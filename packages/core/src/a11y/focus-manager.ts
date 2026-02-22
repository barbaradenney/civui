const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Check if an element is visible (not hidden via CSS or aria-hidden).
 */
function isVisible(el: HTMLElement): boolean {
  if (el.hasAttribute('aria-hidden')) return false;
  if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') return false;
  return getComputedStyle(el).visibility !== 'hidden';
}

/**
 * Get all focusable elements within a container.
 * Filters out hidden, aria-hidden, and visibility:hidden elements.
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter(isVisible);
}

/**
 * Trap focus within a container (for modals/dialogs).
 * Returns a cleanup function to remove the trap.
 */
export function trapFocus(container: HTMLElement): () => void {
  const handler = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    const focusable = getFocusableElements(container);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  container.addEventListener('keydown', handler);
  return () => container.removeEventListener('keydown', handler);
}

/**
 * Move focus to the first focusable element within a container.
 */
export function focusFirst(container: HTMLElement): void {
  const focusable = getFocusableElements(container);
  focusable[0]?.focus();
}
