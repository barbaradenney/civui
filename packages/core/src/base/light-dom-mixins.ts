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

    override disconnectedCallback(): void {
      super.disconnectedCallback();
      // Don't clear _captured or _slottedChildren — children have been
      // relocated into the rendered template and will re-render correctly
      // on reconnect using the already-captured references.
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

      // Sort each child into the matching slot. Comment nodes are
      // skipped — they're typically Lit's `<!---->` ChildPart marker
      // anchors that the OUTER component inserted around an
      // expression like `${html`<x-thing/>`}`. Capturing and removing
      // them detaches the outer template's ChildPart from the DOM,
      // and the next outer re-render throws "ChildPart has no
      // parentNode". Leaving comments in place keeps the outer
      // ChildPart anchored at the host root; relocated Elements
      // still live in their slot targets, and Lit's no-op updates
      // (re-render with unchanged content) work.
      //
      // Dynamic mutations of the slotted content (items array grows
      // / shrinks via outer re-render) still misbehave because the
      // moved Elements aren't at the marker position any more — but
      // that case has always required the plain-DOM-panel workaround
      // documented in .claude/rules/common-traps.md.
      for (const child of Array.from(this.childNodes)) {
        if (child.nodeType === Node.COMMENT_NODE) continue;
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
     *
     * Each child is only re-appended when it's NOT already attached
     * to the target container. The guard matters on re-renders that
     * leave previously-relocated children in place — calling
     * `appendChild` on an already-attached child still fires a
     * `childList` mutation (it counts as remove-then-insert per the
     * DOM spec), and consumers like civ-filterable-list observe
     * those mutations to drive re-filter logic.
     */
    protected _relocateSlots(): void {
      const config = this._getSlotConfig();
      for (const [key, selector] of Object.entries(config)) {
        if (!selector) continue;
        const container = this.querySelector(selector);
        if (!container) continue;
        const children = this._slottedChildren.get(key) || [];
        for (const child of children) {
          if (child.parentNode !== container) {
            container.appendChild(child);
          }
        }
      }
    }

    /**
     * Re-relocate captured children after every render — not just the
     * first. Lit re-renders the host when a reflected `@property`
     * changes (e.g. setting `href` on a civ-list-item to flip its row
     * from a `<div>` into an `<a>`), and the new template starts with
     * the slot-target containers empty. Without re-relocation, the
     * captured children sit detached in `_slottedChildren` and the
     * row renders as an empty stub — the symptom that surfaced as
     * "contact-info row goes blank with an extra divider after
     * personal-info is marked complete".
     *
     * `_relocateSlots()` is idempotent: appending an already-attached
     * child to the same parent is a no-op, so calling this on every
     * render is safe.
     */
    /**
     * Re-relocate captured children after every render, but only when
     * the slot target is empty.
     *
     * Lit re-renders the host when a reflected `@property` changes
     * (e.g. setting `href` on a civ-list-item to flip its row from a
     * `<div>` into an `<a>`), and a template-defined slot-target like
     * `<span data-civ-list-item-heading-slot></span>` gets reset to
     * empty. Without this re-relocation, the captured children sit
     * detached in `_slottedChildren` and the row renders as an empty
     * stub — the "contact-info row goes blank" bug at the task list.
     *
     * The empty-only guard is important: when a parent component's
     * Lit template inserts NEW slotted children into our host on its
     * own re-render (e.g. civ-partnership-history swapping the radio
     * set inside its civ-radio-group), the parent's ChildPart fills
     * our slot target with the new content. Re-appending our original
     * cached children there would duplicate them on top of Lit's new
     * ones. If the slot target has any content after Lit's render,
     * we treat that as authoritative and leave it alone.
     */
    override updated(changed: Map<PropertyKey, unknown>): void {
      super.updated(changed);
      const config = this._getSlotConfig();
      for (const [key, selector] of Object.entries(config)) {
        if (!selector) continue;
        const container = this.querySelector(selector);
        if (!container) continue;
        if (container.childNodes.length > 0) continue;
        const children = this._slottedChildren.get(key) || [];
        for (const child of children) {
          container.appendChild(child);
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
