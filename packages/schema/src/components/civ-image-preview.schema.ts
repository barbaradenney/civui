import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-image-preview',
  description: 'Displays an uploaded or referenced image at a readable size with optional filename and file-size caption. Use for ID document uploads, profile photos, damage photos, signature captures, and review pages. Internally composes `civ-image` for the actual image element so the inner `<img>` inherits all the same accessibility + performance defaults (lazy load, async decode, optional `<picture>` WebP/AVIF format negotiation, aspect-ratio reservation when `width`/`height` or `ratio` are provided). This component owns only the upload-preview chrome — the `<figure>` wrapper, size tier, and `<figcaption>` with filename and file-size.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    src: {
      type: 'string',
      description: 'Image source URL or object URL. Required for the component to render; an empty `src` renders nothing',
      default: '',
    },
    webpSrc: {
      type: 'string',
      description: 'URL to a WebP alternate. Forwarded to the inner `civ-image`, which wraps the `<img>` in a `<picture>` and lets the browser pick the smaller format',
      default: '',
      attribute: 'webp-src',
    },
    avifSrc: {
      type: 'string',
      description: 'URL to an AVIF alternate. Forwarded to the inner `civ-image` for format negotiation. AVIF beats WebP on compression but has narrower browser support, so it falls through to WebP then `src`',
      default: '',
      attribute: 'avif-src',
    },
    alt: {
      type: 'string',
      description: 'Alt text describing the image content. Required per Section 508 / WCAG 1.1.1 — for an ID document upload, the alt should describe what the image contains (e.g. "Front of driver\'s license"). Component dev-warns when `alt` is omitted',
      default: '',
    },
    filename: {
      type: 'string',
      description: 'Filename displayed below the image inside the `<figcaption>`',
      default: '',
    },
    fileSize: {
      type: 'string',
      description: 'File size displayed in the `<figcaption>` after the filename, formatted as a human-readable string (e.g. "2.4 MB")',
      default: '',
      attribute: 'file-size',
    },
    size: {
      type: 'enum',
      description: 'Preview size tier: `sm` (120px max), `md` (240px, default), `lg` (360px), `full` (100% of the parent width)',
      default: 'md',
      values: ['sm', 'md', 'lg', 'full'],
    },
    width: {
      type: 'number',
      description: 'Intrinsic width in px, forwarded to the inner `civ-image`. Combined with `height` (or `ratio`) reserves layout space before the bytes load so the caption does not jump (CLS prevention)',
    },
    height: {
      type: 'number',
      description: 'Intrinsic height in px, forwarded to the inner `civ-image`. Combined with `width` reserves layout space before the image loads',
    },
    ratio: {
      type: 'enum',
      description: 'Aspect ratio forwarded to the inner `civ-image`. `auto` (default) defers to `width`/`height` when both are set, otherwise uses the natural image ratio once loaded',
      default: 'auto',
      values: ['1:1', '4:3', '16:9', '21:9', '3:2', 'auto'],
    },
  },

  events: {},

  a11y: {
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'figure' },
    },
  ],

  form: {
    valueMode: 'none',
    formAssociated: false,
    resetBehavior: 'none',
  },
};

export default schema;
