import { html, nothing } from 'lit';
import { t } from '../i18n/locale.js';

/**
 * Heading level for promoting a label / legend / group label to a heading
 * via `role="heading"` + `aria-level=N`. Use sparingly — typically only the
 * primary question on a single-question page (level 1) or the top legend
 * inside a form-step (level 2/3).
 */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Visual size of a label or legend. Default (`undefined`) renders at body
 * size, bold — appropriate for inline form labels. Larger sizes are used
 * when the label doubles as the page or section heading.
 *
 * - `sm` — body size (same as default)
 * - `md` — `text-lg`, ~1.125rem
 * - `lg` — `text-xl`, ~1.25rem
 * - `xl` — `text-2xl`, ~1.5rem
 */
export type LabelSize = 'sm' | 'md' | 'lg' | 'xl';

/** Resolve a label-size variant to its CSS modifier class. */
function labelSizeClass(prefix: 'civ-label' | 'civ-legend', size?: LabelSize): string {
  if (!size || size === 'sm') return '';
  return `${prefix}--${size}`;
}

/** Build the ARIA-heading attributes object for a label/legend. */
function headingAttrs(headingLevel?: HeadingLevel) {
  return {
    role: headingLevel ? 'heading' : nothing,
    ariaLevel: headingLevel ? String(headingLevel) : nothing,
  };
}

/**
 * Render a standard form label with optional required indicator.
 * Used by text-input, textarea, select, combobox, date-input, date-picker, file-upload.
 * Checkbox and toggle have inline labels — they don't use this.
 *
 * @param showRequired - Override required indicator visibility. When false,
 *   the "(required)" text is hidden even if required is true. Used by compound
 *   components (memorable-date, address) whose parent legend already shows
 *   the required indicator. Defaults to the value of `required`.
 * @param headingLevel - When set, promotes the label to a heading via
 *   `role="heading"` + `aria-level=N` for screen-reader navigation. Keeps
 *   the native `<label>` element so click-to-focus continues to work.
 * @param size - Visual size variant. Defaults to body size (`sm`).
 */
export function renderLabel({
  label,
  inputId,
  required,
  showRequired,
  labelId,
  headingLevel,
  size,
}: {
  label: string;
  inputId: string;
  required: boolean;
  showRequired?: boolean;
  labelId?: string;
  headingLevel?: HeadingLevel;
  size?: LabelSize;
}) {
  if (!label) return nothing;
  const indicatorVisible = showRequired ?? required;
  const sizeClass = labelSizeClass('civ-label', size);
  const { role, ariaLevel } = headingAttrs(headingLevel);
  return html`
    <label
      class="civ-label ${sizeClass}"
      for="${inputId || nothing}"
      id="${labelId ?? nothing}"
      role="${role}"
      aria-level="${ariaLevel}"
    >
      ${label}
      ${indicatorVisible
        ? html`<span class="civ-required-mark">${t('required')}</span>`
        : nothing}
    </label>
  `;
}

/**
 * Render a fieldset legend with optional required indicator.
 * Used by radio-group, checkbox-group, fieldset, memorable-date.
 *
 * @param headingLevel - When set, promotes the legend to a heading via
 *   `role="heading"` + `aria-level=N` for screen-reader navigation.
 * @param size - Visual size variant. Defaults to body size (`sm`).
 */
export function renderLegend({
  legend,
  required,
  legendId,
  size,
  headingLevel,
  srOnly,
}: {
  legend: string;
  required: boolean;
  legendId?: string;
  size?: LabelSize;
  headingLevel?: HeadingLevel;
  srOnly?: boolean;
}) {
  if (!legend) return nothing;
  if (srOnly) {
    return html`<legend class="civ-sr-only">${legend}${required ? html` <span>${t('required')}</span>` : nothing}</legend>`;
  }
  const sizeClass = labelSizeClass('civ-legend', size);
  const { role, ariaLevel } = headingAttrs(headingLevel);
  return html`
    <legend
      class="civ-legend ${sizeClass}"
      id="${legendId ?? nothing}"
      role="${role}"
      aria-level="${ariaLevel}"
    >
      ${legend}
      ${required
        ? html`<span class="civ-required-mark">${t('required')}</span>`
        : nothing}
    </legend>
  `;
}

/**
 * Render a label for a `div[role="group"]` — a single conceptual field
 * composed of multiple sub-inputs (e.g., memorable-date, yes-no).
 *
 * Unlike `renderLabel`, this omits the `for` attribute since it labels
 * a group via `aria-labelledby`, not a single native input.
 */
export function renderGroupLabel({
  label,
  labelId,
  required,
  showRequired,
  headingLevel,
  size,
}: {
  label: string;
  labelId: string;
  required: boolean;
  showRequired?: boolean;
  headingLevel?: HeadingLevel;
  size?: LabelSize;
}) {
  if (!label) return nothing;
  const indicatorVisible = showRequired ?? required;
  const sizeClass = labelSizeClass('civ-label', size);
  const { role, ariaLevel } = headingAttrs(headingLevel);
  return html`
    <label
      class="civ-label ${sizeClass}"
      id="${labelId}"
      role="${role}"
      aria-level="${ariaLevel}"
    >
      ${label}
      ${indicatorVisible
        ? html`<span class="civ-required-mark">${t('required')}</span>`
        : nothing}
    </label>
  `;
}

/**
 * Render a hint span. Returns nothing if text is falsy.
 * @param groupSpacing - true for group components (civ-hint--group), false for individual inputs (civ-hint)
 */
export function renderHint(id: string, text: string, groupSpacing = false) {
  if (!text) return nothing;
  const cls = groupSpacing ? 'civ-hint--group' : 'civ-hint';
  return html`<span class="${cls}" id="${id}">${text}</span>`;
}

/**
 * Render an error span with role="alert". Returns nothing if text is falsy.
 * @param groupSpacing - true for group components (civ-error-text--group), false for individual inputs (civ-error-text)
 */
export function renderError(id: string, text: string, groupSpacing = false) {
  if (!text) return nothing;
  const cls = groupSpacing ? 'civ-error-text--group' : 'civ-error-text';
  return html`<span class="${cls}" id="${id}" role="alert">${text}</span>`;
}

/**
 * Render the standard form header block: label (or legend) → hint → error.
 *
 * For non-fieldset components the three elements are wrapped in a
 * `<div class="civ-form-header">` that consolidates bottom spacing.
 *
 * Fieldset components must keep `<legend>` as a direct child of `<fieldset>`
 * for screen-reader association, so pass `fieldset: true` to skip the wrapper.
 * Spacing inside `.civ-fieldset` is handled by CSS rules that mirror
 * `.civ-form-header` for visual consistency.
 */
export function renderFormHeader({
  label,
  hintId,
  hint,
  errorId,
  error,
  fieldset = false,
}: {
  /** Pre-rendered label/legend template (from renderLabel, renderGroupLabel, or renderLegend). */
  label: ReturnType<typeof renderLabel>;
  hintId: string;
  hint: string;
  errorId: string;
  error: string;
  /** True for fieldset/legend components — skips wrapper div (CSS handles spacing). */
  fieldset?: boolean;
}) {
  const hintEl = renderHint(hintId, hint);
  const errorEl = renderError(errorId, error);

  if (fieldset) {
    return html`${label}${hintEl}${errorEl}`;
  }
  return html`<div class="civ-form-header">${label}${hintEl}${errorEl}</div>`;
}

/** Build an `aria-describedby` value from hint and error IDs, returning empty string when neither applies. */
export function buildDescribedBy(hintId: string, hint: string, errorId: string, error: string): string {
  return [hint ? hintId : '', error ? errorId : ''].filter(Boolean).join(' ');
}

/** Build the class string for standard form inputs (text-input, textarea, select, combobox, date-picker). */
export function inputClasses({
  extra,
  rounded,
  width,
}: {
  extra?: string[];
  rounded?: string;
  width?: string;
} = {}): string {
  return [
    'civ-input',
    rounded ?? '',
    width ?? '',
    ...(extra ?? []),
    'focus-visible:civ-focus-ring',
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * Width variants shared across single-line form inputs (text-input, select,
 * combobox, etc.). Sized for typical fixed-width fields:
 *   - 2xs: a few characters (PIN, single digit)
 *   - xs:  ZIP / state code
 *   - sm:  ZIP+4 / phone
 *   - md:  short text (name, email-short)
 *   - lg:  most fields
 *   - xl:  longer fields (address line)
 *   - 2xl: very long fields
 *   - default: full width (`civ-w-full`)
 */
export type InputWidth = 'default' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/** Tailwind class names for each `InputWidth` variant. */
export const INPUT_WIDTH_CLASSES: Record<InputWidth, string> = {
  'default': 'civ-w-full',
  '2xs': 'civ-w-12',
  'xs': 'civ-w-16',
  'sm': 'civ-w-24',
  'md': 'civ-w-40',
  'lg': 'civ-w-60',
  'xl': 'civ-w-72',
  '2xl': 'civ-w-96',
};

/** Resolve the Tailwind class for a given `InputWidth`, defaulting to `default`. */
export function inputWidthClass(width: InputWidth | undefined): string {
  return INPUT_WIDTH_CLASSES[width ?? 'default'] ?? INPUT_WIDTH_CLASSES['default'];
}
