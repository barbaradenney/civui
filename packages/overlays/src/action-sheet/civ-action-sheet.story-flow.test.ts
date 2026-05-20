import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-action-sheet.js';

afterEach(cleanupFixtures);

// Parity with civ-action-sheet.stories.ts: a real `civ-button` would
// dispatch the click, but we skip that import here (overlays doesn't
// depend on actions) and trigger the click directly on a plain
// `<button>` placed in the demo. The story's toggle / close handlers
// read `sheet.open` straight off the element (no closure), so this
// faithfully exercises the same code path the storybook stories use.
describe('action-sheet story flow', () => {
  async function buildDemo() {
    const root = await fixture(`
      <div class="action-sheet-demo" style="position: relative;">
        <button class="open-trigger">Open action sheet</button>
        <civ-action-sheet label="Choose an option">
          <div class="civ-p-4">
            <p class="civ-heading-sm">Choose an option</p>
            <ul>
              <li>Option 1</li>
              <li>Option 2</li>
              <li>Option 3</li>
            </ul>
          </div>
        </civ-action-sheet>
      </div>
    `);
    const sheet = root.querySelector('civ-action-sheet') as HTMLElement & { open: boolean };
    const button = root.querySelector('button.open-trigger') as HTMLButtonElement;
    button.addEventListener('click', () => { sheet.open = !sheet.open; });
    sheet.addEventListener('civ-action-sheet-close', () => { sheet.open = false; });
    return { root, sheet, button };
  }

  it('toggle button opens the sheet and the slotted content renders inside', async () => {
    const { sheet, button } = await buildDemo();
    expect(sheet.open).toBe(false);

    button.click();
    await elementUpdated(sheet);
    expect(sheet.open).toBe(true);
    expect(sheet.querySelector('.civ-action-sheet--open')).not.toBeNull();
    const slot = sheet.querySelector('[data-civ-action-sheet-content]');
    expect(slot).not.toBeNull();
    expect(slot!.querySelector('p.civ-heading-sm')?.textContent).toBe('Choose an option');
    expect(slot!.querySelectorAll('li').length).toBe(3);
  });

  it('toggling closed and then re-opening still renders the slotted content', async () => {
    // Closure-based toggles in the previous story version desynced after
    // close, so the second open ran with `open` still true and Lit
    // never re-rendered.
    const { sheet, button } = await buildDemo();

    button.click();
    await elementUpdated(sheet);
    expect(sheet.open).toBe(true);
    expect(sheet.querySelector('[data-civ-action-sheet-content] p')?.textContent).toBe('Choose an option');

    button.click();
    await elementUpdated(sheet);
    expect(sheet.open).toBe(false);
    expect(sheet.querySelector('.civ-action-sheet--open')).toBeNull();

    button.click();
    await elementUpdated(sheet);
    expect(sheet.open).toBe(true);
    expect(sheet.querySelector('[data-civ-action-sheet-content] p')?.textContent).toBe('Choose an option');
    expect(sheet.querySelectorAll('[data-civ-action-sheet-content] li').length).toBe(3);
  });
});
