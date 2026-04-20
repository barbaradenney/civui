import { html, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { CivBaseElement } from '@civui/core';

/**
 * CivUI Task Group
 *
 * A group of tasks within a task list. Use `data-task-group-heading`
 * for the group heading. Everything else (civ-task elements) goes
 * into the task list.
 *
 * @element civ-task-group
 *
 * @example
 * ```html
 * <civ-task-group>
 *   <h3 data-task-group-heading class="civ-heading-md">Fill out your application</h3>
 *   <civ-task>...</civ-task>
 *   <civ-task>...</civ-task>
 * </civ-task-group>
 * ```
 */
@customElement('civ-task-group')
export class CivTaskGroup extends CivBaseElement {
  private _headingChildren: Node[] = [];
  private _taskChildren: Node[] = [];
  private _childrenSorted = false;

  override connectedCallback(): void {
    if (!this._childrenSorted) {
      for (const child of Array.from(this.childNodes)) {
        if (child instanceof Element) {
          if (child.hasAttribute('data-task-group-heading')) {
            this._headingChildren.push(child);
          } else {
            this._taskChildren.push(child);
          }
        } else {
          this._taskChildren.push(child);
        }
      }
      this._childrenSorted = true;
    }
    super.connectedCallback();
  }

  override firstUpdated(): void {
    const heading = this.querySelector('[data-civ-task-group-heading]');
    if (heading) {
      for (const child of this._headingChildren) heading.appendChild(child);
    }
    const content = this.querySelector('[data-civ-task-group-content]');
    if (content) {
      for (const child of this._taskChildren) content.appendChild(child);
    }
  }

  override render() {
    const hasHeading = this._headingChildren.length > 0;

    return html`
      <div class="civ-task-group civ-mb-6" role="listitem">
        ${hasHeading ? html`
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
