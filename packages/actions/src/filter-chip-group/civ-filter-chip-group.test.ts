import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-filter-chip-group.js';
import '../filter-chip/civ-filter-chip.js';
import type { CivFilterChipGroup } from './civ-filter-chip-group.js';
import type { CivFilterChip } from '../filter-chip/civ-filter-chip.js';

afterEach(cleanupFixtures);

const groupHtml = (mode = 'multi', selected: string[] = []) => `
  <civ-filter-chip-group mode="${mode}" label="Categories">
    <civ-filter-chip label="Healthcare" value="health" ${selected.includes('health') ? 'selected' : ''}></civ-filter-chip>
    <civ-filter-chip label="Education" value="education" ${selected.includes('education') ? 'selected' : ''}></civ-filter-chip>
    <civ-filter-chip label="Housing" value="housing" ${selected.includes('housing') ? 'selected' : ''}></civ-filter-chip>
  </civ-filter-chip-group>
`;

describe('civ-filter-chip-group', () => {
  it('renders a toolbar with the provided label', async () => {
    const el = await fixture<CivFilterChipGroup>(groupHtml());
    const toolbar = el.querySelector('[role="toolbar"]')!;
    expect(toolbar).not.toBeNull();
    expect(toolbar.getAttribute('aria-label')).toBe('Categories');
  });

  it('relocates chips into the toolbar', async () => {
    const el = await fixture<CivFilterChipGroup>(groupHtml());
    const toolbar = el.querySelector('[role="toolbar"]')!;
    expect(toolbar.querySelectorAll('civ-filter-chip').length).toBe(3);
  });

  describe('roving tabindex', () => {
    it('sets tabindex=0 on the first chip when none are selected', async () => {
      const el = await fixture<CivFilterChipGroup>(groupHtml());
      await new Promise((r) => queueMicrotask(() => r(null)));

      const buttons = el.querySelectorAll<HTMLButtonElement>('civ-filter-chip button');
      expect(buttons[0].tabIndex).toBe(0);
      expect(buttons[1].tabIndex).toBe(-1);
      expect(buttons[2].tabIndex).toBe(-1);
    });

    it('sets tabindex=0 on the first selected chip', async () => {
      const el = await fixture<CivFilterChipGroup>(groupHtml('multi', ['education']));
      await new Promise((r) => queueMicrotask(() => r(null)));

      const buttons = el.querySelectorAll<HTMLButtonElement>('civ-filter-chip button');
      expect(buttons[0].tabIndex).toBe(-1);
      expect(buttons[1].tabIndex).toBe(0);
      expect(buttons[2].tabIndex).toBe(-1);
    });

    it('moves focus on ArrowRight', async () => {
      const el = await fixture<CivFilterChipGroup>(groupHtml());
      await new Promise((r) => queueMicrotask(() => r(null)));

      const buttons = el.querySelectorAll<HTMLButtonElement>('civ-filter-chip button');
      buttons[0].focus();
      buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      await elementUpdated(el);

      expect(document.activeElement).toBe(buttons[1]);
      expect(buttons[1].tabIndex).toBe(0);
      expect(buttons[0].tabIndex).toBe(-1);
    });

    it('moves focus on ArrowLeft and wraps at the start', async () => {
      const el = await fixture<CivFilterChipGroup>(groupHtml());
      await new Promise((r) => queueMicrotask(() => r(null)));

      const buttons = el.querySelectorAll<HTMLButtonElement>('civ-filter-chip button');
      buttons[0].focus();
      buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      await elementUpdated(el);

      expect(document.activeElement).toBe(buttons[2]);
    });

    it('moves focus to the last chip on End', async () => {
      const el = await fixture<CivFilterChipGroup>(groupHtml());
      await new Promise((r) => queueMicrotask(() => r(null)));

      const buttons = el.querySelectorAll<HTMLButtonElement>('civ-filter-chip button');
      buttons[0].focus();
      buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
      await elementUpdated(el);

      expect(document.activeElement).toBe(buttons[2]);
    });

    it('moves focus to the first chip on Home', async () => {
      const el = await fixture<CivFilterChipGroup>(groupHtml());
      await new Promise((r) => queueMicrotask(() => r(null)));

      const buttons = el.querySelectorAll<HTMLButtonElement>('civ-filter-chip button');
      buttons[2].focus();
      buttons[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
      await elementUpdated(el);

      expect(document.activeElement).toBe(buttons[0]);
    });

    it('skips disabled chips during navigation', async () => {
      const html = `
        <civ-filter-chip-group mode="multi">
          <civ-filter-chip label="A" value="a"></civ-filter-chip>
          <civ-filter-chip label="B" value="b" disabled></civ-filter-chip>
          <civ-filter-chip label="C" value="c"></civ-filter-chip>
        </civ-filter-chip-group>
      `;
      const el = await fixture<CivFilterChipGroup>(html);
      await new Promise((r) => queueMicrotask(() => r(null)));

      const buttons = el.querySelectorAll<HTMLButtonElement>('civ-filter-chip button');
      buttons[0].focus();
      buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      await elementUpdated(el);

      expect(document.activeElement).toBe(buttons[2]);
    });
  });

  describe('multi-select (default)', () => {
    it('lets each chip toggle independently', async () => {
      const el = await fixture<CivFilterChipGroup>(groupHtml());
      const chips = el.querySelectorAll<CivFilterChip>('civ-filter-chip');

      chips[0].querySelector('button')!.click();
      chips[2].querySelector('button')!.click();
      await elementUpdated(el);

      expect(chips[0].selected).toBe(true);
      expect(chips[1].selected).toBe(false);
      expect(chips[2].selected).toBe(true);
    });

    it('emits aggregated civ-change with array of values', async () => {
      const el = await fixture<CivFilterChipGroup>(groupHtml());
      const handler = vi.fn();
      el.addEventListener('civ-change', handler);

      const chips = el.querySelectorAll<CivFilterChip>('civ-filter-chip');
      chips[0].querySelector('button')!.click();
      await elementUpdated(el);
      chips[2].querySelector('button')!.click();
      await elementUpdated(el);

      expect(handler).toHaveBeenCalledTimes(2);
      const last = handler.mock.calls.at(-1)![0].detail;
      expect(last.value).toEqual(['health', 'housing']);
      expect(last.aggregated).toBe(true);
    });

    it('value getter returns array', async () => {
      const el = await fixture<CivFilterChipGroup>(groupHtml('multi', ['health', 'housing']));
      expect(el.value).toEqual(['health', 'housing']);
    });
  });

  describe('single-select', () => {
    it('deselects siblings when one chip is selected', async () => {
      const el = await fixture<CivFilterChipGroup>(groupHtml('single', ['health']));
      const chips = el.querySelectorAll<CivFilterChip>('civ-filter-chip');

      chips[1].querySelector('button')!.click();
      await elementUpdated(el);

      expect(chips[0].selected).toBe(false);
      expect(chips[1].selected).toBe(true);
      expect(chips[2].selected).toBe(false);
    });

    it('emits aggregated civ-change with single value string', async () => {
      const el = await fixture<CivFilterChipGroup>(groupHtml('single'));
      const handler = vi.fn();
      el.addEventListener('civ-change', handler);

      const chips = el.querySelectorAll<CivFilterChip>('civ-filter-chip');
      chips[1].querySelector('button')!.click();
      await elementUpdated(el);

      const detail = handler.mock.calls[0][0].detail;
      expect(detail.value).toBe('education');
      expect(detail.aggregated).toBe(true);
    });

    it('value getter returns string', async () => {
      const el = await fixture<CivFilterChipGroup>(groupHtml('single', ['education']));
      expect(el.value).toBe('education');
    });

    it('value returns empty string when nothing is selected', async () => {
      const el = await fixture<CivFilterChipGroup>(groupHtml('single'));
      expect(el.value).toBe('');
    });
  });
});
