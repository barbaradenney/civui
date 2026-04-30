import { t } from '../i18n/index.js';
import type { CivLocaleStrings } from '../i18n/index.js';

export type TaskStatus =
  | 'not-started'
  | 'in-progress'
  | 'complete'
  | 'cannot-start'
  | 'error'
  | 'review';

export interface TaskStatusTag {
  /** Localized label text. */
  label: string;
  /** civ-tag color variant. */
  variant: 'blue' | 'teal' | 'green' | 'gray' | 'red' | 'yellow';
  /** civ-tag style. Defaults to 'secondary' when omitted. */
  tagStyle?: 'primary' | 'secondary';
}

const STATUS_MAP: Record<TaskStatus, { labelKey: keyof CivLocaleStrings; variant: TaskStatusTag['variant']; tagStyle?: TaskStatusTag['tagStyle'] }> = {
  'not-started': { labelKey: 'taskStatusNotStarted', variant: 'blue' },
  'in-progress': { labelKey: 'taskStatusInProgress', variant: 'teal' },
  'complete': { labelKey: 'taskStatusComplete', variant: 'green', tagStyle: 'primary' },
  'cannot-start': { labelKey: 'taskStatusCannotStart', variant: 'gray' },
  'error': { labelKey: 'taskStatusError', variant: 'red' },
  'review': { labelKey: 'taskStatusReview', variant: 'yellow', tagStyle: 'primary' },
};

/**
 * Canonical mapping from a task status to the props for a `<civ-tag>`.
 *
 * Use this when building task lists from `<civ-list>` + `<civ-list-item>`.
 * It returns the localized label and the right tag variant/style for the
 * given status, so the same visual appears across every consumer.
 *
 * @example
 * ```ts
 * import { taskStatusTag } from '@civui/core';
 *
 * const tag = taskStatusTag('complete');
 * // { label: 'Complete', variant: 'green', tagStyle: 'primary' }
 *
 * html`
 *   <civ-list-item href="/personal">
 *     Personal information
 *     <civ-tag
 *       data-list-item-end
 *       label="${tag.label}"
 *       variant="${tag.variant}"
 *       tag-style="${tag.tagStyle ?? 'secondary'}"
 *     ></civ-tag>
 *   </civ-list-item>
 * `;
 * ```
 */
export function taskStatusTag(status: TaskStatus): TaskStatusTag {
  const def = STATUS_MAP[status] || STATUS_MAP['not-started'];
  return {
    label: t(def.labelKey),
    variant: def.variant,
    tagStyle: def.tagStyle,
  };
}
