import { html, nothing } from 'lit';

/**
 * Render a standard form label with optional required indicator.
 * Used by text-input, textarea, select, combobox, date-input, date-picker, file-upload.
 * Checkbox and toggle have inline labels — they don't use this.
 */
export function renderLabel({
  label,
  inputId,
  required,
  labelId,
}: {
  label: string;
  inputId: string;
  required: boolean;
  labelId?: string;
}) {
  if (!label) return nothing;
  return html`
    <label
      class="civ-label"
      for="${inputId || nothing}"
      id="${labelId ?? nothing}"
    >
      ${label}
      ${required
        ? html`<abbr class="civ-required-mark" title="required">*</abbr>`
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
    return html`<legend class="civ-sr-only">${legend}${required ? html` <span class="civ-sr-only">(required)</span>` : nothing}</legend>`;
  }
  const sizeClass = textSizeClass ?? 'civ-text-base';
  return html`
    <legend
      class="civ-legend ${sizeClass}"
      id="${legendId ?? nothing}"
    >
      ${legend}
      ${required
        ? html`<abbr class="civ-required-mark" title="required">*</abbr>`
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
