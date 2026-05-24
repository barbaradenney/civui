import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-image.js';

const meta: Meta = {
  title: 'Layout/Image',
  component: 'civ-image',
  tags: ['autodocs'],
  argTypes: {
    src: { control: 'text' },
    alt: { control: 'text' },
    width: { control: 'number' },
    height: { control: 'number' },
    ratio: { control: 'select', options: ['1:1', '4:3', '16:9', '21:9', '3:2', 'auto'] },
    fit: { control: 'select', options: ['cover', 'contain'] },
    loading: { control: 'select', options: ['lazy', 'eager'] },
    decoding: { control: 'select', options: ['async', 'sync', 'auto'] },
    fetchPriority: { control: 'select', options: ['auto', 'high', 'low'], name: 'fetch-priority' },
    variant: { control: 'select', options: ['content', 'thumbnail'] },
    size: { control: 'select', options: ['32', '48', '64', '96', '128'] },
    rounded: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'General-purpose accessible image with native lazy-loading, async decoding, and CSS aspect-ratio reservation baked in. Required `alt` (use `alt=""` for decorative). Distinct from `civ-image-preview`, which is upload chrome with filename/filesize caption.',
      },
    },
  },
};
export default meta;

type Story = StoryObj;

// LITERAL URLs — must stay literal strings (no template interpolation
// at story-source time), because the MCP example extractor reads the
// raw template text and ships it verbatim. Story-level helpers like
// `photo(w, h, seed)` would render as `src="${photo(...)}"` in
// consumer-facing examples.

/** Default content variant. */
export const Default: Story = {
  render: () => html`
    <div style="max-width: 480px;">
      <civ-image
        src="https://picsum.photos/seed/hero/800/450"
        alt="A government services worker assists a veteran at a counter"
        ratio="16:9"
      ></civ-image>
    </div>
  `,
};

/** Each of the five blessed aspect ratios. */
export const Ratios: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4" style="max-width: 480px;">
      <div>
        <p class="civ-italic civ-mb-1">ratio="1:1"</p>
        <civ-image src="https://picsum.photos/seed/r1/800/800" alt="Square placeholder" ratio="1:1"></civ-image>
      </div>
      <div>
        <p class="civ-italic civ-mb-1">ratio="4:3"</p>
        <civ-image src="https://picsum.photos/seed/r2/800/600" alt="4 by 3 placeholder" ratio="4:3"></civ-image>
      </div>
      <div>
        <p class="civ-italic civ-mb-1">ratio="16:9"</p>
        <civ-image src="https://picsum.photos/seed/r3/800/450" alt="16 by 9 placeholder" ratio="16:9"></civ-image>
      </div>
      <div>
        <p class="civ-italic civ-mb-1">ratio="21:9"</p>
        <civ-image src="https://picsum.photos/seed/r4/800/343" alt="21 by 9 placeholder" ratio="21:9"></civ-image>
      </div>
      <div>
        <p class="civ-italic civ-mb-1">ratio="3:2"</p>
        <civ-image src="https://picsum.photos/seed/r5/800/533" alt="3 by 2 placeholder" ratio="3:2"></civ-image>
      </div>
    </div>
  `,
};

/** Cover fills the box and crops; contain fits without cropping. */
export const FitModes: Story = {
  render: () => html`
    <div class="civ-flex civ-gap-4">
      <div style="width: 220px;">
        <p class="civ-italic civ-mb-1">fit="cover"</p>
        <civ-image
          src="https://picsum.photos/seed/cover/800/450"
          alt="cover example"
          ratio="1:1"
          fit="cover"
          style="background: #eee;"
        ></civ-image>
      </div>
      <div style="width: 220px;">
        <p class="civ-italic civ-mb-1">fit="contain"</p>
        <civ-image
          src="https://picsum.photos/seed/cover/800/450"
          alt="contain example"
          ratio="1:1"
          fit="contain"
          style="background: #eee;"
        ></civ-image>
      </div>
    </div>
  `,
};

/** Decorative image — `alt=""` is the WAI-documented opt-out. */
export const Decorative: Story = {
  render: () => html`
    <div style="max-width: 480px;">
      <p class="civ-italic civ-mb-2">
        This image has <code>alt=""</code>, so screen readers skip it entirely.
      </p>
      <civ-image
        src="https://picsum.photos/seed/decor/800/200"
        alt=""
        ratio="21:9"
      ></civ-image>
    </div>
  `,
};

/** Thumbnail variant — five stepped sizes (Primer's avatar scale). */
export const Thumbnails: Story = {
  render: () => html`
    <div class="civ-flex civ-gap-3 civ-items-end">
      <civ-image src="https://picsum.photos/seed/avatar/256/256" alt="Avatar" variant="thumbnail" size="32"></civ-image>
      <civ-image src="https://picsum.photos/seed/avatar/256/256" alt="Avatar" variant="thumbnail" size="48"></civ-image>
      <civ-image src="https://picsum.photos/seed/avatar/256/256" alt="Avatar" variant="thumbnail" size="64"></civ-image>
      <civ-image src="https://picsum.photos/seed/avatar/256/256" alt="Avatar" variant="thumbnail" size="96"></civ-image>
      <civ-image src="https://picsum.photos/seed/avatar/256/256" alt="Avatar" variant="thumbnail" size="128"></civ-image>
    </div>
  `,
};

/** Circular thumbnail — `rounded` for profile photos. */
export const RoundedAvatars: Story = {
  render: () => html`
    <div class="civ-flex civ-gap-3 civ-items-center">
      <civ-image src="https://picsum.photos/seed/p1/256/256" alt="Jane Doe" variant="thumbnail" size="48" rounded></civ-image>
      <civ-image src="https://picsum.photos/seed/p2/256/256" alt="John Smith" variant="thumbnail" size="48" rounded></civ-image>
      <civ-image src="https://picsum.photos/seed/p3/256/256" alt="Alex Lee" variant="thumbnail" size="48" rounded></civ-image>
    </div>
  `,
};

/**
 * Above-the-fold hero — combine `loading="eager"` + `decoding="sync"` +
 * `fetch-priority="high"` for the LCP-candidate image so the browser
 * prioritizes its fetch and decodes it before painting.
 */
export const HeroPriority: Story = {
  render: () => html`
    <div style="max-width: 480px;">
      <civ-image
        src="https://picsum.photos/seed/hero/800/450"
        alt="Hero image at the top of the page"
        ratio="16:9"
        loading="eager"
        decoding="sync"
        fetch-priority="high"
      ></civ-image>
    </div>
  `,
};

/**
 * Modern image formats with universal fallback — the component renders
 * a `<picture>` element with AVIF + WebP `<source>` children; the
 * browser picks the smallest format it understands and falls back to
 * the original `src` (JPEG / PNG) on older browsers. The component
 * does NOT convert anything — consumers produce the alternate files
 * at build time, via a CDN, or by hand. See the docs page for the
 * implementation guide.
 *
 * (picsum.photos doesn't serve WebP / AVIF natively, so the demo
 * URLs below are illustrative — Inspect the rendered markup to see
 * the `<picture>` + `<source>` structure that ships to the browser.)
 */
export const ModernFormats: Story = {
  render: () => html`
    <div style="max-width: 480px;">
      <civ-image
        src="https://picsum.photos/seed/formats/800/450"
        webp-src="https://picsum.photos/seed/formats/800/450.webp"
        avif-src="https://picsum.photos/seed/formats/800/450.avif"
        alt="Modern-format demo — Inspect the DOM to see picture + source"
        ratio="16:9"
      ></civ-image>
    </div>
  `,
};
