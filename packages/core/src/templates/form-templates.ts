import { html, nothing } from 'lit';
import { t } from '../i18n/locale.js';

/**
 * Render a standard form label with optional required indicator.
 * Used by text-input, textarea, select, combobox, date-input, date-picker, file-upload.
 * Checkbox and toggle have inline labels — they don't use this.
 */
/**
 * @param showRequired - Override required indicator visibility. When false,
 *   the "(required)" text is hidden even if required is true. Used by compound
 *   components (memorable-date, address) whose parent legend already shows
 *   the required indicator. Defaults to the value of `required`.
 */
export function renderLabel({
  label,
  inputId,
  required,
  showRequired,
  labelId,
}: {
  label: string;
  inputId: string;
  required: boolean;
  showRequired?: boolean;
  labelId?: string;
}) {
  if (!label) return nothing;
  const indicatorVisible = showRequired ?? required;
  return html`
    <label
      class="civ-label"
      for="${inputId || nothing}"
      id="${labelId ?? nothing}"
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
 */
export function renderLegend({
  legend,
  required,
  legendId,
  textSizeClass,
  srOnly,
}: {
  legend: string;
  required: boolean;
  legendId?: string;
  textSizeClass?: string;
  srOnly?: boolean;
}) {
  if (!legend) return nothing;
  if (srOnly) {
    return html`<legend class="civ-sr-only">${legend}${required ? html` <span>${t('required')}</span>` : nothing}</legend>`;
  }
  const sizeClass = textSizeClass ?? '';
  return html`
    <legend
      class="civ-legend ${sizeClass}"
      id="${legendId ?? nothing}"
    >
      ${legend}
      ${required
        ? html`<span class="civ-required-mark">${t('required')}</span>`
        : nothing}
    </legend>
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

/** Build an aria-describedby value from hint and error IDs */
export function buildDescribedBy(hintId: string, hint: string, errorId: string, error: string): string {
  return [hint ? hintId : '', error ? errorId : ''].filter(Boolean).join(' ');
}

/**
 * Build the class string for standard form inputs (text-input, textarea, select, combobox, date-input, date-picker).
 * Error and disabled states are now handled by CSS attribute selectors in components.css.
 */
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
