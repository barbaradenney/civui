let counter = 0;

/**
 * Generate a unique ID for DOM element association (label-for, aria-describedby, etc.)
 */
export function generateId(prefix = 'civ'): string {
  return `${prefix}-${++counter}`;
}

/**
 * Reset the ID counter. Call between tests to ensure isolation.
 */
export function resetIdCounter(): void {
  counter = 0;
}
