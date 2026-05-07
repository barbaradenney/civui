import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-action-link',
  description: 'Specialized link variants for common contact / file actions. The `type` prop drives the rendered href: `phone` → `tel:`, `email` → `mailto:`, `address` → `geo:` / map link, `download` → file with optional filename / size annotation. Each variant gets a leading icon (phone, envelope, location, download) automatically.',
  category: 'navigation',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    type: {
      type: 'enum',
      description: 'Action variant. Drives the href scheme and the leading icon',
      default: 'phone',
      values: ['phone', 'email', 'address', 'download'],
    },
    number: {
      type: 'string',
      description: 'Phone number for `type="phone"`. Stripped of formatting before being used in `tel:`',
      default: '',
    },
    address: {
      type: 'string',
      description: 'Address for `type="address"`. Used as the geo / map link target',
      default: '',
    },
    subject: {
      type: 'string',
      description: 'Email subject for `type="email"`. URL-encoded into the mailto: query string',
      default: '',
    },
    href: {
      type: 'string',
      description: 'Override the auto-generated href. Useful for `type="download"` where the URL is dynamic',
      default: '',
    },
    filename: {
      type: 'string',
      description: 'Filename annotation for `type="download"`. Rendered alongside the link label',
      default: '',
    },
    fileSize: {
      type: 'string',
      description: 'Human-readable file size for `type="download"` (e.g. "2.4 MB")',
      default: '',
      attribute: 'file-size',
    },
  },

  events: {},

  a11y: {
    role: 'link',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'a' },
      children: [{ type: 'label', bindings: { text: 'label' } }],
    },
  ],

  form: {
    valueMode: 'string',
    formAssociated: false,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
