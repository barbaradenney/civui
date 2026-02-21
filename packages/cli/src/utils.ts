import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Find the monorepo root by looking for pnpm-workspace.yaml.
 */
export function findRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 10; i++) {
    if (existsSync(resolve(dir, 'pnpm-workspace.yaml'))) return dir;
    const parent = resolve(dir, '..');
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error('Could not find CivUI monorepo root (no pnpm-workspace.yaml found)');
}

/**
 * Run a shell command and stream output.
 */
export function run(cmd: string, cwd?: string): void {
  console.log(`\n> ${cmd}\n`);
  execSync(cmd, { cwd: cwd ?? findRoot(), stdio: 'inherit' });
}

/**
 * Run a shell command and return output as string.
 */
export function runCapture(cmd: string, cwd?: string): string {
  return execSync(cmd, { cwd: cwd ?? findRoot(), encoding: 'utf-8' }).trim();
}

/**
 * Print a section header.
 */
export function header(title: string): void {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`  ${title}`);
  console.log('='.repeat(50));
}

/**
 * Print a success message.
 */
export function success(msg: string): void {
  console.log(`  [OK] ${msg}`);
}

/**
 * Print a failure message.
 */
export function fail(msg: string): void {
  console.error(`  [FAIL] ${msg}`);
}

/**
 * Convert a kebab-case name to PascalCase.
 */
export function toPascalCase(name: string): string {
  return name
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}
