import { interpolate, t } from '@civui/core';
import { rowHeadingLevel, rowHeadingText, resolveFormStepsSummary } from './repeater-helpers.js';

/**
 * Imperative DOM builders for the inline and form-steps display modes.
 *
 * These paths can't be expressed cleanly in Lit `html\`\`` because they
 * clone consumer-slotted children into per-row containers — Lit
 * doesn't have a way to interpolate a live, capturing template tree
 * into its render output. So everything here is built with
 * `document.createElement`.
 *
 * The route-mode render path stays declarative in civ-repeater.ts.
 *
 * All builders take only the data they need (never the host element)
 * so the logic can be unit-tested without instantiating a repeater.
 */

/** Shared per-row container chrome. Returns the `<div data-civ-repeater-row>` host. */
function buildRowContainer(index: number, headingId: string): HTMLDivElement {
  const row = document.createElement('div');
  row.setAttribute('data-civ-repeater-row', String(index));
  row.setAttribute('role', 'group');
  row.setAttribute('aria-labelledby', headingId);
  row.classList.add('civ-repeater-row', 'civ-card');
  return row;
}

/**
 * Per-row heading element. Tag (`h${level}`) comes from the legend's
 * heading level + 1 so the outline stays consistent across modes; text
 * comes from the localized "{item} {index+1}" template.
 */
export function buildRowHeading(opts: {
  legendLevel: number | undefined;
  idPrefix: string;
  index: number;
  itemLabel: string;
}): HTMLElement {
  const level = rowHeadingLevel(opts.legendLevel);
  const heading = document.createElement(`h${level}`);
  heading.id = `${opts.idPrefix}-${opts.index}-heading`;
  heading.classList.add('civ-repeater-row-heading');
  heading.textContent = rowHeadingText(opts.itemLabel, opts.index);
  return heading;
}

/**
 * Remove `<civ-action-button>` for a per-row action cluster. Wired
 * via the `data-civ-repeater-action="remove"` attribute — the
 * repeater's delegated click handler on the rows container dispatches
 * to `removeRow(index)` when this is clicked.
 */
function buildRemoveButton(itemLabel: string, index: number): HTMLElement {
  const btn = document.createElement('civ-action-button');
  btn.setAttribute('variant', 'tertiary');
  btn.setAttribute('danger', '');
  btn.setAttribute('label', interpolate(t('repeaterRemoveLabel'), { item: itemLabel }));
  btn.setAttribute('data-civ-repeater-action', 'remove');
  btn.setAttribute('aria-label',
    interpolate(t('repeaterRemoveAriaLabel'), { item: itemLabel, index: String(index + 1) }));
  return btn;
}

/**
 * Edit `<civ-action-button>` for a per-row action cluster in
 * form-steps mode. Wired via `data-civ-repeater-action="edit"`.
 */
function buildEditButton(itemLabel: string, index: number): HTMLElement {
  const btn = document.createElement('civ-action-button');
  btn.setAttribute('variant', 'tertiary');
  btn.setAttribute('label', t('repeaterEditButton'));
  btn.setAttribute('data-civ-repeater-action', 'edit');
  btn.setAttribute('aria-label',
    interpolate(t('repeaterEditAriaLabel'), { item: itemLabel, index: String(index + 1) }));
  return btn;
}

/**
 * Apply the indexed-field-name pattern to a row's direct children.
 *
 * `<civ-text-input name="firstName">` inside a row at index 2 becomes
 * `<civ-text-input name="dependents[2].firstName">`. Only direct
 * children with their own `[name]` attribute are rewritten — inner
 * rendered inputs from CivUI components manage their own names.
 */
function indexInlineFieldNames(row: Element, index: number, baseName: string): void {
  for (const child of row.children) {
    const fieldName = child.getAttribute('name');
    if (!fieldName) continue;
    child.setAttribute('name', `${baseName}[${index}].${fieldName}`);
  }
}

/**
 * Apply the indexed-field-name pattern to the children of every
 * `[data-step-label]` block inside a cloned form-steps template.
 *
 * Same shape as {@link indexInlineFieldNames} but recurses one level
 * deeper because the form-steps template groups fields into step
 * divs. Skips fields whose name already contains a `[` so a repeated
 * `_buildFormSteps()` call doesn't double-prefix.
 */
function indexFormStepsFieldNames(el: Element, index: number, baseName: string): void {
  const stepDivs = el.hasAttribute('data-step-label')
    ? [el]
    : Array.from(el.querySelectorAll('[data-step-label]'));

  for (const stepDiv of stepDivs) {
    for (const child of stepDiv.children) {
      const fieldName = child.getAttribute('name');
      if (!fieldName || fieldName.includes('[')) continue;
      child.setAttribute('name', `${baseName}[${index}].${fieldName}`);
    }
  }
}

/** Options for {@link appendInlineRow}. */
export interface AppendInlineRowOptions {
  /** Container element to append into. */
  container: Element;
  /** Cloned template nodes from the consumer's slotted children. */
  template: Node[];
  /** Zero-based row index. */
  index: number;
  /** Base name for indexed field names (e.g. `dependents`). Empty falls back to `items`. */
  baseName: string;
  /** Label used in Add/Remove copy + announcements. */
  itemLabel: string;
  /** Heading id prefix from the repeater instance. */
  idPrefix: string;
  /** Legend heading level (used to derive the row heading level). */
  legendLevel: number | undefined;
  /** Minimum row count — removal isn't offered below this. */
  min: number;
  /** Current row count at the time of append (used with `min` to decide). */
  rowCount: number;
}

/**
 * Build and append a row for inline mode.
 *
 * Clones the captured template directly into the row, applies the
 * indexed-field-name rewriting, and conditionally appends a Remove
 * button when removal would still leave us at or above `min`.
 */
export function appendInlineRow(opts: AppendInlineRowOptions): void {
  const heading = buildRowHeading({
    legendLevel: opts.legendLevel,
    idPrefix: opts.idPrefix,
    index: opts.index,
    itemLabel: opts.itemLabel,
  });
  const row = buildRowContainer(opts.index, heading.id);
  row.appendChild(heading);

  for (const node of opts.template) {
    row.appendChild(node.cloneNode(true));
  }

  indexInlineFieldNames(row, opts.index, opts.baseName || 'items');

  if (opts.rowCount >= opts.min || opts.index >= opts.min) {
    const removeBtn = buildRemoveButton(opts.itemLabel, opts.index);
    removeBtn.classList.add('civ-mt-2');
    row.appendChild(removeBtn);
  }

  opts.container.appendChild(row);
}

/** Options for {@link appendFormStepsSummaryCard}. */
export interface AppendFormStepsSummaryCardOptions {
  container: Element;
  data: Record<string, string>;
  index: number;
  itemLabel: string;
  idPrefix: string;
  legendLevel: number | undefined;
}

/**
 * Build and append a summary card for form-steps mode after a row's
 * field values are saved. The card carries the row heading, the
 * extracted summary line (`<span class="civ-list-item__content">`),
 * and an Edit + Remove action cluster (`<span class="civ-list-item__actions">`).
 */
export function appendFormStepsSummaryCard(opts: AppendFormStepsSummaryCardOptions): void {
  const heading = buildRowHeading({
    legendLevel: opts.legendLevel,
    idPrefix: opts.idPrefix,
    index: opts.index,
    itemLabel: opts.itemLabel,
  });
  const row = buildRowContainer(opts.index, heading.id);
  row.appendChild(heading);

  const summary = document.createElement('div');
  summary.setAttribute('data-civ-repeater-summary', '');
  summary.classList.add('civ-list-item');

  const summaryText = document.createElement('span');
  summaryText.classList.add('civ-list-item__content', 'civ-font-medium');
  summaryText.textContent = resolveFormStepsSummary(opts.data, opts.index, opts.itemLabel);
  summary.appendChild(summaryText);

  const actions = document.createElement('span');
  actions.classList.add('civ-list-item__actions');
  actions.appendChild(buildEditButton(opts.itemLabel, opts.index));
  actions.appendChild(buildRemoveButton(opts.itemLabel, opts.index));
  summary.appendChild(actions);

  row.appendChild(summary);
  opts.container.appendChild(row);
}

/**
 * Extract `{ name: value }` pairs from every form field inside a
 * form-steps container. Used after `civ-step-complete` to capture the
 * values the user just typed into the wizard.
 *
 * Only CivUI custom elements (tagName starts with `CIV-`) and the three
 * standard form elements (input / select / textarea) are captured —
 * inner rendered inputs from CivUI components manage their own names,
 * and picking those up would produce duplicate entries with the same
 * key.
 */
export function extractFormStepsValues(container: Element): Record<string, string> {
  const data: Record<string, string> = {};
  for (const field of container.querySelectorAll('[name]')) {
    const name = field.getAttribute('name');
    if (!name) continue;
    const val = (field as HTMLElement & { value?: string }).value;
    if (val === undefined) continue;
    const tag = field.tagName;
    if (!(tag.startsWith('CIV-') || tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA')) continue;
    data[name] = val;
  }
  return data;
}

/**
 * Refresh the summary line on an existing form-steps card. Used when
 * the user edits a row and saves — only the summary text needs to
 * change; the action cluster and heading are reused.
 */
export function updateFormStepsSummaryText(
  row: Element,
  data: Record<string, string>,
  index: number,
  itemLabel: string,
): void {
  const summaryText = row.querySelector('[data-civ-repeater-summary] > span') as HTMLElement | null;
  if (summaryText) {
    summaryText.textContent = resolveFormStepsSummary(data, index, itemLabel);
  }
}

/**
 * Build a `<civ-form-step>` for the form-steps sub-flow.
 *
 * Clones the captured template into a fresh form-step, applies the
 * indexed-field-name pattern, and sets the consumer-supplied flags
 * (sensitive / show-pause / save-label).
 */
export function buildFormStepShell(opts: {
  template: Node[];
  index: number;
  itemLabel: string;
  baseName: string;
  sensitive: boolean;
  showPause: boolean;
}): HTMLElement {
  const formStep = document.createElement('civ-form-step');
  formStep.setAttribute('complete-label',
    interpolate(t('repeaterSaveButton'), { item: opts.itemLabel }));
  if (opts.sensitive) formStep.setAttribute('sensitive', '');
  if (opts.showPause) formStep.setAttribute('show-pause', '');

  for (const node of opts.template) {
    const clone = node.cloneNode(true);
    if (clone instanceof Element) {
      indexFormStepsFieldNames(clone, opts.index, opts.baseName || 'items');
    }
    formStep.appendChild(clone);
  }

  return formStep;
}
