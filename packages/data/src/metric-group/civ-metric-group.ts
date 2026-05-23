// Schema: packages/schema/src/components/civ-metric-group.schema.ts

import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Metric Group
 *
 * Responsive grid wrapper for `<civ-metric-tile>` children. Stacks to
 * a single column on mobile (≤480px), two columns on tablet (481–767px),
 * and up to `columns` columns on desktop (≥768px). The `columns` prop
 * is the maximum — narrower viewports never exceed their breakpoint cap.
 *
 * A pure layout primitive: no headings, no surrounding chrome. If you
 * need a labeled section ("Key metrics — last 30 days"), wrap the group
 * in a `<section>` with your own heading and divider.
 *
 * @element civ-metric-group
 *
 * @prop {number} columns - Maximum number of columns on desktop (2–6, default 4)
 *
 * @slot - One or more `<civ-metric-tile>` children
 *
 * @example
 * ```html
 * <civ-metric-group columns="3">
 *   <civ-metric-tile label="Applications" value="1,234"></civ-metric-tile>
 *   <civ-metric-tile label="Pending review" value="248"></civ-metric-tile>
 *   <civ-metric-tile label="Approved this week" value="47"></civ-metric-tile>
 * </civ-metric-group>
 * ```
 */
@customElement('civ-metric-group')
export class CivMetricGroup extends LightDomSlotMixin(CivBaseElement) {
  @property({ type: Number }) columns = 4;

  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-metric-group-content]' };
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override render() {
    const cols = Math.max(2, Math.min(6, Number(this.columns) || 4));
    return html`
      <div
        class="civ-metric-group"
        style="--civ-metric-group-cols: ${cols};"
        data-civ-metric-group-content
      ></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-metric-group': CivMetricGroup;
  }
}
