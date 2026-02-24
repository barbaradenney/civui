import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-date-picker.js';

afterEach(cleanupFixtures);

describe('civ-date-picker', () => {
  describe('rendering', () => {
    it('renders with a label', async () => {
      const el = await fixture('<civ-date-picker label="Appointment date"></civ-date-picker>');

      const label = el.querySelector('label');
      expect(label).not.toBeNull();
      expect(label!.textContent).toContain('Appointment date');
    });

    it('renders a text input', async () => {
      const el = await fixture('<civ-date-picker label="Date" name="date"></civ-date-picker>');

      const input = el.querySelector('input[type="text"]');
      expect(input).not.toBeNull();
    });

    it('renders a calendar button', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>');

      const button = el.querySelector('button[aria-label^="Choose date"]');
      expect(button).not.toBeNull();
    });

    it('associates label with input', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>');

      const label = el.querySelector('label');
      const input = el.querySelector('input');
      expect(label!.getAttribute('for')).toBe(input!.id);
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
    it('shows required indicator', async () => {
      const el = await fixture('<civ-date-picker label="Date" required></civ-date-picker>');

      const abbr = el.querySelector('abbr');
      expect(abbr).not.toBeNull();
    });

    it('renders hint text', async () => {
      const el = await fixture('<civ-date-picker label="Date" hint="Select a date"></civ-date-picker>');

      const hint = el.querySelector('span');
      expect(hint).not.toBeNull();
      expect(hint!.textContent).toBe('Select a date');
    });

    it('renders error with alert role', async () => {
      const el = await fixture('<civ-date-picker label="Date" error="Date is required"></civ-date-picker>');

      const errorEl = el.querySelector('[role="alert"]');
      expect(errorEl).not.toBeNull();
      expect(errorEl!.textContent).toBe('Date is required');
    });

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

    it('sets aria-required when required', async () => {
      const el = await fixture('<civ-date-picker label="Date" required></civ-date-picker>');

      const input = el.querySelector('input');
      expect(input!.getAttribute('aria-required')).toBe('true');
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

      const heading = el.querySelector('[aria-label="Current month"]');
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

    it('keeps invalid text in input', async () => {
      const el = await fixture('<civ-date-picker label="Date"></civ-date-picker>') as any;

      const input = el.querySelector('input') as HTMLInputElement;
      input.value = 'not a date';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await elementUpdated(el);

      expect(el._inputValue).toBe('not a date');
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

  describe('focus-visible', () => {
    it('applies focus-visible ring class to text input', async () => {
      const el = await fixture('<civ-date-picker label="Date" name="date"></civ-date-picker>');

      const input = el.querySelector('input[type="text"]');
      expect(input!.className).toContain('focus-visible:civ-focus-ring');
    });

    it('applies focus-visible ring class to calendar button', async () => {
      const el = await fixture('<civ-date-picker label="Date" name="date"></civ-date-picker>');

      const button = el.querySelector('button[type="button"]');
      expect(button!.className).toContain('focus-visible:civ-focus-ring');
    });

    it('applies focus-visible ring class to day cells', async () => {
      const el = await fixture('<civ-date-picker label="Date" name="date"></civ-date-picker>') as any;
      el._open = true;
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      const dayButton = el.querySelector('[data-civ-day]');
      expect(dayButton!.className).toContain('focus-visible:civ-focus-ring');
    });

    it('applies inverse focus-visible ring class to selected day cells', async () => {
      const el = await fixture('<civ-date-picker label="Date" name="date" value="2026-03-15"></civ-date-picker>') as any;
      el._open = true;
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      const selectedDay = el.querySelector('[data-date="2026-03-15"]');
      expect(selectedDay!.className).toContain('focus-visible:civ-focus-ring-inverse');
      expect(selectedDay!.className).not.toContain('focus-visible:civ-focus-ring ');

      // Unselected day should use standard focus ring
      const unselectedDay = el.querySelector('[data-date="2026-03-16"]');
      expect(unselectedDay!.className).toContain('focus-visible:civ-focus-ring');
      expect(unselectedDay!.className).not.toContain('focus-visible:civ-focus-ring-inverse');
    });

    it('applies focus-visible ring class to navigation buttons', async () => {
      const el = await fixture('<civ-date-picker label="Date" name="date"></civ-date-picker>') as any;
      el._open = true;
      el._displayMonth = 2;
      el._displayYear = 2026;
      await elementUpdated(el);

      const navButtons = el.querySelectorAll('[data-civ-dialog] > div > button');
      for (const btn of navButtons) {
        expect(btn.className).toContain('focus-visible:civ-focus-ring');
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
});

// Helper for keyboard events on dialog
function sendKeyToDialog(el: HTMLElement, key: string, opts?: Partial<KeyboardEvent>): void {
  const dialog = el.querySelector('[data-civ-dialog]') as HTMLElement;
  dialog?.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, ...opts }),
  );
}
