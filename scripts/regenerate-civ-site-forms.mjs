#!/usr/bin/env node
/**
 * Regenerate the static VA form HTML in apps/civ-site/forms/ from the MCP
 * server's `assembleGovForm`. Used after code changes to the generator so
 * the checked-in artifacts stay in sync with the source.
 *
 * Usage: node scripts/regenerate-civ-site-forms.mjs
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

const { assembleGovForm } = await import(
  join(repoRoot, 'packages/mcp-server/dist/tools/assemble-gov-form.js')
);
const { GOV_FORMS } = await import(
  join(repoRoot, 'packages/mcp-server/dist/resources/gov-form-registry.js')
);

const outDir = join(repoRoot, 'apps/civ-site/forms');
mkdirSync(outDir, { recursive: true });

let written = 0;
for (const def of GOV_FORMS) {
  const result = await assembleGovForm(def.formNumber, { format: 'html' });
  const filename = `${def.formNumber.toLowerCase()}.html`;
  writeFileSync(join(outDir, filename), result.html, 'utf-8');
  written++;
  console.log(`  ${filename}  (${result.pageCount} pages)`);
}

console.log(`\nRegenerated ${written} forms in ${outDir}`);
