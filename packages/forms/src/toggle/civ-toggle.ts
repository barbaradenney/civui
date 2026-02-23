import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivFormElement, dispatch, renderHint, renderError } from '@civui/core';

/**
 * CivUI Toggle Switch
 *
 * A toggle switch with immediate-effect semantics using `role="switch"`.
 * Uses ElementInternals for native form participation.
 *
 * @element civ-toggle
 *
 * @prop {string} label - Toggle label text
 * @prop {string} name - Form field name
 * @prop {string} value - Form submission value when checked
 * @prop {boolean} checked - Whether the toggle is on
 * @prop {string} description - Secondary text below the label
 * @prop {boolean} required - Whether the field is required
 * @prop {boolean} disabled - Whether the field is disabled
 *
 * @fires civ-change - When checked state changes, detail: { checked, value }
 * @fires civ-input - When checked state changes (input event), detail: { checked, value }
 */
@customElement('civ-toggle')
export class CivToggle extends CivFormElement {
  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: String }) description = '';

  private _defaultChecked = false;
  private _descriptionId = this.generateId('desc');

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

  override render() {
    const trackClasses = [
      'civ-toggle-track',
      'civ-relative',
      'civ-inline-flex',
      'civ-items-center',
      'civ-w-10',
      'civ-h-6',
      'civ-rounded-full',
      'civ-border',
      'civ-transition-colors',
      this.checked ? 'civ-bg-primary civ-border-primary' : 'civ-bg-base-light civ-border-base',
      this.disabled ? 'civ-opacity-50 civ-cursor-not-allowed' : 'civ-cursor-pointer',
      'focus-visible:civ-focus-ring',
    ].join(' ');

    const thumbClasses = [
      'civ-toggle-thumb',
      'civ-absolute',
      'civ-bg-white',
      'civ-rounded-full',
      'civ-shadow-sm',
      'civ-transition-transform',
    ].join(' ');

    const thumbStyle = `width: 18px; height: 18px; top: 2px; left: ${this.checked ? '18px' : '2px'};`;

    const labelClasses = [
      'civ-text-base',
      'civ-font-sans',
      'civ-text-base-darkest',
      this.disabled ? 'civ-cursor-not-allowed' : 'civ-cursor-pointer',
    ].join(' ');

    return html`
      <div class="civ-mb-2">
        ${renderHint(this._hintId, this.hint)}
        ${renderError(this._errorId, this.error)}
        <div class="civ-flex civ-items-center civ-gap-3">
          <button
            type="button"
            role="switch"
            id="${this._inputId}"
            aria-checked="${this.checked ? 'true' : 'false'}"
            aria-required="${this.required}"
            aria-invalid="${this.error ? 'true' : 'false'}"
            aria-describedby="${this._ariaDescribedBy || nothing}"
            ?disabled="${this.disabled}"
            @click="${this._onToggle}"
            class="${trackClasses}"
          >
            <span class="${thumbClasses}" style="${thumbStyle}"></span>
          </button>
          <div>
            <label class="${labelClasses}" for="${this._inputId}">
              ${this.label}
              ${this.required
                ? html`<abbr class="civ-text-error civ-no-underline" title="required">*</abbr>`
                : nothing}
            </label>
            ${this.description
              ? html`<span id="${this._descriptionId}" class="civ-block civ-text-sm civ-text-base civ-mt-0.5">${this.description}</span>`
              : nothing}
          </div>
        </div>
      </div>
    `;
  }

  protected override _syncFormValue(): void {
    this.updateFormValue(this.checked ? this.value : null);
  }

  private _onToggle(): void {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.updateFormValue(this.checked ? this.value : null);
    dispatch(this, 'civ-input', { checked: this.checked, value: this.value });
    dispatch(this, 'civ-change', { checked: this.checked, value: this.value });
    this.sendAnalytics('change', { checked: this.checked });
  }

  override formResetCallback(): void {
    this.checked = this._defaultChecked;
    this.error = '';
    this.updateFormValue(this._defaultChecked ? this.value : null);
    dispatch(this, 'civ-reset');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-toggle': CivToggle;
  }
}
