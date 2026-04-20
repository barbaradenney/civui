import { html, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { CivBaseElement } from '@civui/core';

/**
 * CivUI Task
 *
 * An individual task row within a task group. Provides a two-column
 * layout: content on the left, status on the right. Use `data-task-content`
 * and `data-task-status` to assign children to each area.
 * Everything else goes into the content area.
 *
 * @element civ-task
 *
 * @example
 * ```html
 * <civ-task>
 *   <div data-task-content>
 *     <civ-link href="#/contact">Contact information</civ-link>
 *     <span class="civ-hint civ-block">Phone number needed</span>
 *   </div>
 *   <div data-task-status>
 *     <civ-tag label="In progress" variant="teal"></civ-tag>
 *   </div>
 * </civ-task>
 * ```
 */
@customElement('civ-task')
export class CivTask extends CivBaseElement {
  private _contentChildren: Node[] = [];
  private _statusChildren: Node[] = [];
  private _childrenSorted = false;

  override connectedCallback(): void {
    if (!this._childrenSorted) {
      for (const child of Array.from(this.childNodes)) {
        if (child instanceof Element) {
          if (child.hasAttribute('data-task-status')) {
            this._statusChildren.push(child);
          } else {
            this._contentChildren.push(child);
          }
        } else {
          this._contentChildren.push(child);
        }
      }
      this._childrenSorted = true;
    }
    super.connectedCallback();
  }

  override firstUpdated(): void {
    const content = this.querySelector('[data-civ-task-content]');
    if (content) {
      for (const child of this._contentChildren) content.appendChild(child);
    }
    const status = this.querySelector('[data-civ-task-status]');
    if (status) {
      for (const child of this._statusChildren) status.appendChild(child);
    }
  }

  override render() {
    const hasStatus = this._statusChildren.length > 0;

    return html`
      <li class="civ-task" role="listitem">
        <div class="civ-task__content" data-civ-task-content></div>
        ${hasStatus ? html`
          <div class="civ-task__status" data-civ-task-status></div>
        ` : nothing}
      </li>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-task': CivTask;
  }
}
