import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivdsBaseElement } from '@civds/core';

/**
 * CivDS Checkbox Group
 *
 * Groups multiple civds-checkbox elements with a shared legend,
 * hint, and error message using a native fieldset.
 *
 * @element civds-checkbox-group
 *
 * @prop {string} legend - Group legend text
 * @prop {string} hint - Hint text displayed below legend
 * @prop {string} error - Error message for the group
 * @prop {boolean} tile - Apply tile variant to all child checkboxes
 * @prop {boolean} required - Whether at least one selection is required
 *
 * @fires civds-change - Bubbles from child checkboxes
 */
@customElement('civds-checkbox-group')
export class CivdsCheckboxGroup extends CivdsBaseElement {
  @property({ type: String }) legend = '';
  @property({ type: String }) hint = '';
  @property({ type: String }) error = '';
  @property({ type: Boolean, reflect: true }) tile = false;
  @property({ type: Boolean, reflect: true }) required = false;

  private _hintId = this.generateId('hint');
  private _errorId = this.generateId('error');

  override render() {
    const describedBy = [
      this.hint ? this._hintId : '',
      this.error ? this._errorId : '',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <fieldset
        class="civds-border-0 civds-p-0 civds-m-0 civds-mb-4"
        aria-describedby="${describedBy || nothing}"
        aria-invalid="${this.error ? 'true' : 'false'}"
      >
        ${this.legend
          ? html`
              <legend class="civds-block civds-mb-1 civds-text-base-darkest civds-font-bold civds-text-base">
                ${this.legend}
                ${this.required
                  ? html`<abbr class="civds-text-error civds-no-underline" title="required">*</abbr>`
                  : nothing}
              </legend>
            `
          : nothing}
        ${this.hint
          ? html`<span class="civds-block civds-mb-2 civds-text-sm civds-text-base" id="${this._hintId}">${this.hint}</span>`
          : nothing}
        ${this.error
          ? html`<span class="civds-block civds-mb-2 civds-text-sm civds-text-error civds-font-bold" id="${this._errorId}" role="alert">${this.error}</span>`
          : nothing}
        <div class="civds-flex civds-flex-col civds-gap-1">
          <slot></slot>
        </div>
      </fieldset>
    `;
  }

  /**
   * Get the values of all checked checkboxes in this group.
   */
  getCheckedValues(): string[] {
    const checkboxes = this.querySelectorAll('civds-checkbox');
    return Array.from(checkboxes)
      .filter((cb: any) => cb.checked)
      .map((cb: any) => cb.value);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civds-checkbox-group': CivdsCheckboxGroup;
  }
}
