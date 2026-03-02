/**
 * generate_508_report tool — generate a prioritized Section 508 compliance report
 * with WCAG criterion mapping, severity scores, and remediation plan.
 */
import { validateForm } from '../validators/validate-form.js';
import type { Violation } from '../validators/rules.js';

export interface WcagMapping {
  criterion: string;
  name: string;
  level: 'A' | 'AA' | 'AAA';
}

export interface ReportViolation {
  rule: string;
  severity: 'error' | 'warning';
  message: string;
  element: string;
  fix: string;
  wcag: WcagMapping;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  effort: 'trivial' | 'small' | 'medium';
}

export interface Section508Report {
  score: number;
  grade: string;
  totalIssues: number;
  errorCount: number;
  warningCount: number;
  violations: ReportViolation[];
  byWcag: Record<string, ReportViolation[]>;
  byPriority: Record<string, ReportViolation[]>;
  remediationPlan: string;
  summary: string;
}

const RULE_TO_WCAG: Record<string, WcagMapping> = {
  'missing-label': { criterion: '1.3.1', name: 'Info and Relationships', level: 'A' },
  'missing-legend': { criterion: '1.3.1', name: 'Info and Relationships', level: 'A' },
  'placeholder-as-label': { criterion: '1.3.1', name: 'Info and Relationships', level: 'A' },
  'missing-required-message': { criterion: '3.3.1', name: 'Error Identification', level: 'A' },
  'deprecated-date-input': { criterion: '4.1.2', name: 'Name, Role, Value', level: 'A' },
  'orphaned-radio': { criterion: '1.3.1', name: 'Info and Relationships', level: 'A' },
  'orphaned-segment': { criterion: '1.3.1', name: 'Info and Relationships', level: 'A' },
  'label-on-group': { criterion: '1.3.1', name: 'Info and Relationships', level: 'A' },
  'legend-on-single': { criterion: '1.3.1', name: 'Info and Relationships', level: 'A' },
  'duplicate-name': { criterion: '4.1.1', name: 'Parsing', level: 'A' },
  'empty-select-options': { criterion: '4.1.2', name: 'Name, Role, Value', level: 'A' },
  'radio-group-single-option': { criterion: '1.3.1', name: 'Info and Relationships', level: 'A' },
  'generic-required-message': { criterion: '3.3.2', name: 'Labels or Instructions', level: 'A' },
  'missing-hint-date': { criterion: '3.3.2', name: 'Labels or Instructions', level: 'A' },
  'missing-hint-ssn': { criterion: '3.3.2', name: 'Labels or Instructions', level: 'A' },
  'missing-autocomplete': { criterion: '1.3.5', name: 'Identify Input Purpose', level: 'AA' },
  'abbreviation-in-label': { criterion: '3.1.4', name: 'Abbreviations', level: 'AAA' },
  'missing-name': { criterion: '4.1.2', name: 'Name, Role, Value', level: 'A' },
  'deprecated-focus-class': { criterion: '2.4.7', name: 'Focus Visible', level: 'AA' },
  'comma-in-checkbox-value': { criterion: '4.1.2', name: 'Name, Role, Value', level: 'A' },
  'nested-fieldset': { criterion: '1.3.1', name: 'Info and Relationships', level: 'A' },
  'large-radio-group': { criterion: '3.2.2', name: 'On Input', level: 'A' },
  'missing-form-wrapper': { criterion: '3.3.1', name: 'Error Identification', level: 'A' },
  'excessive-file-size': { criterion: '3.3.2', name: 'Labels or Instructions', level: 'A' },
  'toggle-without-default': { criterion: '3.2.2', name: 'On Input', level: 'A' },
  'reading-level': { criterion: '3.1.5', name: 'Reading Level', level: 'AAA' },
  'missing-inputmode': { criterion: '1.3.5', name: 'Identify Input Purpose', level: 'AA' },
  'form-length': { criterion: '3.3.2', name: 'Labels or Instructions', level: 'A' },
  'repeatable-missing-key': { criterion: '4.1.2', name: 'Name, Role, Value', level: 'A' },
  'repeatable-missing-buttons': { criterion: '4.1.2', name: 'Name, Role, Value', level: 'A' },
  'conditional-target-missing': { criterion: '4.1.2', name: 'Name, Role, Value', level: 'A' },
  'wizard-missing-progress': { criterion: '2.4.8', name: 'Location', level: 'AAA' },
  'repeatable-no-aria-live': { criterion: '4.1.3', name: 'Status Messages', level: 'AA' },
  'repeatable-no-min': { criterion: '3.3.2', name: 'Labels or Instructions', level: 'A' },
  'wizard-step-gap': { criterion: '2.4.8', name: 'Location', level: 'AAA' },
  'wizard-step-no-fields': { criterion: '3.3.2', name: 'Labels or Instructions', level: 'A' },
  'cascading-source-missing': { criterion: '4.1.2', name: 'Name, Role, Value', level: 'A' },
  'cascading-empty-map': { criterion: '4.1.2', name: 'Name, Role, Value', level: 'A' },
  'table-layout-not-repeatable': { criterion: '1.3.1', name: 'Info and Relationships', level: 'A' },
  'physical-css-property': { criterion: '1.3.4', name: 'Orientation', level: 'AA' },
};

const EFFORT_MAP: Record<string, 'trivial' | 'small' | 'medium'> = {
  'missing-label': 'trivial',
  'missing-legend': 'trivial',
  'placeholder-as-label': 'trivial',
  'missing-required-message': 'trivial',
  'deprecated-date-input': 'medium',
  'orphaned-radio': 'small',
  'orphaned-segment': 'small',
  'label-on-group': 'trivial',
  'legend-on-single': 'trivial',
  'duplicate-name': 'trivial',
  'empty-select-options': 'small',
  'radio-group-single-option': 'small',
  'generic-required-message': 'trivial',
  'missing-hint-date': 'trivial',
  'missing-hint-ssn': 'trivial',
  'missing-autocomplete': 'trivial',
  'abbreviation-in-label': 'trivial',
  'missing-name': 'trivial',
  'deprecated-focus-class': 'trivial',
  'comma-in-checkbox-value': 'trivial',
  'nested-fieldset': 'small',
  'large-radio-group': 'medium',
  'missing-form-wrapper': 'small',
  'excessive-file-size': 'trivial',
  'toggle-without-default': 'trivial',
  'reading-level': 'medium',
  'missing-inputmode': 'trivial',
  'form-length': 'medium',
  'repeatable-missing-key': 'trivial',
  'repeatable-missing-buttons': 'small',
  'conditional-target-missing': 'small',
  'wizard-missing-progress': 'small',
  'repeatable-no-aria-live': 'trivial',
  'repeatable-no-min': 'trivial',
  'wizard-step-gap': 'trivial',
  'wizard-step-no-fields': 'small',
  'cascading-source-missing': 'small',
  'cascading-empty-map': 'small',
  'table-layout-not-repeatable': 'small',
  'physical-css-property': 'trivial',
};

const DEFAULT_WCAG: WcagMapping = { criterion: '4.1.2', name: 'Name, Role, Value', level: 'A' };

function assignPriority(severity: 'error' | 'warning', wcag: WcagMapping): 'P1' | 'P2' | 'P3' | 'P4' {
  if (severity === 'error' && wcag.level === 'A') return 'P1';
  if (severity === 'error' && wcag.level === 'AA') return 'P2';
  if (severity === 'warning' && (wcag.level === 'A' || wcag.level === 'AA')) return 'P3';
  return 'P4';
}

function computeGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function mapViolation(v: Violation): ReportViolation {
  const wcag = RULE_TO_WCAG[v.rule] ?? DEFAULT_WCAG;
  const priority = assignPriority(v.severity, wcag);
  const effort = EFFORT_MAP[v.rule] ?? 'small';
  return {
    rule: v.rule,
    severity: v.severity,
    message: v.message,
    element: v.element,
    fix: v.fix,
    wcag,
    priority,
    effort,
  };
}

/**
 * Generate a prioritized Section 508 compliance report from CivUI HTML markup.
 */
export function generate508Report(html: string): Section508Report {
  const result = validateForm(html);
  const allViolations = [...result.errors, ...result.warnings];

  const violations = allViolations.map(mapViolation);

  const errorCount = result.errors.length;
  const warningCount = result.warnings.length;
  const rawScore = 100 - (errorCount * 5 + warningCount * 1);
  const score = Math.max(0, Math.min(100, rawScore));
  const grade = computeGrade(score);

  // Group by WCAG
  const byWcag: Record<string, ReportViolation[]> = {};
  for (const v of violations) {
    const key = v.wcag.criterion;
    if (!byWcag[key]) byWcag[key] = [];
    byWcag[key].push(v);
  }

  // Group by priority
  const byPriority: Record<string, ReportViolation[]> = {};
  for (const v of violations) {
    if (!byPriority[v.priority]) byPriority[v.priority] = [];
    byPriority[v.priority].push(v);
  }

  // Generate remediation plan
  const planLines: string[] = ['# Section 508 Remediation Plan\n'];
  for (const p of ['P1', 'P2', 'P3', 'P4'] as const) {
    const items = byPriority[p];
    if (!items || items.length === 0) continue;
    planLines.push(`## ${p} — ${p === 'P1' ? 'Critical' : p === 'P2' ? 'High' : p === 'P3' ? 'Medium' : 'Low'} Priority\n`);
    for (const item of items) {
      planLines.push(`- [ ] **${item.rule}** (WCAG ${item.wcag.criterion} ${item.wcag.level}, effort: ${item.effort})`);
      planLines.push(`  - ${item.message}`);
      planLines.push(`  - Fix: ${item.fix}`);
    }
    planLines.push('');
  }
  const remediationPlan = planLines.join('\n');

  const summary = allViolations.length === 0
    ? `Score: ${score}/100 (${grade}). No issues found.`
    : `Score: ${score}/100 (${grade}). ${errorCount} error${errorCount === 1 ? '' : 's'}, ${warningCount} warning${warningCount === 1 ? '' : 's'}.`;

  return {
    score,
    grade,
    totalIssues: allViolations.length,
    errorCount,
    warningCount,
    violations,
    byWcag,
    byPriority,
    remediationPlan,
    summary,
  };
}
