import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivFormElement, dispatch, interpolate, renderHint, renderError } from '@civui/core';

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
 * @fires civ-analytics - Analytics tracking event on change
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
    const content = html`
      <div class="civ-flex civ-items-start">
        <input
          class="civ-check-input focus-visible:civ-focus-ring"
          id="${this._inputId}"
          type="checkbox"
          name="${this.name}"
          .value="${this.value}"
          .checked="${this.checked}"
          ?disabled="${this.disabled}"
          ?required="${this.required}"
          aria-required="${this.required || nothing}"
          aria-checked="${this.indeterminate ? 'mixed' : nothing}"
          aria-invalid="${this.error ? 'true' : nothing}"
          aria-describedby="${this._ariaDescribedBy || nothing}"
          @change="${this._onCheckboxChange}"
        />
        <div>
          <label class="civ-check-label" for="${this._inputId}">
            ${this.label}
            ${this.required
              ? html`<abbr class="civ-required-mark" title="required">*</abbr>`
              : nothing}
          </label>
          ${this.description
            ? html`<span id="${this._descriptionId}" class="civ-check-description">${this.description}</span>`
            : nothing}
        </div>
      </div>
    `;

    return html`
      <div class="civ-mb-2 ${this.tile ? 'civ-check-tile' : ''}" data-civ-tile="${this.tile || nothing}">
        ${renderHint(this._hintId, this.hint)}
        ${renderError(this._errorId, this.error)}
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
    if (changed.has('checked')) {
      this._syncFormValue();
    }
  }

  protected override _syncFormValue(): void {
    this.updateFormValue(this.checked ? this.value : null);
  }

  protected override _updateValidity(): void {
    if (typeof this._internals?.setValidity !== 'function') return;
    const anchor = this.querySelector('input') as HTMLElement | null;
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

  private _onCheckboxChange(e: Event): void {
    const target = e.target as HTMLInputElement;
    this.checked = target.checked;
    this.indeterminate = false;
    // Form value sync handled by _syncFormValue() in updated() watching checked
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
