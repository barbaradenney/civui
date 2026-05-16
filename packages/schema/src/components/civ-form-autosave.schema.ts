import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-form-autosave',
  description: 'Drops inside a `<civ-form>` to persist in-progress answers so the user can resume later. On mount, the configured adapter loads any saved snapshot and the host form prefills it. On every civ-input the autosave debounces (default 1s) and writes the current form data. On civ-submit the snapshot is cleared. Built-in adapters: localStorage (default), sessionStorage, custom (provide your own `{ load, save, clear }` triple).',
  category: 'form-container',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    storageKey: {
      type: 'string',
      description: 'Unique key identifying this form\'s saved snapshot. Required.',
      default: '',
      attribute: 'storage-key',
    },
    storage: {
      type: 'enum',
      description: 'Built-in storage type. Use "custom" and set `.adapter` for server-side persistence.',
      default: 'local',
      values: ['local', 'session', 'custom'],
    },
    debounceMs: {
      type: 'number',
      description: 'Save debounce in ms',
      default: 1000,
      attribute: 'debounce-ms',
    },
    silentResume: {
      type: 'boolean',
      description: 'Suppress the "Resumed from saved progress" screen reader announcement.',
      default: false,
      attribute: 'silent-resume',
    },
  },

  events: {
    'civ-autosave-loaded': {
      description: 'Fires after a snapshot is restored from storage',
      detail: {
        savedAt: { type: 'number', description: 'Epoch ms when the snapshot was originally saved' },
        data: { type: 'object', description: 'The restored form data' },
      },
    },
    'civ-autosave-saved': {
      description: 'Fires after each successful save to storage',
      detail: {
        savedAt: { type: 'number', description: 'Epoch ms of this save' },
      },
    },
    'civ-autosave-cleared': {
      description: 'Fires when the snapshot is cleared (on civ-submit or manual .clear())',
      detail: {},
    },
  },

  a11y: {
    role: 'none',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    { type: 'container', bindings: { tag: 'span' } },
  ],

  form: {
    valueMode: 'string',
    formAssociated: false,
    resetBehavior: 'restore-default-value',
  },

  platform: {
    web: {
      controlClasses: [],
    },
    ios: {
      // Wire to UserDefaults / Keychain in app code; no UI surface.
    },
    android: {
      // Wire to SharedPreferences / DataStore in app code; no UI surface.
    },
  },
};

export default schema;
