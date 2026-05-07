/**
 * CivUI Component Schema — Platform-neutral component definitions
 *
 * This schema format defines CivUI components once, enabling code generation
 * for Lit (web), SwiftUI (iOS), and Jetpack Compose (Android).
 *
 * Design principles:
 * - Captures the *contract*, not the implementation
 * - Platform renderers handle the mapping to native primitives
 * - Tokens are referenced by name, resolved at render time per platform
 * - Accessibility requirements are first-class, not afterthoughts
 */

// ---------------------------------------------------------------------------
// Prop types
// ---------------------------------------------------------------------------

/**
 * Source of truth for prop types. The TS union below is derived from this
 * array, and the runtime validator imports the array directly — adding a
 * new value here automatically flows through both compile-time typing and
 * runtime validation.
 */
export const PROP_TYPES = ['string', 'boolean', 'number', 'enum', 'array'] as const;
export type PropType = typeof PROP_TYPES[number];

export interface PropDef {
  /** Data type of this prop */
  type: PropType;

  /** Human-readable description */
  description: string;

  /** Default value (omit for required props with no default) */
  default?: string | number | boolean | unknown[];

  /** Whether this prop is required for the component to function */
  required?: boolean;

  /** For enum types: the allowed values */
  values?: string[];

  /** For array types: the shape of each item */
  items?: Record<string, PropDef>;

  /** Whether this prop should be reflected as an HTML attribute */
  reflect?: boolean;

  /** HTML attribute name if different from the prop name */
  attribute?: string;

  /**
   * When true, this prop is a web-specific abstraction (Tailwind
   * size class, ARIA heading-level promotion, JS-only callback, etc.)
   * that doesn't have a clean cross-platform mapping. The schema-parity
   * check skips it on iOS / Android / Drupal so platform parity isn't
   * blocked by props that don't translate.
   */
  webOnly?: boolean;
}

// ---------------------------------------------------------------------------
// Event types
// ---------------------------------------------------------------------------

export interface EventDetailField {
  type: 'string' | 'boolean' | 'number' | 'string[]' | 'File[]' | 'object';
  description?: string;
}

export interface EventDef {
  /** Human-readable description */
  description: string;

  /** Shape of the event detail object */
  detail: Record<string, EventDetailField>;
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export interface A11yDef {
  /** ARIA role for the control element */
  role: string;

  /** How the required state is communicated */
  requiredIndicator: 'asterisk' | 'text' | 'none';

  /** How errors are announced to screen readers */
  errorAnnouncement: 'assertive' | 'polite' | 'none';

  /** aria-describedby sources (IDs are generated per platform) */
  describedBy?: string[];

  /** Additional ARIA attributes to set on the control */
  ariaAttributes?: Record<string, string | boolean>;
}

// ---------------------------------------------------------------------------
// Width mapping
// ---------------------------------------------------------------------------

export interface WidthVariant {
  /** Tailwind class for web */
  webClass: string;

  /** Points for iOS */
  iosPoints: number | null;

  /** DP for Android */
  androidDp: number | null;
}

// ---------------------------------------------------------------------------
// Render tree
// ---------------------------------------------------------------------------

/**
 * Platform-neutral render element.
 * Each element maps to a native primitive on each platform:
 *   label  → <label>       / Text (bold)     / Text (bold)
 *   hint   → <span>        / Text (small)    / Text (small)
 *   error  → <span alert>  / Text (announce) / Text (LiveRegion)
 *   input  → <input>       / TextField       / TextField
 *   select → <select>      / Picker          / ExposedDropdownMenu
 *   button → <button>      / Button          / Button
 *   slot   → <slot>        / ViewBuilder     / @Composable content
 */
export const RENDER_ELEMENT_TYPES = [
  'label', 'hint', 'error', 'input', 'select', 'checkbox', 'switch', 'button', 'slot', 'container',
] as const;
export type RenderElementType = typeof RENDER_ELEMENT_TYPES[number];

export interface RenderElement {
  /** Element type — maps to platform primitives */
  type: RenderElementType;

  /** Condition for rendering (prop name or expression) */
  condition?: string;

  /** Props to bind from the component's props */
  bindings?: Record<string, string>;

  /** Children elements */
  children?: RenderElement[];
}

// ---------------------------------------------------------------------------
// Form behavior
// ---------------------------------------------------------------------------

/**
 * How a component participates in form submission. Source-of-truth array;
 * the union below is derived and the runtime validator imports the array.
 *  - string:  value is always a string (text-input, select, textarea)
 *  - boolean: value is submitted when checked, null when unchecked (checkbox, toggle)
 *  - multi:   FormData with multiple values (checkbox-group, date-range-picker)
 *  - file:    FormData with File objects (file-upload)
 */
export const FORM_VALUE_MODES = ['string', 'boolean', 'multi', 'file'] as const;
export type FormValueMode = typeof FORM_VALUE_MODES[number];

export interface FormBehavior {
  /** How this component participates in form submission */
  valueMode: FormValueMode;

  /** Whether this is a form-associated custom element */
  formAssociated: boolean;

  /** What happens on form reset */
  resetBehavior: 'restore-default-value' | 'restore-default-checked' | 'clear-files';
}

// ---------------------------------------------------------------------------
// Platform-specific overrides
// ---------------------------------------------------------------------------

export interface PlatformOverrides {
  web?: {
    /** Extra CSS classes on the control */
    controlClasses?: string[];
    /** HTML input type mapping */
    inputTypeAttribute?: string;
  };
  ios?: {
    /** SwiftUI-specific view to use (e.g., SecureField for password) */
    secureVariant?: string;
    /** Keyboard type mapping */
    keyboardType?: Record<string, string>;
    /** Content type mapping */
    contentType?: Record<string, string>;
    /** Autocapitalization */
    autocapitalization?: Record<string, string>;
  };
  android?: {
    /** Compose keyboard type mapping */
    keyboardType?: Record<string, string>;
    /** Capitalization mapping */
    capitalization?: Record<string, string>;
    /** Visual transformation (e.g., password masking) */
    visualTransformation?: Record<string, string>;
  };
}

// ---------------------------------------------------------------------------
// Component Schema (top-level)
// ---------------------------------------------------------------------------

export const COMPONENT_CATEGORIES = [
  'form-control', 'form-group', 'form-container', 'ui', 'feedback', 'navigation',
] as const;
export type ComponentCategory = typeof COMPONENT_CATEGORIES[number];

export const COMPONENT_BASE_CLASSES = ['CivFormElement', 'CivBaseElement'] as const;
export type ComponentBaseClass = typeof COMPONENT_BASE_CLASSES[number];

export interface ComponentSchema {
  /** Schema version for forward compatibility */
  $schema: '1.0';

  /** Component tag name (e.g., "civ-text-input") */
  name: string;

  /** Human-readable description */
  description: string;

  /** Component category */
  category: ComponentCategory;

  /** Base class pattern this component follows */
  extends: ComponentBaseClass;

  /** Whether this is a group component (uses legend instead of label) */
  isGroup: boolean;

  /** Component-specific props (base props like label, value, etc. are inherited) */
  props: Record<string, PropDef>;

  /** Custom events this component fires */
  events: Record<string, EventDef>;

  /** Accessibility contract */
  a11y: A11yDef;

  /** Platform-neutral render tree (order matters: label → hint → error → control) */
  renderOrder: RenderElement[];

  /** Form participation behavior */
  form: FormBehavior;

  /** Width variants (if the component supports width sizing) */
  widths?: Record<string, WidthVariant>;

  /** Platform-specific overrides that can't be abstracted */
  platform?: PlatformOverrides;
}
