import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivFormElement, dispatch, interpolate, renderHint, renderError } from '@civui/core';

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
 * @fires civ-analytics - Analytics tracking event on change
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
    const thumbStyle = `width: 18px; height: 18px; top: 2px; inset-inline-start: ${this.checked ? '18px' : '2px'};`;

    return html`
      <div class="civ-mb-2">
        <div class="civ-flex civ-items-center civ-gap-3">
          <button
            type="button"
            role="switch"
            id="${this._inputId}"
            aria-checked="${this.checked ? 'true' : 'false'}"
            aria-required="${this.required || nothing}"
            aria-invalid="${this.error ? 'true' : nothing}"
            aria-describedby="${this._ariaDescribedBy || nothing}"
            ?disabled="${this.disabled}"
            @click="${this._onToggle}"
            class="civ-toggle-track focus-visible:civ-focus-ring"
          >
            <span class="civ-toggle-thumb" style="${thumbStyle}"></span>
          </button>
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
        ${renderHint(this._hintId, this.hint)}
        ${renderError(this._errorId, this.error)}
      </div>
    `;
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
    const anchor = this.querySelector('button') as HTMLElement | null;
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

  private _onToggle(): void {
    if (this.disabled) return;
    this.checked = !this.checked;
    // Form value sync handled by _syncFormValue() in updated() watching checked
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
