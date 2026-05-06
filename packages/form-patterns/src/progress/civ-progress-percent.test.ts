import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-progress-percent.js';
import type { CivProgressPercent } from './civ-progress-percent.js';

afterEach(cleanupFixtures);

describe('civ-progress-percent', () => {
  it('renders a progress bar with role="progressbar"', async () => {
    const el = await fixture<CivProgressPercent>('<civ-progress-percent value="50"></civ-progress-percent>');
    const track = el.querySelector('[role="progressbar"]')!;
    expect(track).toBeTruthy();
    expect(track.getAttribute('aria-valuenow')).toBe('50');
    expect(track.getAttribute('aria-valuemin')).toBe('0');
    expect(track.getAttribute('aria-valuemax')).toBe('100');
  });

  it('shows percentage text by default', async () => {
    const el = await fixture<CivProgressPercent>('<civ-progress-percent value="75"></civ-progress-percent>');
    expect(el.textContent).toContain('75%');
  });

  it('hides percentage when show-percent is false', async () => {
    const el = await fixture<CivProgressPercent>('<civ-progress-percent value="75" show-percent="false"></civ-progress-percent>');
    // show-percent defaults to true, setting to false should hide it
    // Note: boolean attributes — presence = true, so we need to test the property
    el.showPercent = false;
    await elementUpdated(el);
    expect(el.querySelector('.civ-font-bold')).toBeNull();
  });

  it('shows status text when provided', async () => {
    const el = await fixture<CivProgressPercent>('<civ-progress-percent value="40" status="3 of 8 sections complete"></civ-progress-percent>');
    expect(el.textContent).toContain('3 of 8 sections complete');
  });

  it('clamps value between 0 and 100', async () => {
    const el = await fixture<CivProgressPercent>('<civ-progress-percent value="150"></civ-progress-percent>');
    const track = el.querySelector('[role="progressbar"]')!;
    expect(track.getAttribute('aria-valuenow')).toBe('100');

    el.value = -10;
    await elementUpdated(el);
    expect(el.querySelector('[role="progressbar"]')!.getAttribute('aria-valuenow')).toBe('0');
  });

  it('applies complete styling at 100%', async () => {
    const el = await fixture<CivProgressPercent>('<civ-progress-percent value="100"></civ-progress-percent>');
    const fill = el.querySelector('.civ-progress-fill')!;
    expect(fill.classList.contains('civ-progress-fill--complete')).toBe(true);
  });

  it('does not apply complete styling below 100%', async () => {
    const el = await fixture<CivProgressPercent>('<civ-progress-percent value="99"></civ-progress-percent>');
    const fill = el.querySelector('.civ-progress-fill')!;
    expect(fill.classList.contains('civ-progress-fill--complete')).toBe(false);
  });

  it('sets aria-label from label prop', async () => {
    const el = await fixture<CivProgressPercent>('<civ-progress-percent value="50" label="Form completion"></civ-progress-percent>');
    const track = el.querySelector('[role="progressbar"]')!;
    expect(track.getAttribute('aria-label')).toBe('Form completion');
  });

  it('updates fill width when value changes', async () => {
    const el = await fixture<CivProgressPercent>('<civ-progress-percent value="25"></civ-progress-percent>');
    const fill = el.querySelector('.civ-progress-fill') as HTMLElement;
    expect(fill.style.width).toBe('25%');

    el.value = 60;
    await elementUpdated(el);
    expect(fill.style.width).toBe('60%');
  });

  it('defaults to 0% when no value set', async () => {
    const el = await fixture<CivProgressPercent>('<civ-progress-percent></civ-progress-percent>');
    const track = el.querySelector('[role="progressbar"]')!;
    expect(track.getAttribute('aria-valuenow')).toBe('0');
  });
});
