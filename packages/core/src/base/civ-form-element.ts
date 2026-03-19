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
  private _cachedAnchor: HTMLElement | null | undefined;
  protected _inputId: string;
  protected _hintId: string;
  protected _errorId: string;
  protected _defaultValue = '';

  @property({ type: String }) name = '';
  @property({ type: String }) value = '';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: Boolean, reflect: true }) readonly = false;
  @property({ type: String }) error = '';
  @property({ type: String }) hint = '';
  @property({ type: String }) label = '';
  @property({ type: String, attribute: 'required-message' }) requiredMessage = '';

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
  }

  /**
   * The form this element is associated with (via ElementInternals).
   */
  get form(): HTMLFormElement | null {
    return this._internals.form;
  }

  /**
   * Validity state of this form element.
   */
  get validity(): ValidityState {
    return this._internals.validity;
  }

  /**
   * The validation message.
   */
  get validationMessage(): string {
    return this._internals.validationMessage;
  }

  /**
   * Whether the element will be included in form submission.
   */
  get willValidate(): boolean {
    return this._internals.willValidate;
  }

  /**
   * Check validity without showing UI.
   */
  checkValidity(): boolean {
    return this._internals.checkValidity();
  }

  /**
   * Check validity and show browser validation UI.
   */
  reportValidity(): boolean {
    return this._internals.reportValidity();
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
   */
  protected _updateValidity(): void {
    if (typeof this._internals.setValidity !== 'function') return;

    // Cache the anchor element to avoid DOM query on every value change
    if (this._cachedAnchor === undefined) {
      this._cachedAnchor = this.querySelector('input, select, textarea') as HTMLElement | null;
    }
    const anchor = this._cachedAnchor;

    if (this.required && !this.value) {
      this._internals.setValidity(
        { valueMissing: true },
        this.error || interpolate(this.requiredMessage || t('fieldRequired'), { label: this.label || t('fieldFallbackLabel') }),
        anchor ?? undefined,
      );
    } else {
      this._internals.setValidity({});
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
    // Light DOM re-renders replace DOM nodes, so clear cached anchor references
    // to avoid stale element references for validation anchoring.
    this._cachedAnchor = undefined;
    // Error announcement is handled by renderError()'s role="alert" attribute.
    // No manual announce() needed — role="alert" triggers immediate SR announcement.
    if (changed.has('value')) {
      this._syncFormValue();
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
}
