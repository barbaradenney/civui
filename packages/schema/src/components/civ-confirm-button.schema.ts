import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-confirm-button',
  description: 'Text button that fires an action and shows a transient ✓ confirmation before reverting. Used for fire-and-forget actions whose feedback needs to be visible inline without yanking the user to a toast — Copy, Paste, Scan, Generate. Consumer does the actual work in the `civ-confirm` listener; the component manages the success-window timing and visual swap. Padding stays stable across states (the variant class is held constant; only the `.is-success` flag is added) so the button does not visibly shrink mid-confirmation. For two-state toggles (Show / Hide) use `civ-toggle-button`; for primary form CTAs use `civ-button`.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    label: {
      type: 'string',
      description: 'Resting label ("Copy", "Generate", "Scan"). Required — there is no fallback because the verb is intent-specific',
      default: '',
    },
    successLabel: {
      type: 'string',
      description: 'Transient receipt label shown during the success window ("Copied", "Generated"). Defaults to the localized "Done"',
      default: '',
      attribute: 'success-label',
    },
    successMs: {
      type: 'number',
      description: 'How long the success state stays visible, in milliseconds. Default 1500. Re-clicks during the window restart the timer (no stacking)',
      default: 1500,
      attribute: 'success-ms',
    },
    variant: {
      type: 'enum',
      description: 'Picks the text-btn modifier. `chip` (default) renders the prominent gray pill — typical for helper-row Copy buttons. `inline` renders the transparent text-link style — typical when the button needs to read as quiet inside denser surfaces',
      default: 'chip',
      values: ['chip', 'inline'],
    },
  },

  events: {
    'civ-confirm': {
      description: 'Fires on activation, BEFORE entering the success window. Consumer does the work in the listener (clipboard write, file save, share). The component starts the success timer immediately regardless of whether the work succeeds; consumers can call `.reset()` to cancel the receipt if the work fails',
      detail: {},
    },
  },

  a11y: {
    role: 'button',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
    ariaAttributes: {
      'aria-live': 'polite during the success window',
    },
  },

  renderOrder: [
    {
      type: 'container',
      children: [
        { type: 'slot', bindings: { name: 'default' } },
      ],
    },
  ],

  form: {
    valueMode: 'string',
    formAssociated: false,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
