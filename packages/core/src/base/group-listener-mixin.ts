import type { LitElement } from 'lit';
import { stopChildEvent } from '../utils/group-utils.js';

type Constructor<T = {}> = new (...args: any[]) => T;

interface GroupListenerHost {
  /** Optional handler for `civ-change` events bubbling up from child controls. */
  _onChildChange?(e: Event): void;
  /** Optional handler for `keydown` (radiogroup-style roving tabindex). */
  _onKeydown?(e: KeyboardEvent): void;
}

/**
 * Mixin that wires the standard "group container" event listener
 * triplet on `connectedCallback` and tears it down on
 * `disconnectedCallback`:
 *
 *  - `civ-change` → calls `this._onChildChange(e)` if defined
 *  - `civ-input`  → swallowed by `stopChildEvent(this)` so the group
 *                   re-dispatches its own committed event instead
 *                   of re-firing the child's
 *  - `keydown`    → calls `this._onKeydown(e)` if defined (used for
 *                   roving tabindex / arrow-key navigation)
 *
 * Both `_onChildChange` and `_onKeydown` are opt-in — the mixin only
 * wires the listener when the subclass defines the corresponding
 * method. This lets components that don't need keyboard handling
 * (e.g. checkbox-group has no roving tabindex) skip the keydown
 * listener simply by not declaring `_onKeydown`.
 *
 * Replaces the bind+add+remove triplet that was duplicated across
 * civ-radio-group, civ-checkbox-group, civ-segmented-control.
 */
export function GroupListenerMixin<T extends Constructor<LitElement>>(superClass: T) {
  class GroupListenerClass extends superClass implements GroupListenerHost {
    declare _onChildChange?: GroupListenerHost['_onChildChange'];
    declare _onKeydown?: GroupListenerHost['_onKeydown'];

    private _boundCivChange?: EventListener;
    private _boundCivInput?: EventListener;
    private _boundKeydown?: EventListener;

    override connectedCallback(): void {
      super.connectedCallback();

      // Lazy-bind on first connect — caches references so re-connect
      // cycles (move-in-DOM) re-add the same function and removeEventListener
      // can find it later.
      if (!this._boundCivChange && typeof this._onChildChange === 'function') {
        this._boundCivChange = this._onChildChange.bind(this) as EventListener;
      }
      if (!this._boundCivInput) {
        this._boundCivInput = stopChildEvent(this) as EventListener;
      }
      if (!this._boundKeydown && typeof this._onKeydown === 'function') {
        this._boundKeydown = this._onKeydown.bind(this) as EventListener;
      }

      if (this._boundCivChange) this.addEventListener('civ-change', this._boundCivChange);
      if (this._boundCivInput) this.addEventListener('civ-input', this._boundCivInput);
      if (this._boundKeydown) this.addEventListener('keydown', this._boundKeydown);
    }

    override disconnectedCallback(): void {
      super.disconnectedCallback();
      if (this._boundCivChange) this.removeEventListener('civ-change', this._boundCivChange);
      if (this._boundCivInput) this.removeEventListener('civ-input', this._boundCivInput);
      if (this._boundKeydown) this.removeEventListener('keydown', this._boundKeydown);
    }
  }
  return GroupListenerClass as Constructor<GroupListenerHost> & T;
}
