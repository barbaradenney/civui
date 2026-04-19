import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, t } from '@civui/core';
import type { CivLocaleStrings } from '@civui/core';

export type TaskStatus = 'not-started' | 'in-progress' | 'complete' | 'cannot-start' | 'error';

const STATUS_I18N_KEYS: Record<TaskStatus, keyof CivLocaleStrings> = {
  'not-started': 'taskStatusNotStarted',
  'in-progress': 'taskStatusInProgress',
  'complete': 'taskStatusComplete',
  'cannot-start': 'taskStatusCannotStart',
  'error': 'taskStatusError',
};

const STATUS_TAG_CLASS: Record<TaskStatus, string> = {
  'not-started': 'civ-tag civ-tag--blue',
  'in-progress': 'civ-tag civ-tag--teal',
  'complete': 'civ-task__status--complete',
  'cannot-start': 'civ-task__status--cannot-start',
  'error': 'civ-tag civ-tag--red',
};

/**
 * CivUI Task
 *
 * An individual task within a task group. Displays a label (as a link
 * when navigable), optional hint text, and a status indicator.
 *
 * @element civ-task
 *
 * @prop {string} label - Task name/description
 * @prop {string} href - Navigation target (omit for non-navigable tasks)
 * @prop {TaskStatus} status - Current task status
 * @prop {string} hint - Optional hint text below the label
 *
 * @example
 * ```html
 * <civ-task
 *   label="Contact information"
 *   href="#/contact"
 *   status="in-progress"
 *   hint="Phone number needed"
 * ></civ-task>
 * ```
 */
@customElement('civ-task')
export class CivTask extends CivBaseElement {
  /** Task name. */
  @property({ type: String }) label = '';

  /** Navigation target. When empty, task is not clickable. */
  @property({ type: String }) href = '';

  /** Current task status. */
  @property({ type: String }) status: TaskStatus = 'not-started';

  /** Optional hint text shown below the label. */
  @property({ type: String }) hint = '';

  private _statusId = this.generateId('status');

  override render() {
    const isNavigable = this.href && this.status !== 'cannot-start';
    const i18nKey = STATUS_I18N_KEYS[this.status];
    const statusLabel = i18nKey ? t(i18nKey) : this.status;
    const tagClass = STATUS_TAG_CLASS[this.status] || '';

    return html`
      <li class="civ-task" role="listitem">
        <div class="civ-task__name-and-hint">
          ${isNavigable
            ? html`<a
                class="civ-link civ-task__link civ-font-medium"
                href="${this.href}"
                aria-describedby="${this._statusId}"
              >${this.label}</a>`
            : html`<span class="civ-task__label civ-font-medium ${this.status === 'cannot-start' ? 'civ-text-muted' : ''}">${this.label}</span>`}
          ${this.hint
            ? html`<span class="civ-task__hint civ-text-sm civ-text-secondary civ-block">${this.hint}</span>`
            : nothing}
        </div>
        <div class="civ-task__status" id="${this._statusId}">
          <span class="${tagClass}">${statusLabel}</span>
        </div>
      </li>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-task': CivTask;
  }
}
