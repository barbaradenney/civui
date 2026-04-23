import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-task-group.js';
import './civ-task.js';
import '@civui/ui/tag';
import '@civui/ui/link';

afterEach(cleanupFixtures);

describe('civ-task-group', () => {
  it('renders heading from data-task-group-heading slot', async () => {
    const el = await fixture(`
      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">Section</h3>
        <civ-task label="Task 1" status="not-started"></civ-task>
      </civ-task-group>
    `);
    const heading = el.querySelector('[data-civ-task-group-heading] h3');
    expect(heading).not.toBeNull();
    expect(heading!.textContent).toBe('Section');
  });

  it('renders a list for tasks', async () => {
    const el = await fixture(`
      <civ-task-group>
        <h3 data-task-group-heading>Section</h3>
        <civ-task label="Task 1" status="not-started"></civ-task>
      </civ-task-group>
    `);
    expect(el.querySelector('ul[role="list"]')).not.toBeNull();
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-task-group></civ-task-group>');
    expect(el.shadowRoot).toBeNull();
  });
});
