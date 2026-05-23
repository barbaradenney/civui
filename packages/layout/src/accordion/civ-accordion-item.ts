// Schema: packages/schema/src/components/civ-accordion-item.schema.ts

import { html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Accordion Item
 *
 * One full-width expandable row inside `<civ-accordion>`. Composes
 * the same visual language as `<civ-disclosure>` — chevron caret
 * beside the label, 90° rotation on open — but renders as a full-row
 * trigger with a larger tap target. Built on native
 * `<details>`/`<summary>` so it works without JavaScript and is
 * announced as a disclosure widget by every screen reader.
 *
 * `headingLevel` (1–6) optionally wraps the label in an `<h1>`–`<h6>`
 * so screen-reader rotor users can jump between accordion sections.
 * The visual treatment is held constant across all levels — the
 * heading element only affects assistive-tech navigation, not the
 * rendered font size or weight.
 *
 * Setting `open` opens the panel programmatically. The component
 * dispatches `civ-toggle` (non-bubbling, mirrors civ-disclosure) on
 * every state change and an internal `civ-accordion-item-toggle`
 * event (bubbling) used by the parent `<civ-accordion>` to
 * coordinate `single`-open mode.
 *
 * @element civ-accordion-item
 *
 * @prop {string} label - Header text rendered on the trigger row
 * @prop {boolean} open - Whether the panel is currently expanded
 * @prop {boolean} disabled - Disables interaction; renders dimmed
 * @prop {number} headingLevel - 1–6 wraps the label in an `<h1>`–`<h6>` for screen-reader navigation
 *
 * @fires civ-toggle - When the open/closed state changes, detail: { open }
 * @fires civ-analytics - Analytics tracking on toggle
 *
 * @slot - Panel content rendered when open
 */
@customElement('civ-accordion-item')
export class CivAccordionItem extends LightDomSlotMixin(CivBaseElement) {
  /** Header text shown on the full-width trigger row. */
  @property({ type: String }) label = '';

  /** Whether the panel is currently expanded. */
  @property({ type: Boolean, reflect: true }) open = false;

  /** Disables interaction; the row is dimmed and not toggleable. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /**
   * Wrap the label in an `<h1>`–`<h6>` for screen-reader rotor
   * navigation. Visual treatment stays constant across levels.
   */
  @property({ type: Number, attribute: 'heading-level' })
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;

  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-accordion-item-content]' };
  }

  override render() {
    return html`
      <details
        class="civ-accordion-item"
        ?open="${this.open}"
        @toggle="${this._onToggle}"
      >
        <summary class="civ-accordion-item__trigger">
          <civ-icon name="chevron-right" class="civ-accordion-item__icon" aria-hidden="true"></civ-icon>
          ${this._renderLabel()}
        </summary>
        <div class="civ-accordion-item__content" data-civ-accordion-item-content></div>
      </details>
    `;
  }

  private _renderLabel(): TemplateResult {
    const cls = 'civ-accordion-item__label';
    switch (this.headingLevel) {
      case 1: return html`<h1 class="${cls}">${this.label}</h1>`;
      case 2: return html`<h2 class="${cls}">${this.label}</h2>`;
      case 3: return html`<h3 class="${cls}">${this.label}</h3>`;
      case 4: return html`<h4 class="${cls}">${this.label}</h4>`;
      case 5: return html`<h5 class="${cls}">${this.label}</h5>`;
      case 6: return html`<h6 class="${cls}">${this.label}</h6>`;
      default: return html`<span class="${cls}">${this.label}</span>`;
    }
  }

  /**
   * Fire `civ-toggle` (non-bubbling) for consumer subscriptions and
   * `civ-accordion-item-toggle` (bubbling) for the parent
   * `<civ-accordion>` to drive single-open coordination. Non-bubbling
   * on the public event mirrors civ-disclosure — items may live
   * inside a `<civ-form>` and form-level listeners shouldn't see
   * accordion events.
   */
  private _onToggle(e: Event): void {
    const details = e.target as HTMLDetailsElement;
    if (details.open === this.open) return;

    if (this.disabled) {
      details.open = this.open;
      return;
    }

    this.open = details.open;

    this.dispatchEvent(new CustomEvent('civ-toggle', {
      detail: { open: this.open },
      bubbles: false,
      composed: false,
    }));

    this.dispatchEvent(new CustomEvent('civ-accordion-item-toggle', {
      detail: { open: this.open },
      bubbles: true,
      composed: false,
    }));

    this.sendAnalytics('change', { open: this.open });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-accordion-item': CivAccordionItem;
  }
}
