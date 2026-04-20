import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-task-list.js';
import './civ-task-group.js';
import './civ-task.js';
import '@civui/ui/tag';
import '@civui/ui/link';

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

  it('relocates children into content container', async () => {
    const el = await fixture(`
      <civ-task-list>
        <civ-task-group>
          <h3 data-task-group-heading class="civ-heading-md">Section 1</h3>
          <civ-task>
            <span>Task 1</span>
          </civ-task>
        </civ-task-group>
      </civ-task-list>
    `);
    const content = el.querySelector('[data-civ-task-list-content]');
    expect(content).not.toBeNull();
    expect(content!.querySelector('civ-task-group')).not.toBeNull();
  });
});

describe('civ-task-group', () => {
  it('renders heading from data-task-group-heading slot', async () => {
    const el = await fixture(`
      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">Personal details</h3>
        <civ-task><span>Name</span></civ-task>
      </civ-task-group>
    `);
    const heading = el.querySelector('[data-civ-task-group-heading] h3');
    expect(heading).not.toBeNull();
    expect(heading!.textContent).toBe('Personal details');
  });

  it('renders a list for tasks', async () => {
    const el = await fixture(`
      <civ-task-group>
        <h3 data-task-group-heading>Section</h3>
        <civ-task><span>Task 1</span></civ-task>
      </civ-task-group>
    `);
    expect(el.querySelector('ul[role="list"]')).not.toBeNull();
  });

  it('relocates task children into list', async () => {
    const el = await fixture(`
      <civ-task-group>
        <h3 data-task-group-heading>Section</h3>
        <civ-task><span>Task 1</span></civ-task>
        <civ-task><span>Task 2</span></civ-task>
      </civ-task-group>
    `);
    const tasks = el.querySelectorAll('[data-civ-task-group-content] civ-task');
    expect(tasks.length).toBe(2);
  });

  it('omits heading container when no heading child', async () => {
    const el = await fixture(`
      <civ-task-group>
        <civ-task><span>Task</span></civ-task>
      </civ-task-group>
    `);
    expect(el.querySelector('[data-civ-task-group-heading]')).toBeNull();
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-task-group></civ-task-group>');
    expect(el.shadowRoot).toBeNull();
  });
});

describe('civ-task', () => {
  it('renders as a list item', async () => {
    const el = await fixture(`
      <civ-task>
        <span>Task name</span>
      </civ-task>
    `);
    expect(el.querySelector('li')).not.toBeNull();
  });

  it('relocates content children', async () => {
    const el = await fixture(`
      <civ-task>
        <civ-link href="#/contact">Contact info</civ-link>
      </civ-task>
    `);
    const content = el.querySelector('[data-civ-task-content]');
    expect(content).not.toBeNull();
    expect(content!.querySelector('civ-link')).not.toBeNull();
  });

  it('relocates status children', async () => {
    const el = await fixture(`
      <civ-task>
        <span>Task name</span>
        <div data-task-status>
          <civ-tag label="In progress" variant="teal"></civ-tag>
        </div>
      </civ-task>
    `);
    const status = el.querySelector('[data-civ-task-status]');
    expect(status).not.toBeNull();
    const tag = status!.querySelector('civ-tag');
    expect(tag).not.toBeNull();
    expect(tag!.getAttribute('variant')).toBe('teal');
  });

  it('omits status container when no status children', async () => {
    const el = await fixture(`
      <civ-task>
        <span>Task with no status</span>
      </civ-task>
    `);
    expect(el.querySelector('[data-civ-task-status]')).toBeNull();
  });

  it('renders content and status side by side', async () => {
    const el = await fixture(`
      <civ-task>
        <civ-link href="#">Personal info</civ-link>
        <div data-task-status>
          <civ-tag label="Complete" variant="green" tag-style="primary"></civ-tag>
        </div>
      </civ-task>
    `);
    const content = el.querySelector('[data-civ-task-content]');
    const status = el.querySelector('[data-civ-task-status]');
    expect(content).not.toBeNull();
    expect(status).not.toBeNull();
    expect(content!.querySelector('civ-link')).not.toBeNull();
    expect(status!.querySelector('civ-tag')).not.toBeNull();
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-task><span>Test</span></civ-task>');
    expect(el.shadowRoot).toBeNull();
  });
});
