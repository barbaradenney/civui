import { describe, it, expect } from 'vitest';
import { generate508Report } from './generate-508-report.js';

describe('generate508Report', () => {
  // 1. Clean HTML -> score 100, grade A, no violations
  it('returns score 100 and grade A for clean HTML with no violations', () => {
    const html = '<civ-form><civ-form-field label="Name" required><civ-text-input name="n" required required-message="Enter your name"></civ-text-input></civ-form-field></civ-form>';
    const report = generate508Report(html);
    expect(report.score).toBe(100);
    expect(report.grade).toBe('A');
    expect(report.violations).toHaveLength(0);
    expect(report.errorCount).toBe(0);
    expect(report.warningCount).toBe(0);
  });

  // 2. Missing label -> P1 error with WCAG 1.3.1
  it('reports P1 error with WCAG 1.3.1 for missing label', () => {
    const html = '<civ-text-input name="n"></civ-text-input>';
    const report = generate508Report(html);
    const labelViolation = report.violations.find((v) => v.rule === 'missing-label');
    expect(labelViolation).toBeDefined();
    expect(labelViolation!.severity).toBe('error');
    expect(labelViolation!.priority).toBe('P1');
    expect(labelViolation!.wcag.criterion).toBe('1.3.1');
  });

  // 3. Missing legend -> P1 error with WCAG 1.3.1
  it('reports P1 error with WCAG 1.3.1 for missing legend', () => {
    const html = '<civ-radio-group name="c"></civ-radio-group>';
    const report = generate508Report(html);
    const legendViolation = report.violations.find((v) => v.rule === 'missing-legend');
    expect(legendViolation).toBeDefined();
    expect(legendViolation!.severity).toBe('error');
    expect(legendViolation!.priority).toBe('P1');
    expect(legendViolation!.wcag.criterion).toBe('1.3.1');
  });

  // 4. Deprecated date input -> P1 error with WCAG 4.1.2
  it('reports P1 error with WCAG 4.1.2 for deprecated date input', () => {
    const html = '<civ-form-field label="Date"><civ-date-input name="d"></civ-date-input></civ-form-field>';
    const report = generate508Report(html);
    const dateViolation = report.violations.find((v) => v.rule === 'deprecated-date-input');
    expect(dateViolation).toBeDefined();
    expect(dateViolation!.severity).toBe('error');
    expect(dateViolation!.priority).toBe('P1');
    expect(dateViolation!.wcag.criterion).toBe('4.1.2');
  });

  // 5. Missing autocomplete -> P3 warning with WCAG 1.3.5 (AA)
  it('reports P3 warning with WCAG 1.3.5 for missing autocomplete on identity field', () => {
    const html = '<civ-form><civ-form-field label="Email" required><civ-text-input name="email" required required-message="Enter email"></civ-text-input></civ-form-field></civ-form>';
    const report = generate508Report(html);
    const acViolation = report.violations.find((v) => v.rule === 'missing-autocomplete');
    expect(acViolation).toBeDefined();
    expect(acViolation!.severity).toBe('warning');
    expect(acViolation!.priority).toBe('P3');
    expect(acViolation!.wcag.criterion).toBe('1.3.5');
    expect(acViolation!.wcag.level).toBe('AA');
  });

  // 6. Missing hint date -> warning with WCAG 3.3.2
  it('reports warning with WCAG 3.3.2 for missing hint on date component', () => {
    const html = '<civ-form><civ-form-field label="Date of birth"><civ-memorable-date name="dob" required required-message="Enter DOB"></civ-memorable-date></civ-form-field></civ-form>';
    const report = generate508Report(html);
    const hintViolation = report.violations.find((v) => v.rule === 'missing-hint-date');
    expect(hintViolation).toBeDefined();
    expect(hintViolation!.severity).toBe('warning');
    expect(hintViolation!.wcag.criterion).toBe('3.3.2');
  });

  // 7. Multiple violations grouped by WCAG criterion
  it('groups multiple violations by WCAG criterion', () => {
    const html = '<civ-text-input name="a"></civ-text-input><civ-radio-group name="b"></civ-radio-group>';
    const report = generate508Report(html);
    const wcag131 = report.byWcag['1.3.1'];
    expect(wcag131).toBeDefined();
    expect(wcag131.length).toBeGreaterThanOrEqual(2);
    // Should have violations from both civ-text-input and civ-radio-group
    const elements = wcag131.map((v) => v.element);
    expect(elements).toContain('civ-text-input');
    expect(elements).toContain('civ-radio-group');
  });

  // 8. Multiple violations grouped by priority
  it('groups multiple violations by priority', () => {
    const html = '<civ-text-input name="a"></civ-text-input><civ-radio-group name="b"></civ-radio-group>';
    const report = generate508Report(html);
    const p1 = report.byPriority['P1'];
    expect(p1).toBeDefined();
    expect(p1.length).toBeGreaterThanOrEqual(2);
    // P1 should include violations from both elements
    const elements = p1.map((v) => v.element);
    expect(elements).toContain('civ-text-input');
    expect(elements).toContain('civ-radio-group');
  });

  // 9. Score calculation with mixed errors/warnings
  it('calculates score as 100 - (errors*5 + warnings*1)', () => {
    // Two missing-label errors + one missing-form-wrapper warning
    // Use two label components without labels inside a form to avoid missing-form-wrapper
    // but outside a form to get the warning.
    // <civ-text-input name="a"> -> missing-label (error) + missing-form-wrapper (warning)
    // <civ-text-input name="b"> -> missing-label (error) + missing-form-wrapper (warning)
    // That gives 2 errors + 2 warnings = 100 - (10+2) = 88
    // For exactly 2 errors + 1 warning = 89, wrap one in a form:
    const html = '<civ-form><civ-text-input name="a"></civ-text-input></civ-form><civ-text-input name="b"></civ-text-input>';
    const report = generate508Report(html);
    // Both have missing-label (2 errors), the unwrapped one has missing-form-wrapper (1 warning)
    expect(report.errorCount).toBe(2);
    expect(report.warningCount).toBe(1);
    expect(report.score).toBe(100 - (2 * 5 + 1 * 1));
    expect(report.score).toBe(89);
  });

  // 10. Grade thresholds
  it('assigns correct grade for each threshold boundary', () => {
    // Helper to build HTML with N missing-label errors (each -5 pts)
    // and M missing-form-wrapper warnings (each -1 pt)
    // We need unique names to avoid duplicate-name errors.
    // Use civ-text-input without label -> 1 error per element.
    // Outside civ-form -> 1 warning per element.
    function buildHtml(errorCount: number, warningCountExtra: number): string {
      // Wrap some in <civ-form> to control warnings separately.
      // Each civ-text-input without label outside form = 1 error + 1 warning.
      // Each civ-text-input without label inside form = 1 error + 0 warning.
      // So for E errors and W warnings total:
      //   W elements outside form (each contributes 1 error + 1 warning)
      //   (E - W) elements inside form (each contributes 1 error + 0 warning)
      const outsideCount = warningCountExtra;
      const insideCount = errorCount - warningCountExtra;
      const insideEls = Array.from({ length: insideCount }, (_, i) =>
        `<civ-text-input name="in${i}"></civ-text-input>`,
      ).join('');
      const outsideEls = Array.from({ length: outsideCount }, (_, i) =>
        `<civ-text-input name="out${i}"></civ-text-input>`,
      ).join('');
      return `<civ-form>${insideEls}</civ-form>${outsideEls}`;
    }

    // score 100 -> A (0 errors, 0 warnings)
    const r100 = generate508Report('<civ-form><civ-form-field label="Name" required><civ-text-input name="n" required required-message="Enter name"></civ-text-input></civ-form-field></civ-form>');
    expect(r100.grade).toBe('A');
    expect(r100.score).toBe(100);

    // score 90 -> A (2 errors, 0 warnings => 100 - 10 = 90)
    const r90 = generate508Report(buildHtml(2, 0));
    expect(r90.score).toBe(90);
    expect(r90.grade).toBe('A');

    // score 89 -> B (2 errors, 1 warning => 100 - 11 = 89)
    const r89 = generate508Report(buildHtml(2, 1));
    expect(r89.score).toBe(89);
    expect(r89.grade).toBe('B');

    // score 80 -> B (4 errors, 0 warnings => 100 - 20 = 80)
    const r80 = generate508Report(buildHtml(4, 0));
    expect(r80.score).toBe(80);
    expect(r80.grade).toBe('B');

    // score 79 -> C (4 errors, 1 warning => 100 - 21 = 79)
    const r79 = generate508Report(buildHtml(4, 1));
    expect(r79.score).toBe(79);
    expect(r79.grade).toBe('C');

    // score 70 -> C (6 errors, 0 warnings => 100 - 30 = 70)
    const r70 = generate508Report(buildHtml(6, 0));
    expect(r70.score).toBe(70);
    expect(r70.grade).toBe('C');

    // score 69 -> D (6 errors, 1 warning => 100 - 31 = 69)
    const r69 = generate508Report(buildHtml(6, 1));
    expect(r69.score).toBe(69);
    expect(r69.grade).toBe('D');

    // score 60 -> D (8 errors, 0 warnings => 100 - 40 = 60)
    const r60 = generate508Report(buildHtml(8, 0));
    expect(r60.score).toBe(60);
    expect(r60.grade).toBe('D');

    // score 59 -> F (8 errors, 1 warning => 100 - 41 = 59)
    const r59 = generate508Report(buildHtml(8, 1));
    expect(r59.score).toBe(59);
    expect(r59.grade).toBe('F');
  });

  // 11. Remediation plan is markdown string
  it('generates a remediation plan as a markdown string', () => {
    const html = '<civ-text-input name="n"></civ-text-input>';
    const report = generate508Report(html);
    expect(report.remediationPlan).toContain('#');
    expect(report.remediationPlan).toContain('Section 508 Remediation Plan');
    expect(report.remediationPlan).toContain('- [ ]');
  });

  // 12. Effort estimation per violation type
  it('assigns correct effort estimates per violation type', () => {
    // missing-label -> trivial
    const htmlLabel = '<civ-text-input name="n"></civ-text-input>';
    const reportLabel = generate508Report(htmlLabel);
    const labelV = reportLabel.violations.find((v) => v.rule === 'missing-label');
    expect(labelV).toBeDefined();
    expect(labelV!.effort).toBe('trivial');

    // deprecated-date-input -> medium
    const htmlDate = '<civ-form-field label="Date"><civ-date-input name="d"></civ-date-input></civ-form-field>';
    const reportDate = generate508Report(htmlDate);
    const dateV = reportDate.violations.find((v) => v.rule === 'deprecated-date-input');
    expect(dateV).toBeDefined();
    expect(dateV!.effort).toBe('medium');
  });

  // 13. byWcag grouping correctness
  it('groups all violations for the same WCAG criterion together in byWcag', () => {
    // Both missing-label and missing-legend map to WCAG 1.3.1
    const html = '<civ-text-input name="a"></civ-text-input><civ-radio-group name="b"></civ-radio-group>';
    const report = generate508Report(html);
    const wcag131 = report.byWcag['1.3.1'];
    expect(wcag131).toBeDefined();
    const rules = wcag131.map((v) => v.rule);
    expect(rules).toContain('missing-label');
    expect(rules).toContain('missing-legend');
    // Verify every violation in byWcag['1.3.1'] has the correct criterion
    for (const v of wcag131) {
      expect(v.wcag.criterion).toBe('1.3.1');
    }
  });

  // 14. byPriority grouping correctness
  it('groups all violations for the same priority together in byPriority', () => {
    const html = '<civ-text-input name="a"></civ-text-input><civ-radio-group name="b"></civ-radio-group>';
    const report = generate508Report(html);
    // All priority keys should have correctly assigned violations
    for (const [priority, violations] of Object.entries(report.byPriority)) {
      for (const v of violations) {
        expect(v.priority).toBe(priority);
      }
    }
    // P1 should contain the error-level A violations
    expect(report.byPriority['P1']).toBeDefined();
    expect(report.byPriority['P1'].length).toBeGreaterThan(0);
    for (const v of report.byPriority['P1']) {
      expect(v.severity).toBe('error');
    }
  });

  // 15. Summary includes error/warning counts
  it('includes error and warning counts in the summary', () => {
    const html = '<civ-text-input name="a"></civ-text-input><civ-radio-group name="b"></civ-radio-group>';
    const report = generate508Report(html);
    expect(report.errorCount).toBeGreaterThan(0);
    expect(report.warningCount).toBeGreaterThan(0);
    expect(report.summary).toContain(`${report.errorCount} error`);
    expect(report.summary).toContain(`${report.warningCount} warning`);
    expect(report.summary).toMatch(/Score: \d+\/100/);
    expect(report.totalIssues).toBe(report.errorCount + report.warningCount);
  });
});
