import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-input-group.js';

afterEach(cleanupFixtures);

describe('civ-input-group', () => {
  it('renders a flex container', async () => {
    const el = await fixture('<civ-input-group></civ-input-group>');
    const container = el.querySelector('.civ-input-group');
    expect(container).not.toBeNull();
  });

  it('relocates children into the group container', async () => {
    const el = await fixture(`
      <civ-input-group>
        <input type="text" />
        <button>Go</button>
      </civ-input-group>
    `);
    await elementUpdated(el);
    const container = el.querySelector('[data-civ-input-group-content]');
    expect(container!.querySelector('input')).not.toBeNull();
    expect(container!.querySelector('button')).not.toBeNull();
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-input-group></civ-input-group>');
    expect(el.shadowRoot).toBeNull();
  });
});
