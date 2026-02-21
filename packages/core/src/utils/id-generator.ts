let counter = 0;

/**
 * Generate a unique ID for DOM element association (label-for, aria-describedby, etc.)
 */
export function generateId(prefix = 'civ'): string {
  return `${prefix}-${++counter}`;
}
