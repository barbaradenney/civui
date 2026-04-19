import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-card.js';

afterEach(cleanupFixtures);

describe('civ-card', () => {
  it('renders a bordered container', async () => {
    const el = await fixture('<civ-card><p>Content</p></civ-card>');
    const card = el.querySelector('.civ-card');
    expect(card).not.toBeNull();
  });

  it('relocates children into card container', async () => {
    const el = await fixture('<civ-card><p>Hello</p></civ-card>');
    const content = el.querySelector('[data-civ-card-content]');
    expect(content).not.toBeNull();
    expect(content!.querySelector('p')).not.toBeNull();
  });

  it('applies sm spacing class', async () => {
    const el = await fixture('<civ-card spacing="sm"><p>Compact</p></civ-card>');
    const card = el.querySelector('.civ-card--sm');
    expect(card).not.toBeNull();
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-card><p>Test</p></civ-card>');
    expect(el.shadowRoot).toBeNull();
  });
});
