import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-notice.js';
import '../alert/civ-alert.js';
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

  it('defaults to the filled icon (primary weight) for the intent', async () => {
    const el = await fixture<CivNotice>(`
      <civ-notice intent="warning" body="Heads up"></civ-notice>
    `);
    const icon = el.querySelector('civ-icon.civ-notice__icon');
    expect(icon?.getAttribute('name')).toBe('warning-fill');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
  });

  it('maps each intent to its primary (filled) default icon', async () => {
    const cases: Array<['info' | 'warning' | 'error' | 'success' | 'neutral', string]> = [
      ['info', 'info-fill'],
      ['warning', 'warning-fill'],
      ['error', 'error-fill'],
      ['success', 'check-circle-fill'],
      ['neutral', 'info-fill'],
    ];
    for (const [intent, expected] of cases) {
      const el = await fixture<CivNotice>(`
        <civ-notice intent="${intent}" body="x"></civ-notice>
      `);
      expect(el.querySelector('civ-icon.civ-notice__icon')?.getAttribute('name')).toBe(expected);
    }
  });

  it('switches to outlined-variant icons when notice-style="secondary"', async () => {
    const cases: Array<['info' | 'warning' | 'error' | 'success' | 'neutral', string]> = [
      ['info', 'info'],
      ['warning', 'warning'],
      ['error', 'error'],
      ['success', 'check-circle'],
      ['neutral', 'info'],
    ];
    for (const [intent, expected] of cases) {
      const el = await fixture<CivNotice>(`
        <civ-notice intent="${intent}" notice-style="secondary" body="x"></civ-notice>
      `);
      expect(el.querySelector('civ-icon.civ-notice__icon')?.getAttribute('name')).toBe(expected);
    }
  });

  it('reflects notice-style to the host attribute', async () => {
    const el = await fixture<CivNotice>(`
      <civ-notice body="x"></civ-notice>
    `);
    // Default is primary and reflects to the host so consumer CSS
    // overrides can target the weight.
    expect(el.getAttribute('notice-style')).toBe('primary');
    el.noticeStyle = 'secondary';
    await elementUpdated(el);
    expect(el.getAttribute('notice-style')).toBe('secondary');
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

describe('civ-notice composed inside civ-alert', () => {
  // Civ-alert was migrated from LightDomTextMixin to LightDomSlotMixin
  // so consumers can place rich content (including <civ-notice>) as
  // children. These tests live in the layout package because
  // packages/layout/vitest.config.ts already aliases @civui/feedback
  // to source.

  it('relocates a civ-notice child into the alert body when label is unset', async () => {
    const el = await fixture(`
      <civ-alert variant="warning">
        <civ-notice intent="warning" body="Embedded notice body"></civ-notice>
      </civ-alert>
    `);
    const body = el.querySelector('.civ-alert__body')!;
    const notice = body.querySelector('civ-notice');
    expect(notice).not.toBeNull();
    expect(notice?.querySelector('.civ-notice__body')?.textContent).toBe('Embedded notice body');
  });

  it('hides children when label is set (label-wins rule preserved)', async () => {
    const el = await fixture(`
      <civ-alert variant="info" label="Label wins">
        <civ-notice intent="info" body="Should be hidden"></civ-notice>
      </civ-alert>
    `);
    const body = el.querySelector('.civ-alert__body')!;
    expect(body.textContent?.trim()).toBe('Label wins');
    // The notice element was captured by LightDomSlotMixin but, since
    // the body container is non-empty (label rendered), the mixin
    // never relocates it — so it is not present in the alert body.
    expect(body.querySelector('civ-notice')).toBeNull();
  });

  it('preserves the alert role + ARIA labelling around composed children', async () => {
    const el = await fixture(`
      <civ-alert variant="error" heading="Action needed">
        <civ-notice intent="error" body="Composed body"></civ-notice>
      </civ-alert>
    `);
    const alert = el.querySelector('.civ-alert')!;
    expect(alert.getAttribute('role')).toBe('alert');
    // aria-labelledby points to the alert's own heading id, even when
    // the body is supplied by a composed civ-notice.
    const headingId = el.querySelector('.civ-alert__heading')?.id;
    expect(headingId).toBeTruthy();
    expect(alert.getAttribute('aria-labelledby')).toBe(headingId);
  });
});
