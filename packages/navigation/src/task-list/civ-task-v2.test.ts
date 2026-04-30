import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-task-v2.js';
import '@civui/layout/tag';
import '@civui/navigation/link-card';

afterEach(cleanupFixtures);

describe('civ-task-v2', () => {
  it('renders as a list item', async () => {
    const el = await fixture('<civ-task-v2 label="Task" status="not-started"></civ-task-v2>');
    expect(el.querySelector('li')).not.toBeNull();
  });

  it('renders a civ-link-card when navigable', async () => {
    const el = await fixture('<civ-task-v2 label="Contact info" href="#/contact" status="not-started"></civ-task-v2>');
    const card = el.querySelector('civ-link-card');
    expect(card).not.toBeNull();
    expect(card!.getAttribute('href')).toBe('#/contact');
    expect(card!.getAttribute('heading')).toBe('Contact info');
    expect(card!.getAttribute('variant')).toBe('tertiary');
  });

  it('passes hint text as the link card description', async () => {
    const el = await fixture('<civ-task-v2 label="Task" hint="Phone needed" href="#" status="in-progress"></civ-task-v2>');
    const card = el.querySelector('civ-link-card');
    expect(card!.getAttribute('description')).toContain('Phone needed');
  });

  it('slots the status tag inside the link card', async () => {
    const el = await fixture('<civ-task-v2 label="Task" href="#" status="in-progress"></civ-task-v2>');
    const card = el.querySelector('civ-link-card')!;
    const tag = card.querySelector('civ-tag');
    expect(tag).not.toBeNull();
    expect(tag!.getAttribute('variant')).toBe('teal');
  });

  it('slotted tag is relocated into the link card end slot', async () => {
    const el = await fixture('<civ-task-v2 label="Task" href="#" status="not-started"></civ-task-v2>');
    const endSlot = el.querySelector('civ-link-card [data-civ-link-card-end-slot]');
    expect(endSlot).not.toBeNull();
    expect(endSlot!.querySelector('civ-tag')).not.toBeNull();
  });

  it('renders cannot-start as a plain row without a link card', async () => {
    const el = await fixture('<civ-task-v2 label="Review" status="cannot-start"></civ-task-v2>');
    expect(el.querySelector('civ-link-card')).toBeNull();
    const h4 = el.querySelector('h4.civ-task__label');
    expect(h4).not.toBeNull();
    expect(h4!.textContent).toContain('Review');
  });

  it('renders plain row when status is cannot-start even with href', async () => {
    const el = await fixture('<civ-task-v2 label="Review" href="#/review" status="cannot-start"></civ-task-v2>');
    expect(el.querySelector('civ-link-card')).toBeNull();
  });

  it('renders plain row when no href is provided', async () => {
    const el = await fixture('<civ-task-v2 label="Locked" status="not-started"></civ-task-v2>');
    expect(el.querySelector('civ-link-card')).toBeNull();
    const h4 = el.querySelector('h4.civ-task__label');
    expect(h4).not.toBeNull();
  });

  it('renders not-started with blue tag', async () => {
    const el = await fixture('<civ-task-v2 label="Task" href="#" status="not-started"></civ-task-v2>');
    const tag = el.querySelector('civ-tag');
    expect(tag!.getAttribute('variant')).toBe('blue');
    expect(tag!.getAttribute('label')).toBe('Not started');
  });

  it('renders complete with green primary tag', async () => {
    const el = await fixture('<civ-task-v2 label="Task" href="#" status="complete"></civ-task-v2>');
    const tag = el.querySelector('civ-tag');
    expect(tag!.getAttribute('variant')).toBe('green');
    expect(tag!.getAttribute('tag-style')).toBe('primary');
  });

  it('renders error with red tag', async () => {
    const el = await fixture('<civ-task-v2 label="Task" href="#" status="error"></civ-task-v2>');
    const tag = el.querySelector('civ-tag');
    expect(tag!.getAttribute('variant')).toBe('red');
  });

  it('renders review with yellow primary tag', async () => {
    const el = await fixture('<civ-task-v2 label="Task" href="#" status="review"></civ-task-v2>');
    const tag = el.querySelector('civ-tag');
    expect(tag!.getAttribute('variant')).toBe('yellow');
    expect(tag!.getAttribute('tag-style')).toBe('primary');
  });

  it('combines hint and prefill hint into the description', async () => {
    const el = await fixture('<civ-task-v2 label="Task" hint="Phone and email" href="#" status="review" prefilled></civ-task-v2>');
    const card = el.querySelector('civ-link-card')!;
    const description = card.getAttribute('description')!;
    expect(description).toContain('Phone and email');
    expect(description).toContain('prefilled');
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-task-v2 label="Task" status="not-started"></civ-task-v2>');
    expect(el.shadowRoot).toBeNull();
  });
});
