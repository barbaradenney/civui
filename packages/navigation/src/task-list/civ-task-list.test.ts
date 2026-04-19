import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-task-list.js';
import './civ-task-group.js';
import './civ-task.js';
import '@civui/ui/tag';

afterEach(cleanupFixtures);

describe('civ-task-list', () => {
  it('renders a container with role="list"', async () => {
    const el = await fixture('<civ-task-list></civ-task-list>');

    const list = el.querySelector('[role="list"]');
    expect(list).not.toBeNull();
  });

  it('uses Light DOM (no shadow root)', async () => {
    const el = await fixture('<civ-task-list></civ-task-list>');
    expect(el.shadowRoot).toBeNull();
  });

  it('relocates children into content container', async () => {
    const el = await fixture(`
      <civ-task-list>
        <civ-task-group heading="Section 1">
          <civ-task label="Task 1" status="not-started"></civ-task>
        </civ-task-group>
      </civ-task-list>
    `);

    const content = el.querySelector('[data-civ-task-list-content]');
    expect(content).not.toBeNull();
    const group = content!.querySelector('civ-task-group');
    expect(group).not.toBeNull();
  });
});

describe('civ-task-group', () => {
  it('renders heading', async () => {
    const el = await fixture(`
      <civ-task-group heading="Personal details">
        <civ-task label="Name" status="complete"></civ-task>
      </civ-task-group>
    `);

    const h3 = el.querySelector('h3');
    expect(h3).not.toBeNull();
    expect(h3!.textContent).toBe('Personal details');
  });

  it('renders a list for tasks', async () => {
    const el = await fixture(`
      <civ-task-group heading="Section">
        <civ-task label="Task 1" status="not-started"></civ-task>
      </civ-task-group>
    `);

    const list = el.querySelector('ul[role="list"]');
    expect(list).not.toBeNull();
  });

  it('relocates task children into list', async () => {
    const el = await fixture(`
      <civ-task-group heading="Section">
        <civ-task label="Task 1" status="not-started"></civ-task>
        <civ-task label="Task 2" status="complete"></civ-task>
      </civ-task-group>
    `);

    const tasks = el.querySelectorAll('[data-civ-task-group-content] civ-task');
    expect(tasks.length).toBe(2);
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-task-group heading="Test"></civ-task-group>');
    expect(el.shadowRoot).toBeNull();
  });
});

describe('civ-task', () => {
  it('renders label as link when href is provided', async () => {
    const el = await fixture('<civ-task label="Contact info" href="#/contact" status="not-started"></civ-task>');

    const link = el.querySelector('a.civ-link');
    expect(link).not.toBeNull();
    expect(link!.textContent).toBe('Contact info');
    expect(link!.getAttribute('href')).toBe('#/contact');
  });

  it('renders label as plain text when no href', async () => {
    const el = await fixture('<civ-task label="Review" status="cannot-start"></civ-task>');

    const link = el.querySelector('a');
    expect(link).toBeNull();
    const span = el.querySelector('.civ-task__label');
    expect(span).not.toBeNull();
    expect(span!.textContent).toBe('Review');
  });

  it('renders label as plain text when status is cannot-start even with href', async () => {
    const el = await fixture('<civ-task label="Review" href="#/review" status="cannot-start"></civ-task>');

    const link = el.querySelector('a');
    expect(link).toBeNull();
  });

  it('renders not-started status with blue tag', async () => {
    const el = await fixture('<civ-task label="Task" status="not-started"></civ-task>');

    const tag = el.querySelector('civ-tag');
    expect(tag).not.toBeNull();
    expect(tag!.getAttribute('variant')).toBe('blue');
    expect(tag!.getAttribute('label')).toBe('Not started');
  });

  it('renders in-progress status with teal tag', async () => {
    const el = await fixture('<civ-task label="Task" status="in-progress"></civ-task>');

    const tag = el.querySelector('civ-tag');
    expect(tag).not.toBeNull();
    expect(tag!.getAttribute('variant')).toBe('teal');
    expect(tag!.getAttribute('label')).toBe('In progress');
  });

  it('renders complete status as plain text', async () => {
    const el = await fixture('<civ-task label="Task" href="#" status="complete"></civ-task>');

    const tag = el.querySelector('civ-tag');
    expect(tag).toBeNull();
    const status = el.querySelector('.civ-task__status--complete');
    expect(status).not.toBeNull();
    expect(status!.textContent).toBe('Complete');
  });

  it('renders cannot-start status with muted text', async () => {
    const el = await fixture('<civ-task label="Task" status="cannot-start"></civ-task>');

    const status = el.querySelector('.civ-task__status--cannot-start');
    expect(status).not.toBeNull();
    expect(status!.textContent).toBe('Cannot start yet');
  });

  it('renders error status with red tag', async () => {
    const el = await fixture('<civ-task label="Task" href="#" status="error"></civ-task>');

    const tag = el.querySelector('civ-tag');
    expect(tag).not.toBeNull();
    expect(tag!.getAttribute('variant')).toBe('red');
    expect(tag!.getAttribute('label')).toBe('There is a problem');
  });

  it('renders hint text', async () => {
    const el = await fixture('<civ-task label="Task" status="in-progress" hint="Missing phone number"></civ-task>');

    const hint = el.querySelector('.civ-task__hint');
    expect(hint).not.toBeNull();
    expect(hint!.textContent).toBe('Missing phone number');
  });

  it('omits hint when empty', async () => {
    const el = await fixture('<civ-task label="Task" status="not-started"></civ-task>');

    const hint = el.querySelector('.civ-task__hint');
    expect(hint).toBeNull();
  });

  it('links have aria-describedby pointing to status container', async () => {
    const el = await fixture('<civ-task label="Task" href="#" status="in-progress"></civ-task>');

    const link = el.querySelector('a')!;
    const statusId = link.getAttribute('aria-describedby');
    expect(statusId).toBeTruthy();
    const statusEl = el.querySelector(`#${statusId}`);
    expect(statusEl).not.toBeNull();
    // Status container holds the civ-tag element
    const tag = statusEl!.querySelector('civ-tag');
    expect(tag).not.toBeNull();
    expect(tag!.getAttribute('label')).toBe('In progress');
  });

  it('applies muted class to cannot-start label', async () => {
    const el = await fixture('<civ-task label="Task" status="cannot-start"></civ-task>');

    const label = el.querySelector('.civ-task__label');
    expect(label!.className).toContain('civ-text-muted');
  });

  it('renders as list item', async () => {
    const el = await fixture('<civ-task label="Task" status="not-started"></civ-task>');

    const li = el.querySelector('li');
    expect(li).not.toBeNull();
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-task label="Task" status="not-started"></civ-task>');
    expect(el.shadowRoot).toBeNull();
  });
});
