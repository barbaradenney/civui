import type { LitElement } from 'lit';

type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Slot configuration for LightDomSlotMixin.
 *
 * Keys are data-* attribute names to match on child elements.
 * Values are CSS selectors for the rendered container to relocate into.
 * The special key 'default' catches all unmatched children.
 *
 * @example
 * // Single slot (all children go to one container)
 * static lightDomSlots = { default: '[data-civ-form-content]' };
 *
 * // Multi-slot (sort children by attribute)
 * static lightDomSlots = {
 *   'data-card-header': '[data-civ-card-header]',
 *   'data-card-footer': '[data-civ-card-footer]',
 *   default: '[data-civ-card-body]',
 * };
 */
export type SlotConfig = Record<string, string>;

/**
 * Unified mixin for Light DOM components that need to preserve
 * authored children across Lit's render cycle.
 *
 * Handles three patterns:
 * 1. Single-slot: all children → one container
 * 2. Multi-slot: sort children by data-* attributes into different containers
 * 3. Filtered: capture only specific children (e.g., data-step elements)
 *
 * Critical behaviors:
 * - Captures children BEFORE Lit's first render (connectedCallback)
 * - REMOVES children from DOM so Lit doesn't destroy them
 * - Relocates them into rendered containers in firstUpdated
 * - Skips capture on reconnection (avoids re-capturing Lit output)
 * - Safe for nesting (doesn't interfere with parent/child relocation)
 */
export function LightDomSlotMixin<T extends Constructor<LitElement>>(superClass: T) {
  class LightDomSlot extends superClass {
    /** Captured children sorted by slot key. */
    protected _slottedChildren: Map<string, Node[]> = new Map();
    private _captured = false;

    /**
     * Override to define slot configuration.
     * Default: captures all children into 'default' slot.
     */
    protected _getSlotConfig(): SlotConfig {
      return { default: '' };
    }

    override connectedCallback(): void {
      if (!this._captured) {
        this._captureChildren();
        this._captured = true;
      }
      super.connectedCallback();
    }

    /**
     * Capture and remove children from DOM before Lit renders.
     * Sorts children into slot buckets based on data-* attributes.
     */
    private _captureChildren(): void {
      const config = this._getSlotConfig();
      const slotKeys = Object.keys(config).filter(k => k !== 'default');

      // Initialize buckets
      for (const key of [...slotKeys, 'default']) {
        this._slottedChildren.set(key, []);
      }

      // Sort each child into the matching slot
      for (const child of Array.from(this.childNodes)) {
        let matched = false;
        if (child instanceof Element) {
          for (const key of slotKeys) {
            if (child.hasAttribute(key)) {
              this._slottedChildren.get(key)!.push(child);
              matched = true;
              break;
            }
          }
        }
        if (!matched) {
          this._slottedChildren.get('default')!.push(child);
        }
      }

      // Remove all captured children from DOM so Lit doesn't destroy them
      for (const children of this._slottedChildren.values()) {
        for (const child of children) {
          if (child instanceof Element) {
            child.remove();
          } else if (child.parentNode) {
            child.parentNode.removeChild(child);
          }
        }
      }
    }

    /**
     * Relocate captured children into their rendered containers.
     * Call this in firstUpdated() or override firstUpdated() to
     * call _relocateSlots() after the template is in the DOM.
     */
    protected _relocateSlots(): void {
      const config = this._getSlotConfig();
      for (const [key, selector] of Object.entries(config)) {
        if (!selector) continue;
        const container = this.querySelector(selector);
        const children = this._slottedChildren.get(key) || [];
        if (container) {
          for (const child of children) {
            container.appendChild(child);
          }
        }
      }
    }

    /**
     * Get captured children for a specific slot.
     * Useful for components that need to inspect children before rendering
     * (e.g., civ-form-step counting steps, civ-page-header checking slots).
     */
    protected _getSlottedChildren(key = 'default'): Node[] {
      return this._slottedChildren.get(key) || [];
    }

    /**
     * Check if a slot has any captured children.
     */
    protected _hasSlottedChildren(key: string): boolean {
      const children = this._slottedChildren.get(key);
      return !!children && children.length > 0;
    }
  }

  return LightDomSlot as unknown as Constructor<{
    _slottedChildren: Map<string, Node[]>;
    _getSlotConfig(): SlotConfig;
    _relocateSlots(): void;
    _getSlottedChildren(key?: string): Node[];
    _hasSlottedChildren(key: string): boolean;
  }> & T;
}

/**
 * Mixin for Light DOM leaf components that use child text content
 * as a label fallback. Captures textContent before Lit renders
 * and clears children to prevent duplication.
 */
export function LightDomTextMixin<T extends Constructor<LitElement>>(superClass: T) {
  class LightDomText extends superClass {
    protected _initialText = '';
    private _textCaptured = false;

    override connectedCallback(): void {
      // Only capture and clear on the first connection.
      // Reconnections (e.g., from appendChild relocation) must not
      // wipe the rendered template.
      if (!this._textCaptured) {
        this._initialText = this.textContent?.trim() || '';
        this.textContent = '';
        this._textCaptured = true;
      }
      super.connectedCallback();
    }
  }
  return LightDomText as unknown as Constructor<{ _initialText: string }> & T;
}
