import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Task List
 *
 * Container for task groups in a multi-chapter form hub.
 * Renders a semantic list of task groups, each containing tasks
 * with status indicators.
 *
 * Based on the GDS Task List pattern adapted for government
 * benefit applications.
 *
 * @element civ-task-list
 *
 * @example
 * ```html
 * <civ-task-list>
 *   <civ-task-group heading="Personal details">
 *     <civ-task label="Your name" href="/name" status="complete"></civ-task>
 *     <civ-task label="Your address" href="/address" status="not-started"></civ-task>
 *   </civ-task-group>
 * </civ-task-list>
 * ```
 */
@customElement('civ-task-list')
export class CivTaskList extends LightDomSlotMixin(CivBaseElement) {
  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-task-list-content]' };
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override render() {
    return html`
      <div class="civ-task-list" role="list" data-civ-task-list-content></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-task-list': CivTaskList;
  }
}
