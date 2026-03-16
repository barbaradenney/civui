import { property } from 'lit/decorators.js';
import { CivFormElement } from './civ-form-element.js';
import { interpolate } from '../utils/interpolate.js';

/**
 * Base class for boolean form controls (checkbox, toggle).
 * Provides shared checked state, form value sync, and validation.
 */
export class CivBooleanFormElement extends CivFormElement {
  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: String }) description = '';

  protected _defaultChecked = false;
  protected _descriptionId = this.generateId('desc');
  private _cachedBooleanAnchor?: HTMLElement | null;

  /** Override in subclass to specify the anchor element selector */
  protected get _anchorSelector(): string { return 'input'; }

  protected override get _ariaDescribedBy(): string {
    const ids: string[] = [];
    if (this.description) ids.push(this._descriptionId);
    if (this.hint) ids.push(this._hintId);
    if (this.error) ids.push(this._errorId);
    return ids.join(' ') || '';
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.value) this.value = 'on';
    this._defaultChecked = this.checked;
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('checked')) {
      this._syncFormValue();
    }
  }

  protected override _syncFormValue(): void {
    this.updateFormValue(this.checked ? this.value : null);
  }

  protected override _updateValidity(): void {
    if (typeof this._internals?.setValidity !== 'function') return;
    if (this._cachedBooleanAnchor === undefined) {
      this._cachedBooleanAnchor = this.querySelector(this._anchorSelector) as HTMLElement | null;
    }
    const anchor = this._cachedBooleanAnchor;
    if (this.required && !this.checked) {
      this._internals.setValidity(
        { valueMissing: true },
        this.error || interpolate(this.requiredMessage, { label: this.label || 'This field' }),
        anchor ?? undefined,
      );
    } else {
      this._internals.setValidity({});
    }
  }

  override formResetCallback(): void {
    this.checked = this._defaultChecked;
    this.error = '';
    this.updateFormValue(this._defaultChecked ? this.value : null);
    // Subclasses dispatch civ-reset
  }
}
