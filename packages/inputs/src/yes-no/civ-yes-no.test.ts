import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-yes-no.js';

afterEach(cleanupFixtures);

describe('civ-yes-no', () => {
  it('renders with a label', async () => {
    const el = await fixture('<civ-yes-no legend="Are you a U.S. citizen?"></civ-yes-no>');

    const label = el.querySelector('label.civ-label');
    expect(label).not.toBeNull();
    expect(label!.textContent).toContain('Are you a U.S. citizen?');
  });

  it('renders Yes and No buttons with role="radio"', async () => {
    const el = await fixture('<civ-yes-no legend="Question"></civ-yes-no>');

    const buttons = el.querySelectorAll('button[role="radio"]');
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toBe('Yes');
    expect(buttons[1].textContent).toBe('No');
  });

  it('renders a group wrapping a div with role="radiogroup"', async () => {
    const el = await fixture('<civ-yes-no legend="Question"></civ-yes-no>');

    const outerGroup = el.querySelector('[role="group"]')!;
    expect(outerGroup).not.toBeNull();
    // The radiogroup role lives on the inner div so the optional skip
    // affordance can sit alongside the radios without becoming part of
    // the mutually-exclusive group.
    const group = outerGroup.querySelector('[role="radiogroup"]');
    expect(group).not.toBeNull();
    expect(group!.tagName).toBe('DIV');
  });

  it('sets aria-checked on selected button', async () => {
    const el = await fixture('<civ-yes-no legend="Question" value="yes"></civ-yes-no>') as any;
    await elementUpdated(el);

    const buttons = el.querySelectorAll('button[role="radio"]');
    expect(buttons[0].getAttribute('aria-checked')).toBe('true');
    expect(buttons[1].getAttribute('aria-checked')).toBe('false');
  });

  it('selects Yes on click', async () => {
    const el = await fixture('<civ-yes-no legend="Question"></civ-yes-no>') as any;

    const buttons = el.querySelectorAll('button[role="radio"]');
    (buttons[0] as HTMLButtonElement).click();
    await elementUpdated(el);

    expect(el.value).toBe('yes');
    expect(buttons[0].getAttribute('aria-checked')).toBe('true');
  });

  it('selects No on click', async () => {
    const el = await fixture('<civ-yes-no legend="Question"></civ-yes-no>') as any;

    const buttons = el.querySelectorAll('button[role="radio"]');
    (buttons[1] as HTMLButtonElement).click();
    await elementUpdated(el);

    expect(el.value).toBe('no');
    expect(buttons[1].getAttribute('aria-checked')).toBe('true');
  });

  it('fires civ-input and civ-change with { value } on selection', async () => {
    const el = await fixture('<civ-yes-no legend="Question" name="citizen"></civ-yes-no>');

    const inputHandler = vi.fn();
    const changeHandler = vi.fn();
    el.addEventListener('civ-input', inputHandler as EventListener);
    el.addEventListener('civ-change', changeHandler as EventListener);

    const buttons = el.querySelectorAll('button[role="radio"]');
    (buttons[0] as HTMLButtonElement).click();

    expect(inputHandler).toHaveBeenCalledOnce();
    expect(changeHandler).toHaveBeenCalledOnce();
    expect(inputHandler.mock.calls[0][0].detail).toEqual({ value: 'yes' });
    expect(changeHandler.mock.calls[0][0].detail).toEqual({ value: 'yes' });
  });

  it('renders hint text', async () => {
    const el = await fixture('<civ-yes-no legend="Question" hint="Select one option"></civ-yes-no>');

    const hint = el.querySelector('.civ-hint');
    expect(hint).not.toBeNull();
    expect(hint!.textContent).toBe('Select one option');
  });

  it('renders error message with role="alert"', async () => {
    const el = await fixture('<civ-yes-no legend="Question" error="Please select an answer"></civ-yes-no>');

    const errorEl = el.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe('Please select an answer');
  });

  it('sets aria-invalid on the radiogroup when error is present', async () => {
    const el = await fixture('<civ-yes-no legend="Question" error="Required"></civ-yes-no>');

    const group = el.querySelector('[role="radiogroup"]')!;
    expect(group.getAttribute('aria-invalid')).toBe('true');
  });

  it('sets aria-required on the radiogroup when required', async () => {
    const el = await fixture('<civ-yes-no legend="Question" required></civ-yes-no>');

    const group = el.querySelector('[role="radiogroup"]')!;
    expect(group.getAttribute('aria-required')).toBe('true');
  });

  it('disabled state prevents selection', async () => {
    const el = await fixture('<civ-yes-no legend="Question" disabled></civ-yes-no>') as any;

    const buttons = el.querySelectorAll('button[role="radio"]') as NodeListOf<HTMLButtonElement>;
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[1].disabled).toBe(true);

    buttons[0].click();
    await elementUpdated(el);
    expect(el.value).toBe('');
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-yes-no') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('resets to default value on formResetCallback', async () => {
    const el = await fixture('<civ-yes-no legend="Question" value="yes"></civ-yes-no>') as any;
    await elementUpdated(el);

    el.value = 'no';
    await elementUpdated(el);
    expect(el.value).toBe('no');

    el.formResetCallback();
    await elementUpdated(el);
    expect(el.value).toBe('yes');
  });

  it('fires analytics on change', async () => {
    const el = await fixture('<civ-yes-no legend="Question" name="citizen"></civ-yes-no>');

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const buttons = el.querySelectorAll('button[role="radio"]');
    (buttons[0] as HTMLButtonElement).click();

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail.componentName).toBe('civ-yes-no');
    expect(detail.action).toBe('change');
  });

  it('uses Light DOM (no shadowRoot)', async () => {
    const el = await fixture('<civ-yes-no legend="Question"></civ-yes-no>');

    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('[role="group"]')).not.toBeNull();
  });

  it('applies focus-visible:civ-focus-ring to buttons', async () => {
    const el = await fixture('<civ-yes-no legend="Question"></civ-yes-no>');

    const buttons = el.querySelectorAll('button[role="radio"]');
    expect(buttons[0].className).toContain('focus-visible:civ-focus-ring');
    expect(buttons[1].className).toContain('focus-visible:civ-focus-ring');
  });

  it('uses custom labels when provided', async () => {
    const el = await fixture('<civ-yes-no legend="Agree?" yes-label="Agree" no-label="Disagree"></civ-yes-no>');

    const buttons = el.querySelectorAll('button[role="radio"]');
    expect(buttons[0].textContent).toBe('Agree');
    expect(buttons[1].textContent).toBe('Disagree');
  });

  it('navigates with arrow keys', async () => {
    const el = await fixture('<civ-yes-no legend="Question" value="yes"></civ-yes-no>') as any;
    await elementUpdated(el);

    const buttons = el.querySelectorAll('button[role="radio"]') as NodeListOf<HTMLButtonElement>;
    buttons[0].focus();

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await elementUpdated(el);
    expect(el.value).toBe('no');

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await elementUpdated(el);
    expect(el.value).toBe('yes');
  });

  it('does not fire events when selecting already-selected value', async () => {
    const el = await fixture('<civ-yes-no legend="Question" value="yes"></civ-yes-no>') as any;
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-change', handler as EventListener);

    const buttons = el.querySelectorAll('button[role="radio"]');
    (buttons[0] as HTMLButtonElement).click();

    expect(handler).not.toHaveBeenCalled();
  });

  it('applies civ-btn--yesno class to both buttons', async () => {
    const el = await fixture('<civ-yes-no legend="Question" value="yes"></civ-yes-no>');
    await elementUpdated(el);

    const buttons = el.querySelectorAll('button[role="radio"]');
    expect(buttons[0].className).toContain('civ-btn--yesno');
    expect(buttons[1].className).toContain('civ-btn--yesno');
    // Selected state is handled by CSS via aria-checked
    expect(buttons[0].getAttribute('aria-checked')).toBe('true');
    expect(buttons[1].getAttribute('aria-checked')).toBe('false');
  });

  // ── Third option (unsure) ────────────────────────────────────

  it('renders only 2 buttons by default (no unsure-label)', async () => {
    const el = await fixture('<civ-yes-no legend="Question"></civ-yes-no>');

    const buttons = el.querySelectorAll('button[role="radio"]');
    expect(buttons.length).toBe(2);
  });

  it('renders 3 buttons when unsure-label is set', async () => {
    const el = await fixture('<civ-yes-no legend="Question" unsure-label="I\'m not sure"></civ-yes-no>');

    const buttons = el.querySelectorAll('button[role="radio"]');
    expect(buttons.length).toBe(3);
    expect(buttons[2].textContent).toBe("I'm not sure");
  });

  it('selects unsure value on third button click', async () => {
    const el = await fixture('<civ-yes-no legend="Question" unsure-label="Unsure"></civ-yes-no>') as any;

    const buttons = el.querySelectorAll('button[role="radio"]');
    (buttons[2] as HTMLButtonElement).click();
    await elementUpdated(el);

    expect(el.value).toBe('unsure');
    expect(buttons[2].getAttribute('aria-checked')).toBe('true');
    expect(buttons[0].getAttribute('aria-checked')).toBe('false');
    expect(buttons[1].getAttribute('aria-checked')).toBe('false');
  });

  it('uses custom unsure-value when set', async () => {
    const el = await fixture('<civ-yes-no legend="Question" unsure-label="N/A" unsure-value="n/a"></civ-yes-no>') as any;

    const buttons = el.querySelectorAll('button[role="radio"]');
    (buttons[2] as HTMLButtonElement).click();
    await elementUpdated(el);

    expect(el.value).toBe('n/a');
  });

  it('fires civ-change with unsure value', async () => {
    const el = await fixture('<civ-yes-no legend="Question" unsure-label="Unsure"></civ-yes-no>');

    const handler = vi.fn();
    el.addEventListener('civ-change', handler as EventListener);

    const buttons = el.querySelectorAll('button[role="radio"]');
    (buttons[2] as HTMLButtonElement).click();

    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].detail).toEqual({ value: 'unsure' });
  });

  it('navigates through 3 options with arrow keys', async () => {
    const el = await fixture('<civ-yes-no legend="Question" value="yes" unsure-label="Unsure"></civ-yes-no>') as any;
    await elementUpdated(el);

    const buttons = el.querySelectorAll('button[role="radio"]') as NodeListOf<HTMLButtonElement>;
    buttons[0].focus();

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await elementUpdated(el);
    expect(el.value).toBe('no');

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await elementUpdated(el);
    expect(el.value).toBe('unsure');

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await elementUpdated(el);
    expect(el.value).toBe('no');
  });

  it('applies civ-btn--yesno class to third button', async () => {
    const el = await fixture('<civ-yes-no legend="Question" unsure-label="Unsure"></civ-yes-no>');

    const buttons = el.querySelectorAll('button[role="radio"]');
    expect(buttons[2].className).toContain('civ-btn--yesno');
    expect(buttons[2].className).toContain('focus-visible:civ-focus-ring');
  });

  describe('prefer-not-to-answer affordance', () => {
    it('renders a skip button only when skip-label is set', async () => {
      const without = await fixture('<civ-yes-no legend="Q"></civ-yes-no>');
      expect(without.querySelector('[data-civ-skip]')).toBeNull();

      const withSkip = await fixture(
        '<civ-yes-no legend="Q" skip-label="Prefer not to answer"></civ-yes-no>',
      );
      expect(withSkip.querySelector('[data-civ-skip]')).not.toBeNull();
    });

    it('skip button is not part of the radio group', async () => {
      const el = await fixture(
        '<civ-yes-no legend="Q" skip-label="Prefer not to answer"></civ-yes-no>',
      );
      const skip = el.querySelector('[data-civ-skip]')!;
      expect(skip.getAttribute('role')).not.toBe('radio');
      const outerGroup = el.querySelector('[role="group"]')!;
      expect(outerGroup).not.toBeNull();
      const radiogroup = el.querySelector('[role="radiogroup"]')!;
      expect(radiogroup.tagName.toLowerCase()).toBe('div');
      expect(radiogroup.contains(skip)).toBe(false);
    });

    it('sets value to skip-value on click and fires civ-change', async () => {
      const el = await fixture(
        '<civ-yes-no legend="Q" skip-label="Prefer not to answer" skip-value="opt_out"></civ-yes-no>',
      ) as any;

      let changeValue: string | null = null;
      el.addEventListener('civ-change', ((e: CustomEvent) => { changeValue = e.detail.value; }) as EventListener);

      const skip = el.querySelector('[data-civ-skip]') as HTMLButtonElement;
      skip.click();
      await elementUpdated(el);

      expect(el.value).toBe('opt_out');
      expect(changeValue).toBe('opt_out');
      expect(skip.getAttribute('aria-pressed')).toBe('true');
    });

    it('does not interfere with arrow-key navigation on the radios', async () => {
      const el = await fixture(
        '<civ-yes-no legend="Q" skip-label="Prefer not to answer"></civ-yes-no>',
      ) as any;
      const yesBtn = el.querySelectorAll('button[role="radio"]')[0] as HTMLButtonElement;
      yesBtn.focus();
      yesBtn.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      await elementUpdated(el);
      expect(el.value).toBe('no');
    });

    it('moves aria-describedby / aria-invalid / aria-required onto the inner radiogroup', async () => {
      const el = await fixture(
        '<civ-yes-no legend="Q" hint="Pick" error="err" required skip-label="Skip"></civ-yes-no>',
      );
      const outerGroup = el.querySelector('[role="group"]')!;
      expect(outerGroup.getAttribute('aria-describedby')).toBeNull();
      expect(outerGroup.getAttribute('aria-invalid')).toBeNull();
      expect(outerGroup.getAttribute('aria-required')).toBeNull();

      const inner = el.querySelector('[role="radiogroup"]')!;
      expect(inner.getAttribute('aria-describedby')).toBeTruthy();
      expect(inner.getAttribute('aria-invalid')).toBe('true');
      expect(inner.getAttribute('aria-required')).toBe('true');
    });

    it('labels the inner radiogroup via aria-labelledby (not a redundant aria-label)', async () => {
      const el = await fixture(
        '<civ-yes-no legend="Did you serve?" skip-label="Skip"></civ-yes-no>',
      );
      const label = el.querySelector('label.civ-label')!;
      expect(label.id).toBeTruthy();
      const inner = el.querySelector('[role="radiogroup"]')!;
      expect(inner.getAttribute('aria-labelledby')).toBe(label.id);
      expect(inner.getAttribute('aria-label')).toBeNull();
    });
  });
});
