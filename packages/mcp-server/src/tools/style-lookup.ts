/**
 * Structured style lookup for CivUI component CSS classes.
 * Maps element types to their semantic CSS classes, state selectors, and usage notes.
 *
 * Source data mirrors packages/core/src/styles/components.css.
 */

/** All valid element types for the style lookup tool. */
export const ELEMENT_TYPES = [
  'label',
  'legend',
  'required-mark',
  'hint',
  'error-text',
  'input',
  'fieldset',
  'group-layout',
  'checkbox',
  'radio',
  'toggle',
  'segment',
  'file-upload',
  'combobox',
  'date-picker',
  'form-error-summary',
  'sr-only',
] as const;

export type ElementType = (typeof ELEMENT_TYPES)[number];

export interface StyleResult {
  classes: string[];
  stateClasses?: Record<string, string>;
  focusRing?: string;
  notes?: string[];
}

interface ElementStyleDef {
  classes: string[];
  variants?: Record<string, string[]>;
  states?: Record<string, string>;
  focusRing?: boolean;
  notes?: string[];
}

const FOCUS_RING_NOTE = 'Add focus-visible:civ-focus-ring to the interactive element';

/**
 * Complete element style definitions derived from components.css.
 * Each entry maps an element type to its base classes, state classes, and notes.
 */
const ELEMENT_STYLES: Record<ElementType, ElementStyleDef> = {
  label: {
    classes: ['.civ-label'],
    notes: ['Renders: block, mb-1, text-base-darkest, font-bold, text-base'],
  },
  legend: {
    classes: ['.civ-legend'],
    notes: ['Use for group components (radio-group, checkbox-group, memorable-date, segmented-control)'],
  },
  'required-mark': {
    classes: ['.civ-required-mark'],
    notes: ['Renders: text-error, no-underline — used for the asterisk on required fields'],
  },
  hint: {
    classes: ['.civ-hint'],
    variants: {
      group: ['.civ-hint--group'],
    },
    notes: [
      '.civ-hint for field-level hints (mb-1)',
      '.civ-hint--group for group-level hints (mb-2)',
    ],
  },
  'error-text': {
    classes: ['.civ-error-text'],
    variants: {
      group: ['.civ-error-text--group'],
    },
    notes: [
      '.civ-error-text for field-level errors (mb-1)',
      '.civ-error-text--group for group-level errors (mb-2)',
      'Always pair with role="alert" for screen reader announcements',
    ],
  },
  input: {
    classes: ['.civ-input'],
    states: {
      error: 'Set aria-invalid="true" to trigger: civ-border-error civ-border-s-4',
      disabled: 'Set disabled attribute to trigger: civ-opacity-50 civ-cursor-not-allowed civ-bg-base-lightest',
    },
    focusRing: true,
    notes: ['Use .civ-input for text inputs, textareas, and selects'],
  },
  fieldset: {
    classes: ['.civ-fieldset'],
    notes: ['Resets fieldset to: border-0, p-0, m-0, mb-4'],
  },
  'group-layout': {
    classes: ['.civ-group-layout--vertical'],
    variants: {
      vertical: ['.civ-group-layout--vertical'],
      horizontal: ['.civ-group-layout--horizontal'],
    },
    notes: [
      'Vertical (default): flex, flex-col, gap-1',
      'Horizontal: flex, flex-row, flex-wrap, gap-4',
    ],
  },
  checkbox: {
    classes: ['.civ-check-input', '.civ-check-label'],
    variants: {
      tile: ['.civ-check-tile', '.civ-check-input', '.civ-check-label'],
    },
    states: {
      checked: 'Non-tile: native browser :checked styling via accent-primary. Tile variant: .civ-check-tile:has(:checked) triggers: civ-border-primary civ-bg-primary-lightest',
      disabled: '.civ-check-tile:has(:disabled) triggers: civ-opacity-50 civ-cursor-not-allowed; .civ-check-input:disabled triggers: civ-cursor-not-allowed',
    },
    focusRing: true,
    notes: [
      '.civ-check-input for the input element (w-5, h-5, me-2, accent-primary)',
      '.civ-check-label for the label text',
      '.civ-check-description for optional description below',
      '.civ-check-tile wraps the option in a bordered card (tile variant)',
    ],
  },
  radio: {
    classes: ['.civ-check-input', '.civ-check-label'],
    variants: {
      tile: ['.civ-check-tile', '.civ-check-input', '.civ-check-label'],
    },
    states: {
      checked: 'Non-tile: native browser :checked styling via accent-primary. Tile variant: .civ-check-tile:has(:checked) triggers: civ-border-primary civ-bg-primary-lightest',
      disabled: '.civ-check-tile:has(:disabled) triggers: civ-opacity-50 civ-cursor-not-allowed; .civ-check-input:disabled triggers: civ-cursor-not-allowed',
    },
    focusRing: true,
    notes: [
      'Radio uses the same .civ-check-* classes as checkbox',
      '.civ-check-input for the input element',
      '.civ-check-label for the label text',
      '.civ-check-description for optional description below',
      '.civ-check-tile wraps the option in a bordered card (tile variant)',
    ],
  },
  toggle: {
    classes: ['.civ-toggle-track', '.civ-toggle-thumb'],
    states: {
      checked: 'Set aria-checked="true" on .civ-toggle-track to trigger: civ-bg-primary civ-border-primary',
      disabled: 'Set disabled on .civ-toggle-track to trigger: civ-opacity-50 civ-cursor-not-allowed',
    },
    focusRing: true,
    notes: [
      '.civ-toggle-track for the switch track (w-10, h-6, rounded-full)',
      '.civ-toggle-thumb for the sliding circle',
    ],
  },
  segment: {
    classes: ['.civ-segment-btn'],
    states: {
      selected: 'Set aria-checked="true" on .civ-segment-btn to trigger: civ-bg-primary civ-text-white civ-border-primary',
      disabled: 'Set disabled on .civ-segment-btn to trigger: civ-opacity-50 civ-cursor-not-allowed',
    },
    focusRing: true,
    notes: [
      'First segment gets civ-rounded-s, last gets civ-rounded-e via data-civ-segment-position',
      'Middle/last segments get civ-border-s-0 to avoid double borders',
    ],
  },
  'file-upload': {
    classes: ['.civ-dropzone'],
    states: {
      dragging: 'Set data-dragging attribute on .civ-dropzone to trigger: civ-border-primary civ-bg-primary-lightest',
      error: 'Set aria-invalid="true" on .civ-dropzone to trigger: civ-border-error',
      disabled: 'Set aria-disabled="true" on .civ-dropzone to trigger: civ-opacity-50 civ-cursor-not-allowed',
    },
    focusRing: true,
    notes: [
      '.civ-dropzone for the drag-and-drop area',
      '.civ-list-item for each uploaded file row (shared list item pattern)',
      '.civ-list-item__content for the file info area',
      '.civ-list-item__actions for action buttons',
    ],
  },
  combobox: {
    classes: ['.civ-input', '.civ-combobox-listbox', '.civ-combobox-option'],
    states: {
      active: 'Set data-active on .civ-combobox-option to trigger: civ-bg-primary civ-text-white',
      error: 'Set aria-invalid="true" on .civ-input to trigger: civ-border-error civ-border-s-4',
      disabled: 'Set disabled on .civ-input to trigger: civ-opacity-50 civ-cursor-not-allowed civ-bg-base-lightest',
    },
    focusRing: true,
    notes: [
      '.civ-input for the text input field',
      '.civ-combobox-listbox for the dropdown container',
      '.civ-combobox-option for each option in the dropdown',
    ],
  },
  'date-picker': {
    classes: ['.civ-input', '.civ-datepicker-dialog', '.civ-datepicker-day'],
    states: {
      selected: 'Set aria-selected="true" on .civ-datepicker-day to trigger: civ-bg-primary civ-text-white civ-font-bold',
      disabled: 'Set aria-disabled="true" on .civ-datepicker-day to trigger: civ-opacity-40 civ-cursor-not-allowed',
      error: 'Set aria-invalid="true" on .civ-input to trigger: civ-border-error civ-border-s-4',
    },
    focusRing: true,
    notes: [
      '.civ-input for the date text input',
      '.civ-datepicker-dialog for the calendar popup',
      '.civ-datepicker-day for each day cell',
      '.civ-datepicker-nav-btn for month navigation buttons',
      '.civ-datepicker-cal-btn for the calendar toggle button',
    ],
  },
  'form-error-summary': {
    classes: ['.civ-form-error-summary', '.civ-form-error-heading'],
    notes: [
      '.civ-form-error-summary for the error list container (border-s-4, border-error, bg-error-lighter)',
      '.civ-form-error-heading for the heading inside the summary',
    ],
  },
  'sr-only': {
    classes: ['.civ-sr-only'],
    notes: ['Visually hidden but accessible to screen readers'],
  },
};

/**
 * Look up the CSS classes, states, and notes for a CivUI element type.
 *
 * @param element  - The element type to look up
 * @param variant  - Optional variant (e.g., 'tile', 'group', 'horizontal')
 * @param states   - Optional state filter; omit to return all states
 * @returns Structured style result
 */
export function lookupStyle(
  element: string,
  variant?: string,
  states?: string[],
): StyleResult {
  if (!ELEMENT_TYPES.includes(element as ElementType)) {
    return {
      classes: [],
      notes: [
        `Unknown element "${element}". Valid types: ${ELEMENT_TYPES.join(', ')}`,
      ],
    };
  }

  const def = ELEMENT_STYLES[element as ElementType];

  // Resolve classes: variant overrides base when present
  const classes =
    variant && def.variants?.[variant]
      ? def.variants[variant]
      : def.classes;

  const result: StyleResult = { classes: [...classes] };

  // State classes — filter if specific states requested
  if (def.states) {
    const stateEntries = Object.entries(def.states);
    const filtered = states
      ? stateEntries.filter(([key]) => states.includes(key))
      : stateEntries;

    if (filtered.length > 0) {
      result.stateClasses = Object.fromEntries(filtered);
    }
  }

  // Focus ring — only for interactive elements
  if (def.focusRing) {
    result.focusRing = FOCUS_RING_NOTE;
  }

  // Notes
  if (def.notes && def.notes.length > 0) {
    result.notes = [...def.notes];
  }

  return result;
}
