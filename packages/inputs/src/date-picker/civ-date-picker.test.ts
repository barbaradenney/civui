import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-date-picker.js';
import '@civui/core';

afterEach(cleanupFixtures);

describe('civ-date-picker', () => {
  describe('rendering', () => {
    it('renders a text input', async () => {
      const el = await fixture('<civ-date-picker label="Date" name="date"></civ-date-picker>');

      const input = el.querySelector('input[type="text"]');
      expect(input).not.toBeNull();
    });

    it('sets inputmode="numeric" so mobile shows a number keypad for mm/dd/yyyy entry', async () => {
      const el = await fixture('<civ-date-picker label="Date" name="date"></civ-date-picker>');

      const input = el.querySelector('input[type="text"]') as HTMLInputElement;
      expect(input.getAttribute('inputmode')).toBe('numeric');
    });

    it('renders a calendar button', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>');

      const button = el.querySelector('button[aria-label^="Choose date"]');
      expect(button).not.toBeNull();
    });

    it('uses Light DOM', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>');

      expect(el.shadowRoot).toBeNull();
    });

    it('has static formAssociated = true', () => {
      const Ctor = customElements.get('civ-date-picker') as any;
      expect(Ctor.formAssociated).toBe(true);
    });
  });

  describe('states', () => {
    it('sets aria-invalid when error is present', async () => {
      const el = await fixture('<civ-date-picker label="Date" error="Bad"></civ-date-picker>');

      const input = el.querySelector('input');
      expect(input!.getAttribute('aria-invalid')).toBe('true');
    });

    it('renders disabled state', async () => {
      const el = await fixture('<civ-date-picker label="Date" disabled></civ-date-picker>');

      const input = el.querySelector('input') as HTMLInputElement;
      expect(input.disabled).toBe(true);
      const button = el.querySelector('button') as HTMLButtonElement;
      expect(button.disabled).toBe(true);
    });

    it('sets native required on the inner input', async () => {
      const el = await fixture('<civ-date-picker label="Date" required></civ-date-picker>');

      const input = el.querySelector('input')!;
      expect(input.required).toBe(true);
      expect(input.hasAttribute('required')).toBe(true);
    });

    it('sets placeholder on input', async () => {
      const el = await fixture('<civ-date-picker label="Date" placeholder="MM/DD/YYYY"></civ-date-picker>');

      const input = el.querySelector('input') as HTMLInputElement;
      expect(input.placeholder).toBe('MM/DD/YYYY');
    });
  });

  describe('dialog', () => {
    it('opens dialog on button click', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>') as any;

      const button = el.querySelector('button[aria-label^="Choose date"]') as HTMLButtonElement;
      button.click();
      await elementUpdated(el);

      const dialog = el.querySelector('[role="dialog"]');
      expect(dialog).not.toBeNull();
    });

    it('dialog has aria-modal="true"', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>') as any;
      el._open = true;
      await elementUpdated(el);

      const dialog = el.querySelector('[role="dialog"]');
      expect(dialog!.getAttribute('aria-modal')).toBe('true');
    });

    it('dialog has aria-label', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>') as any;
      el._open = true;
      await elementUpdated(el);

      const dialog = el.querySelector('[role="dialog"]');
      expect(dialog!.getAttribute('aria-label')).toBe('Choose Date');
    });

    it('renders a grid with role="grid"', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>') as any;
      el._open = true;
      await elementUpdated(el);

      const grid = el.querySelector('[role="grid"]');
      expect(grid).not.toBeNull();
    });

    it('renders 7 day-of-week headers', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>') as any;
      el._open = true;
      await elementUpdated(el);

      const headers = el.querySelectorAll('th');
      expect(headers.length).toBe(7);
    });

    it('renders 6 weeks of days', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>') as any;
      el._open = true;
      await elementUpdated(el);

      const rows = el.querySelectorAll('tbody tr');
      expect(rows.length).toBe(6);
    });

    it('renders previous/next month buttons', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>') as any;
      el._open = true;
      await elementUpdated(el);

      const prevBtn = el.querySelector('[aria-label="Previous month"]');
      const nextBtn = el.querySelector('[aria-label="Next month"]');
      expect(prevBtn).not.toBeNull();
      expect(nextBtn).not.toBeNull();
    });

    it('shows month/year heading', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>') as any;
      el._open = true;
      el._displayMonth = 2; // March
      el._displayYear = 2026;
      await elementUpdated(el);

      const heading = el.querySelector('[aria-live="polite"]');
      expect(heading).not.toBeNull();
      expect(heading!.textContent).toContain('March');
      expect(heading!.textContent).toContain('2026');
    });
  });

  describe('date selection', () => {
    it('selects a date on click and fires civ-change', async () => {
      const el = await fixture('<civ-date-picker label="Date" name="date"></civ-date-picker>') as any;
      el._open = true;
      el._displayMonth = 2; // March
      el._displayYear = 2026;
      await elementUpdated(el);

      let eventDetail: any = null;
      el.addEventListener('civ-change', ((e: CustomEvent) => {
        eventDetail = e.detail;
      }) as EventListener);

      // Find a day button in the current month — day 15
      const dayButtons = el.querySelectorAll('[data-civ-day]');
      const day15 = Array.from(dayButtons).find(
        (btn: any) => btn.getAttribute('data-date') === '2026-03-15',
      ) as HTMLElement;
      expect(day15).not.toBeNull();
      day15!.click();
      await elementUpdated(el);

      expect(el.value).toBe('2026-03-15');
      expect(eventDetail).toEqual({ value: '2026-03-15' });
    });

    it('closes dialog after selection', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>') as any;
      el._open = true;
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      const dayButtons = el.querySelectorAll('[data-civ-day]');
      const day15 = Array.from(dayButtons).find(
        (btn: any) => btn.getAttribute('data-date') === '2026-03-15',
      ) as HTMLElement;
      day15!.click();
      await elementUpdated(el);

      expect(el._open).toBe(false);
    });

    it('updates the text input with formatted date', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>') as any;
      el._open = true;
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      const dayButtons = el.querySelectorAll('[data-civ-day]');
      const day15 = Array.from(dayButtons).find(
        (btn: any) => btn.getAttribute('data-date') === '2026-03-15',
      ) as HTMLElement;
      day15!.click();
      await elementUpdated(el);

      const input = el.querySelector('input') as HTMLInputElement;
      expect(input.value).toContain('3');
      expect(input.value).toContain('15');
      expect(input.value).toContain('2026');
    });
  });

  describe('keyboard navigation', () => {
    function sendKey(el: HTMLElement, key: string, opts?: Partial<KeyboardEvent>): void {
      const dialog = el.querySelector('[data-civ-dialog]') as HTMLElement;
      dialog?.dispatchEvent(
        new KeyboardEvent('keydown', { key, bubbles: true, ...opts }),
      );
    }

    it('closes on Escape', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>') as any;
      el._open = true;
      await elementUpdated(el);

      sendKey(el, 'Escape');
      await elementUpdated(el);

      expect(el._open).toBe(false);
    });

    it('moves focus right with ArrowRight', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>') as any;
      el._open = true;
      el._focusedDate = new Date(2026, 2, 15);
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      sendKey(el, 'ArrowRight');
      await elementUpdated(el);

      expect(el._focusedDate.getDate()).toBe(16);
    });

    it('moves focus left with ArrowLeft', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>') as any;
      el._open = true;
      el._focusedDate = new Date(2026, 2, 15);
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      sendKey(el, 'ArrowLeft');
      await elementUpdated(el);

      expect(el._focusedDate.getDate()).toBe(14);
    });

    it('moves focus down with ArrowDown (+7 days)', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>') as any;
      el._open = true;
      el._focusedDate = new Date(2026, 2, 15);
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      sendKey(el, 'ArrowDown');
      await elementUpdated(el);

      expect(el._focusedDate.getDate()).toBe(22);
    });

    it('moves focus up with ArrowUp (-7 days)', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>') as any;
      el._open = true;
      el._focusedDate = new Date(2026, 2, 22);
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      sendKey(el, 'ArrowUp');
      await elementUpdated(el);

      expect(el._focusedDate.getDate()).toBe(15);
    });

    it('moves to next month with PageDown', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>') as any;
      el._open = true;
      el._focusedDate = new Date(2026, 2, 15);
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      sendKey(el, 'PageDown');
      await elementUpdated(el);

      expect(el._focusedDate.getMonth()).toBe(3); // April
    });

    it('moves to previous month with PageUp', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>') as any;
      el._open = true;
      el._focusedDate = new Date(2026, 2, 15);
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      sendKey(el, 'PageUp');
      await elementUpdated(el);

      expect(el._focusedDate.getMonth()).toBe(1); // February
    });

    it('moves to next year with Shift+PageDown', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>') as any;
      el._open = true;
      el._focusedDate = new Date(2026, 2, 15);
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      sendKey(el, 'PageDown', { shiftKey: true });
      await elementUpdated(el);

      expect(el._focusedDate.getFullYear()).toBe(2027);
    });

    it('moves to previous year with Shift+PageUp', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>') as any;
      el._open = true;
      el._focusedDate = new Date(2026, 2, 15);
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      sendKey(el, 'PageUp', { shiftKey: true });
      await elementUpdated(el);

      expect(el._focusedDate.getFullYear()).toBe(2025);
    });

    it('selects focused date on Enter', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>') as any;
      el._open = true;
      el._focusedDate = new Date(2026, 2, 15);
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      sendKey(el, 'Enter');
      await elementUpdated(el);

      expect(el.value).toBe('2026-03-15');
      expect(el._open).toBe(false);
    });

    it('selects focused date on Space', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>') as any;
      el._open = true;
      el._focusedDate = new Date(2026, 2, 20);
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      sendKey(el, ' ');
      await elementUpdated(el);

      expect(el.value).toBe('2026-03-20');
    });

    it('moves focus to start of week row with Home', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>') as any;
      el._open = true;
      // March 18, 2026 is a Wednesday (week starts on Sunday by default)
      el._focusedDate = new Date(2026, 2, 18);
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      sendKey(el, 'Home');
      await elementUpdated(el);

      // Start of the week row (Sunday) is March 15
      expect(el._focusedDate.getDate()).toBe(15);
      expect(el._focusedDate.getMonth()).toBe(2);
    });

    it('stays in place when Home is pressed on the first day of the week', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>') as any;
      el._open = true;
      // March 15, 2026 is a Sunday (start of week)
      el._focusedDate = new Date(2026, 2, 15);
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      sendKey(el, 'Home');
      await elementUpdated(el);

      expect(el._focusedDate.getDate()).toBe(15);
    });

    it('moves focus to end of week row with End', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>') as any;
      el._open = true;
      // March 18, 2026 is a Wednesday (week starts on Sunday by default)
      el._focusedDate = new Date(2026, 2, 18);
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      sendKey(el, 'End');
      await elementUpdated(el);

      // End of the week row (Saturday) is March 21
      expect(el._focusedDate.getDate()).toBe(21);
      expect(el._focusedDate.getMonth()).toBe(2);
    });

    it('stays in place when End is pressed on the last day of the week', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>') as any;
      el._open = true;
      // March 21, 2026 is a Saturday (end of week)
      el._focusedDate = new Date(2026, 2, 21);
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      sendKey(el, 'End');
      await elementUpdated(el);

      expect(el._focusedDate.getDate()).toBe(21);
    });

    it('respects weekStartsOn for Home key', async () => {
      const el = await fixture('<civ-date-picker label="Date" week-starts-on="1"></civ-date-picker>') as any;
      el._open = true;
      // March 18, 2026 is a Wednesday; with weekStartsOn=1 (Monday), start of week is March 16
      el._focusedDate = new Date(2026, 2, 18);
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      sendKey(el, 'Home');
      await elementUpdated(el);

      expect(el._focusedDate.getDate()).toBe(16);
    });

    it('respects weekStartsOn for End key', async () => {
      const el = await fixture('<civ-date-picker label="Date" week-starts-on="1"></civ-date-picker>') as any;
      el._open = true;
      // March 18, 2026 is a Wednesday; with weekStartsOn=1 (Monday), end of week is March 22 (Sunday)
      el._focusedDate = new Date(2026, 2, 18);
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      sendKey(el, 'End');
      await elementUpdated(el);

      expect(el._focusedDate.getDate()).toBe(22);
    });
  });

  describe('constraints', () => {
    it('disables dates before min', async () => {
      const el = await fixture('<civ-date-picker label="Date" min="2026-03-15"></civ-date-picker>') as any;
      el._open = true;
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      const day10 = el.querySelector('[data-date="2026-03-10"]') as HTMLElement;
      expect(day10).not.toBeNull();
      expect(day10.getAttribute('aria-disabled')).toBe('true');
    });

    it('disables dates after max', async () => {
      const el = await fixture('<civ-date-picker label="Date" max="2026-03-20"></civ-date-picker>') as any;
      el._open = true;
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      const day25 = el.querySelector('[data-date="2026-03-25"]') as HTMLElement;
      expect(day25).not.toBeNull();
      expect(day25.getAttribute('aria-disabled')).toBe('true');
    });

    it('does not select disabled date on click', async () => {
      const el = await fixture('<civ-date-picker label="Date" min="2026-03-15"></civ-date-picker>') as any;
      el._open = true;
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      const day10 = el.querySelector('[data-date="2026-03-10"]') as HTMLElement;
      day10!.click();
      await elementUpdated(el);

      expect(el.value).toBe('');
    });
  });

  describe('text input', () => {
    it('parses typed date and updates value', async () => {
      const el = await fixture('<civ-date-picker label="Date" name="date"></civ-date-picker>') as any;

      const input = el.querySelector('input') as HTMLInputElement;
      input.value = '3/15/2026';
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await elementUpdated(el);

      expect(el.value).toBe('2026-03-15');
    });

    it('clears value on empty text', async () => {
      const el = await fixture('<civ-date-picker label="Date" value="2026-03-15"></civ-date-picker>') as any;

      const input = el.querySelector('input') as HTMLInputElement;
      input.value = '';
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await elementUpdated(el);

      expect(el.value).toBe('');
    });

    it('applies the slash mask on blur (not while typing)', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>') as any;

      const input = el.querySelector('input') as HTMLInputElement;

      // While typing: raw passes through (no cursor jumps for screen readers)
      input.value = '12121983';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await elementUpdated(el);
      expect(el._inputValue).toBe('12121983');

      // On blur: mask reformats to MM/DD/YYYY
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await elementUpdated(el);
      expect(el._inputValue).toBe('12/12/1983');
    });

    it('skips the mask when the user already typed slashes (no mangling)', async () => {
      const el = await fixture('<civ-date-picker label="Date" name="date"></civ-date-picker>') as any;

      const input = el.querySelector('input') as HTMLInputElement;
      input.value = '3/15/2026';
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await elementUpdated(el);

      // Single-digit month survives — not stripped+re-masked into '31/52/026'
      expect(el.value).toBe('2026-03-15');
    });

    it('discards typed non-digits on blur', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>') as any;

      const input = el.querySelector('input') as HTMLInputElement;
      input.value = 'not a date';
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await elementUpdated(el);

      // No digits typed → mask result is empty → cleared
      expect(el._inputValue).toBe('');
    });

  });

  describe('focus management', () => {
    it('returns focus to calendar button on close', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>') as any;
      el._open = true;
      await elementUpdated(el);

      const button = el.querySelector('button[aria-label^="Choose date"]') as HTMLElement;
      const focusSpy = vi.spyOn(button, 'focus');

      sendKeyToDialog(el, 'Escape');
      await elementUpdated(el);
      // Wait for requestAnimationFrame
      await new Promise((r) => requestAnimationFrame(r));

      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe('form integration', () => {
    it('updates form value on date selection', async () => {
      const el = await fixture('<civ-date-picker label="Date" name="date"></civ-date-picker>') as any;
      el._open = true;
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      const day15 = el.querySelector('[data-date="2026-03-15"]') as HTMLElement;
      day15!.click();
      await elementUpdated(el);

      expect(el.value).toBe('2026-03-15');
    });

    it('resets on formResetCallback', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>') as any;
      await elementUpdated(el);

      // Simulate a user changing the value
      el.value = '2026-03-15';
      await elementUpdated(el);

      el.formResetCallback();
      await elementUpdated(el);

      expect(el.value).toBe('');
      expect(el._inputValue).toBe('');
      expect(el._open).toBe(false);
    });
  });

  describe('day cell ARIA', () => {
    it('sets aria-selected on selected date', async () => {
      const el = await fixture('<civ-date-picker label="Date" value="2026-03-15"></civ-date-picker>') as any;
      el._open = true;
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      const day15 = el.querySelector('[data-date="2026-03-15"]') as HTMLElement;
      expect(day15.getAttribute('aria-selected')).toBe('true');
    });

    it('sets aria-label with long date format', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>') as any;
      el._open = true;
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      const day15 = el.querySelector('[data-date="2026-03-15"]') as HTMLElement;
      const ariaLabel = day15.getAttribute('aria-label')!;
      expect(ariaLabel).toContain('Sunday');
      expect(ariaLabel).toContain('March');
      expect(ariaLabel).toContain('15');
    });

    it('uses roving tabindex — only focused date has tabindex=0', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>') as any;
      el._open = true;
      el._focusedDate = new Date(2026, 2, 15);
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      const dayButtons = el.querySelectorAll('[data-civ-day]');
      const tabbable = Array.from(dayButtons).filter(
        (btn: any) => btn.getAttribute('tabindex') === '0',
      );
      expect(tabbable.length).toBe(1);
      expect((tabbable[0] as HTMLElement).getAttribute('data-date')).toBe('2026-03-15');
    });
  });

  describe('focus indicators', () => {
    it('renders the text input as a real <input> so the global focus ring applies', async () => {
      const el = await fixture('<civ-date-picker label="Date" name="date"></civ-date-picker>');

      const input = el.querySelector('input[type="text"]')!;
      expect(input.tagName).toBe('INPUT');
      expect(input.className).toContain('civ-input');
    });

    it('renders the calendar trigger as a real <button>', async () => {
      const el = await fixture('<civ-date-picker label="Date" name="date"></civ-date-picker>');

      const button = el.querySelector('button[type="button"]')!;
      expect(button.tagName).toBe('BUTTON');
    });

    it('renders day cells as real <button> elements', async () => {
      const el = await fixture('<civ-date-picker label="Date" name="date"></civ-date-picker>') as any;
      el._open = true;
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      const dayButton = el.querySelector('[data-civ-day]')!;
      expect(dayButton.tagName).toBe('BUTTON');
    });

    it('applies inverse focus-visible ring class to selected day cells', async () => {
      const el = await fixture('<civ-date-picker label="Date" name="date" value="2026-03-15"></civ-date-picker>') as any;
      el._open = true;
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      // Selected day uses the inverse ring (light yellow on the dark
      // primary background); unselected days fall through to the global
      // focus rule.
      const selectedDay = el.querySelector('[data-date="2026-03-15"]');
      expect(selectedDay!.className).toContain('focus-visible:civ-focus-ring-inverse');

      const unselectedDay = el.querySelector('[data-date="2026-03-16"]');
      expect(unselectedDay!.className).not.toContain('focus-visible:civ-focus-ring-inverse');
    });

    it('renders navigation buttons as real <button> elements', async () => {
      const el = await fixture('<civ-date-picker label="Date" name="date"></civ-date-picker>') as any;
      el._open = true;
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      const navButtons = el.querySelectorAll('[data-civ-dialog] > div > button');
      expect(navButtons.length).toBeGreaterThan(0);
      for (const btn of navButtons) {
        expect(btn.tagName).toBe('BUTTON');
      }
    });

    it('does not use deprecated focus: outline classes', async () => {
      const el = await fixture('<civ-date-picker label="Date" name="date"></civ-date-picker>') as any;
      el._open = true;
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      const input = el.querySelector('input[type="text"]');
      expect(input!.className).not.toContain('focus:civ-outline-2');

      const dayButton = el.querySelector('[data-civ-day]');
      expect(dayButton!.className).not.toContain('focus:civ-outline-2');
    });
  });

  describe('i18n overrides', () => {
    it('uses custom dialog-label', async () => {
      const el = await fixture('<civ-date-picker label="Date" dialog-label="Elegir fecha"></civ-date-picker>') as any;
      el._open = true;
      await elementUpdated(el);

      const dialog = el.querySelector('[role="dialog"]');
      expect(dialog!.getAttribute('aria-label')).toBe('Elegir fecha');
    });

    it('uses custom previous-month-label and next-month-label', async () => {
      const el = await fixture('<civ-date-picker label="Date" previous-month-label="Mes anterior" next-month-label="Mes siguiente"></civ-date-picker>') as any;
      el._open = true;
      await elementUpdated(el);

      const prevBtn = el.querySelector('[aria-label="Mes anterior"]');
      const nextBtn = el.querySelector('[aria-label="Mes siguiente"]');
      expect(prevBtn).not.toBeNull();
      expect(nextBtn).not.toBeNull();
    });

    it('uses custom choose-date-label', async () => {
      const el = await fixture('<civ-date-picker label="Date" choose-date-label="Elegir"></civ-date-picker>');

      const button = el.querySelector('button[aria-label="Elegir"]');
      expect(button).not.toBeNull();
    });
  });

  describe('analytics', () => {
    it('fires civ-analytics on date selection', async () => {
      const el = await fixture('<civ-date-picker label="Date" name="date"></civ-date-picker>') as any;
      el._open = true;
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      const handler = vi.fn();
      el.addEventListener('civ-analytics', handler as EventListener);

      const day15 = el.querySelector('[data-date="2026-03-15"]') as HTMLElement;
      day15!.click();
      await elementUpdated(el);

      expect(handler).toHaveBeenCalledOnce();
      const detail = handler.mock.calls[0][0].detail;
      expect(detail.componentName).toBe('civ-date-picker');
      expect(detail.action).toBe('change');
    });
  });

  describe('Today button', () => {
    afterEach(cleanupFixtures);

    it('renders a Today button in the dialog footer when open', async () => {
      const el = await fixture('<civ-date-picker label="When"></civ-date-picker>') as any;
      el._open = true;
      await elementUpdated(el);

      const btn = el.querySelector('.civ-datepicker-today-btn') as HTMLButtonElement | null;
      expect(btn).not.toBeNull();
      expect(btn!.textContent?.trim()).toBe('Today');
    });

    it('hides the Today button when hide-today-button is set', async () => {
      const el = await fixture('<civ-date-picker label="DOB" hide-today-button></civ-date-picker>') as any;
      el._open = true;
      await elementUpdated(el);

      expect(el.querySelector('.civ-datepicker-today-btn')).toBeNull();
    });

    it('selects today and closes the dialog on click', async () => {
      const el = await fixture('<civ-date-picker label="When"></civ-date-picker>') as any;
      el._open = true;
      await elementUpdated(el);

      let civChange: any = null;
      el.addEventListener('civ-change', ((e: CustomEvent) => { civChange = e.detail; }) as EventListener);

      const btn = el.querySelector('.civ-datepicker-today-btn') as HTMLButtonElement;
      btn.click();
      await elementUpdated(el);

      const today = new Date();
      const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      expect(el.value).toBe(expected);
      expect(civChange?.value).toBe(expected);
      expect(el._open).toBe(false);
    });

    it('disables the Today button when today is outside min/max', async () => {
      // min set to a future date so today is below the range
      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);
      const minIso = future.toISOString().slice(0, 10);
      const el = await fixture(`<civ-date-picker label="When" min="${minIso}"></civ-date-picker>`) as any;
      el._open = true;
      await elementUpdated(el);

      const btn = el.querySelector('.civ-datepicker-today-btn') as HTMLButtonElement;
      expect(btn.disabled).toBe(true);

      btn.click();
      await elementUpdated(el);
      expect(el.value).toBe('');
      expect(el._open).toBe(true);
    });

    it('jumps focus to today on T key without selecting', async () => {
      const el = await fixture('<civ-date-picker label="When"></civ-date-picker>') as any;
      el._open = true;
      // Start the calendar in a different month so jumping changes the view.
      el._displayMonth = (new Date().getMonth() + 6) % 12;
      el._focusedDate = new Date(el._displayYear, el._displayMonth, 1);
      await elementUpdated(el);

      sendKeyToDialog(el, 't');
      await elementUpdated(el);

      const today = new Date();
      expect(el._focusedDate.getDate()).toBe(today.getDate());
      expect(el._focusedDate.getMonth()).toBe(today.getMonth());
      // T does NOT select — selection still requires Enter/Space.
      expect(el.value).toBe('');
      expect(el._open).toBe(true);
    });

    it('uppercase T also jumps to today', async () => {
      const el = await fixture('<civ-date-picker label="When"></civ-date-picker>') as any;
      el._open = true;
      el._displayMonth = (new Date().getMonth() + 3) % 12;
      el._focusedDate = new Date(el._displayYear, el._displayMonth, 1);
      await elementUpdated(el);

      sendKeyToDialog(el, 'T', { shiftKey: true });
      await elementUpdated(el);

      const today = new Date();
      expect(el._focusedDate.getDate()).toBe(today.getDate());
    });

    it('honors a custom today-button-label', async () => {
      const el = await fixture('<civ-date-picker label="When" today-button-label="Hoy"></civ-date-picker>') as any;
      el._open = true;
      await elementUpdated(el);

      const btn = el.querySelector('.civ-datepicker-today-btn') as HTMLButtonElement;
      expect(btn.textContent?.trim()).toBe('Hoy');
    });
  });

  describe('Inline Today shortcut', () => {
    afterEach(cleanupFixtures);

    const todayISO = (() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })();

    it('does not render the inline Today button by default', async () => {
      const el = await fixture('<civ-date-picker label="When"></civ-date-picker>') as any;
      expect(el.querySelector('.civ-text-btn--chip')).toBeNull();
    });

    it('renders the inline Today button when show-today-shortcut is set', async () => {
      const el = await fixture('<civ-date-picker label="When" show-today-shortcut></civ-date-picker>') as any;
      const btn = el.querySelector('.civ-text-btn--chip') as HTMLButtonElement | null;
      expect(btn).not.toBeNull();
      expect(btn!.textContent?.trim()).toBe('Today');
    });

    it('selects today on click without opening the dialog', async () => {
      const el = await fixture('<civ-date-picker label="When" show-today-shortcut></civ-date-picker>') as any;
      let civChange: any = null;
      el.addEventListener('civ-change', ((e: CustomEvent) => { civChange = e.detail; }) as EventListener);

      const btn = el.querySelector('.civ-text-btn--chip') as HTMLButtonElement;
      btn.click();
      await elementUpdated(el);

      expect(el.value).toBe(todayISO);
      expect(civChange?.value).toBe(todayISO);
      expect(el._open).toBe(false);
    });

    it('disables the inline Today button when today is out of min/max', async () => {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);
      const minIso = future.toISOString().slice(0, 10);
      const el = await fixture(`<civ-date-picker label="When" show-today-shortcut min="${minIso}"></civ-date-picker>`) as any;
      const btn = el.querySelector('.civ-text-btn--chip') as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
    });

    it('disables the inline Today button when value already matches today', async () => {
      const el = await fixture(`<civ-date-picker label="When" show-today-shortcut value="${todayISO}"></civ-date-picker>`) as any;
      const btn = el.querySelector('.civ-text-btn--chip') as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
    });

    it('hides the inline Today button when host is disabled or readonly', async () => {
      const elDisabled = await fixture('<civ-date-picker label="When" show-today-shortcut disabled></civ-date-picker>') as any;
      expect(elDisabled.querySelector('.civ-text-btn--chip')).toBeNull();

      const elReadonly = await fixture('<civ-date-picker label="When" show-today-shortcut readonly></civ-date-picker>') as any;
      expect(elReadonly.querySelector('.civ-text-btn--chip')).toBeNull();
    });

    it('hides the inline Today button in compact (spacing=sm) mode', async () => {
      const el = await fixture('<civ-date-picker label="When" show-today-shortcut spacing="sm"></civ-date-picker>') as any;
      expect(el.querySelector('.civ-text-btn--chip')).toBeNull();
    });

    it('honors a custom today-shortcut-label', async () => {
      const el = await fixture('<civ-date-picker label="When" show-today-shortcut today-shortcut-label="Hoy"></civ-date-picker>') as any;
      const btn = el.querySelector('.civ-text-btn--chip') as HTMLButtonElement;
      expect(btn.textContent?.trim()).toBe('Hoy');
    });
  });

  describe('Month + year jump selects', () => {
    afterEach(cleanupFixtures);

    it('renders month and year <select>s in the dialog header', async () => {
      const el = await fixture('<civ-date-picker label="When"></civ-date-picker>') as any;
      el._open = true;
      await elementUpdated(el);

      const monthSel = el.querySelector('[data-civ-month-select]') as HTMLSelectElement | null;
      const yearSel = el.querySelector('[data-civ-year-select]') as HTMLSelectElement | null;
      expect(monthSel).not.toBeNull();
      expect(yearSel).not.toBeNull();
      expect(monthSel!.tagName).toBe('SELECT');
      expect(yearSel!.tagName).toBe('SELECT');
    });

    it('default year range covers today − 120 through today + 10', async () => {
      const el = await fixture('<civ-date-picker label="When"></civ-date-picker>') as any;
      el._open = true;
      await elementUpdated(el);

      const yearSel = el.querySelector('[data-civ-year-select]') as HTMLSelectElement;
      const years = Array.from(yearSel.options).map((o) => Number(o.value));
      const today = new Date().getFullYear();
      expect(years[0]).toBe(today - 120);
      expect(years[years.length - 1]).toBe(today + 10);
    });

    it('clamps year range to min/max when set', async () => {
      const el = await fixture('<civ-date-picker label="When" min="2020-01-01" max="2030-12-31"></civ-date-picker>') as any;
      el._open = true;
      await elementUpdated(el);

      const yearSel = el.querySelector('[data-civ-year-select]') as HTMLSelectElement;
      const years = Array.from(yearSel.options).map((o) => Number(o.value));
      expect(years[0]).toBe(2020);
      expect(years[years.length - 1]).toBe(2030);
    });

    it('disables months outside min/max in the boundary year', async () => {
      // 2026-04-30 max — only Jan–Apr should be enabled in 2026
      const el = await fixture('<civ-date-picker label="When" max="2026-04-30"></civ-date-picker>') as any;
      el._displayYear = 2026;
      el._displayMonth = 0;
      el._focusedDate = new Date(2026, 0, 15);
      el._open = true;
      await elementUpdated(el);

      const monthSel = el.querySelector('[data-civ-month-select]') as HTMLSelectElement;
      const opts = Array.from(monthSel.options);
      expect(opts[3].disabled).toBe(false); // April
      expect(opts[4].disabled).toBe(true);  // May
      expect(opts[11].disabled).toBe(true); // December
    });

    it('selecting a year jumps the calendar without changing the day-of-month', async () => {
      const el = await fixture('<civ-date-picker label="When"></civ-date-picker>') as any;
      el._displayYear = 2026;
      el._displayMonth = 4; // May
      el._focusedDate = new Date(2026, 4, 15);
      el._open = true;
      await elementUpdated(el);

      const yearSel = el.querySelector('[data-civ-year-select]') as HTMLSelectElement;
      yearSel.value = '1985';
      yearSel.dispatchEvent(new Event('change', { bubbles: true }));
      await elementUpdated(el);

      expect(el._displayYear).toBe(1985);
      expect(el._displayMonth).toBe(4);
      expect(el._focusedDate.getDate()).toBe(15);
    });

    it('selecting a month jumps the calendar without changing the year', async () => {
      const el = await fixture('<civ-date-picker label="When"></civ-date-picker>') as any;
      el._displayYear = 2026;
      el._displayMonth = 0;
      el._focusedDate = new Date(2026, 0, 10);
      el._open = true;
      await elementUpdated(el);

      const monthSel = el.querySelector('[data-civ-month-select]') as HTMLSelectElement;
      monthSel.value = '6'; // July
      monthSel.dispatchEvent(new Event('change', { bubbles: true }));
      await elementUpdated(el);

      expect(el._displayYear).toBe(2026);
      expect(el._displayMonth).toBe(6);
      expect(el._focusedDate.getDate()).toBe(10);
    });

    it('clamps the focused day to the new month length (Jan 31 → Feb 28/29)', async () => {
      const el = await fixture('<civ-date-picker label="When"></civ-date-picker>') as any;
      el._displayYear = 2026;
      el._displayMonth = 0; // January
      el._focusedDate = new Date(2026, 0, 31);
      el._open = true;
      await elementUpdated(el);

      const monthSel = el.querySelector('[data-civ-month-select]') as HTMLSelectElement;
      monthSel.value = '1'; // February
      monthSel.dispatchEvent(new Event('change', { bubbles: true }));
      await elementUpdated(el);

      // 2026 is not a leap year — last day is Feb 28
      expect(el._displayMonth).toBe(1);
      expect(el._focusedDate.getDate()).toBe(28);
    });

    it('jumping to a year where the current month is invalid pulls the month back into range', async () => {
      // max="2026-04-30" — switching to 2026 from a December view should
      // move the displayed month to April so the user lands on a valid one.
      const el = await fixture('<civ-date-picker label="When" max="2026-04-30"></civ-date-picker>') as any;
      el._displayYear = 2025;
      el._displayMonth = 11; // December
      el._focusedDate = new Date(2025, 11, 5);
      el._open = true;
      await elementUpdated(el);

      const yearSel = el.querySelector('[data-civ-year-select]') as HTMLSelectElement;
      yearSel.value = '2026';
      yearSel.dispatchEvent(new Event('change', { bubbles: true }));
      await elementUpdated(el);

      expect(el._displayYear).toBe(2026);
      // December → April (last valid month for 2026)
      expect(el._displayMonth).toBe(3);
    });

    it('selects expose locale-keyed accessible names', async () => {
      const el = await fixture('<civ-date-picker label="When"></civ-date-picker>') as any;
      el._open = true;
      await elementUpdated(el);

      const monthSel = el.querySelector('[data-civ-month-select]') as HTMLSelectElement;
      const yearSel = el.querySelector('[data-civ-year-select]') as HTMLSelectElement;
      expect(monthSel.getAttribute('aria-label')).toBe('Month');
      expect(yearSel.getAttribute('aria-label')).toBe('Year');
    });
  });

  describe('aria-describedby', () => {
    it('wires hint and error IDs into aria-describedby when chrome is set', async () => {
      const el = await fixture(
        '<civ-date-picker label="Appointment" hint="Pick a date" error="Required" name="appt"></civ-date-picker>',
      );
      const input = el.querySelector('input[type="text"]')!;
      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      const ids = describedBy!.split(' ');
      expect(ids.length).toBe(2);
      for (const id of ids) {
        expect(el.querySelector(`#${id}`)).not.toBeNull();
      }
    });
  });

  describe('spacing="sm"', () => {
    it('renders just the input + trigger button with no chrome', async () => {
      const el = await fixture(
        '<civ-date-picker spacing="sm" aria-label="Date" hint="not shown" label="not shown"></civ-date-picker>',
      );
      expect(el.querySelector('input')).not.toBeNull();
      expect(el.querySelector('.civ-label')).toBeNull();
      expect(el.querySelector('.civ-hint')).toBeNull();
    });

    it('propagates host aria-label to the inner <input>', async () => {
      const el = await fixture('<civ-date-picker spacing="sm" aria-label="Birthday"></civ-date-picker>');
      expect(el.querySelector('input')!.getAttribute('aria-label')).toBe('Birthday');
    });

    it('applies civ-input--sm class to the inner <input>', async () => {
      const el = await fixture('<civ-date-picker spacing="sm" aria-label="x"></civ-date-picker>');
      expect(el.querySelector('input')!.classList.contains('civ-input--sm')).toBe(true);
    });

    it('applies civ-action-btn--sm to the trigger button so it matches the compact input height', async () => {
      const el = await fixture('<civ-date-picker spacing="sm" aria-label="x"></civ-date-picker>');
      const trigger = el.querySelector('button[aria-haspopup="dialog"]')!;
      expect(trigger.classList.contains('civ-action-btn--sm')).toBe(true);
    });

    it('omits civ-action-btn--sm from the trigger button at default spacing', async () => {
      const el = await fixture('<civ-date-picker label="When" aria-label="x"></civ-date-picker>');
      const trigger = el.querySelector('button[aria-haspopup="dialog"]')!;
      expect(trigger.classList.contains('civ-action-btn--sm')).toBe(false);
    });
  });
});

// Helper for keyboard events on dialog
function sendKeyToDialog(el: HTMLElement, key: string, opts?: Partial<KeyboardEvent>): void {
  const dialog = el.querySelector('[data-civ-dialog]') as HTMLElement;
  dialog?.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, ...opts }),
  );
}
