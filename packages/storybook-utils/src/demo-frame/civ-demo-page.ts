import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin, type SlotConfig } from '@civui/core';

/**
 * CivUI Demo Page
 *
 * Slotted child of `<civ-demo-frame>`. Marks one "page" of a multi-page
 * demo, with `path` declaring the URL pattern it should render on.
 *
 * Patterns support static segments and `:name` parameters:
 * - `/dependents` — exact match
 * - `/dependents/new` — exact match
 * - `/dependents/:id/edit` — matches `/dependents/42/edit` and exposes
 *   `params = { id: '42' }` on the page when it's active.
 *
 * Active vs inactive: the parent frame sets `hidden` on every page that
 * doesn't match the current path. Inactive pages stay mounted, so any
 * form state inside them survives navigation away and back. Authors
 * who *want* a fresh page on each visit can remount manually.
 *
 * Not intended for production. Lives in `@civui/storybook-utils`.
 *
 * @element civ-demo-page
 */
@customElement('civ-demo-page')
export class CivDemoPage extends LightDomSlotMixin(CivBaseElement) {
  override _getSlotConfig(): SlotConfig {
    // Relocate authored children into the rendered content wrapper.
    // Without this, Light-DOM rendering would leave them adrift while
    // the rendered `<div>` sits empty.
    return { default: '[data-civ-demo-page-content]' };
  }

  /**
   * URL pattern this page matches. May include `:name` segments which
   * capture path params (surfaced on the `params` property when active).
   */
  @property({ type: String }) path = '';

  /**
   * Captured path params from the matched URL. Set by the parent
   * `<civ-demo-frame>` whenever this page becomes active. Empty object
   * when the page is inactive.
   */
  @property({ attribute: false }) params: Record<string, string> = {};

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override render() {
    return html`<div data-civ-demo-page-content></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-demo-page': CivDemoPage;
  }
}
