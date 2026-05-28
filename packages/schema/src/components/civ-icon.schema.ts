import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-icon',
  description: 'Inline icon. Web renders SVG paths from a built-in library (no font files / external requests); the optional Material Symbols opt-in stylesheet enables the full glyph catalog. iOS uses SF Symbols; Android uses Material Symbols. Icons inherit `currentColor` and scale with `font-size`. Decorative when `label` is omitted (sets `aria-hidden`).',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    name: {
      type: 'string',
      description: 'Icon name. Must match a key in the icon library (or a custom icon registered via `registerIcon()`)',
      default: '',
      reflect: true,
    },
    label: {
      type: 'string',
      description: 'Accessible label. When set, renders `role="img"` + `aria-label`; when omitted the icon is decorative (`aria-hidden="true"`)',
      default: '',
    },
    size: {
      type: 'string',
      description: 'Size shorthand. `sm` / `md` / `lg` / `xl` / `2xl` map to font-size multipliers; explicit values like `24px` or `1.5em` are passed through. Empty inherits parent font-size. Web-specific: native platforms take a numeric size in their idiomatic unit (CGFloat on iOS, Dp on Android). Consumers pass the resolved value directly',
      default: '',
      reflect: true,
      webOnly: true,
    },
    rotate: {
      type: 'number',
      description: 'Rotation in degrees. Common values: 90, 180, 270. Web-only. Native platforms expose rotation via the platform modifier (`.rotationEffect()` on iOS, `Modifier.rotate()` on Android); consumers apply it directly',
      webOnly: true,
    },
    flip: {
      type: 'enum',
      description: 'Mirror axis. `horizontal` flips left-right; `vertical` flips top-bottom; `both` flips both. Web-only. Native platforms use platform-native flip modifiers',
      values: ['horizontal', 'vertical', 'both'],
      webOnly: true,
    },
  },

  events: {},

  a11y: {
    role: 'img',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'svg' },
    },
  ],

  form: {
    valueMode: 'none',
    formAssociated: false,
    resetBehavior: 'none',
  },
};

export default schema;
