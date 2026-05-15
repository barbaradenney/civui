/**
 * generate_audit_trail tool — generate a timeline/history component
 * for case-style government forms with workflow state transitions.
 */
import type { FormSchema } from '../schema/index.js';
import { escapeHtml } from './html-utils.js';

export interface AuditEntry {
  timestamp: string;
  actor: string;
  action: string;
  details?: string;
  stateFrom?: string;
  stateTo?: string;
}

export interface AuditTrailResult {
  html: string;
  entryCount: number;
  features: string[];
}

export function generateAuditTrail(
  schema: FormSchema,
  entries: AuditEntry[],
): AuditTrailResult {
  if (!schema.workflow && (!schema.actors || schema.actors.length === 0)) {
    throw new Error('Schema must have a `workflow` or `actors` definition to generate an audit trail');
  }

  const features: string[] = ['audit-trail'];

  // Resolve actor labels
  const actorMap = new Map<string, string>();
  if (schema.actors) {
    for (const actor of schema.actors) {
      actorMap.set(actor.id, actor.label);
    }
  }

  // Sort entries chronologically
  const sorted = [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const htmlParts: string[] = [
    `<section aria-labelledby="audit-trail-heading">`,
    `  <h2 id="audit-trail-heading" class="civ-text-xl civ-font-bold civ-mb-4">Case history</h2>`,
  ];

  if (sorted.length === 0) {
    htmlParts.push(`  <p>No history recorded.</p>`);
  } else {
    features.push('timeline');
    htmlParts.push(`  <ol data-civ-audit-trail class="civ-list-none civ-p-0">`);

    for (const entry of sorted) {
      const actorLabel = actorMap.get(entry.actor) ?? entry.actor;
      htmlParts.push(
        `    <li class="civ-border-s-2 civ-border-primary civ-ps-6 civ-pb-6 civ-relative">`,
        `      <time datetime="${escapeHtml(entry.timestamp)}" class="civ-text-sm civ-text-base-dark">${escapeHtml(entry.timestamp)}</time>`,
        `      <p class="civ-font-bold">${escapeHtml(actorLabel)}</p>`,
        `      <p>${escapeHtml(entry.action)}</p>`,
      );

      if (entry.stateFrom && entry.stateTo) {
        htmlParts.push(
          `      <p class="civ-text-sm">${escapeHtml(entry.stateFrom)} → ${escapeHtml(entry.stateTo)}</p>`,
        );
      }

      if (entry.details) {
        htmlParts.push(
          `      <p class="civ-text-sm civ-mt-1">${escapeHtml(entry.details)}</p>`,
        );
      }

      htmlParts.push(`    </li>`);
    }

    htmlParts.push(`  </ol>`);

    if (sorted.some((e) => e.stateFrom && e.stateTo)) {
      features.push('state-transitions');
    }
  }

  htmlParts.push(`</section>`);

  return {
    html: htmlParts.join('\n'),
    entryCount: sorted.length,
    features: [...new Set(features)],
  };
}
