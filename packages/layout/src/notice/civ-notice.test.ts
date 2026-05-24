import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-notice.js';
import type { CivNotice } from './civ-notice.js';

afterEach(cleanupFixtures);

describe('civ-notice', () => {
  it('renders the body text', async () => {
    const el = await fixture<CivNotice>(`
      <civ-notice body="You must register"></civ-notice>
    `);
    expect(el.querySelector('.civ-notice__body')?.textContent).toBe('You must register');
  });

  it('renders the optional header as a heading', async () => {
    const el = await fixture<CivNotice>(`
      <civ-notice header="Important" body="Read carefully"></civ-notice>
    `);
    const header = el.querySelector('.civ-notice__header');
    expect(header?.textContent).toBe('Important');
    expect(header?.getAttribute('role')).toBe('heading');
    expect(header?.getAttribute('aria-level')).toBe('3');
  });

  it('honors the configured heading level', async () => {
    const el = await fixture<CivNotice>(`
      <civ-notice header="Warning" body="text" heading-level="2"></civ-notice>
    `);
    expect(el.querySelector('.civ-notice__header')?.getAttribute('aria-level')).toBe('2');
  });

  it('clamps heading level into the 2-6 range', async () => {
    const el = await fixture<CivNotice>(`
      <civ-notice header="x" body="y" heading-level="9"></civ-notice>
    `);
    expect(el.querySelector('.civ-notice__header')?.getAttribute('aria-level')).toBe('6');
  });

  it('omits the header when not set', async () => {
    const el = await fixture<CivNotice>(`
      <civ-notice body="No header here"></civ-notice>
    `);
    expect(el.querySelector('.civ-notice__header')).toBeNull();
  });

  it('omits the body when not set', async () => {
    const el = await fixture<CivNotice>(`
      <civ-notice header="Just a header"></civ-notice>
    `);
    expect(el.querySelector('.civ-notice__body')).toBeNull();
  });

  it('uses the intent-default icon when no override is set', async () => {
    const el = await fixture<CivNotice>(`
      <civ-notice intent="warning" body="Heads up"></civ-notice>
    `);
    const icon = el.querySelector('civ-icon.civ-notice__icon');
    expect(icon?.getAttribute('name')).toBe('warning');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
  });

  it('maps each intent to its default icon', async () => {
    const cases: Array<['info' | 'warning' | 'error' | 'success' | 'neutral', string]> = [
      ['info', 'info'],
      ['warning', 'warning'],
      ['error', 'error'],
      ['success', 'check-circle'],
      ['neutral', 'info'],
    ];
    for (const [intent, expected] of cases) {
      const el = await fixture<CivNotice>(`
        <civ-notice intent="${intent}" body="x"></civ-notice>
      `);
      expect(el.querySelector('civ-icon.civ-notice__icon')?.getAttribute('name')).toBe(expected);
    }
  });

  it('uses the override icon when set', async () => {
    const el = await fixture<CivNotice>(`
      <civ-notice intent="info" icon="check" body="custom"></civ-notice>
    `);
    expect(el.querySelector('civ-icon.civ-notice__icon')?.getAttribute('name')).toBe('check');
  });

  it('applies the intent class to the root for each intent', async () => {
    // Literal class-name references below double as Tailwind content
    // hints — `lint:purged-variants` requires every BEM variant class
    // to appear as a static string in TS so the JIT scanner emits
    // the corresponding CSS rule into the production bundle.
    const cases: Array<['info' | 'warning' | 'error' | 'success' | 'neutral', string]> = [
      ['info', 'civ-notice--info'],
      ['warning', 'civ-notice--warning'],
      ['error', 'civ-notice--error'],
      ['success', 'civ-notice--success'],
      ['neutral', 'civ-notice--neutral'],
    ];
    for (const [intent, expected] of cases) {
      const el = await fixture<CivNotice>(`
        <civ-notice intent="${intent}" body="x"></civ-notice>
      `);
      const root = el.querySelector('.civ-notice')!;
      expect(root.classList.contains(expected)).toBe(true);
    }
  });

  it('applies the spacing class to the root', async () => {
    const el = await fixture<CivNotice>(`
      <civ-notice spacing="sm" body="x"></civ-notice>
    `);
    expect(el.querySelector('.civ-notice')?.classList.contains('civ-notice--sm')).toBe(true);
  });

  it('defaults to default spacing', async () => {
    const el = await fixture<CivNotice>(`
      <civ-notice body="x"></civ-notice>
    `);
    expect(el.querySelector('.civ-notice')?.classList.contains('civ-notice--default')).toBe(true);
  });

  it('reflects intent and spacing to the host attribute', async () => {
    const el = await fixture<CivNotice>(`
      <civ-notice body="x"></civ-notice>
    `);
    el.intent = 'warning';
    el.spacing = 'sm';
    await elementUpdated(el);
    expect(el.getAttribute('intent')).toBe('warning');
    expect(el.getAttribute('spacing')).toBe('sm');
  });

  it('omits the screen-reader prefix when not set', async () => {
    const el = await fixture<CivNotice>(`
      <civ-notice body="x"></civ-notice>
    `);
    expect(el.querySelector('.civ-sr-only')).toBeNull();
  });

  it('renders the screen-reader prefix when set', async () => {
    const el = await fixture<CivNotice>(`
      <civ-notice sr-prefix="Warning:" intent="warning" body="Read this"></civ-notice>
    `);
    const sr = el.querySelector('.civ-sr-only');
    expect(sr?.textContent).toBe('Warning:');
  });
});
