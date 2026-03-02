/**
 * generate_lock_matrix tool — generate a state × actor permission matrix
 * showing which sections are editable, readonly, or hidden per combination.
 */
import type { FormSchema } from '../schema/index.js';

export interface SectionPermission {
  sectionHeading: string;
  access: 'editable' | 'readonly' | 'hidden';
}

export interface LockMatrixEntry {
  state: string;
  stateLabel: string;
  actor: string;
  actorLabel: string;
  sections: SectionPermission[];
}

export interface LockMatrixResult {
  matrix: LockMatrixEntry[];
  summary: string;
  dataAttributes: string;
}

export function generateLockMatrix(schema: FormSchema): LockMatrixResult {
  if (!schema.workflow) {
    throw new Error('Schema must have a `workflow` definition to generate a lock matrix');
  }
  if (!schema.actors || schema.actors.length === 0) {
    throw new Error('Schema must have an `actors` array to generate a lock matrix');
  }

  const { workflow, actors, sections } = schema;
  const matrix: LockMatrixEntry[] = [];

  for (const state of workflow.states) {
    for (const actor of actors) {
      const sectionPermissions: SectionPermission[] = sections.map((section, i) => {
        const heading = section.heading ?? `Section ${i + 1}`;

        // Visibility: undefined/absent = visible to all; [] = visible to nobody; [...ids] = check membership
        const stateVisible =
          !state.visibleTo || state.visibleTo.includes(actor.id);
        const sectionVisible =
          !section.visibleTo || section.visibleTo.includes(actor.id);

        if (!stateVisible || !sectionVisible) {
          return { sectionHeading: heading, access: 'hidden' as const };
        }

        // Phase check — section is only active in matching state
        if (section.phase && section.phase !== state.id) {
          return { sectionHeading: heading, access: 'hidden' as const };
        }

        // Editability: undefined/absent = editable by all; [] = editable by nobody; [...ids] = check membership
        const stateEditable =
          !state.editableBy || state.editableBy.includes(actor.id);
        const sectionEditable =
          !section.editableBy || section.editableBy.includes(actor.id);

        if (stateEditable && sectionEditable) {
          return { sectionHeading: heading, access: 'editable' as const };
        }

        return { sectionHeading: heading, access: 'readonly' as const };
      });

      matrix.push({
        state: state.id,
        stateLabel: state.label,
        actor: actor.id,
        actorLabel: actor.label,
        sections: sectionPermissions,
      });
    }
  }

  // Generate markdown summary
  const sectionHeadings = sections.map((s, i) => s.heading ?? `Section ${i + 1}`);
  const accessCode = (a: string) => (a === 'editable' ? 'E' : a === 'readonly' ? 'R' : 'H');

  let summary = '| State | Actor |';
  for (const h of sectionHeadings) {
    summary += ` ${h} |`;
  }
  summary += '\n|-------|-------|';
  for (const _h of sectionHeadings) {
    summary += '------|';
  }
  summary += '\n';

  for (const entry of matrix) {
    summary += `| ${entry.stateLabel} | ${entry.actorLabel} |`;
    for (const sp of entry.sections) {
      summary += ` ${accessCode(sp.access)} |`;
    }
    summary += '\n';
  }

  const dataAttributes =
    'Use `data-civ-lock-state="<state-id>"` and `data-civ-lock-actor="<actor-id>"` ' +
    'on section containers to enable JavaScript-based permission toggling. ' +
    'Set `data-civ-lock-access="editable|readonly|hidden"` on each section ' +
    'to reflect the current permission state.';

  return { matrix, summary, dataAttributes };
}
