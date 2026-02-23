export type KeyBinding = {
  key: string;
  handler: (e: KeyboardEvent) => void;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  preventDefault?: boolean;
};

/**
 * Create a keyboard event handler from a list of key bindings.
 */
export function createKeyboardHandler(bindings: KeyBinding[]): (e: KeyboardEvent) => void {
  return (e: KeyboardEvent) => {
    for (const binding of bindings) {
      if (
        e.key === binding.key &&
        e.ctrlKey === !!binding.ctrlKey &&
        e.shiftKey === !!binding.shiftKey &&
        e.altKey === !!binding.altKey &&
        e.metaKey === !!binding.metaKey
      ) {
        if (binding.preventDefault !== false) {
          e.preventDefault();
        }
        binding.handler(e);
        return;
      }
    }
  };
}

/**
 * Resolve the next index for arrow/Home/End keyboard navigation
 * within a group of items (radio buttons, segmented controls, etc.).
 * Returns undefined for unrecognized keys.
 */
export function resolveGroupNavIndex(
  key: string,
  currentIndex: number,
  length: number,
): number | undefined {
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return currentIndex < length - 1 ? currentIndex + 1 : 0;
    case 'ArrowLeft':
    case 'ArrowUp':
      return currentIndex > 0 ? currentIndex - 1 : length - 1;
    case 'Home':
      return 0;
    case 'End':
      return length - 1;
    default:
      return undefined;
  }
}
