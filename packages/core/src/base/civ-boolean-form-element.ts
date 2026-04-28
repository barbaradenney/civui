import { property } from 'lit/decorators.js';
import { CivFormElement } from './civ-form-element.js';
import { dispatch } from '../utils/events.js';
import { interpolate } from '../utils/interpolate.js';
import { t } from '../i18n/locale.js';

/**
 * Base class for boolean form controls (checkbox, toggle).
 * Provides shared checked state, form value sync, and validation.
 */
export class CivBooleanFormElement extends CivFormElement {
  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: String }) description = '';
  /**
   * Space-separated list of element IDs to append to this control's
   * `aria-describedby`. Useful when a sibling element (e.g., a separate
   * statement-of-truth paragraph above the certification checkbox) already
   * holds the descriptive text and shouldn't be duplicated into the
   * component's own description slot.
   */
  @property({ type: String, attribute: 'extra-describedby' }) extraDescribedby = '';

  protected _defaultChecked = false;
  protected _descriptionId = this.generateId('desc');
  /** Override in subclass to specify the anchor element selector */
  protected get _anchorSelector(): string { return 'input'; }

  protected override get _ariaDescribedBy(): string {
    const ids: string[] = [];
    if (this.description) ids.push(this._descriptionId);
    if (this.hint) ids.push(this._hintId);
    if (this.error) ids.push(this._errorId);
    if (this.extraDescribedby) {
      for (const id of this.extraDescribedby.trim().split(/\s+/)) {
        if (id) ids.push(id);
      }
    }
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
    const anchor = this.querySelector(this._anchorSelector) as HTMLElement | null;
    if (this.required && !this.checked) {
      this._setValidity(
        { valueMissing: true },
        this.error || interpolate(this.requiredMessage || t('fieldRequired'), { label: this.label || t('fieldFallbackLabel') }),
        anchor ?? undefined,
      );
    } else {
      this._setValidity({});
    }
  }

  override formResetCallback(): void {
    this.checked = this._defaultChecked;
    this.error = '';
    this.touched = false;
    this.updateFormValue(this._defaultChecked ? this.value : null);
    dispatch(this, 'civ-reset');
  }
}
