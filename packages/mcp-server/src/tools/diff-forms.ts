/**
 * diff_forms tool — structured changeset between two CivUI form markups.
 * Compares form-participating components by name or positional index.
 */
import { load, type CheerioAPI } from 'cheerio';

export interface AttrChange {
  attribute: string;
  before: string | null;
  after: string | null;
}

export interface DiffEntry {
  element: string;
  name?: string;
  attributes: Record<string, string>;
}

export interface DiffChange {
  element: string;
  name?: string;
  changes: AttrChange[];
}

export interface FormDiff {
  added: DiffEntry[];
  removed: DiffEntry[];
  changed: DiffChange[];
  unchanged: number;
  summary: string;
}

/** All CivUI form-participating tags. */
const CIV_TAGS = new Set([
  'civ-text-input',
  'civ-textarea',
  'civ-select',
  'civ-combobox',
  'civ-date-picker',
  'civ-checkbox',
  'civ-toggle',
  'civ-file-upload',
  'civ-radio-group',
  'civ-checkbox-group',
  'civ-memorable-date',
  'civ-segmented-control',
  'civ-fieldset',
]);

interface ElementRecord {
  tag: string;
  name: string | undefined;
  attrs: Record<string, string>;
  matched: boolean;
}

function extractElements($: CheerioAPI): ElementRecord[] {
  const records: ElementRecord[] = [];
  const selector = Array.from(CIV_TAGS).join(', ');
  $(selector).each((_, el) => {
    if (el.type !== 'tag') return;
    const tag = el.tagName;
    const attrs: Record<string, string> = {};
    for (const [k, v] of Object.entries(el.attribs)) {
      attrs[k] = v;
    }
    records.push({
      tag,
      name: attrs['name'],
      attrs,
      matched: false,
    });
  });
  return records;
}

function diffAttrs(
  before: Record<string, string>,
  after: Record<string, string>,
): AttrChange[] {
  const changes: AttrChange[] = [];
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of allKeys) {
    const bVal = key in before ? before[key] : null;
    const aVal = key in after ? after[key] : null;
    if (bVal !== aVal) {
      changes.push({ attribute: key, before: bVal, after: aVal });
    }
  }
  return changes;
}

/**
 * Compute a structured diff between two CivUI form markups.
 *
 * @param before - Original CivUI HTML markup
 * @param after - Modified CivUI HTML markup
 * @returns Structured changeset
 */
export function diffForms(before: string, after: string): FormDiff {
  const $before = load(before);
  const $after = load(after);

  const beforeEls = extractElements($before);
  const afterEls = extractElements($after);

  // Phase 1: Match by name attribute
  for (const bEl of beforeEls) {
    if (bEl.matched || !bEl.name) continue;
    const match = afterEls.find(
      (a) => !a.matched && a.name === bEl.name && a.tag === bEl.tag,
    );
    if (match) {
      bEl.matched = true;
      match.matched = true;
    }
  }

  // Phase 2: Match remaining unnamed elements by position within same tag type
  const tagCountsBefore = new Map<string, number>();

  for (const bEl of beforeEls) {
    if (bEl.matched || bEl.name) continue;
    const idx = tagCountsBefore.get(bEl.tag) ?? 0;
    tagCountsBefore.set(bEl.tag, idx + 1);

    let posIdx = 0;
    for (const aEl of afterEls) {
      if (aEl.matched || aEl.name || aEl.tag !== bEl.tag) continue;
      if (posIdx === idx) {
        bEl.matched = true;
        aEl.matched = true;
        break;
      }
      posIdx++;
    }
  }

  const added: DiffEntry[] = [];
  const removed: DiffEntry[] = [];
  const changed: DiffChange[] = [];
  let unchanged = 0;

  // Build matched pairs for diffing
  const matchedPairs: [ElementRecord, ElementRecord][] = [];
  const usedAfter = new Set<number>();

  for (const bEl of beforeEls) {
    if (!bEl.matched) {
      removed.push({
        element: bEl.tag,
        name: bEl.name,
        attributes: bEl.attrs,
      });
      continue;
    }

    // Find the matching after element
    let matchIdx = -1;
    if (bEl.name) {
      matchIdx = afterEls.findIndex(
        (a, i) => !usedAfter.has(i) && a.matched && a.name === bEl.name && a.tag === bEl.tag,
      );
    }
    if (matchIdx === -1) {
      matchIdx = afterEls.findIndex(
        (a, i) => !usedAfter.has(i) && a.matched && a.tag === bEl.tag,
      );
    }

    if (matchIdx !== -1) {
      usedAfter.add(matchIdx);
      matchedPairs.push([bEl, afterEls[matchIdx]]);
    }
  }

  for (const aEl of afterEls) {
    if (!aEl.matched) {
      added.push({
        element: aEl.tag,
        name: aEl.name,
        attributes: aEl.attrs,
      });
    }
  }

  // Diff matched pairs
  for (const [bEl, aEl] of matchedPairs) {
    const changes = diffAttrs(bEl.attrs, aEl.attrs);
    if (changes.length > 0) {
      changed.push({
        element: bEl.tag,
        name: bEl.name ?? aEl.name,
        changes,
      });
    } else {
      unchanged++;
    }
  }

  const parts: string[] = [];
  if (added.length > 0) parts.push(`Added ${added.length} field${added.length === 1 ? '' : 's'}`);
  if (removed.length > 0) parts.push(`removed ${removed.length}`);
  if (changed.length > 0) parts.push(`changed ${changed.length}`);
  if (unchanged > 0) parts.push(`${unchanged} unchanged`);
  const summary = parts.join(', ') || 'No differences';

  return { added, removed, changed, unchanged, summary };
}
