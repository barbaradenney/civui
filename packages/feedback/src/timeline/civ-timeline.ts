import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Timeline
 *
 * Vertical timeline that lists `<civ-timeline-item>` entries in source
 * order. The container renders as an ordered list (`<ol role="list">`)
 * so screen readers announce the sequence and count, while sighted
 * users see a rail of intent-colored dots with a connecting line
 * between them.
 *
 * Order in the markup is the visual order — author oldest-first or
 * newest-first as the situation calls for. A claim history page
 * typically reads top-down chronologically; an audit log reads
 * newest-first.
 *
 * **Use cases.** Activity logs, case histories, claim status timelines,
 * document workflow trails, version histories, onboarding journeys,
 * audit logs, project milestones — anything that's a sequence of
 * dated events. For the in-flight "where am I now" pattern, reach
 * for `<civ-progress-steps>` instead.
 *
 * **Content model.** Items are direct children. The timeline does not
 * generate the rail itself — each `<civ-timeline-item>` renders its
 * own dot and connecting segment. This keeps the rail aligned with
 * the timeline's content even when items are added or removed.
 *
 * @element civ-timeline
 *
 * @slot - One or more `<civ-timeline-item>` elements.
 *
 * @example
 * ```html
 * <civ-timeline>
 *   <civ-timeline-item
 *     timestamp="2026-01-15T10:30:00Z"
 *     actor="Sarah Chen"
 *     action="Application submitted"
 *     intent="info">
 *   </civ-timeline-item>
 *   <civ-timeline-item
 *     timestamp="2026-01-16T14:20:00Z"
 *     actor="J. Martinez (Reviewer)"
 *     action="Approved"
 *     intent="success">
 *     All documentation verified.
 *   </civ-timeline-item>
 * </civ-timeline>
 * ```
 */
@customElement('civ-timeline')
export class CivTimeline extends LightDomSlotMixin(CivBaseElement) {
  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-timeline-content]' };
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override render() {
    return html`
      <ol
        class="civ-timeline civ-list-none civ-p-0 civ-m-0"
        role="list"
        data-civ-timeline-content
      ></ol>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-timeline': CivTimeline;
  }
}
