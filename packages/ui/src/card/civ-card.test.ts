import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-card.js';
import '../tag/civ-tag.js';

afterEach(cleanupFixtures);

describe('civ-card', () => {
  it('renders a bordered container', async () => {
    const el = await fixture('<civ-card><p>Content</p></civ-card>');
    const card = el.querySelector('.civ-card');
    expect(card).not.toBeNull();
  });

  it('relocates body children into card body', async () => {
    const el = await fixture('<civ-card><p>Hello</p></civ-card>');
    const body = el.querySelector('[data-civ-card-body]');
    expect(body).not.toBeNull();
    expect(body!.querySelector('p')).not.toBeNull();
  });

  it('applies sm spacing class', async () => {
    const el = await fixture('<civ-card spacing="sm"><p>Compact</p></civ-card>');
    const card = el.querySelector('.civ-card--sm');
    expect(card).not.toBeNull();
  });

  it('renders heading', async () => {
    const el = await fixture('<civ-card heading="Card title"><p>Body</p></civ-card>');
    const title = el.querySelector('.civ-card__title');
    expect(title).not.toBeNull();
    expect(title!.textContent).toBe('Card title');
  });

  it('renders heading as link when href is set', async () => {
    const el = await fixture('<civ-card heading="Details" href="/details"><p>Body</p></civ-card>');
    const link = el.querySelector('a.civ-card__title');
    expect(link).not.toBeNull();
    expect(link!.getAttribute('href')).toBe('/details');
  });

  it('renders heading as plain text when no href', async () => {
    const el = await fixture('<civ-card heading="Title"><p>Body</p></civ-card>');
    const span = el.querySelector('span.civ-card__title');
    expect(span).not.toBeNull();
    const link = el.querySelector('a.civ-card__title');
    expect(link).toBeNull();
  });

  it('renders eyebrow as tag', async () => {
    const el = await fixture('<civ-card heading="Title" eyebrow="In progress" eyebrow-variant="teal"><p>Body</p></civ-card>');
    const tag = el.querySelector('civ-tag');
    expect(tag).not.toBeNull();
    expect(tag!.getAttribute('label')).toBe('In progress');
    expect(tag!.getAttribute('variant')).toBe('teal');
  });

  it('omits header when no heading or eyebrow', async () => {
    const el = await fixture('<civ-card><p>Body only</p></civ-card>');
    const header = el.querySelector('.civ-card__header');
    expect(header).toBeNull();
  });

  it('relocates footer children into card footer', async () => {
    const el = await fixture(`
      <civ-card heading="Title">
        <p>Body</p>
        <div data-card-footer><a href="/details">View details</a></div>
      </civ-card>
    `);
    const footer = el.querySelector('[data-civ-card-footer]');
    expect(footer).not.toBeNull();
    const link = footer!.querySelector('a');
    expect(link).not.toBeNull();
    expect(link!.textContent).toBe('View details');
  });

  it('omits footer when no data-card-footer children', async () => {
    const el = await fixture('<civ-card heading="Title"><p>Body</p></civ-card>');
    const footer = el.querySelector('.civ-card__footer');
    expect(footer).toBeNull();
  });

  it('relocates action children into header actions', async () => {
    const el = await fixture(`
      <civ-card heading="Title">
        <p>Body</p>
        <span data-card-actions><a href="/edit">Edit</a></span>
      </civ-card>
    `);
    const actions = el.querySelector('[data-civ-card-actions]');
    expect(actions).not.toBeNull();
    expect(actions!.querySelector('a')!.textContent).toBe('Edit');
  });

  it('renders expandable footer with details element', async () => {
    const el = await fixture(`
      <civ-card heading="Payment">
        <p>Last payment: $100</p>
        <details data-card-footer>
          <summary>View breakdown</summary>
          <p>Detail content</p>
        </details>
      </civ-card>
    `);
    const details = el.querySelector('details');
    expect(details).not.toBeNull();
    expect(details!.querySelector('summary')!.textContent).toBe('View breakdown');
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-card><p>Test</p></civ-card>');
    expect(el.shadowRoot).toBeNull();
  });
});
