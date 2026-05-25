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

const actions = (el: Element) =>
  el.querySelectorAll<HTMLButtonElement>('civ-filter-chip .civ-chip__action');

const settle = () => new Promise((r) => queueMicrotask(() => r(null)));

describe('civ-filter-chip-group', () => {
  describe('wrapper role', () => {
    it('uses role="toolbar" in multi mode', async () => {
      const el = await fixture<CivFilterChipGroup>(groupHtml('multi'));
      expect(el.querySelector('[role="toolbar"]')).not.toBeNull();
      expect(el.querySelector('[role="radiogroup"]')).toBeNull();
    });

    it('uses role="radiogroup" in single mode', async () => {
      const el = await fixture<CivFilterChipGroup>(groupHtml('single'));
      expect(el.querySelector('[role="radiogroup"]')).not.toBeNull();
      expect(el.querySelector('[role="toolbar"]')).toBeNull();
    });

    it('exposes aria-label on the wrapper', async () => {
      const el = await fixture<CivFilterChipGroup>(groupHtml());
      const wrapper = el.querySelector('[role="toolbar"], [role="radiogroup"]')!;
      expect(wrapper.getAttribute('aria-label')).toBe('Categories');
    });

    it('relocates chips into the wrapper', async () => {
      const el = await fixture<CivFilterChipGroup>(groupHtml());
      const wrapper = el.querySelector('[role="toolbar"]')!;
      expect(wrapper.querySelectorAll('civ-filter-chip').length).toBe(3);
    });
  });

  describe('variant coordination', () => {
    it('sets variant="toggle" on every chip in multi mode', async () => {
      const el = await fixture<CivFilterChipGroup>(groupHtml('multi'));
      await settle();

      for (const chip of el.querySelectorAll<CivFilterChip>('civ-filter-chip')) {
        expect(chip.variant).toBe('toggle');
      }
    });

    it('sets variant="radio" on every chip in single mode', async () => {
      const el = await fixture<CivFilterChipGroup>(groupHtml('single'));
      await settle();

      for (const chip of el.querySelectorAll<CivFilterChip>('civ-filter-chip')) {
        expect(chip.variant).toBe('radio');
      }
    });

    it('updates variant when mode changes after mount', async () => {
      const el = await fixture<CivFilterChipGroup>(groupHtml('multi'));
      await settle();
      const chips = Array.from(el.querySelectorAll<CivFilterChip>('civ-filter-chip'));

      el.mode = 'single';
      await elementUpdated(el);

      for (const chip of chips) expect(chip.variant).toBe('radio');
    });
  });

  describe('roving tabindex', () => {
    it('sets tabindex=0 on the first chip when none are selected', async () => {
      const el = await fixture<CivFilterChipGroup>(groupHtml());
      await settle();

      const buttons = actions(el);
      expect(buttons[0].tabIndex).toBe(0);
      expect(buttons[1].tabIndex).toBe(-1);
      expect(buttons[2].tabIndex).toBe(-1);
    });

    it('sets tabindex=0 on the first selected chip', async () => {
      const el = await fixture<CivFilterChipGroup>(groupHtml('multi', ['education']));
      await settle();

      const buttons = actions(el);
      expect(buttons[0].tabIndex).toBe(-1);
      expect(buttons[1].tabIndex).toBe(0);
      expect(buttons[2].tabIndex).toBe(-1);
    });

    it('moves focus on ArrowRight', async () => {
      const el = await fixture<CivFilterChipGroup>(groupHtml());
      await settle();

      const buttons = actions(el);
      buttons[0].focus();
      buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      await elementUpdated(el);

      expect(document.activeElement).toBe(buttons[1]);
      expect(buttons[1].tabIndex).toBe(0);
      expect(buttons[0].tabIndex).toBe(-1);
    });

    it('moves focus on ArrowLeft and wraps at the start', async () => {
      const el = await fixture<CivFilterChipGroup>(groupHtml());
      await settle();

      const buttons = actions(el);
      buttons[0].focus();
      buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      await elementUpdated(el);

      expect(document.activeElement).toBe(buttons[2]);
    });

    it('moves focus to the last chip on End', async () => {
      const el = await fixture<CivFilterChipGroup>(groupHtml());
      await settle();

      const buttons = actions(el);
      buttons[0].focus();
      buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
      await elementUpdated(el);

      expect(document.activeElement).toBe(buttons[2]);
    });

    it('moves focus to the first chip on Home', async () => {
      const el = await fixture<CivFilterChipGroup>(groupHtml());
      await settle();

      const buttons = actions(el);
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
      await settle();

      const buttons = actions(el);
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

      chips[0].querySelector<HTMLButtonElement>('.civ-chip__action')!.click();
      chips[2].querySelector<HTMLButtonElement>('.civ-chip__action')!.click();
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
      chips[0].querySelector<HTMLButtonElement>('.civ-chip__action')!.click();
      await elementUpdated(el);
      chips[2].querySelector<HTMLButtonElement>('.civ-chip__action')!.click();
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

      chips[1].querySelector<HTMLButtonElement>('.civ-chip__action')!.click();
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
      chips[1].querySelector<HTMLButtonElement>('.civ-chip__action')!.click();
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

  describe('value setter', () => {
    it('selects chips matching the supplied array (multi)', async () => {
      const el = await fixture<CivFilterChipGroup>(groupHtml('multi'));
      el.value = ['health', 'housing'];
      await elementUpdated(el);

      const chips = el.querySelectorAll<CivFilterChip>('civ-filter-chip');
      expect(chips[0].selected).toBe(true);
      expect(chips[1].selected).toBe(false);
      expect(chips[2].selected).toBe(true);
    });

    it('selects the chip matching the supplied string (single)', async () => {
      const el = await fixture<CivFilterChipGroup>(groupHtml('single'));
      el.value = 'education';
      await elementUpdated(el);

      const chips = el.querySelectorAll<CivFilterChip>('civ-filter-chip');
      expect(chips[0].selected).toBe(false);
      expect(chips[1].selected).toBe(true);
      expect(chips[2].selected).toBe(false);
    });

    it('deselects all chips when value is empty', async () => {
      const el = await fixture<CivFilterChipGroup>(groupHtml('multi', ['health', 'housing']));
      el.value = [];
      await elementUpdated(el);

      for (const chip of el.querySelectorAll<CivFilterChip>('civ-filter-chip')) {
        expect(chip.selected).toBe(false);
      }
    });
  });

  describe('mode change reconciliation', () => {
    it('reduces to a single selection when switching multi → single', async () => {
      const el = await fixture<CivFilterChipGroup>(groupHtml('multi', ['health', 'education', 'housing']));
      await settle();

      el.mode = 'single';
      await elementUpdated(el);

      const chips = el.querySelectorAll<CivFilterChip>('civ-filter-chip');
      const stillSelected = Array.from(chips).filter((c) => c.selected);
      expect(stillSelected.length).toBe(1);
      expect(stillSelected[0].value).toBe('health');
    });

    it('keeps an existing single selection when switching multi → single', async () => {
      const el = await fixture<CivFilterChipGroup>(groupHtml('multi', ['education']));
      await settle();

      el.mode = 'single';
      await elementUpdated(el);

      expect(el.value).toBe('education');
    });
  });

  describe('mutation observer', () => {
    it('syncs tabindex when a chip is appended after mount', async () => {
      const el = await fixture<CivFilterChipGroup>(groupHtml('multi'));
      await settle();

      const newChip = document.createElement('civ-filter-chip') as CivFilterChip;
      newChip.label = 'Employment';
      newChip.value = 'employment';
      const wrapper = el.querySelector<HTMLElement>('[data-civ-filter-chip-group-content]')!;
      wrapper.appendChild(newChip);

      // Wait for MutationObserver microtask + Lit update.
      await elementUpdated(newChip);
      await settle();
      await elementUpdated(el);

      const buttons = actions(el);
      expect(buttons.length).toBe(4);
      // Focus index should still be the first chip; the new (unselected, last) chip is -1.
      expect(buttons[0].tabIndex).toBe(0);
      expect(buttons[3].tabIndex).toBe(-1);
    });
  });
});
