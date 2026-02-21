import { property } from 'lit/decorators.js';
import { CivdsBaseElement } from './civds-base-element.js';
import { dispatch } from '../utils/events.js';

/**
 * Base element for all CivDS form components.
 *
 * Uses ElementInternals for native form participation:
 * - Works in native <form> elements (FormData, validation, submit)
 * - Supports formResetCallback() and formDisabledCallback()
 * - Provides checkValidity() and reportValidity()
 * - No hidden inputs or closest('form') hacks needed
 *
 * Subclasses call this.updateFormValue() when their value changes.
 */
export class CivdsFormElement extends CivdsBaseElement {
  static formAssociated = true;

  private _internals: ElementInternals;
  protected _inputId: string;
  protected _hintId: string;
  protected _errorId: string;

  @property({ type: String }) name = '';
  @property({ type: String }) value = '';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: String }) error = '';
  @property({ type: String }) hint = '';
  @property({ type: String }) label = '';

  constructor() {
    super();
    this._internals = this.attachInternals();
    this._inputId = this.generateId('input');
    this._hintId = this.generateId('hint');
    this._errorId = this.generateId('error');
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

    const anchor = this.querySelector('input, select, textarea') as HTMLElement | null;

    if (this.required && !this.value) {
      this._internals.setValidity(
        { valueMissing: true },
        this.error || `${this.label || 'This field'} is required`,
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
    this.value = '';
    this.error = '';
    this.updateFormValue('');
    dispatch(this, 'civds-reset');
  }

  /**
   * Called by the browser when the form's disabled state changes.
   */
  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('error') && this.error) {
      this.announce(this.error, 'assertive');
    }
  }

  /**
   * Handle input events from the inner input element.
   */
  protected _handleInput(e: Event): void {
    const target = e.target as HTMLInputElement;
    this.value = target.value;
    this.updateFormValue(this.value);
    dispatch(this, 'civds-input', { value: this.value });
  }

  /**
   * Handle change events from the inner input element.
   */
  protected _handleChange(e: Event): void {
    const target = e.target as HTMLInputElement;
    this.value = target.value;
    this.updateFormValue(this.value);
    dispatch(this, 'civds-change', { value: this.value });
    this.sendAnalytics('change');
  }
}
