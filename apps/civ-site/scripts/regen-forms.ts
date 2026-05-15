#!/usr/bin/env tsx
/**
 * Regenerate every VA form HTML page in `apps/civ-site/forms/` from
 * the current `assembleGovForm` output.
 *
 * The forms in this directory were generated against an older
 * component contract — they reference retired tags (`civ-form-field`,
 * `civ-progress-bar`) and forbidden body-text classes
 * (`civ-text-muted` on `<p>`). The MCP generator itself emits the
 * modern shape; this script just re-runs it for every form in the
 * registry and writes the result to disk.
 *
 * Usage:
 *   pnpm --filter civ-site regen-forms
 *
 * The filename slug matches what `assembleGovForm` would write to
 * `tmpdir` in preview mode: lowercase form number, non-alphanumeric
 * collapsed to dashes (`21-526EZ` → `21-526ez.html`).
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { assembleGovForm } from '../../../packages/mcp-server/src/tools/assemble-gov-form.js';
import { getFormNumbers } from '../../../packages/mcp-server/src/resources/gov-form-registry.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FORMS_DIR = join(__dirname, '..', 'forms');

function slugFor(formNumber: string): string {
  return formNumber.toLowerCase().replace(/[^a-z0-9]/g, '-');
}

/**
 * Rewrite the CDN-import block in generated HTML to load civ-site's
 * local Vite-aliased entry point (`src/civui.ts`). The MCP generator
 * emits unpkg URLs by default — correct for external consumers once
 * @civui/* is published — but those URLs return 404 today, so the
 * scripts fail silently and no custom elements register. The local
 * entry imports styles and runs every @customElement decorator
 * through the Vite alias graph, which is what dev / preview need.
 */
function rewriteImportsForCivSite(html: string): string {
  // Match the whole CDN block from the leading comment through the
  // last @civui script tag. Each form has the same 10 script tags
  // plus the stylesheet link.
  const block = /<!-- CivUI Design System -->[\s\S]*?<script[^>]*@civui\/feedback[^>]*><\/script>/;
  if (!block.test(html)) {
    throw new Error('CivUI CDN import block not found — did the generator template change?');
  }
  return html.replace(
    block,
    '<!-- CivUI Design System (civ-site dev: resolved via Vite aliases) -->\n  <script type="module" src="/src/civui.ts"></script>',
  );
}

async function main(): Promise<void> {
  const formNumbers = getFormNumbers();
  console.log(`Regenerating ${formNumbers.length} forms into ${FORMS_DIR}`);

  let written = 0;
  let failed = 0;
  for (const formNumber of formNumbers) {
    try {
      const result = await assembleGovForm(formNumber, { format: 'html' });
      const filename = `${slugFor(formNumber)}.html`;
      const html = rewriteImportsForCivSite(result.html);
      writeFileSync(join(FORMS_DIR, filename), html, 'utf-8');
      console.log(`  ✓ ${formNumber} → ${filename} (${result.pageCount} pages)`);
      written++;
    } catch (err) {
      console.error(`  ✗ ${formNumber}: ${(err as Error).message}`);
      failed++;
    }
  }

  console.log(`\nWrote ${written} form(s)${failed > 0 ? `, ${failed} failed` : ''}.`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
