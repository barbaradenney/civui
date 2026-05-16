import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-form-autosave.js';
import '../form/civ-form.js';
import '@civui/inputs';
import '@civui/actions/button';

const meta: Meta = {
  title: 'Forms/Form/Form Autosave',
  component: 'civ-form-autosave',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Drops inside a \`<civ-form>\` to persist in-progress answers so the user
can come back later and resume where they left off. Long government
applications (benefits, immigration, tax) often span multiple sessions —
losing typed input to a page refresh, tab close, or network drop is
one of the highest-impact paper cuts the design system can close.

**Lifecycle:**
- On mount, the configured adapter loads any saved snapshot and the
  host form's \`prefillData\` is set — every matching field is restored.
- On every \`civ-input\` inside the form, the autosave element
  debounces (default 1 s) and writes the form's current data.
- On \`civ-submit\`, the saved snapshot is cleared.

**Storage adapters:** \`localStorage\` (default), \`sessionStorage\`,
or a custom adapter you provide via the \`.adapter\` property — pass a
\`{ load, save, clear }\` triple to persist to a server endpoint.
        `,
      },
    },
  },
  argTypes: {
    storageKey: { control: 'text' },
    storage: { control: 'select', options: ['local', 'session', 'custom'] },
    debounceMs: { control: 'number' },
    silentResume: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <p class="civ-mb-4">
      Type in any field below, then refresh the page — your draft will resume.
    </p>
    <civ-form>
      <civ-form-autosave storage-key="civui-autosave-demo" debounce-ms="500"></civ-form-autosave>
      <civ-text-input label="First name" name="first-name"></civ-text-input>
      <civ-text-input label="Last name" name="last-name"></civ-text-input>
      <civ-text-input label="Email" name="email" type="email" validate="email"></civ-text-input>
      <civ-button type="submit">Submit application</civ-button>
    </civ-form>
  `,
};

export const SessionStorage: Story = {
  name: 'Session storage (cleared when tab closes)',
  render: () => html`
    <p class="civ-mb-4">
      Uses \`sessionStorage\` — draft survives reloads in this tab, but is
      cleared when you close the tab. Good for one-time sessions on
      shared devices.
    </p>
    <civ-form>
      <civ-form-autosave storage-key="session-demo" storage="session" debounce-ms="500"></civ-form-autosave>
      <civ-text-input label="Address line 1" name="address1"></civ-text-input>
      <civ-text-input label="City" name="city"></civ-text-input>
    </civ-form>
  `,
};

export const WithSavedIndicator: Story = {
  name: 'With "saved X minutes ago" indicator',
  render: () => html`
    <p class="civ-mb-4">
      Hook into <code>civ-autosave-saved</code> to show a "Saved a moment ago"
      indicator. The element exposes <code>describeLastSave()</code> for
      localized strings.
    </p>
    <civ-form id="indicator-form">
      <civ-form-autosave id="autosave-indicator" storage-key="indicator-demo" debounce-ms="500"></civ-form-autosave>
      <civ-text-input label="What brings you here today?" name="reason"></civ-text-input>
      <div id="saved-indicator" class="civ-text-sm civ-mt-2 civ-text-muted">Not yet saved.</div>
    </civ-form>
    <script>
      const autosave = document.getElementById('autosave-indicator');
      const indicator = document.getElementById('saved-indicator');
      autosave.addEventListener('civ-autosave-saved', () => {
        indicator.textContent = autosave.describeLastSave();
      });
      autosave.addEventListener('civ-autosave-loaded', () => {
        indicator.textContent = autosave.describeLastSave();
      });
    </script>
  `,
};
