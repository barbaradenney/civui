#!/usr/bin/env node
/**
 * Build ESM bundles for CDN usage.
 * Consumers can use: <script type="module" src="https://cdn.example.com/civui.js"></script>
 *
 * Entry points are discovered from the workspace rather than hard-coded —
 * the previous hard-coded list had drifted (its `civui` entry pointed at
 * `packages/forms/src/index.ts`, a package that no longer exists, which
 * broke the whole build). We emit one bundle per browser-component package
 * plus an aggregate `civui` bundle that registers every element.
 *
 * A "browser-component package" is a non-private package that depends on
 * `lit` and exposes `src/index.ts`. The two lit-using dev/test helpers
 * (test-utils, storybook-utils) ship no end-user components and are excluded.
 */
import { build } from 'esbuild';
import { writeFileSync, readdirSync, existsSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const ROOT = process.cwd();
const outdir = join(ROOT, 'dist', 'cdn');

// lit-using packages that aren't shipped as end-user components.
const NON_COMPONENT = new Set(['test-utils', 'storybook-utils']);

function discoverComponentPackages() {
  const packagesDir = join(ROOT, 'packages');
  const names = [];
  for (const name of readdirSync(packagesDir)) {
    if (NON_COMPONENT.has(name)) continue;
    const pkgJsonPath = join(packagesDir, name, 'package.json');
    const indexPath = join(packagesDir, name, 'src', 'index.ts');
    if (!existsSync(pkgJsonPath) || !existsSync(indexPath)) continue;
    let pkg;
    try {
      pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
    } catch {
      continue;
    }
    if (pkg.private) continue;
    const deps = { ...pkg.dependencies, ...pkg.peerDependencies };
    if (!deps.lit) continue; // only browser-component packages register elements
    names.push(name);
  }
  return names.sort();
}

async function buildCDN() {
  const packages = discoverComponentPackages();
  if (packages.length === 0) {
    throw new Error('build-cdn: no component packages discovered under packages/*');
  }

  // Synthesize the all-in-one entry — side-effect imports register every
  // custom element. Written to a temp file so esbuild has a real entry path;
  // removed in `finally` regardless of build outcome.
  const aggregateEntry = join(tmpdir(), `civui-cdn-all-${process.pid}.ts`);
  writeFileSync(
    aggregateEntry,
    packages
      .map((p) => `import ${JSON.stringify(join(ROOT, 'packages', p, 'src', 'index.ts'))};`)
      .join('\n') + '\n',
  );

  const entryPoints = { civui: aggregateEntry };
  for (const p of packages) {
    entryPoints[`civui-${p}`] = join(ROOT, 'packages', p, 'src', 'index.ts');
  }

  try {
    const result = await build({
      entryPoints,
      bundle: true,
      format: 'esm',
      target: 'es2022',
      minify: true,
      splitting: true,
      outdir,
      external: [],
      metafile: true,
    });

    // Write size report
    const outputs = result.metafile.outputs;
    console.log(`CDN bundles built (${packages.length} component packages + aggregate):`);
    for (const [file, info] of Object.entries(outputs)) {
      if (file.endsWith('.js')) {
        console.log(`  ${file}: ${(info.bytes / 1024).toFixed(1)}K`);
      }
    }

    // Write metafile for analysis
    writeFileSync(join(outdir, 'metafile.json'), JSON.stringify(result.metafile, null, 2));
    console.log(`\nMetafile written to ${outdir}/metafile.json`);
    console.log('Analyze at: https://esbuild.github.io/analyze/');
  } finally {
    rmSync(aggregateEntry, { force: true });
  }
}

buildCDN().catch((err) => {
  console.error(err);
  process.exit(1);
});
