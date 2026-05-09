import type { LitElement } from 'lit';
import { stopChildEvent } from '../utils/group-utils.js';

type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Mixin that wires the standard "group container" event listener
 * triplet on `connectedCallback` and tears it down on
 * `disconnectedCallback`:
 *
 *  - `civ-change` → calls `this._onChildChange(e)`
 *  - `civ-input`  → swallowed by `stopChildEvent(this)` so the group
 *                   re-dispatches its own committed event instead
 *                   of re-firing the child's
 *  - `keydown`    → calls `this._onKeydown(e)`
 *
 * Both `_onChildChange` and `_onKeydown` are declared on the mixin as
 * protected no-op stubs. Subclasses override the ones they need:
 *
 *   class CivRadioGroup extends GroupListenerMixin(...) {
 *     protected override _onChildChange(e: Event): void { ... }
 *     protected override _onKeydown(e: KeyboardEvent): void { ... }
 *   }
 *
 * Components that don't need keyboard handling (e.g. checkbox-group
 * has no roving tabindex) simply skip the `_onKeydown` override —
 * the mixin's stub fires harmlessly. This keeps TypeScript happy
 * about the method usage chain (mixin defines, subclass overrides,
 * mixin calls) while preserving the same runtime behavior as the
 * old hand-wired bind+add+remove triplets.
 *
 * Replaces the bind+add+remove triplet that was duplicated across
 * civ-radio-group, civ-checkbox-group, civ-segmented-control.
 */
export function GroupListenerMixin<T extends Constructor<LitElement>>(superClass: T) {
  class GroupListenerClass extends superClass {
    /**
     * Subclass override: handle a civ-change bubbling up from a child
     * control. Public-with-underscore-prefix (treated as internal API)
     * because TypeScript's anonymous-class return type can't express
     * `protected` methods through a `Constructor<>` cast.
     */
    _onChildChange(_e: Event): void { /* no-op default */ }
    /** Subclass override: handle keydown for arrow-key / roving-tabindex nav. */
    _onKeydown(_e: KeyboardEvent): void { /* no-op default */ }

    // Public (with underscore-prefix convention) so the mixin's
    // anonymous return type doesn't carry private-member visibility
    // (which TypeScript can't represent through `extends`). Treated as
    // internal-by-convention; not part of the documented API.
    _boundCivChange?: EventListener;
    _boundCivInput?: EventListener;
    _boundKeydown?: EventListener;

    override connectedCallback(): void {
      super.connectedCallback();

      // Lazy-bind on first connect — caches references so re-connect
      // cycles (move-in-DOM) re-add the same function and
      // removeEventListener can find it later.
      if (!this._boundCivChange) {
        this._boundCivChange = this._onChildChange.bind(this) as EventListener;
      }
      if (!this._boundCivInput) {
        this._boundCivInput = stopChildEvent(this) as EventListener;
      }
      if (!this._boundKeydown) {
        this._boundKeydown = this._onKeydown.bind(this) as EventListener;
      }

      this.addEventListener('civ-change', this._boundCivChange);
      this.addEventListener('civ-input', this._boundCivInput);
      this.addEventListener('keydown', this._boundKeydown);
    }

    override disconnectedCallback(): void {
      super.disconnectedCallback();
      if (this._boundCivChange) this.removeEventListener('civ-change', this._boundCivChange);
      if (this._boundCivInput) this.removeEventListener('civ-input', this._boundCivInput);
      if (this._boundKeydown) this.removeEventListener('keydown', this._boundKeydown);
    }
  }
  // Cast: expose `_onChildChange` and `_onKeydown` so subclasses can
  // `override` them, while hiding the private fields and LitElement
  // internals (TypeScript can't represent those through an inferred
  // anonymous-class return type).
  return GroupListenerClass as Constructor<{
    _onChildChange(e: Event): void;
    _onKeydown(e: KeyboardEvent): void;
  }> & T;
}
