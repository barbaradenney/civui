import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, t } from '@civui/core';

export type TaskStatus = 'not-started' | 'in-progress' | 'complete' | 'cannot-start' | 'error';

/** Preview item for showing prefilled data beneath a task. */
export interface TaskPreviewItem {
  label: string;
  value?: string;
  source?: 'profile' | 'user' | 'api';
  action?: { label: string; href: string };
}

const STATUS_TAG: Record<TaskStatus, { label: string; variant: string; style?: string }> = {
  'not-started': { label: 'Not started', variant: 'blue' },
  'in-progress': { label: 'In progress', variant: 'teal' },
  'complete': { label: 'Complete', variant: 'green', style: 'primary' },
  'cannot-start': { label: 'Cannot start yet', variant: 'gray' },
  'error': { label: 'Error', variant: 'red' },
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

  /** When true, data comes from profile — hint auto-populates. */
  @property({ type: Boolean }) locked = false;

  /** Preview items to show beneath the task (e.g., prefilled data). Set via JS. */
  @property({ type: Array, attribute: false }) preview: TaskPreviewItem[] = [];

  private _statusId = this.generateId('status');

  private get _hintText(): string {
    if (this.hint) return this.hint;
    if (this.locked) return t('taskLockedHint');
    if (this.prefilled) return t('taskPrefillHint');
    return '';
  }

  override render() {
    const isNavigable = this.href && this.status !== 'cannot-start';
    const tag = STATUS_TAG[this.status] || STATUS_TAG['not-started'];
    const isError = this.status === 'error';
    const hintText = this._hintText;

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
          ${hintText
            ? html`<p class="civ-task__hint">${hintText}</p>`
            : nothing}
          ${this.preview.length > 0
            ? html`
              <dl class="civ-task__preview civ-mt-2 civ-text-sm">
                ${this.preview.map(item => html`
                  <div class="civ-flex civ-gap-2 civ-py-0_5">
                    <dt class="civ-text-muted">${item.label}</dt>
                    <dd class="civ-m-0">
                      ${item.value || html`<span class="civ-text-muted civ-italic">Not provided</span>`}
                      ${item.action
                        ? html`<a href="${item.action.href}" class="civ-link civ-text-sm civ-ms-1">${item.action.label}</a>`
                        : nothing}
                    </dd>
                  </div>
                `)}
              </dl>
            ` : nothing}
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
