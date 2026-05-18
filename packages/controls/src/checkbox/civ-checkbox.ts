// Schema: packages/schema/src/components/civ-checkbox.schema.ts

import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBooleanFormElement, devWarn, dispatch, forwardTileClick, renderHint, renderError, t } from '@civui/core';

export type CheckboxSpacing = 'default' | 'sm';

/**
 * CivUI Checkbox
 *
 * Accessible checkbox with inline label, optional description, and tile variant.
 * Uses ElementInternals for native form participation.
 *
 * **Spacing modes:**
 * - `default` — standard 40px tappable size with full chrome (label, hint,
 *   description, required-mark). Use in forms.
 * - `sm` — compact 20px size for dense surfaces (data-grid rows, column-toggle
 *   panels). Tile chrome is forced off; hint / description / required-mark
 *   are not rendered (sm mode assumes the surrounding context labels the
 *   control). When `label` is empty, only the bare `<input>` is rendered and
 *   the host's `aria-label` is propagated to it.
 *
 * @element civ-checkbox
 */
@customElement('civ-checkbox')
export class CivCheckbox extends CivBooleanFormElement {
  @property({ type: Boolean, reflect: true }) indeterminate = false;
  @property({ type: Boolean, reflect: true }) tile = true;
  @property({ type: String }) spacing: CheckboxSpacing = 'default';

  /** Tracks whether the missing-accessible-name dev warning has fired (fires once per instance). */
  private _warnedMissingAccessibleName = false;

  override render() {
    const isCompact = this.spacing === 'sm';
    // Compact mode: bare input, no chrome. Propagate host aria-label so the
    // surrounding context (e.g. data-grid row label) names the control for AT.
    if (isCompact) {
      const ariaLabel = this.getAttribute('aria-label') || undefined;
      if (!this.label && !ariaLabel && !this._warnedMissingAccessibleName) {
        devWarn(
          'civ-checkbox',
          'spacing="sm" requires either `label` or `aria-label` so screen-reader users hear what the checkbox is for. Without one, the control is unlabeled to AT.',
        );
        this._warnedMissingAccessibleName = true;
      }
      const input = html`
        <input
          class="civ-check-input civ-check-input--sm"
          id="${this._inputId}"
          type="checkbox"
          name="${this.name}"
          .value="${this.value}"
          .checked="${this.checked}"
          ?disabled="${this.disabled}"
          ?required="${this.required}"
          aria-label="${ariaLabel ?? nothing}"
          aria-invalid="${this.error ? 'true' : nothing}"
          @change="${this._onCheckboxChange}"
        />
      `;
      if (!this.label) return input;
      return html`
        <label class="civ-check-row civ-cursor-pointer" for="${this._inputId}">
          ${input}
          <span class="civ-check-label">${this.label}</span>
        </label>
      `;
    }

    return html`
      ${renderError(this._errorId, this.error)}
      <div class="${this.tile ? 'civ-check-tile' : 'civ-mb-2'}" data-civ-tile="${this.tile ? '' : nothing}" @click="${this.tile ? this._onTileClick : nothing}">
        <label class="civ-check-row civ-cursor-pointer civ-w-full" for="${this._inputId}">
          <input
            class="civ-check-input"
            id="${this._inputId}"
            type="checkbox"
            name="${this.name}"
            .value="${this.value}"
            .checked="${this.checked}"
            ?disabled="${this.disabled}"
            ?required="${this.required}"
            aria-invalid="${this.error ? 'true' : nothing}"
            aria-describedby="${this._ariaDescribedBy || nothing}"
            @change="${this._onCheckboxChange}"
          />
          <span class="civ-check-label">
            ${this.label}
            ${this.required
              ? html`<span class="civ-required-mark">${t('required')}</span>`
              : nothing}
            ${this.description
              ? html`<span id="${this._descriptionId}" class="civ-check-description">${this.description}</span>`
              : nothing}
            ${renderHint(this._hintId, this.hint)}
          </span>
        </label>
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

  private _onTileClick = (e: Event) => forwardTileClick(this, e);

  private _onCheckboxChange(e: Event): void {
    const target = e.target as HTMLInputElement;
    this.checked = target.checked;
    this.indeterminate = false;
    dispatch(this, 'civ-input', { checked: this.checked, value: this.value });
    dispatch(this, 'civ-change', { checked: this.checked, value: this.value });
    this.sendAnalytics('change', { checked: this.checked });
  }

  override formResetCallback(): void {
    super.formResetCallback();
    this.indeterminate = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-checkbox': CivCheckbox;
  }
}
