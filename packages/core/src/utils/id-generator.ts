// Random suffix per CivUI instance to prevent ID collisions
// across iframes or multiple library instances on the same page.
const instanceId = Math.random().toString(36).slice(2, 6);
let counter = 0;

/**
 * Generate a unique ID for DOM element association (label-for, aria-describedby, etc.)
 * Format: `{prefix}-{instanceId}-{counter}` (e.g., `civ-a3x9-1`)
 */
export function generateId(prefix = 'civ'): string {
  return `${prefix}-${instanceId}-${++counter}`;
}

/**
 * Reset the ID counter. Call between tests to ensure isolation.
 */
export function resetIdCounter(): void {
  counter = 0;
}
