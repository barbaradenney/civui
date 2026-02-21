import { run, header, success } from '../utils.js';

const PACKAGES = ['tokens', 'core', 'forms', 'react-native', 'cli'] as const;

/**
 * civui build [target]
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
    header('Building @civui/tokens');
    run('node build/build-tokens.js', 'packages/tokens');
    success('Tokens built');
    return;
  }

  const validPackages = PACKAGES.filter((p) => p !== 'tokens');
  if (validPackages.includes(target as any)) {
    header(`Building @civui/${target}`);
    run(`pnpm --filter @civui/${target} build`);
    success(`@civui/${target} built`);
    return;
  }

  throw new Error(
    `Unknown build target: "${target}". Valid targets: ${PACKAGES.join(', ')}, all`,
  );
}
