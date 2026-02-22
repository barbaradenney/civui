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
