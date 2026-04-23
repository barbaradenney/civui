import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-task-list.js';

afterEach(cleanupFixtures);

describe('civ-task-list', () => {
  it('renders a container with role="list"', async () => {
    const el = await fixture('<civ-task-list></civ-task-list>');
    expect(el.querySelector('[role="list"]')).not.toBeNull();
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-task-list></civ-task-list>');
    expect(el.shadowRoot).toBeNull();
  });
});
