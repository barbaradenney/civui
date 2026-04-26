#!/usr/bin/env node
/**
 * Build a single ESM bundle for CDN usage.
 * Consumers can use: <script type="module" src="https://cdn.example.com/civui.min.js"></script>
 */
import { build } from 'esbuild';
import { writeFileSync } from 'fs';
import { join } from 'path';

const outdir = join(process.cwd(), 'dist', 'cdn');

async function buildCDN() {
  // Full bundle (all components)
  const result = await build({
    entryPoints: {
      'civui': join(process.cwd(), 'packages/forms/src/index.ts'),
      'civui-core': join(process.cwd(), 'packages/core/src/index.ts'),
      'civui-actions': join(process.cwd(), 'packages/actions/src/index.ts'),
      'civui-overlays': join(process.cwd(), 'packages/overlays/src/index.ts'),
      'civui-layout': join(process.cwd(), 'packages/layout/src/index.ts'),
      'civui-feedback': join(process.cwd(), 'packages/feedback/src/alert/civ-alert.ts'),
      'civui-navigation': join(process.cwd(), 'packages/navigation/src/skip-link/civ-skip-link.ts'),
    },
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
  console.log('CDN bundles built:');
  for (const [file, info] of Object.entries(outputs)) {
    if (file.endsWith('.js')) {
      console.log(`  ${file}: ${(info.bytes / 1024).toFixed(1)}K`);
    }
  }

  // Write metafile for analysis
  writeFileSync(join(outdir, 'metafile.json'), JSON.stringify(result.metafile, null, 2));
  console.log(`\nMetafile written to ${outdir}/metafile.json`);
  console.log('Analyze at: https://esbuild.github.io/analyze/');
}

buildCDN().catch(console.error);
