/**
 * generate_case_dashboard tool — compose a case-style dashboard combining
 * workflow status, section progress, and audit trail into a single layout.
 */
import type { FormSchema } from '../schema/index.js';
import { generateWorkflowUi } from './generate-workflow-ui.js';
import { generateSectionProgress } from './generate-section-progress.js';
import { generateAuditTrail } from './generate-audit-trail.js';
import type { AuditEntry } from './generate-audit-trail.js';

export interface CaseDashboardResult {
  html: string;
  javascript: string;
  features: string[];
  summary: string;
}

export function generateCaseDashboard(
  schema: FormSchema,
  options?: {
    currentState?: string;
    currentActor?: string;
    completedValues?: Record<string, string | string[]>;
    auditEntries?: AuditEntry[];
  },
): CaseDashboardResult {
  if (!schema.workflow) {
    throw new Error('Schema must have a `workflow` definition to generate a case dashboard');
  }

  const features: string[] = ['case-dashboard'];
  const jsParts: string[] = [];

  // 1. Workflow status
  const workflowUi = generateWorkflowUi(
    schema,
    options?.currentState,
    options?.currentActor,
  );
  features.push(...workflowUi.features);
  jsParts.push(workflowUi.javascript);

  // 2. Section progress
  const progress = generateSectionProgress(schema, options?.completedValues);
  features.push(...progress.features);
  jsParts.push(progress.javascript);

  // 3. Audit trail (optional)
  let auditHtml = '';
  if (options?.auditEntries && options.auditEntries.length > 0) {
    const audit = generateAuditTrail(schema, options.auditEntries);
    auditHtml = audit.html;
    features.push(...audit.features);
  }

  // Compose two-column layout
  const htmlParts: string[] = [
    `<div class="civ-grid civ-grid-cols-1 md:civ-grid-cols-[280px_1fr] civ-gap-6">`,
    `  <!-- Sidebar: progress -->`,
    `  <aside aria-label="Section progress">`,
    `    ${progress.html}`,
    `  </aside>`,
    `  <!-- Main content -->`,
    `  <main>`,
    `    ${workflowUi.html}`,
    `    <div data-civ-form-area class="civ-mt-6">`,
    `      <!-- Form sections rendered here -->`,
    `    </div>`,
  ];

  if (auditHtml) {
    htmlParts.push(`    <div class="civ-mt-6">`);
    htmlParts.push(`      ${auditHtml}`);
    htmlParts.push(`    </div>`);
  }

  htmlParts.push(`  </main>`, `</div>`);

  // Merge JavaScript
  const javascript = `(function() {\n${jsParts.join('\n\n')}\n})();`;

  // Summary text
  const currentState = options?.currentState ?? schema.workflow.initialState;
  const stateObj = schema.workflow.states.find((s) => s.id === currentState);
  const summaryParts = [
    `Status: ${stateObj?.label ?? currentState}`,
    `Progress: ${progress.overallPercentage}%`,
    `Sections: ${progress.sections.length}`,
  ];
  if (options?.auditEntries) {
    summaryParts.push(`History entries: ${options.auditEntries.length}`);
  }

  return {
    html: htmlParts.join('\n'),
    javascript,
    features: [...new Set(features)],
    summary: summaryParts.join(', '),
  };
}
