import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, t } from '@civui/core';
import type { CivLocaleStrings } from '@civui/core';
import '@civui/ui/tag';
import '@civui/ui/link';

export type TaskStatus = 'not-started' | 'in-progress' | 'complete' | 'cannot-start' | 'error' | 'review';

const STATUS_TAG: Record<TaskStatus, { labelKey: keyof CivLocaleStrings; variant: string; style?: string }> = {
  'not-started': { labelKey: 'taskStatusNotStarted', variant: 'blue' },
  'in-progress': { labelKey: 'taskStatusInProgress', variant: 'teal' },
  'complete': { labelKey: 'taskStatusComplete', variant: 'green', style: 'primary' },
  'cannot-start': { labelKey: 'taskStatusCannotStart', variant: 'gray' },
  'error': { labelKey: 'taskStatusError', variant: 'red' },
  'review': { labelKey: 'taskStatusReview', variant: 'yellow', style: 'primary' },
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
    const tagDef = STATUS_TAG[this.status] || STATUS_TAG['not-started'];
    const isError = this.status === 'error';
    const prefillHint = this.prefilled ? t('taskPrefillHint') : '';

    return html`
      <li class="civ-task">
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
          ${this.hint || prefillHint ? html`
            <p class="civ-task__hint">
              ${this.hint}${this.hint && prefillHint ? html`<br>` : nothing}${prefillHint}
            </p>
          ` : nothing}
        </div>
        <div class="civ-task__status" id="${this._statusId}">
          <civ-tag
            label="${t(tagDef.labelKey)}"
            variant="${tagDef.variant}"
            tag-style="${tagDef.style || 'secondary'}"
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
