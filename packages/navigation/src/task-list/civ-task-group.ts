import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomContainerMixin } from '@civui/core';

/**
 * CivUI Task Group
 *
 * A labeled group of tasks within a task list. Renders a heading
 * and contains child `civ-task` elements.
 *
 * @element civ-task-group
 *
 * @prop {string} heading - Group heading text
 *
 * @example
 * ```html
 * <civ-task-group heading="Fill out your application">
 *   <civ-task label="Personal info" href="/personal" status="complete"></civ-task>
 *   <civ-task label="Contact info" href="/contact" status="in-progress"></civ-task>
 * </civ-task-group>
 * ```
 */
@customElement('civ-task-group')
export class CivTaskGroup extends LightDomContainerMixin(CivBaseElement) {
  /** Group heading displayed above the tasks. */
  @property({ type: String }) heading = '';

  override firstUpdated(): void {
    this._relocateChildren('[data-civ-task-group-content]');
  }

  override render() {
    return html`
      <div class="civ-task-group civ-mb-6" role="listitem">
        ${this.heading ? html`
          <h3 class="civ-text-lg civ-font-semibold civ-mb-3">${this.heading}</h3>
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
