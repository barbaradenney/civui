/**
 * Announce a message to screen readers via a live region.
 * Creates a shared live region element on first use.
 */

let liveRegion: HTMLElement | null = null;

function ensureLiveRegion(): HTMLElement {
  if (liveRegion && document.body.contains(liveRegion)) {
    return liveRegion;
  }
  liveRegion = document.createElement('div');
  liveRegion.setAttribute('role', 'status');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  Object.assign(liveRegion.style, {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: '0',
  });
  document.body.appendChild(liveRegion);
  return liveRegion;
}

export function announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const region = ensureLiveRegion();
  region.setAttribute('aria-live', priority);
  // Clear then set to ensure announcement even if same message
  region.textContent = '';
  requestAnimationFrame(() => {
    region.textContent = message;
  });
}
