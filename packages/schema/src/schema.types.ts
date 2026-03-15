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

export type PropType = 'string' | 'boolean' | 'number' | 'enum' | 'array';

export interface PropDef {
  /** Data type of this prop */
  type: PropType;

  /** Human-readable description */
  description: string;

  /** Default value (omit for required props with no default) */
  default?: string | number | boolean;

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
}

// ---------------------------------------------------------------------------
// Event types
// ---------------------------------------------------------------------------

export interface EventDetailField {
  type: 'string' | 'boolean' | 'number' | 'string[]' | 'File[]';
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
export interface RenderElement {
  /** Element type — maps to platform primitives */
  type: 'label' | 'hint' | 'error' | 'input' | 'select' | 'checkbox' | 'switch' | 'button' | 'slot' | 'container';

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

export type FormValueMode =
  | 'string'           // value is always a string (text-input, select, textarea)
  | 'boolean'          // value is submitted when checked, null when unchecked (checkbox, toggle)
  | 'multi'            // FormData with multiple values (checkbox-group)
  | 'file';            // FormData with File objects (file-upload)

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

export interface ComponentSchema {
  /** Schema version for forward compatibility */
  $schema: '1.0';

  /** Component tag name (e.g., "civ-text-input") */
  name: string;

  /** Human-readable description */
  description: string;

  /** Component category */
  category: 'form-control' | 'form-group' | 'form-container' | 'ui' | 'feedback' | 'navigation';

  /** Base class pattern this component follows */
  extends: 'CivFormElement' | 'CivBaseElement';

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
