import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivdsFormElement } from '@civds/core';

/**
 * CivDS Checkbox
 *
 * Single checkbox with optional tile variant and description.
 * Uses ElementInternals for native form participation.
 *
 * @element civds-checkbox
 *
 * @prop {string} label - Checkbox label text
 * @prop {string} name - Form field name
 * @prop {string} value - Form submission value when checked
 * @prop {boolean} checked - Whether the checkbox is checked
 * @prop {string} description - Description text below the label
 * @prop {boolean} tile - Tile variant (bordered card style)
 * @prop {boolean} required - Whether the field is required
 * @prop {boolean} disabled - Whether the field is disabled
 *
 * @fires civds-change - When checked state changes
 */
@customElement('civds-checkbox')
export class CivdsCheckbox extends CivdsFormElement {
  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: String }) description = '';
  @property({ type: Boolean, reflect: true }) tile = false;

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
  }

  override render() {
    const wrapperClasses = this.tile
      ? [
          'civds-relative',
          'civds-border',
          'civds-rounded',
          'civds-p-4',
          this.checked ? 'civds-border-primary civds-bg-primary-lightest' : 'civds-border-base-light',
          this.disabled ? 'civds-opacity-50 civds-cursor-not-allowed' : 'civds-cursor-pointer',
        ]
          .filter(Boolean)
          .join(' ')
      : '';

    const inputClasses = [
      'civds-w-5',
      'civds-h-5',
      'civds-mr-2',
      'civds-align-middle',
      'civds-accent-primary',
      'focus-visible:civds-focus-ring',
      this.disabled ? 'civds-cursor-not-allowed' : 'civds-cursor-pointer',
    ].join(' ');

    const labelClasses = [
      'civds-text-base',
      'civds-font-sans',
      'civds-text-base-darkest',
      this.disabled ? 'civds-cursor-not-allowed' : 'civds-cursor-pointer',
    ].join(' ');

    const content = html`
      <div class="civds-flex civds-items-start">
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
          aria-invalid="${this.error ? 'true' : 'false'}"
          aria-describedby="${this._ariaDescribedBy || nothing}"
          @change="${this._onCheckboxChange}"
        />
        <div>
          <label class="${labelClasses}" for="${this._inputId}">
            ${this.label}
            ${this.required
              ? html`<abbr class="civds-text-error civds-no-underline" title="required">*</abbr>`
              : nothing}
          </label>
          ${this.description
            ? html`<span id="${this._descriptionId}" class="civds-block civds-text-sm civds-text-base civds-mt-0.5">${this.description}</span>`
            : nothing}
        </div>
      </div>
    `;

    return html`
      <div class="civds-mb-2 ${wrapperClasses}" data-civds-tile="${this.tile || nothing}">
        ${this.error
          ? html`<span class="civds-block civds-mb-1 civds-text-sm civds-text-error civds-font-bold" id="${this._errorId}" role="alert">${this.error}</span>`
          : nothing}
        ${content}
      </div>
    `;
  }

  private _onCheckboxChange(e: Event): void {
    const target = e.target as HTMLInputElement;
    this.checked = target.checked;
    this.updateFormValue(this.checked ? this.value : null);
    this.dispatchEvent(
      new CustomEvent('civds-change', {
        detail: { checked: this.checked, value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
    this.sendAnalytics('change', { checked: this.checked });
  }

  override formResetCallback(): void {
    this.checked = false;
    this.error = '';
    this.updateFormValue(null);
    this.dispatchEvent(new CustomEvent('civds-reset', { bubbles: true, composed: true }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civds-checkbox': CivdsCheckbox;
  }
}
