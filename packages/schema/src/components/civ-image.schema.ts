import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-image',
  description: 'General-purpose accessible image. Distinct from `civ-image-preview`, which is upload chrome (filename + filesize caption). Use `civ-image` for content imagery — marketing visuals, illustrations, profile photos, avatar thumbnails. Defaults bake in good behavior: native `loading="lazy"`, `decoding="async"`, CSS `aspect-ratio` reserved from `ratio` or `width`/`height` to prevent layout shift (CLS) before the bytes arrive. Required `alt` per Section 508 / WCAG 1.1.1 — pass `alt=""` (empty string) explicitly for decorative; the component dev-warns if `alt` is undefined. Two variants: `content` (default fluid) and `thumbnail` (fixed-size on a Primer-style stepped scale, with optional `rounded` for circular avatars).',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    src: {
      type: 'string',
      description: 'Image source URL. Required',
      default: '',
    },
    alt: {
      type: 'string',
      description: 'Alt text. Required per Section 508 / WCAG 1.1.1. For purely decorative images, pass `alt=""` (empty string) — that\'s the WAI-documented opt-out, never omit the attribute. Filenames are deliberately never used as a fallback (.gov uploads often have opaque names that read worse than nothing)',
      default: '',
    },
    width: {
      type: 'number',
      description: 'Intrinsic width in px. Combined with `height` to compute aspect-ratio when `ratio` is `auto` — set both to reserve layout space before the bytes load',
    },
    height: {
      type: 'number',
      description: 'Intrinsic height in px. Combined with `width` for aspect-ratio when `ratio` is `auto`',
    },
    ratio: {
      type: 'enum',
      description: 'Aspect ratio. `auto` (default) defers to `width`/`height` if both are set, otherwise the browser uses the image\'s natural ratio once loaded (with a CLS cost). Explicit values are the Scottish-GOV aspect-box vocabulary plus 3:2',
      default: 'auto',
      values: ['1:1', '4:3', '16:9', '21:9', '3:2', 'auto'],
      reflect: true,
    },
    fit: {
      type: 'enum',
      description: 'CSS `object-fit`. `cover` (default) fills the box and crops; `contain` fits inside the box without cropping',
      default: 'cover',
      values: ['cover', 'contain'],
      reflect: true,
    },
    loading: {
      type: 'enum',
      description: 'Native HTML `loading` attribute. `lazy` (default) defers off-screen images until the user scrolls near them; `eager` loads immediately. Use `eager` for above-the-fold hero images',
      default: 'lazy',
      values: ['lazy', 'eager'],
    },
    variant: {
      type: 'enum',
      description: '`content` (default) is a fluid, ratio-reserved image for body imagery. `thumbnail` is a fixed-pixel-size image on the Primer stepped scale for inline avatars / list-row thumbs. The `size` and `rounded` props only apply to the thumbnail variant',
      default: 'content',
      values: ['content', 'thumbnail'],
      reflect: true,
    },
    size: {
      type: 'enum',
      description: 'Thumbnail edge length in px on a Primer-style stepped scale. Thumbnail variant only',
      default: '64',
      values: ['32', '48', '64', '96', '128'],
      reflect: true,
    },
    rounded: {
      type: 'boolean',
      description: 'Render the thumbnail as a circle (border-radius: 50%) for avatar use. Ignored for the content variant',
      default: false,
      reflect: true,
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
      bindings: { tag: 'img' },
    },
  ],

  form: {
    valueMode: 'string',
    formAssociated: false,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
