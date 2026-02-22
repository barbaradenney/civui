import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivFormElement, dispatch } from '@civui/core';

/**
 * CivUI Checkbox
 *
 * Single checkbox with optional tile variant and description.
 * Uses ElementInternals for native form participation.
 *
 * @element civ-checkbox
 *
 * @prop {string} label - Checkbox label text
 * @prop {string} name - Form field name
 * @prop {string} value - Form submission value when checked
 * @prop {boolean} checked - Whether the checkbox is checked
 * @prop {boolean} indeterminate - Tri-state mixed state
 * @prop {string} description - Description text below the label
 * @prop {boolean} tile - Tile variant (bordered card style)
 * @prop {boolean} required - Whether the field is required
 * @prop {boolean} disabled - Whether the field is disabled
 *
 * @fires civ-change - When checked state changes, detail: { checked, value }
 * @fires civ-input - When checked state changes (input event), detail: { checked, value }
 */
@customElement('civ-checkbox')
export class CivCheckbox extends CivFormElement {
  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: Boolean, reflect: true }) indeterminate = false;
  @property({ type: String }) description = '';
  @property({ type: Boolean, reflect: true }) tile = false;

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
    const isActive = this.checked || this.indeterminate;
    const wrapperClasses = this.tile
      ? [
          'civ-relative',
          'civ-border',
          'civ-rounded',
          'civ-p-4',
          isActive ? 'civ-border-primary civ-bg-primary-lightest' : 'civ-border-base-light',
          this.disabled ? 'civ-opacity-50 civ-cursor-not-allowed' : 'civ-cursor-pointer',
        ]
          .filter(Boolean)
          .join(' ')
      : '';

    const inputClasses = [
      'civ-w-5',
      'civ-h-5',
      'civ-mr-2',
      'civ-align-middle',
      'civ-accent-primary',
      'focus-visible:civ-focus-ring',
      this.disabled ? 'civ-cursor-not-allowed' : 'civ-cursor-pointer',
    ].join(' ');

    const labelClasses = [
      'civ-text-base',
      'civ-font-sans',
      'civ-text-base-darkest',
      this.disabled ? 'civ-cursor-not-allowed' : 'civ-cursor-pointer',
    ].join(' ');

    const content = html`
      <div class="civ-flex civ-items-start">
        <input
          class="${inputClasses}"
          id="${this._inputId}"
          type="checkbox"
          name="${this.name}"
          .value="${this.value}"
          .checked="${this.checked}"
          ?disabled="${this.disabled}"
          ?required="${this.required}"
          aria-required="${this.required}"
          aria-checked="${this.indeterminate ? 'mixed' : this.checked ? 'true' : 'false'}"
          aria-invalid="${this.error ? 'true' : 'false'}"
          aria-describedby="${this._ariaDescribedBy || nothing}"
          @change="${this._onCheckboxChange}"
        />
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
    `;

    return html`
      <div class="civ-mb-2 ${wrapperClasses}" data-civ-tile="${this.tile || nothing}">
        ${this.hint
          ? html`<span class="civ-block civ-mb-1 civ-text-sm civ-text-base" id="${this._hintId}">${this.hint}</span>`
          : nothing}
        ${this.error
          ? html`<span class="civ-block civ-mb-1 civ-text-sm civ-text-error civ-font-bold" id="${this._errorId}" role="alert">${this.error}</span>`
          : nothing}
        ${content}
      </div>
    `;
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('indeterminate')) {
      const input = this.querySelector('input') as HTMLInputElement | null;
      if (input) input.indeterminate = this.indeterminate;
    }
  }

  private _onCheckboxChange(e: Event): void {
    const target = e.target as HTMLInputElement;
    this.checked = target.checked;
    this.indeterminate = false;
    this.updateFormValue(this.checked ? this.value : null);
    dispatch(this, 'civ-input', { checked: this.checked, value: this.value });
    dispatch(this, 'civ-change', { checked: this.checked, value: this.value });
    this.sendAnalytics('change', { checked: this.checked });
  }

  override formResetCallback(): void {
    this.checked = this._defaultChecked;
    this.indeterminate = false;
    this.error = '';
    this.updateFormValue(this._defaultChecked ? this.value : null);
    dispatch(this, 'civ-reset');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-checkbox': CivCheckbox;
  }
}
