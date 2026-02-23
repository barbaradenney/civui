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
      class="civ-block civ-mb-1 civ-text-base-darkest civ-font-bold civ-text-base"
      for="${inputId || nothing}"
      id="${labelId ?? nothing}"
    >
      ${label}
      ${required
        ? html`<abbr class="civ-text-error civ-no-underline" title="required">*</abbr>`
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
    return html`<legend class="civ-sr-only">${legend}</legend>`;
  }
  const sizeClass = textSizeClass ?? 'civ-text-base';
  return html`
    <legend
      class="civ-block civ-mb-1 civ-text-base-darkest civ-font-bold ${sizeClass}"
      id="${legendId ?? nothing}"
    >
      ${legend}
      ${required
        ? html`<abbr class="civ-text-error civ-no-underline" title="required">*</abbr>`
        : nothing}
    </legend>
  `;
}

/**
 * Render a hint span. Returns nothing if text is falsy.
 * @param groupSpacing - true for group components (civ-mb-2), false for individual inputs (civ-mb-1)
 */
export function renderHint(id: string, text: string, groupSpacing = false) {
  if (!text) return nothing;
  const mb = groupSpacing ? 'civ-mb-2' : 'civ-mb-1';
  return html`<span class="civ-block ${mb} civ-text-sm civ-text-base" id="${id}">${text}</span>`;
}

/**
 * Render an error span with role="alert". Returns nothing if text is falsy.
 * @param groupSpacing - true for group components (civ-mb-2), false for individual inputs (civ-mb-1)
 */
export function renderError(id: string, text: string, groupSpacing = false) {
  if (!text) return nothing;
  const mb = groupSpacing ? 'civ-mb-2' : 'civ-mb-1';
  return html`<span class="civ-block ${mb} civ-text-sm civ-text-error civ-font-bold" id="${id}" role="alert">${text}</span>`;
}

/**
 * Build the class string for standard form inputs (text-input, textarea, select, combobox, date-input, date-picker).
 */
export function inputClasses({
  error,
  disabled,
  extra,
  rounded,
  width,
}: {
  error?: string;
  disabled?: boolean;
  extra?: string[];
  rounded?: string;
  width?: string;
} = {}): string {
  return [
    'civ-block',
    width ?? 'civ-w-full',
    'civ-border',
    rounded ?? 'civ-rounded',
    'civ-px-2',
    'civ-py-1.5',
    'civ-text-base',
    'civ-font-sans',
    'civ-text-base-darkest',
    'civ-bg-white',
    ...(extra ?? []),
    error ? 'civ-border-error civ-border-l-4' : 'civ-border-base-light',
    disabled ? 'civ-opacity-50 civ-cursor-not-allowed civ-bg-base-lightest' : '',
    'focus-visible:civ-focus-ring',
  ]
    .filter(Boolean)
    .join(' ');
}
