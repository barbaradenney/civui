#!/usr/bin/env node
/**
 * Post-build minification — runs esbuild on all dist/*.js files
 * to remove whitespace, shorten variable names, and reduce bundle size.
 * Preserves the file structure (no bundling) so tree-shaking still works.
 */
import { transform } from 'esbuild';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const packages = ['core', 'forms', 'ui', 'feedback', 'navigation'];

function getJsFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      getJsFiles(full, files);
    } else if (extname(full) === '.js') {
      files.push(full);
    }
  }
  return files;
}

async function minify() {
  let totalBefore = 0;
  let totalAfter = 0;
  let fileCount = 0;

  for (const pkg of packages) {
    const distDir = join(process.cwd(), 'packages', pkg, 'dist');
    let files;
    try {
      files = getJsFiles(distDir);
    } catch {
      continue; // dist doesn't exist
    }

    for (const file of files) {
      const source = readFileSync(file, 'utf-8');
      const result = await transform(source, {
        minify: true,
        target: 'es2022',
        format: 'esm',
      });
      totalBefore += source.length;
      totalAfter += result.code.length;
      fileCount++;
      writeFileSync(file, result.code);
    }
  }

  const savedPct = ((1 - totalAfter / totalBefore) * 100).toFixed(1);
  console.log(`Minified ${fileCount} files: ${(totalBefore / 1024).toFixed(0)}K → ${(totalAfter / 1024).toFixed(0)}K (${savedPct}% reduction)`);
}

minify().catch(console.error);
