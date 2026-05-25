import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-progress-header.js';
import type { CivProgressHeader } from './civ-progress-header.js';

afterEach(cleanupFixtures);

describe('civ-progress-header', () => {
  it('renders step counter and title', async () => {
    const el = await fixture<CivProgressHeader>(
      '<civ-progress-header current="0" total="3" step-title="Personal Info"></civ-progress-header>'
    );
    const counter = el.querySelector('.civ-progress-header__counter');
    expect(counter).not.toBeNull();
    expect(counter!.textContent).toContain('1');
    expect(counter!.textContent).toContain('3');

    const title = el.querySelector('.civ-progress-header__title');
    expect(title).not.toBeNull();
    expect(title!.textContent).toBe('Personal Info');
  });

  it('renders nothing for single step', async () => {
    const el = await fixture<CivProgressHeader>(
      '<civ-progress-header current="0" total="1" step-title="Only"></civ-progress-header>'
    );
    expect(el.querySelector('[class^="civ-progress-header--"]')).toBeNull();
  });

  it('renders nothing for zero steps', async () => {
    const el = await fixture<CivProgressHeader>(
      '<civ-progress-header current="0" total="0" step-title="None"></civ-progress-header>'
    );
    expect(el.querySelector('[class^="civ-progress-header--"]')).toBeNull();
  });

  it('clamps current to valid range', async () => {
    const el = await fixture<CivProgressHeader>(
      '<civ-progress-header current="10" total="3" step-title="Clamped"></civ-progress-header>'
    );
    const counter = el.querySelector('.civ-progress-header__counter');
    expect(counter!.textContent).toContain('3');
  });

  it('clamps negative current to zero', async () => {
    const el = await fixture<CivProgressHeader>(
      '<civ-progress-header current="-1" total="3" step-title="First"></civ-progress-header>'
    );
    const counter = el.querySelector('.civ-progress-header__counter');
    expect(counter!.textContent).toContain('1');
  });

  it('applies heading level', async () => {
    const el = await fixture<CivProgressHeader>(
      '<civ-progress-header current="0" total="3" step-title="Test" heading-level="3"></civ-progress-header>'
    );
    const title = el.querySelector('.civ-progress-header__title');
    expect(title!.getAttribute('role')).toBe('heading');
    expect(title!.getAttribute('aria-level')).toBe('3');
  });

  it('renders primary emphasis', async () => {
    const el = await fixture<CivProgressHeader>(
      '<civ-progress-header current="0" total="3" step-title="Test" emphasis="primary"></civ-progress-header>'
    );
    expect(el.querySelector('.civ-progress-header--primary')).not.toBeNull();
  });

  it('renders secondary emphasis by default', async () => {
    const el = await fixture<CivProgressHeader>(
      '<civ-progress-header current="0" total="3" step-title="Test"></civ-progress-header>'
    );
    expect(el.querySelector('.civ-progress-header--secondary')).not.toBeNull();
  });

  it('renders tertiary emphasis', async () => {
    const el = await fixture<CivProgressHeader>(
      '<civ-progress-header current="0" total="3" step-title="Test" emphasis="tertiary"></civ-progress-header>'
    );
    expect(el.querySelector('.civ-progress-header--tertiary')).not.toBeNull();
  });

  it('updates when current changes', async () => {
    const el = await fixture<CivProgressHeader>(
      '<civ-progress-header current="0" total="3" step-title="Step 1"></civ-progress-header>'
    );
    el.current = 2;
    el.stepTitle = 'Step 3';
    await elementUpdated(el);

    const counter = el.querySelector('.civ-progress-header__counter');
    expect(counter!.textContent).toContain('3');

    const title = el.querySelector('.civ-progress-header__title');
    expect(title!.textContent).toBe('Step 3');
  });

  it('uses Light DOM', async () => {
    const el = await fixture<CivProgressHeader>(
      '<civ-progress-header current="0" total="2" step-title="Test"></civ-progress-header>'
    );
    expect(el.shadowRoot).toBeNull();
  });
});
