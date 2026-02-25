import { resetIdCounter, cleanupLiveRegions } from '@civui/core';

/**
 * Create a fixture element in the DOM and return it.
 * Automatically cleans up after each test.
 */
export async function fixture<T extends HTMLElement>(html: string): Promise<T> {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);

  const element = container.firstElementChild as T;

  // Wait for Lit to finish rendering
  if ('updateComplete' in element) {
    await (element as any).updateComplete;
  }

  return element;
}

/**
 * Clean up all fixture containers from the DOM.
 * Also resets shared state (ID counter, live regions) to prevent test leakage.
 */
export function cleanupFixtures(): void {
  document.body.innerHTML = '';
  resetIdCounter();
  cleanupLiveRegions();
}

/**
 * Wait for a LitElement to finish updating.
 */
export async function elementUpdated(element: HTMLElement): Promise<void> {
  if ('updateComplete' in element) {
    await (element as any).updateComplete;
  }
}

/**
 * Simulate a keyboard event on an element.
 */
export function pressKey(element: HTMLElement, key: string, options: KeyboardEventInit = {}): void {
  element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...options }));
  element.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true, ...options }));
}

/**
 * Simulate typing text into an input element.
 */
export function typeText(input: HTMLInputElement, text: string): void {
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}
