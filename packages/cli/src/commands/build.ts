import { run, header, success } from '../utils.js';

const PACKAGES = ['tokens', 'core', 'forms', 'react-native', 'cli'] as const;

/**
 * civds build [target]
 *
 * Build packages. Target can be a package name or "all".
 */
export async function build(
  target: string,
  flags: Record<string, boolean | string>,
): Promise<void> {
  const force = flags.force === true;

  if (!target || target === 'all') {
    header('Building all packages');
    const forceFlag = force ? ' --force' : '';
    run(`pnpm turbo build${forceFlag}`);
    success('All packages built');
    return;
  }

  if (target === 'tokens') {
    header('Building @civds/tokens');
    run('node build/build-tokens.js', 'packages/tokens');
    success('Tokens built');
    return;
  }

  const validPackages = PACKAGES.filter((p) => p !== 'tokens');
  if (validPackages.includes(target as any)) {
    header(`Building @civds/${target}`);
    run(`pnpm --filter @civds/${target} build`);
    success(`@civds/${target} built`);
    return;
  }

  throw new Error(
    `Unknown build target: "${target}". Valid targets: ${PACKAGES.join(', ')}, all`,
  );
}
