import { html, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Task Group
 *
 * A group of tasks within a task list. Use `data-task-group-heading`
 * for the group heading. Everything else goes into the task list.
 *
 * @element civ-task-group
 */
@customElement('civ-task-group')
export class CivTaskGroup extends LightDomSlotMixin(CivBaseElement) {
  override _getSlotConfig(): SlotConfig {
    return {
      'data-task-group-heading': '[data-civ-task-group-heading]',
      default: '[data-civ-task-group-content]',
    };
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override render() {
    return html`
      <div class="civ-task-group civ-mb-6" role="listitem">
        ${this._hasSlottedChildren('data-task-group-heading') ? html`
          <div data-civ-task-group-heading></div>
        ` : nothing}
        <ul class="civ-task-group__list" role="list" data-civ-task-group-content></ul>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-task-group': CivTaskGroup;
  }
}
