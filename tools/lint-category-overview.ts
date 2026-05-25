#!/usr/bin/env tsx
/**
 * lint-category-overview — every docs category folder with N+ component
 * pages should have an `overview.mdx` landing page.
 *
 * Why this exists: as a category grows beyond ~6 components, consumers
 * lose the ability to figure out which one to use just by skimming the
 * sidebar. Each individual page has a "When to use vs. not" section,
 * but that requires already-clicking-into the right one to compare.
 *
 * An `overview.mdx` at `sidebar_position: 0` solves this — first thing
 * the consumer sees on entering the category. It carries the decision
 * tree, the visual catalog, and the cross-references to sibling
 * categories.
 *
 * Threshold: a category folder under `apps/docs/docs/components/<cat>/`
 * with **6 or more** non-partial `.mdx` pages (i.e. excluding auto-
 * generated `_<slug>.{props,events,methods}.mdx` partials) MUST contain
 * an `overview.mdx`.
 *
 * If a folder has fewer than 6 component pages, no overview is
 * required (yet) — the goal is to surface the pattern when the
 * category becomes hard to navigate, not to mandate ceremony for
 * 2-or-3-component groups.
 *
 * Pass with no findings.
 * Exit 1 on findings.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const DOCS_DIR = path.join(REPO_ROOT, 'apps/docs/docs/components');
const OVERVIEW_THRESHOLD = 6;

/**
 * Categories deliberately exempted from the overview requirement.
 *
 * The overview pattern exists for categories where consumers have to
 * *pick* between similar components (Actions: which button? Inputs:
 * which date control? Feedback: alert or notice or callout?). Some
 * categories are large but lack that decision overhead — the role of
 * each component is obvious from context.
 *
 * Removing an entry from this allowlist requires writing the
 * `overview.mdx` in the same PR (the lint will demand it).
 *
 * Rationale per exemption:
 *
 * - `form` — components are a sequenced kit (form → form-step → repeater
 *   → summary → conditional → progress), not a choice. The order of
 *   composition is the contract, not which one to pick.
 *
 * - `navigation` — each component carries its own role from the
 *   placement context (breadcrumb above content, side-nav in the rail,
 *   tab-nav inside a section, back-to-top anchored bottom-right). The
 *   decision is "which surface am I on", which the consumer already
 *   knows when they reach for navigation.
 */
const EXEMPT_CATEGORIES: ReadonlySet<string> = new Set([
  'form',
  'navigation',
  // `compound` components are each preset by domain (address, name,
  // direct-deposit, signature, …). The consumer picks based on what
  // government-form question they're answering, not by comparing
  // similar affordances. Revisit if a meaningful decision tree emerges
  // (e.g. "which family-relationship compound do I use for this case").
  'compound',
  // `data` is largely composed inside `civ-data-grid`, with siblings
  // (pagination, toolbar, bulk-actions, column-visibility) that are
  // grid sub-parts rather than alternatives. itemized-total /
  // metric-tile / table are the few standalone surfaces — too few to
  // need an overview today.
  'data',
]);

interface Finding {
  category: string;
  pageCount: number;
  pages: string[];
}

async function main(): Promise<void> {
  const findings: Finding[] = [];
  let folderCount = 0;

  const entries = await fs.readdir(DOCS_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const category = entry.name;
    const categoryDir = path.join(DOCS_DIR, category);

    const files = await fs.readdir(categoryDir);
    const componentPages = files
      .filter(
        (f) =>
          f.endsWith('.mdx') &&
          !f.startsWith('_') &&
          f !== 'overview.mdx' &&
          f !== 'index.mdx',
      )
      .sort();

    if (componentPages.length < OVERVIEW_THRESHOLD) {
      folderCount++;
      continue;
    }

    if (EXEMPT_CATEGORIES.has(category)) {
      folderCount++;
      continue;
    }

    const hasOverview =
      files.includes('overview.mdx') || files.includes('index.mdx');
    if (!hasOverview) {
      findings.push({
        category,
        pageCount: componentPages.length,
        pages: componentPages,
      });
    }
    folderCount++;
  }

  if (findings.length > 0) {
    console.error(
      `\n✗ ${findings.length} of ${folderCount} component categories with ${OVERVIEW_THRESHOLD}+ pages have no overview.mdx.\n`,
    );
    console.error(
      'Each large category should land on an overview page that surfaces the\n' +
        'decision tree, the visual catalog of components, and cross-references\n' +
        'to adjacent categories — otherwise consumers have to drill into each\n' +
        'individual page just to figure out which to use.\n',
    );
    for (const f of findings) {
      console.error(
        `  apps/docs/docs/components/${f.category}/  (${f.pageCount} component pages)`,
      );
      console.error(
        `    pages: ${f.pages.map((p) => p.replace(/\.mdx$/, '')).join(', ')}\n`,
      );
    }
    console.error(
      'Add an `overview.mdx` with `sidebar_position: 0` and `sidebar_label: Overview`.\n' +
        'See apps/docs/docs/components/actions/overview.mdx for the template.\n',
    );
    process.exit(1);
  }

  console.log(
    `✓ ${folderCount} component categories scanned — every category with ${OVERVIEW_THRESHOLD}+ pages has an overview.mdx.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
