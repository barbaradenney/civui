import { property } from 'lit/decorators.js';
import { CivBaseElement } from './civ-base-element.js';
import { dispatch } from '../utils/events.js';
import { interpolate } from '../utils/interpolate.js';
import { t } from '../i18n/locale.js';

/**
 * Base element for all CivUI form components.
 *
 * Uses ElementInternals for native form participation:
 * - Works in native <form> elements (FormData, validation, submit)
 * - Supports formResetCallback() and formDisabledCallback()
 * - Provides checkValidity() and reportValidity()
 * - No hidden inputs or closest('form') hacks needed
 *
 * Subclasses call this.updateFormValue() when their value changes.
 */
export class CivFormElement extends CivBaseElement {
  static formAssociated = true;

  protected _internals: ElementInternals;
  protected _inputId: string;
  protected _hintId: string;
  protected _errorId: string;
  protected _defaultValue = '';

  /**
   * Local mirror of the validity flags last passed to `setValidity()`.
   * Used to back `checkValidity()` / `validity` / `validationMessage` in
   * environments that don't fully implement ElementInternals (notably jsdom).
   */
  protected _validityFlags: ValidityStateFlags = {};
  protected _validityMessage = '';

  @property({ type: String }) name = '';
  @property({ type: String }) value = '';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: Boolean, reflect: true }) readonly = false;
  @property({ type: String }) error = '';
  @property({ type: String }) hint = '';
  @property({ type: String }) label = '';
  @property({ type: String, attribute: 'required-message' }) requiredMessage = '';
  /** Hides the "(required)" text while keeping validation active. Used by compound components. */
  @property({ type: Boolean, attribute: 'hide-required-indicator' }) hideRequiredIndicator = false;

  constructor() {
    super();
    this._internals = this.attachInternals();
    this._inputId = this.generateId('input');
    this._hintId = this.generateId('hint');
    this._errorId = this.generateId('error');
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-civ-form-field', '');
  }

  override firstUpdated(): void {
    // Capture default value after first render so framework-bound
    // initial values (e.g., React/Angular property bindings) are resolved.
    if (!this._defaultValue) {
      this._defaultValue = this.value;
    }
    // Establish the initial validity state. Without this, components that
    // mount with `required` set but no user interaction yet (especially
    // compound components with structured values) report valid until the
    // first value change.
    this._updateValidity();
  }

  /**
   * The form this element is associated with (via ElementInternals).
   */
  get form(): HTMLFormElement | null {
    return this._internals.form;
  }

  /**
   * Validity state of this form element. Falls back to a synthesized
   * ValidityState when ElementInternals isn't available (jsdom).
   */
  get validity(): ValidityState {
    return this._internals.validity ?? (this._syntheticValidity() as ValidityState);
  }

  /**
   * The validation message.
   */
  get validationMessage(): string {
    return this._internals.validationMessage ?? this._validityMessage;
  }

  /**
   * Whether the element will be included in form submission.
   */
  get willValidate(): boolean {
    return this._internals.willValidate ?? !this.disabled;
  }

  /**
   * Check validity without showing UI.
   */
  checkValidity(): boolean {
    if (typeof this._internals.checkValidity === 'function') {
      return this._internals.checkValidity();
    }
    return Object.keys(this._validityFlags).length === 0;
  }

  /**
   * Check validity and show browser validation UI.
   */
  reportValidity(): boolean {
    if (typeof this._internals.reportValidity === 'function') {
      return this._internals.reportValidity();
    }
    return this.checkValidity();
  }

  /** Build a ValidityState-shaped object from `_validityFlags` for jsdom. */
  private _syntheticValidity(): ValidityState {
    const f = this._validityFlags;
    return {
      badInput: !!f.badInput,
      customError: !!f.customError,
      patternMismatch: !!f.patternMismatch,
      rangeOverflow: !!f.rangeOverflow,
      rangeUnderflow: !!f.rangeUnderflow,
      stepMismatch: !!f.stepMismatch,
      tooLong: !!f.tooLong,
      tooShort: !!f.tooShort,
      typeMismatch: !!f.typeMismatch,
      valid: Object.keys(f).length === 0,
      valueMissing: !!f.valueMissing,
    };
  }

  /**
   * Build the aria-describedby value from hint and error IDs.
   * Returns empty string when no IDs apply; templates should use
   * `aria-describedby="${this._ariaDescribedBy || nothing}"` to
   * omit the attribute entirely when empty.
   */
  protected get _ariaDescribedBy(): string {
    const ids: string[] = [];
    if (this.hint) ids.push(this._hintId);
    if (this.error) ids.push(this._errorId);
    return ids.join(' ') || '';
  }

  /**
   * Update the form value via ElementInternals.
   * Call this whenever the component's value changes.
   */
  protected updateFormValue(value: string | FormData | null): void {
    if (typeof this._internals.setFormValue === 'function') {
      this._internals.setFormValue(value);
    }
    this._updateValidity();
  }

  /**
   * Update validity state. Override in subclasses for custom validation.
   *
   * Subclass overrides should call `_setValidity(...)` so the local mirror
   * (used by `checkValidity()` in jsdom) stays in sync with ElementInternals.
   */
  protected _updateValidity(): void {
    const anchor = this.querySelector('input, select, textarea') as HTMLElement | null;

    if (this.required && !this.value && !this.disabled && !this.readonly) {
      this._setValidity(
        { valueMissing: true },
        this.error || interpolate(this.requiredMessage || t('fieldRequired'), { label: this.label || t('fieldFallbackLabel') }),
        anchor ?? undefined,
      );
    } else {
      this._setValidity({});
    }
  }

  /**
   * Wrapper around `_internals.setValidity()` that also stores the flags
   * and message locally so `checkValidity()` works without a full
   * ElementInternals implementation.
   */
  protected _setValidity(
    flags: ValidityStateFlags,
    message?: string,
    anchor?: HTMLElement,
  ): void {
    this._validityFlags = { ...flags };
    this._validityMessage = message ?? '';
    if (typeof this._internals.setValidity === 'function') {
      // setValidity throws when flags are non-empty without a message; pass
      // empty string when caller didn't supply one.
      this._internals.setValidity(flags, message ?? '', anchor);
    }
  }

  /**
   * Called by the browser when the associated form is reset.
   */
  formResetCallback(): void {
    this.value = this._defaultValue;
    this.error = '';
    this.updateFormValue(this._defaultValue || '');
    dispatch(this, 'civ-reset');
  }

  /**
   * Called by the browser when the form's disabled state changes.
   */
  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    // Error announcement is handled by renderError()'s role="alert" attribute.
    // No manual announce() needed — role="alert" triggers immediate SR announcement.
    if (changed.has('value')) {
      this._syncFormValue();
    } else if (changed.has('required') || changed.has('error')) {
      // Required toggling and external error changes affect the validity
      // message even when the value didn't move.
      this._updateValidity();
    }
  }

  /**
   * Sync the current value to ElementInternals for form participation.
   * Called automatically when the `value` property changes.
   * Override in subclasses with custom form value logic (e.g. checkbox, toggle).
   *
   * Overridden by: CivCheckbox (boolean), CivToggle (boolean),
   * CivCheckboxGroup (FormData), CivFileUpload (FormData)
   */
  protected _syncFormValue(): void {
    this.updateFormValue(this.value || '');
  }

  /**
   * Handle input events from the inner input element.
   */
  protected _handleInput(e: Event): void {
    const target = e.target as HTMLInputElement;
    this.value = target.value;
    // Form value sync handled by _syncFormValue() in updated()
    dispatch(this, 'civ-input', { value: this.value });
  }

  /**
   * Handle change events from the inner input element.
   */
  protected _handleChange(e: Event): void {
    const target = e.target as HTMLInputElement;
    this.value = target.value;
    // Form value sync handled by _syncFormValue() in updated()
    dispatch(this, 'civ-change', { value: this.value });
    this.sendAnalytics('change');
  }

  // ── Compound component helpers ──────────────────────────────
  // Shared utilities for components that manage structured state
  // (address, name, relationship, etc.)

  /**
   * Parse a JSON value string into a typed state object, merging with
   * an empty default. Returns the default if parsing fails.
   */
  protected parseStructuredValue<T extends object>(val: string, empty: T): T {
    if (!val) return { ...empty };
    try {
      return { ...empty, ...JSON.parse(val) };
    } catch {
      return { ...empty };
    }
  }

  /**
   * Build FormData from a state object with prefixed field names.
   * Handles the common compound component pattern of `prefix.fieldName`.
   */
  protected syncFormDataFromState(
    state: object,
    prefix: string,
  ): void {
    const fd = new FormData();
    for (const [key, value] of Object.entries(state)) {
      fd.append(`${prefix}.${key}`, String(value ?? ''));
    }
    this.updateFormValue(fd);
  }

  /**
   * Sync options to a child `<civ-select>` found by data-attribute selector.
   * Avoids the repeated querySelector + .options pattern.
   */
  protected syncChildSelectOptions(
    selector: string,
    options: Array<{ value: string; label: string }>,
  ): void {
    const select = this.querySelector(selector) as HTMLElement & { options?: unknown } | null;
    if (select) select.options = options;
  }
}
