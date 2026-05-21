// Schema: packages/schema/src/components/civ-disclosure.schema.ts

import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin, t } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Disclosure
 *
 * Inline expandable content with a clickable trigger. Use it for
 * "Why we ask?" justifications next to PII fields, definitions of
 * jargon, or any supplementary text that doesn't need to be visible
 * by default. Built on the native `<details>`/`<summary>` semantics
 * so it works without JavaScript and is announced as a disclosure
 * widget by screen readers.
 *
 * The trigger renders a `chevron-right` caret beside the `label` —
 * the caret rotates 90° to point down on open. The visual contract
 * is fixed (no size variants, no icon overrides, no alternate
 * rotations) so every disclosure on a page reads as the same
 * affordance. Pass content via the default slot. Setting `open`
 * opens the disclosure programmatically; the component dispatches
 * `civ-toggle` with `{ open }` whenever the user toggles it.
 *
 * @element civ-disclosure
 *
 * @prop {string} label - Trigger text (defaults to "Why we ask?")
 * @prop {boolean} open - Whether the content is visible
 *
 * @fires civ-toggle - When the open/closed state changes, detail: { open }
 * @fires civ-analytics - Analytics tracking on toggle
 *
 * @slot - Disclosure content rendered when open
 */
@customElement('civ-disclosure')
export class CivDisclosure extends LightDomSlotMixin(CivBaseElement) {
  /** Trigger text displayed beside the caret. */
  @property({ type: String }) label = '';

  /** Whether the disclosure is currently expanded. */
  @property({ type: Boolean, reflect: true }) open = false;

  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-disclosure-content]' };
  }

  override render() {
    const labelText = this.label || t('disclosureDefaultLabel');
    return html`
      <details
        class="civ-disclosure"
        ?open="${this.open}"
        @toggle="${this._onToggle}"
      >
        <summary class="civ-text-btn civ-text-btn--chip civ-disclosure__trigger">
          <civ-icon name="chevron-right" class="civ-disclosure__icon" aria-hidden="true"></civ-icon>
          <span class="civ-disclosure__label">${labelText}</span>
        </summary>
        <div class="civ-disclosure__content" data-civ-disclosure-content></div>
      </details>
    `;
  }

  /**
   * Fire `civ-toggle` as a local (non-bubbling, non-composed) event.
   * Disclosures often live inside `civ-form`; if the event composed
   * and bubbled, every form-level `civ-input` / `civ-change` listener
   * would see a non-form-field payload. Consumers who want the event
   * subscribe directly on the `civ-disclosure` element.
   */
  private _onToggle(e: Event): void {
    const details = e.target as HTMLDetailsElement;
    if (details.open === this.open) return;
    this.open = details.open;
    this.dispatchEvent(new CustomEvent('civ-toggle', {
      detail: { open: this.open },
      bubbles: false,
      composed: false,
    }));
    this.sendAnalytics('change', { open: this.open });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-disclosure': CivDisclosure;
  }
}
