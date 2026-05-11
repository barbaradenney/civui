import { state } from 'lit/decorators.js';
import { CivFormElement } from './civ-form-element.js';

/**
 * Base class for compound form components — `civ-name`, `civ-address`,
 * `civ-direct-deposit`, etc. — that manage a structured value (multiple
 * sub-fields composed into one object) on top of `CivFormElement`.
 *
 * What this encodes that every compound was duplicating before:
 *
 * 1. **Canonical state field name (`_data`)** — every compound had its
 *    own name (`_name`, `_address`, `_marriage`, …). Tests would poke at
 *    them by name, which silently broke on rename. One field, one
 *    accessor in tests.
 * 2. **Hydration in `connectedCallback`** — `_data = parseStructuredValue(
 *    this.value, this._empty)` had to happen before the first render to
 *    avoid Lit's "scheduled an update after an update completed" warning.
 *    The base class does this once; subclasses just declare `_empty`.
 * 3. **Field-delegating sub-input handlers** — `_onSubInput(field, e)` and
 *    `_onSubChange(field, e)` are generic over the value type. Subclasses
 *    bind them inline in templates: `@civ-input="${(e) => this._onSubInput('first', e)}"`.
 * 4. **Default form-data sync** — most compounds emit FormData keyed as
 *    `${name}.${field}`. `_syncFormValue` does this from `_data`.
 *    Override only when the shape diverges (e.g. signature flattens to
 *    a single value).
 *
 * Subclasses provide:
 *   - `_empty: T` — the default value shape (declared as a class field
 *     so it's available before `connectedCallback` runs).
 *   - Custom `willUpdate` for derived-state syncs that depend on props
 *     (e.g. `civ-relationship`'s `deceasedAssumed`).
 *   - Component-specific event handlers (select option syncs, name
 *     compound forwarding, etc.).
 *
 * @example
 * ```ts
 * interface NameValue { first: string; middle: string; last: string; suffix: string }
 * const EMPTY: NameValue = { first: '', middle: '', last: '', suffix: '' };
 *
 * \@customElement('civ-name')
 * export class CivName extends CivCompoundElement<NameValue> {
 *   protected override _empty = EMPTY;
 *   override render() {
 *     return html`...
 *       <civ-text-input
 *         value=${this._data.first}
 *         \@civ-input=${(e: CustomEvent) => this._onSubInput('first', e)}
 *       ></civ-text-input>
 *     ...`;
 *   }
 * }
 * ```
 */
/**
 * Note: this class is intentionally non-generic. Lit's mixin pattern
 * (`LegendHeadingMixin(CivCompoundElement)`) erases generic class type
 * arguments through the intersection, so a `CivCompoundElement<T>`
 * would lose `_data` typing once wrapped. Subclasses re-declare
 * `_data` with their concrete shape and pay the cost of an inline
 * cast at sub-input event sites — that cost is small and the
 * generic-class approach didn't survive contact with the mixin.
 */
export class CivCompoundElement extends CivFormElement {
  /**
   * Empty/default shape for `_data`. Subclasses SHOULD override this as
   * a class field initializer so it's available when `connectedCallback`
   * runs — using a getter or constructor assignment defeats the early-
   * hydration purpose.
   *
   * Not `abstract` because abstract classes can't satisfy Lit's
   * `Constructor<LitElement>` mixin signature; the base provides a
   * trivial default that hydrates `_data` to `{}` if a subclass forgets.
   */
  protected _empty: object = {};

  /**
   * Structured state. Hydrated from `this.value` in `connectedCallback`.
   * Marked with `@state()` so Lit re-renders when the object identity
   * changes (always create a fresh `{ ...this._data, [field]: next }`
   * rather than mutating in place).
   *
   * Subclasses override with their concrete shape:
   *
   *   `@state() protected override _data: NameValue = { ...EMPTY_NAME };`
   *
   * (The override re-declaration is needed because TypeScript widens
   * the inherited `object` type — a known TS limitation
   * around generic class fields in mixin chains.)
   */
  @state() protected _data: object = {};

  override connectedCallback(): void {
    super.connectedCallback();
    // Hydrate before the first render — `parseStructuredValue` is on
    // `CivFormElement`. Mutating `_data` in `firstUpdated` would trigger
    // a second render and Lit's update-cycle warning.
    this._data = this.parseStructuredValue(this.value, this._empty);
  }

  /**
   * Standard sub-input civ-input handler. Patches one field on `_data`
   * and fires `civ-input`. Bind inline:
   *
   *   `@civ-input="${(e: CustomEvent) => this._onSubInput('first', e)}"`
   */
  protected _onSubInput(field: string, e: CustomEvent<{ value: unknown }>): void {
    e.stopPropagation();
    this._data = this._patchStructured(this._data, { [field]: e.detail.value });
  }

  /**
   * Standard sub-input civ-change handler. Same as `_onSubInput` but
   * fires `civ-change` (committed value) instead of `civ-input`.
   */
  protected _onSubChange(field: string, e: CustomEvent<{ value: unknown }>): void {
    e.stopPropagation();
    this._data = this._patchStructured(this._data, { [field]: e.detail.value }, ['change']);
  }

  /**
   * Default form-data sync — emits `${name}.${field}` per `_data` field.
   * Override when the compound needs a different shape (signature
   * flattens to a single value; relationship/partnership prefix nested
   * sub-records).
   */
  protected override _syncFormValue(): void {
    this.syncFormDataFromState(
      this._data,
      this.name || this.tagName.toLowerCase().replace('civ-', ''),
    );
  }
}
