export type KeyBinding = {
  key: string;
  handler: (e: KeyboardEvent) => void;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
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
        (!binding.ctrlKey || e.ctrlKey) &&
        (!binding.shiftKey || e.shiftKey) &&
        (!binding.altKey || e.altKey)
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
