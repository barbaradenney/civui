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

// Placeholder image source. Picsum honors width/height in the URL and
// returns a real JPEG, so the stories show actual aspect-ratio
// behavior even without consumer assets.
const photo = (w: number, h: number, seed = 'civui') =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

/** Default content variant. */
export const Default: Story = {
  render: () => html`
    <div style="max-width: 480px;">
      <civ-image
        src="${photo(800, 450, 'hero')}"
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
      ${['1:1', '4:3', '16:9', '21:9', '3:2'].map(
        (r) => html`
          <div>
            <p class="civ-italic civ-mb-1">ratio="${r}"</p>
            <civ-image
              src="${photo(800, 450, r)}"
              alt="Placeholder for ${r}"
              ratio="${r as any}"
            ></civ-image>
          </div>
        `,
      )}
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
          src="${photo(800, 450, 'cover')}"
          alt="cover example"
          ratio="1:1"
          fit="cover"
          style="background: #eee;"
        ></civ-image>
      </div>
      <div style="width: 220px;">
        <p class="civ-italic civ-mb-1">fit="contain"</p>
        <civ-image
          src="${photo(800, 450, 'cover')}"
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
        src="${photo(800, 200, 'decor')}"
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
      ${(['32', '48', '64', '96', '128'] as const).map(
        (s) => html`
          <civ-image
            src="${photo(256, 256, 'avatar')}"
            alt="Avatar"
            variant="thumbnail"
            size="${s}"
          ></civ-image>
        `,
      )}
    </div>
  `,
};

/** Circular thumbnail — `rounded` for profile photos. */
export const RoundedAvatars: Story = {
  render: () => html`
    <div class="civ-flex civ-gap-3 civ-items-center">
      <civ-image
        src="${photo(256, 256, 'p1')}"
        alt="Jane Doe"
        variant="thumbnail"
        size="48"
        rounded
      ></civ-image>
      <civ-image
        src="${photo(256, 256, 'p2')}"
        alt="John Smith"
        variant="thumbnail"
        size="48"
        rounded
      ></civ-image>
      <civ-image
        src="${photo(256, 256, 'p3')}"
        alt="Alex Lee"
        variant="thumbnail"
        size="48"
        rounded
      ></civ-image>
    </div>
  `,
};

/**
 * Eager loading for above-the-fold hero images. Use sparingly —
 * lazy is the default and the right choice for almost everything.
 */
export const EagerLoading: Story = {
  render: () => html`
    <div style="max-width: 480px;">
      <civ-image
        src="${photo(800, 450, 'hero')}"
        alt="Hero image at the top of the page"
        ratio="16:9"
        loading="eager"
      ></civ-image>
    </div>
  `,
};
