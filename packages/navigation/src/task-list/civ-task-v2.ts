import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, t } from '@civui/core';
import type { CivLocaleStrings } from '@civui/core';
import '@civui/layout/tag';
import '@civui/navigation/link-card';
import type { TaskStatus } from './civ-task.js';

const STATUS_TAG: Record<TaskStatus, { labelKey: keyof CivLocaleStrings; variant: string; style?: string }> = {
  'not-started': { labelKey: 'taskStatusNotStarted', variant: 'blue' },
  'in-progress': { labelKey: 'taskStatusInProgress', variant: 'teal' },
  'complete': { labelKey: 'taskStatusComplete', variant: 'green', style: 'primary' },
  'cannot-start': { labelKey: 'taskStatusCannotStart', variant: 'gray' },
  'error': { labelKey: 'taskStatusError', variant: 'red' },
  'review': { labelKey: 'taskStatusReview', variant: 'yellow', style: 'primary' },
};

/**
 * CivUI Task (v2 — experimental)
 *
 * Like `civ-task`, but the entire row is a clickable link card. The
 * status tag renders inside the card above the heading, so the whole
 * task is the click target. Drops in to `civ-task-group` like the
 * original.
 *
 * Non-navigable statuses (`cannot-start`, or any status without an
 * `href`) render as a plain row matching `civ-task`'s look.
 *
 * @element civ-task-v2
 *
 * @prop {string} label - Task name (rendered as the link card heading)
 * @prop {string} hint - Optional hint text (rendered as the description)
 * @prop {string} href - Navigation target (omit for locked tasks)
 * @prop {TaskStatus} status - Current task status
 * @prop {boolean} prefilled - Shows default prefill hint if no custom hint
 */
@customElement('civ-task-v2')
export class CivTaskV2 extends CivBaseElement {
  @property({ type: String }) label = '';
  @property({ type: String }) hint = '';
  @property({ type: String }) href = '';
  @property({ type: String }) status: TaskStatus = 'not-started';

  /** When true, shows a default prefill hint if no custom hint is set. */
  @property({ type: Boolean }) prefilled = false;

  override render() {
    const isNavigable = this.href && this.status !== 'cannot-start';
    const tagDef = STATUS_TAG[this.status] || STATUS_TAG['not-started'];
    const prefillHint = this.prefilled ? t('taskPrefillHint') : '';
    const description = [this.hint, prefillHint].filter(Boolean).join(' — ');

    const statusTag = html`
      <civ-tag
        label="${t(tagDef.labelKey)}"
        variant="${tagDef.variant}"
        tag-style="${tagDef.style || 'secondary'}"
      ></civ-tag>
    `;

    if (isNavigable) {
      return html`
        <li class="civ-task-v2">
          <civ-link-card
            href="${this.href}"
            heading="${this.label}"
            description="${description}"
            variant="tertiary"
          >
            <span class="civ-block civ-mb-2">${statusTag}</span>
          </civ-link-card>
        </li>
      `;
    }

    return html`
      <li class="civ-task">
        <div class="civ-task__content">
          <h4 class="civ-task__label">${this.label}</h4>
          ${description ? html`<p class="civ-task__hint">${description}</p>` : nothing}
        </div>
        <div class="civ-task__status">${statusTag}</div>
      </li>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-task-v2': CivTaskV2;
  }
}
