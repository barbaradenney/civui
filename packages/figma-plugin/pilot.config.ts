/**
 * Pilot configuration — which components ship in v0.1, what variant
 * axes to explode them across, and what fixed prop values to use when
 * rendering each variant.
 *
 * Variant axes come in two flavors:
 *   - schemaAxes: prop names whose schema enum/boolean values become
 *     Figma variant properties (auto-discovered from the schema).
 *   - states: interaction states (default / hover / focus / disabled /
 *     error) that aren't single props but are applied to the rendered
 *     component during capture. Added as a "State" variant property.
 *
 * Keep the matrix manageable — every (component × variant) combination
 * is captured at build time, so 5 schema axes × 4 states × 4 components
 * = 80 captures, which is the right ballpark for v0.1.
 */

export type InteractionState = 'default' | 'hover' | 'focus' | 'disabled' | 'error';

export interface PilotComponent {
  /** Schema name (e.g., 'civ-button') */
  name: string;
  /**
   * Prop names from the schema that become Figma variant axes. Each
   * must be an enum or boolean prop on the schema; the capture script
   * will explode the cartesian product of their values.
   */
  schemaAxes: string[];
  /**
   * Interaction states to render. Maps to a "State" variant property
   * in Figma. `default` is always included implicitly when this list
   * is non-empty.
   */
  states: InteractionState[];
  /**
   * Fixed props applied to every variant — labels, placeholders, body
   * text that must be present for the component to render meaningfully.
   * These do NOT become variant axes.
   */
  fixedProps: Record<string, string | number | boolean>;
  /** Optional default-slot HTML (for components like civ-alert that take slotted content) */
  slotHtml?: string;
}

export const PILOT: PilotComponent[] = [
  {
    name: 'civ-button',
    schemaAxes: ['variant', 'danger'],
    states: ['default', 'hover', 'focus', 'disabled'],
    fixedProps: { label: 'Submit application' },
  },
  {
    name: 'civ-text-input',
    schemaAxes: [],
    states: ['default', 'focus', 'error', 'disabled'],
    fixedProps: {
      label: 'Email address',
      placeholder: 'name@example.gov',
      hint: 'Use your work email if possible',
    },
  },
  {
    name: 'civ-checkbox',
    schemaAxes: ['checked', 'indeterminate'],
    states: ['default', 'focus', 'disabled'],
    fixedProps: { label: 'I agree to the terms', description: 'You can change this later.' },
  },
  {
    name: 'civ-alert',
    schemaAxes: ['variant', 'alertStyle'],
    states: ['default'],
    fixedProps: { heading: 'We saved your progress' },
    slotHtml: 'You can come back and finish this later from your dashboard.',
  },
];
