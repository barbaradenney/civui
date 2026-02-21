import { run, header, success, fail } from '../utils.js';

/**
 * civds validate [options]
 *
 * Run all validation checks:
 *   1. Lint (ESLint)
 *   2. TypeScript type checking
 *   3. Unit tests
 *   4. (optional) Accessibility audit
 *
 * Options:
 *   --a11y   Also run accessibility validation
 *   --fix    Auto-fix linting issues
 */
export async function validate(flags: Record<string, boolean | string>): Promise<void> {
  header('CivDS Validation');

  const steps: { name: string; cmd: string }[] = [
    { name: 'Lint', cmd: flags.fix ? 'pnpm lint:fix' : 'pnpm lint' },
    { name: 'TypeScript', cmd: 'npx tsc -b --force' },
    { name: 'Unit tests', cmd: 'npx vitest run' },
  ];

  if (flags.a11y) {
    steps.push({ name: 'Accessibility', cmd: 'npx vitest run --grep="a11y|accessibility|aria"' });
  }

  const results: { name: string; passed: boolean; time: number }[] = [];

  for (const step of steps) {
    const start = Date.now();
    console.log(`\n  Running: ${step.name}...`);
    try {
      run(step.cmd);
      results.push({ name: step.name, passed: true, time: Date.now() - start });
      success(step.name);
    } catch {
      results.push({ name: step.name, passed: false, time: Date.now() - start });
      fail(step.name);
    }
  }

  // Summary
  header('Validation Summary');
  let allPassed = true;
  for (const r of results) {
    const status = r.passed ? '[OK]' : '[FAIL]';
    const time = (r.time / 1000).toFixed(1);
    console.log(`  ${status} ${r.name} (${time}s)`);
    if (!r.passed) allPassed = false;
  }

  const totalTime = results.reduce((sum, r) => sum + r.time, 0);
  console.log(`\n  Total: ${(totalTime / 1000).toFixed(1)}s`);

  if (!allPassed) {
    throw new Error('Validation failed. Fix the issues above and try again.');
  }

  console.log('\n  All validations passed!\n');
}
