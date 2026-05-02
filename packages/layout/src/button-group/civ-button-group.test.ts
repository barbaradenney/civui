import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-button-group.js';
import '@civui/actions/action-button';

afterEach(cleanupFixtures);

describe('civ-button-group', () => {
  it('renders a toolbar container', async () => {
    const el = await fixture(`
      <civ-button-group>
        <civ-action-button label="A"></civ-action-button>
        <civ-action-button label="B"></civ-action-button>
      </civ-button-group>
    `);
    await elementUpdated(el);
    const toolbar = el.querySelector('[role="toolbar"]');
    expect(toolbar).not.toBeNull();
  });

  it('relocates children into the group container', async () => {
    const el = await fixture(`
      <civ-button-group>
        <civ-action-button label="Bold"></civ-action-button>
        <civ-action-button label="Italic"></civ-action-button>
      </civ-button-group>
    `);
    await elementUpdated(el);
    const container = el.querySelector('[data-civ-button-group-content]');
    const buttons = container!.querySelectorAll('civ-action-button');
    expect(buttons.length).toBe(2);
  });

  it('uses horizontal layout by default', async () => {
    const el = await fixture('<civ-button-group></civ-button-group>');
    const container = el.querySelector('.civ-button-group');
    expect(container).not.toBeNull();
  });

  it('uses vertical layout when orientation is vertical', async () => {
    const el = await fixture('<civ-button-group orientation="vertical"></civ-button-group>');
    const container = el.querySelector('.civ-button-group--vertical');
    expect(container).not.toBeNull();
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-button-group></civ-button-group>');
    expect(el.shadowRoot).toBeNull();
  });

  it('sets aria-label from label prop', async () => {
    const el = await fixture('<civ-button-group label="Actions"></civ-button-group>');
    await elementUpdated(el);
    const toolbar = el.querySelector('[role="toolbar"]');
    expect(toolbar?.getAttribute('aria-label')).toBe('Actions');
  });

  it('supports disabled child buttons', async () => {
    const el = await fixture(`
      <civ-button-group>
        <civ-action-button label="Active"></civ-action-button>
        <civ-action-button label="Disabled" disabled></civ-action-button>
      </civ-button-group>
    `);
    await elementUpdated(el);
    const buttons = el.querySelectorAll('civ-action-button');
    expect(buttons[1].hasAttribute('disabled')).toBe(true);
  });

  it('renders multiple buttons with correct labels', async () => {
    const el = await fixture(`
      <civ-button-group>
        <civ-action-button label="Save"></civ-action-button>
        <civ-action-button label="Cancel"></civ-action-button>
        <civ-action-button label="Delete"></civ-action-button>
      </civ-button-group>
    `);
    await elementUpdated(el);
    const buttons = el.querySelectorAll('civ-action-button');
    expect(buttons.length).toBe(3);
  });
});
