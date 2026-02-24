import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getFocusableElements, trapFocus, focusFirst } from './focus-manager.js';

// jsdom lacks layout so offsetParent is always null. Mock it to return
// document.body for all elements so isVisible() doesn't filter them out.
const originalOffsetParent = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent');
beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
    get() { return document.body; },
    configurable: true,
  });
});
afterEach(() => {
  if (originalOffsetParent) {
    Object.defineProperty(HTMLElement.prototype, 'offsetParent', originalOffsetParent);
  }
});

describe('getFocusableElements', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('finds buttons, inputs, selects, textareas, links, and tabindex elements', () => {
    container.innerHTML = `
      <button>Click</button>
      <input type="text" />
      <select><option>A</option></select>
      <textarea></textarea>
      <a href="#">Link</a>
      <div tabindex="0">Focusable div</div>
    `;

    const elements = getFocusableElements(container);
    expect(elements.length).toBe(6);
  });

  it('excludes disabled elements', () => {
    container.innerHTML = `
      <button disabled>Disabled</button>
      <input type="text" disabled />
      <select disabled><option>A</option></select>
      <textarea disabled></textarea>
      <button>Enabled</button>
    `;

    const elements = getFocusableElements(container);
    expect(elements.length).toBe(1);
    expect(elements[0].textContent).toBe('Enabled');
  });

  it('excludes hidden inputs', () => {
    container.innerHTML = `
      <input type="hidden" />
      <input type="text" />
    `;

    const elements = getFocusableElements(container);
    expect(elements.length).toBe(1);
    expect((elements[0] as HTMLInputElement).type).toBe('text');
  });

  it('excludes elements with tabindex="-1"', () => {
    container.innerHTML = `
      <div tabindex="-1">Hidden from tab</div>
      <div tabindex="0">Visible</div>
    `;

    const elements = getFocusableElements(container);
    expect(elements.length).toBe(1);
    expect(elements[0].textContent).toBe('Visible');
  });

  it('excludes aria-hidden elements', () => {
    container.innerHTML = `
      <button aria-hidden="true">Hidden</button>
      <button>Visible</button>
    `;

    const elements = getFocusableElements(container);
    expect(elements.length).toBe(1);
    expect(elements[0].textContent).toBe('Visible');
  });

  it('returns empty array for container with no focusable elements', () => {
    container.innerHTML = `<div>Not focusable</div><p>Also not</p>`;

    const elements = getFocusableElements(container);
    expect(elements.length).toBe(0);
  });
});

describe('trapFocus', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('wraps Tab from last element to first', () => {
    container.innerHTML = `
      <button id="first">First</button>
      <button id="last">Last</button>
    `;

    const last = container.querySelector('#last') as HTMLButtonElement;
    last.focus();

    const cleanup = trapFocus(container);

    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    const spy = vi.spyOn(event, 'preventDefault');
    container.dispatchEvent(event);

    expect(spy).toHaveBeenCalled();

    cleanup();
  });

  it('wraps Shift+Tab from first element to last', () => {
    container.innerHTML = `
      <button id="first">First</button>
      <button id="last">Last</button>
    `;

    const first = container.querySelector('#first') as HTMLButtonElement;
    first.focus();

    const cleanup = trapFocus(container);

    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true });
    const spy = vi.spyOn(event, 'preventDefault');
    container.dispatchEvent(event);

    expect(spy).toHaveBeenCalled();

    cleanup();
  });

  it('ignores non-Tab keys', () => {
    container.innerHTML = `<button>Only</button>`;

    const cleanup = trapFocus(container);

    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    const spy = vi.spyOn(event, 'preventDefault');
    container.dispatchEvent(event);

    expect(spy).not.toHaveBeenCalled();

    cleanup();
  });

  it('returns cleanup function that removes the listener', () => {
    container.innerHTML = `<button>Only</button>`;

    const cleanup = trapFocus(container);
    cleanup();

    // After cleanup, Tab should not be intercepted
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    const spy = vi.spyOn(event, 'preventDefault');
    container.dispatchEvent(event);

    expect(spy).not.toHaveBeenCalled();
  });
});

describe('focusFirst', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('focuses the first focusable element', () => {
    container.innerHTML = `
      <div>Not focusable</div>
      <button id="target">First button</button>
      <button>Second button</button>
    `;

    focusFirst(container);

    expect(document.activeElement?.id).toBe('target');
  });

  it('does nothing when container has no focusable elements', () => {
    container.innerHTML = `<div>Not focusable</div>`;

    // Should not throw
    focusFirst(container);

    expect(document.activeElement).not.toBe(container);
  });
});
