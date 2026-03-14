import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { findRoot, header, runCapture } from '../utils.js';

/**
 * civui health
 *
 * Health dashboard showing project status:
 *   - Package count and versions
 *   - Component count
 *   - Test count
 *   - Build status
 *   - Bundle sizes
 */
export async function health(): Promise<void> {
  const root = findRoot();

  header('CivUI Health Dashboard');

  // Package info
  const rootPkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'));
  console.log(`\n  Version:  ${rootPkg.version}`);
  console.log(`  Node:     ${process.version}`);

  // Packages
  const packages = getPackages(root);
  console.log(`\n  Packages: ${packages.length}`);
  for (const pkg of packages) {
    const status = existsSync(resolve(root, 'packages', pkg, 'dist')) ? '[built]' : '[not built]';
    console.log(`    @civui/${pkg} ${status}`);
  }

  // Components
  const components = countComponents(root);
  console.log(`\n  Web Components:    ${components.web}`);

  // Tests
  const testFiles = countTestFiles(root);
  console.log(`\n  Test files:        ${testFiles}`);

  // Stories
  const storyFiles = countStoryFiles(root);
  console.log(`  Story files:       ${storyFiles}`);

  // Bundle sizes
  console.log('\n  Bundle sizes:');
  for (const pkg of packages) {
    const distPath = resolve(root, 'packages', pkg, 'dist');
    if (existsSync(distPath)) {
      const size = getDirSize(distPath);
      console.log(`    @civui/${pkg}: ${formatSize(size)}`);
    }
  }

  // Git info
  try {
    const branch = runCapture('git branch --show-current');
    const commitCount = runCapture('git rev-list --count HEAD');
    const lastCommit = runCapture('git log -1 --format="%h %s"');
    console.log(`\n  Branch:       ${branch}`);
    console.log(`  Commits:      ${commitCount}`);
    console.log(`  Last commit:  ${lastCommit}`);
  } catch {
    // Not in a git repo
  }

  console.log('');
}

function getPackages(root: string): string[] {
  const packagesDir = resolve(root, 'packages');
  if (!existsSync(packagesDir)) return [];
  return readdirSync(packagesDir).filter((d) =>
    existsSync(resolve(packagesDir, d, 'package.json')),
  );
}

function countComponents(root: string): { web: number } {
  const formsDir = resolve(root, 'packages/forms/src');
  let web = 0;
  if (existsSync(formsDir)) {
    const dirs = readdirSync(formsDir).filter(
      (d) => statSync(resolve(formsDir, d)).isDirectory(),
    );
    web = dirs.length;
  }

  return { web };
}

function countTestFiles(root: string): number {
  let count = 0;
  const packagesDir = resolve(root, 'packages');
  if (!existsSync(packagesDir)) return 0;

  for (const pkg of readdirSync(packagesDir)) {
    const srcDir = resolve(packagesDir, pkg, 'src');
    if (existsSync(srcDir)) {
      count += countFilesRecursive(srcDir, '.test.ts');
    }
  }
  return count;
}

function countStoryFiles(root: string): number {
  let count = 0;
  const packagesDir = resolve(root, 'packages');
  if (!existsSync(packagesDir)) return 0;

  for (const pkg of readdirSync(packagesDir)) {
    const srcDir = resolve(packagesDir, pkg, 'src');
    if (existsSync(srcDir)) {
      count += countFilesRecursive(srcDir, '.stories.ts');
      count += countFilesRecursive(srcDir, '.stories.tsx');
    }
  }
  return count;
}

function countFilesRecursive(dir: string, suffix: string): number {
  let count = 0;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      count += countFilesRecursive(full, suffix);
    } else if (entry.endsWith(suffix)) {
      count++;
    }
  }
  return count;
}

function getDirSize(dir: string): number {
  let size = 0;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      size += getDirSize(full);
    } else {
      size += stat.size;
    }
  }
  return size;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
