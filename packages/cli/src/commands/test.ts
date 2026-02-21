import { run, header, success } from '../utils.js';

/**
 * civui test [options]
 *
 * Run tests. Options:
 *   --unit          Run unit tests only (vitest)
 *   --integration   Run integration tests only (playwright)
 *   --watch         Run in watch mode
 *   --coverage      Generate coverage report
 */
export async function test(flags: Record<string, boolean | string>): Promise<void> {
  const isUnit = flags.unit === true;
  const isIntegration = flags.integration === true;
  const isWatch = flags.watch === true;
  const isCoverage = flags.coverage === true;

  if (isIntegration) {
    header('Running integration tests');
    run('npx playwright test');
    success('Integration tests passed');
    return;
  }

  // Default to unit tests
  header(isUnit ? 'Running unit tests' : 'Running all unit tests');

  const args: string[] = [];
  if (isWatch) {
    args.push('');
  } else {
    args.push('run');
  }

  if (isCoverage) {
    args.push('--coverage');
  }

  args.push('--reporter=verbose');

  const cmd = `npx vitest ${args.join(' ')}`.replace(/\s+/g, ' ').trim();
  run(cmd);
  success('All tests passed');
}
