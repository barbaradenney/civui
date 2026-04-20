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
});

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

describe('civ-task', () => {
  it('renders as a list item', async () => {
    const el = await fixture('<civ-task label="Task" status="not-started"></civ-task>');
    expect(el.querySelector('li')).not.toBeNull();
  });

  it('renders label as h4 heading', async () => {
    const el = await fixture('<civ-task label="Personal info" status="not-started"></civ-task>');
    const h4 = el.querySelector('h4.civ-task__label');
    expect(h4).not.toBeNull();
    expect(h4!.textContent).toContain('Personal info');
  });

  it('renders label as secondary link when href is set', async () => {
    const el = await fixture('<civ-task label="Contact info" href="#/contact" status="not-started"></civ-task>');
    const link = el.querySelector('civ-link');
    expect(link).not.toBeNull();
    expect(link!.getAttribute('variant')).toBe('secondary');
    expect(link!.getAttribute('label')).toBe('Contact info');
    expect(link!.getAttribute('href')).toBe('#/contact');
  });

  it('renders label as plain text when no href', async () => {
    const el = await fixture('<civ-task label="Review" status="cannot-start"></civ-task>');
    const link = el.querySelector('civ-link');
    expect(link).toBeNull();
    const h4 = el.querySelector('h4.civ-task__label');
    expect(h4!.textContent).toContain('Review');
  });

  it('renders label as plain text when status is cannot-start even with href', async () => {
    const el = await fixture('<civ-task label="Review" href="#/review" status="cannot-start"></civ-task>');
    expect(el.querySelector('civ-link')).toBeNull();
  });

  it('renders hint as paragraph', async () => {
    const el = await fixture('<civ-task label="Task" hint="Some details" status="not-started"></civ-task>');
    const hint = el.querySelector('p.civ-task__hint');
    expect(hint).not.toBeNull();
    expect(hint!.textContent).toBe('Some details');
  });

  it('omits hint when empty', async () => {
    const el = await fixture('<civ-task label="Task" status="not-started"></civ-task>');
    expect(el.querySelector('.civ-task__hint')).toBeNull();
  });

  it('renders not-started with blue tag', async () => {
    const el = await fixture('<civ-task label="Task" status="not-started"></civ-task>');
    const tag = el.querySelector('civ-tag');
    expect(tag!.getAttribute('variant')).toBe('blue');
    expect(tag!.getAttribute('label')).toBe('Not started');
  });

  it('renders in-progress with teal tag', async () => {
    const el = await fixture('<civ-task label="Task" status="in-progress"></civ-task>');
    const tag = el.querySelector('civ-tag');
    expect(tag!.getAttribute('variant')).toBe('teal');
  });

  it('renders complete with green primary tag', async () => {
    const el = await fixture('<civ-task label="Task" href="#" status="complete"></civ-task>');
    const tag = el.querySelector('civ-tag');
    expect(tag!.getAttribute('variant')).toBe('green');
    expect(tag!.getAttribute('tag-style')).toBe('primary');
  });

  it('renders cannot-start with gray tag', async () => {
    const el = await fixture('<civ-task label="Task" status="cannot-start"></civ-task>');
    const tag = el.querySelector('civ-tag');
    expect(tag!.getAttribute('variant')).toBe('gray');
  });

  it('renders error with red tag and danger link', async () => {
    const el = await fixture('<civ-task label="Task" href="#" status="error"></civ-task>');
    const tag = el.querySelector('civ-tag');
    expect(tag!.getAttribute('variant')).toBe('red');
    const link = el.querySelector('civ-link');
    expect(link!.hasAttribute('danger')).toBe(true);
  });

  it('has aria-describedby linking label to status', async () => {
    const el = await fixture('<civ-task label="Task" href="#" status="in-progress"></civ-task>');
    const link = el.querySelector('civ-link')!;
    const statusId = link.getAttribute('aria-describedby');
    expect(statusId).toBeTruthy();
    const statusEl = el.querySelector(`#${statusId}`);
    expect(statusEl).not.toBeNull();
    expect(statusEl!.querySelector('civ-tag')).not.toBeNull();
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-task label="Task" status="not-started"></civ-task>');
    expect(el.shadowRoot).toBeNull();
  });
});
