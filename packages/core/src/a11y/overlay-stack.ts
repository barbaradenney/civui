/**
 * Overlay stack — shared coordination for dismissable overlay layers.
 *
 * Each dismissable overlay (civ-popover, civ-action-sheet, and anything
 * composed on them like civ-menu) registers a document-level `keydown`
 * listener to close on Escape. When two such overlays are nested — e.g. a
 * civ-popover opened inside a civ-action-sheet — a single Escape fires BOTH
 * listeners, so without coordination both layers dismiss at once instead of
 * one layer per press.
 *
 * Two pieces solve it together:
 *
 * 1. **The stack** (`pushOverlay` / `removeOverlay` / `isTopOverlay`). An
 *    overlay pushes itself when it opens and removes itself when it closes
 *    (and on disconnect). Only the topmost entry should respond to a
 *    dismiss key.
 *
 * 2. **The per-event claim** (`claimOverlayKey` / `isOverlayKeyClaimed`).
 *    `isTopOverlay` alone is not enough: document `keydown` listeners fire
 *    in *registration* order, not nesting order. If the top overlay's
 *    listener runs first it closes and pops itself, and the next listener
 *    would then see ITSELF as top and close too — the double-dismiss
 *    returns. So the layer that handles a key marks the event as claimed;
 *    every other overlay listener bails when it sees an already-claimed
 *    event. A non-top overlay returns *before* claiming, so the top layer
 *    still gets its turn regardless of firing order.
 *
 * The native-`<dialog>` overlays (civ-modal, civ-drawer) intentionally do
 * NOT participate: they dismiss via the dialog `cancel` path, and the JS
 * overlays already call `preventDefault()` on Escape, which suppresses the
 * dialog cancel when a JS overlay sits on top of a modal. The remaining
 * broken case was strictly two JS-document-listener overlays nested in each
 * other, which the stack + claim model fixes.
 */

const stack: unknown[] = [];

/**
 * Register an overlay as the new topmost layer. De-duplicates: re-pushing an
 * overlay that's already in the stack moves it to the top rather than
 * stacking a second entry (guards against a double open without an
 * intervening close).
 */
export function pushOverlay(token: unknown): void {
  const i = stack.indexOf(token);
  if (i !== -1) stack.splice(i, 1);
  stack.push(token);
}

/** Remove an overlay from the stack. No-op if it isn't present. */
export function removeOverlay(token: unknown): void {
  const i = stack.indexOf(token);
  if (i !== -1) stack.splice(i, 1);
}

/** True when `token` is the topmost (most recently opened) overlay. */
export function isTopOverlay(token: unknown): boolean {
  return stack.length > 0 && stack[stack.length - 1] === token;
}

const claimedEvents = new WeakSet<Event>();

/**
 * Mark a keyboard event as consumed by an overlay layer so other overlay
 * listeners firing later for the same event skip it. Call this only after
 * confirming `isTopOverlay(this)` — the topmost layer is the one entitled
 * to claim the key.
 */
export function claimOverlayKey(e: Event): void {
  claimedEvents.add(e);
}

/** True when an overlay layer has already claimed this event. */
export function isOverlayKeyClaimed(e: Event): boolean {
  return claimedEvents.has(e);
}

/** Test-only: clear the stack between cases. The claimed-event WeakSet is
 *  self-clearing (entries vanish with the events) so it needs no reset. */
export function _resetOverlayStack(): void {
  stack.length = 0;
}
