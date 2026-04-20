import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-card.js';

afterEach(cleanupFixtures);

describe('civ-card', () => {
  it('renders a bordered container', async () => {
    const el = await fixture('<civ-card><p>Content</p></civ-card>');
    expect(el.querySelector('.civ-card')).not.toBeNull();
  });

  it('relocates body children into card body', async () => {
    const el = await fixture('<civ-card><p>Hello</p></civ-card>');
    const body = el.querySelector('[data-civ-card-body]');
    expect(body).not.toBeNull();
    expect(body!.querySelector('p')).not.toBeNull();
  });

  it('applies sm spacing class', async () => {
    const el = await fixture('<civ-card spacing="sm"><p>Compact</p></civ-card>');
    expect(el.querySelector('.civ-card--sm')).not.toBeNull();
  });

  it('relocates header children into card header', async () => {
    const el = await fixture(`
      <civ-card>
        <div data-card-header><h3>Title</h3></div>
        <p>Body</p>
      </civ-card>
    `);
    const header = el.querySelector('[data-civ-card-header]');
    expect(header).not.toBeNull();
    expect(header!.querySelector('h3')!.textContent).toBe('Title');
  });

  it('omits header when no data-card-header children', async () => {
    const el = await fixture('<civ-card><p>Body only</p></civ-card>');
    expect(el.querySelector('.civ-card__header')).toBeNull();
  });

  it('relocates footer children into card footer', async () => {
    const el = await fixture(`
      <civ-card>
        <p>Body</p>
        <div data-card-footer><a href="/details">View details</a></div>
      </civ-card>
    `);
    const footer = el.querySelector('[data-civ-card-footer]');
    expect(footer).not.toBeNull();
    expect(footer!.querySelector('a')!.textContent).toBe('View details');
  });

  it('omits footer when no data-card-footer children', async () => {
    const el = await fixture('<civ-card><p>Body</p></civ-card>');
    expect(el.querySelector('.civ-card__footer')).toBeNull();
  });

  it('renders all three sections together', async () => {
    const el = await fixture(`
      <civ-card>
        <div data-card-header><h3>Heading</h3></div>
        <p>Body content</p>
        <div data-card-footer><span>Footer</span></div>
      </civ-card>
    `);
    expect(el.querySelector('.civ-card__header')).not.toBeNull();
    expect(el.querySelector('.civ-card__body')).not.toBeNull();
    expect(el.querySelector('.civ-card__footer')).not.toBeNull();
  });

  it('renders expandable footer with details element', async () => {
    const el = await fixture(`
      <civ-card>
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
