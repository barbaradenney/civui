import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Process List
 *
 * Numbered vertical list of upcoming steps in a process — "here's what
 * to expect." Used on intro pages before a multi-step form, on benefit-
 * application landing pages, or anywhere the user needs a clear preview
 * of the path they're about to walk.
 *
 * Same visual idiom as `<civ-timeline>` (rail + connecting line +
 * trailing content per row) but with auto-incremented numbered markers
 * via CSS counters instead of intent-colored dots, and no timestamp
 * axis. Author oldest-to-newest in source order; rendering follows.
 *
 * For the "where am I right now in an in-flight flow" pattern, reach
 * for `<civ-progress-steps>` instead — that's the active-progress
 * indicator. Process list is for *preview*.
 *
 * **Content model.** Items are direct `<civ-process-list-item>`
 * children. The container renders as `<ol role="list">` so screen
 * readers announce sequence and count. Each item renders its own
 * numbered marker + connecting line; the connector on the last item
 * is suppressed automatically.
 *
 * @element civ-process-list
 *
 * @slot - One or more `<civ-process-list-item>` elements.
 *
 * @example
 * ```html
 * <civ-process-list>
 *   <civ-process-list-item heading="Gather your documents">
 *     You'll need your Social Security number and proof of income.
 *   </civ-process-list-item>
 *   <civ-process-list-item heading="Fill out the application">
 *     Most people finish in about 15 minutes.
 *   </civ-process-list-item>
 *   <civ-process-list-item heading="We review your application">
 *     A decision usually arrives within 30 days.
 *   </civ-process-list-item>
 * </civ-process-list>
 * ```
 */
@customElement('civ-process-list')
export class CivProcessList extends LightDomSlotMixin(CivBaseElement) {
  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-process-list-content]' };
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override render() {
    return html`
      <ol
        class="civ-process-list civ-list-none civ-p-0 civ-m-0"
        role="list"
        data-civ-process-list-content
      ></ol>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-process-list': CivProcessList;
  }
}
