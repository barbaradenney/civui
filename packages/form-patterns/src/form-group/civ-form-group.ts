// Schema: packages/schema/src/components/civ-form-group.schema.ts

import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin, renderLabel, renderFormHeader, buildDescribedBy } from '@civui/core';
import type { SlotConfig } from '@civui/core';

const FORM_INPUT_SELECTOR = 'input, select, textarea';

/**
 * CivUI FormGroup
 *
 * Wrapper that provides label, hint, and error rendering for custom or
 * third-party form controls. Automatically wires ARIA attributes to the
 * first child input.
 *
 * @element civ-form-group
 */
@customElement('civ-form-group')
export class CivFormGroup extends LightDomSlotMixin(CivBaseElement) {
  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-form-group-content]' };
  }

  @property({ type: String }) label = '';
  @property({ type: String }) hint = '';
  @property({ type: String }) error = '';
  @property({ type: String, attribute: 'input-id' }) inputId = '';
  @property({ type: Boolean, reflect: true }) required = false;

  private _hintId = this.generateId('hint');
  private _errorId = this.generateId('error');
  override firstUpdated(): void {
    this._relocateSlots();
    this._wireAriaDescribedBy();
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('hint') || changed.has('error') || changed.has('required')) {
      this._wireAriaDescribedBy();
    }
  }

  private _wireAriaDescribedBy(): void {
    const ids = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);

    const input = this.querySelector(FORM_INPUT_SELECTOR) as HTMLElement | null;
    if (!input) return;

    if (ids) {
      input.setAttribute('aria-describedby', ids);
    } else {
      input.removeAttribute('aria-describedby');
    }

    if (this.error) {
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.removeAttribute('aria-invalid');
    }

    if (this.required) {
      input.setAttribute('aria-required', 'true');
    } else {
      input.removeAttribute('aria-required');
    }
  }

  override render() {
    return html`
      <div class="civ-mb-4">
        ${renderFormHeader({ label: renderLabel({ label: this.label, inputId: this.inputId, required: this.required }), hintId: this._hintId, hint: this.hint, errorId: this._errorId, error: this.error })}
        <div data-civ-form-group-content></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-form-group': CivFormGroup;
  }
}
