import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Activity Timeline
 *
 * Vertical timeline that lists `<civ-activity-item>` entries in
 * chronological order. The container renders as an ordered list
 * (`<ol role="list">`) so screen readers announce the sequence and
 * count, while sighted users see a rail of intent-colored dots with
 * a connecting line between them.
 *
 * Order in the markup is the visual order — author oldest-first or
 * newest-first as the situation calls for. A claim history page
 * typically reads top-down chronologically; an audit log reads
 * newest-first.
 *
 * **Content model.** Items are direct children. The timeline does not
 * generate the rail itself — each `<civ-activity-item>` renders its
 * own dot and connecting segment. This keeps the visual rail aligned
 * with the timeline's content even when items are added or removed.
 *
 * @element civ-activity-timeline
 *
 * @slot - One or more `<civ-activity-item>` elements.
 *
 * @example
 * ```html
 * <civ-activity-timeline>
 *   <civ-activity-item
 *     timestamp="2026-01-15T10:30:00Z"
 *     actor="Sarah Chen"
 *     action="Application submitted"
 *     intent="info">
 *   </civ-activity-item>
 *   <civ-activity-item
 *     timestamp="2026-01-16T14:20:00Z"
 *     actor="J. Martinez (Reviewer)"
 *     action="Approved"
 *     intent="success">
 *     All documentation verified.
 *   </civ-activity-item>
 * </civ-activity-timeline>
 * ```
 */
@customElement('civ-activity-timeline')
export class CivActivityTimeline extends LightDomSlotMixin(CivBaseElement) {
  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-activity-timeline-content]' };
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override render() {
    return html`
      <ol
        class="civ-activity-timeline civ-list-none civ-p-0 civ-m-0"
        role="list"
        data-civ-activity-timeline-content
      ></ol>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-activity-timeline': CivActivityTimeline;
  }
}
