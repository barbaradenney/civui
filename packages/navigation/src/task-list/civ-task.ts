import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, t } from '@civui/core';
import '@civui/ui/tag';
import '@civui/ui/link';

export type TaskStatus = 'not-started' | 'in-progress' | 'complete' | 'cannot-start' | 'error' | 'review';

const STATUS_TAG: Record<TaskStatus, { label: string; variant: string; style?: string }> = {
  'not-started': { label: 'Not started', variant: 'blue' },
  'in-progress': { label: 'In progress', variant: 'teal' },
  'complete': { label: 'Complete', variant: 'green', style: 'primary' },
  'cannot-start': { label: 'Cannot start yet', variant: 'gray' },
  'error': { label: 'Error', variant: 'red' },
  'review': { label: 'Review', variant: 'yellow', style: 'primary' },
};

/**
 * CivUI Task
 *
 * An individual task row within a task group. Renders a label as a
 * heading, optional hint, and status tag. When `href` is set, the
 * label becomes a clickable secondary link.
 *
 * @element civ-task
 *
 * @prop {string} label - Task name
 * @prop {string} hint - Optional hint text below the label
 * @prop {string} href - Navigation target (omit for locked tasks)
 * @prop {TaskStatus} status - Current task status
 * @prop {boolean} prefilled - Shows default prefill hint if no custom hint
 *
 * @example
 * ```html
 * <civ-task
 *   label="Contact information"
 *   hint="Phone number needed"
 *   href="#/contact"
 *   status="in-progress"
 * ></civ-task>
 * ```
 */
@customElement('civ-task')
export class CivTask extends CivBaseElement {
  @property({ type: String }) label = '';
  @property({ type: String }) hint = '';
  @property({ type: String }) href = '';
  @property({ type: String }) status: TaskStatus = 'not-started';

  /** When true, shows a default prefill hint if no custom hint is set. */
  @property({ type: Boolean }) prefilled = false;

  private _statusId = this.generateId('status');

  override render() {
    const isNavigable = this.href && this.status !== 'cannot-start';
    const tag = STATUS_TAG[this.status] || STATUS_TAG['not-started'];
    const isError = this.status === 'error';
    const prefillHint = this.prefilled ? t('taskPrefillHint') : '';

    return html`
      <li class="civ-task" role="listitem">
        <div class="civ-task__content">
          <h4 class="civ-task__label">
            ${isNavigable
              ? html`<civ-link
                  href="${this.href}"
                  variant="secondary"
                  ?danger="${isError}"
                  label="${this.label}"
                  aria-describedby="${this._statusId}"
                ></civ-link>`
              : html`${this.label}`}
          </h4>
          ${this.hint
            ? html`<p class="civ-task__hint">${this.hint}</p>`
            : nothing}
          ${prefillHint
            ? html`<p class="civ-task__hint">${prefillHint}</p>`
            : nothing}
        </div>
        <div class="civ-task__status" id="${this._statusId}">
          <civ-tag
            label="${tag.label}"
            variant="${tag.variant}"
            tag-style="${tag.style || 'secondary'}"
          ></civ-tag>
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
