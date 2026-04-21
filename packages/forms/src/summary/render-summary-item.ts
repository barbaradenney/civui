import { html, nothing } from 'lit';
import { t } from '@civui/core';
import type { SummaryItem } from './civ-summary.js';

/**
 * Shared renderer for a summary item (label/value pair).
 * Used by civ-summary for review pages and civ-task for preview items.
 */
export function renderSummaryItem(item: SummaryItem) {
  const hasValue = Array.isArray(item.value)
    ? item.value.length > 0
    : Boolean(item.value);

  return html`
    <div class="civ-summary-item civ-flex civ-flex-wrap civ-py-2">
      <dt class="civ-font-medium civ-text-muted civ-summary-label">${item.label}</dt>
      <dd class="civ-flex-1 civ-min-w-0">
        ${hasValue
          ? Array.isArray(item.value)
            ? item.value.map(v => html`<span class="civ-block">${v}</span>`)
            : item.value
          : html`<span class="civ-text-muted civ-italic">${t('summaryNotProvided')}</span>`}
        ${item.source === 'profile'
          ? html`<civ-tag label="${t('summarySourceProfile')}" variant="gray" tag-style="secondary" class="civ-ms-1"></civ-tag>`
          : nothing}
        ${item.action
          ? html`<a href="${item.action.href}" class="civ-link civ-text-sm civ-ms-2">${item.action.label}</a>`
          : nothing}
      </dd>
    </div>
  `;
}
