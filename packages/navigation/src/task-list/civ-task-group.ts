import { html, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Task Group
 *
 * A group of tasks within a task list. Use `data-task-group-heading`
 * on a child heading element to set the group heading. All other
 * children are treated as task items.
 *
 * @element civ-task-group
 *
 * @example
 * ```html
 * <civ-task-group>
 *   <h3 data-task-group-heading class="civ-heading-md">Personal details</h3>
 *   <civ-task label="Your name" href="/name" status="complete"></civ-task>
 *   <civ-task label="Your address" href="/address" status="not-started"></civ-task>
 * </civ-task-group>
 * ```
 */
@customElement('civ-task-group')
export class CivTaskGroup extends LightDomSlotMixin(CivBaseElement) {
  private _headingId = this.generateId('heading');

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
    const hasHeading = this._hasSlottedChildren('data-task-group-heading');

    return html`
      <div
        class="civ-task-group civ-mb-6"
        role="listitem"
        aria-labelledby="${hasHeading ? this._headingId : nothing}"
      >
        ${hasHeading ? html`
          <div id="${this._headingId}" data-civ-task-group-heading></div>
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
