import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivFormElement, LegendHeadingMixin, LightDomSlotMixin, GroupListenerMixin, dispatch, syncGroupDisabled, t, interpolate, resolvePresetOptions, renderFormHeader, renderLegend, buildDescribedBy } from '@civui/core';
import type { SlotConfig, SelectPresetName } from '@civui/core';
import type { CivCheckbox } from './civ-checkbox.js';
import './civ-checkbox.js';

/**
 * CivUI Checkbox Group
 *
 * Self-contained group of civ-checkbox elements with a shared
 * legend, hint, and error message using a native fieldset. Uses
 * ElementInternals for form participation.
 *
 * Renders its own legend / hint / error — do **not** wrap in
 * `<civ-fieldset>` (you'd get nested fieldsets with double
 * legends). Use the `legend` prop directly on the component.
 *
 * @element civ-checkbox-group
 *
 * @prop {string} legend - Group legend text
 * @prop {string} name - Shared form field name for all checkboxes
 * @prop {string} value - Comma-separated checked values (individual values must not contain commas)
 * @prop {string} hint - Hint text displayed below legend
 * @prop {string} error - Error message for the group
 * @prop {boolean} tile - Apply tile variant to all child checkboxes
 * @prop {boolean} required - Whether at least one selection is required
 * @prop {boolean} disabled - Whether the group is disabled
 * @prop {'vertical' | 'horizontal'} orientation - Layout direction
 *
 * @fires civ-input - When the set of checked values changes (before civ-change), detail: { values }
 * @fires civ-change - When the set of checked values changes, detail: { values }
 * @fires civ-reset - When the form is reset
 * @fires civ-analytics - Analytics tracking event on change
 */
@customElement('civ-checkbox-group')
export class CivCheckboxGroup extends LegendHeadingMixin(GroupListenerMixin(LightDomSlotMixin(CivFormElement))) {
  override _getSlotConfig(): SlotConfig {
    return { default: '.civ-group-layout--vertical, .civ-group-layout--horizontal' };
  }

  /** Fieldset legend displayed above the checkbox choices. */
  @property({ type: String }) legend = '';

  /**
   * Pull the hint visually flush with the controls below it by removing
   * the default 16px gap under group hints. Useful for compact compounds
   * (e.g. the OMB race group) where the legend + hint should read as one
   * stacked header. Renders as `tight-hint` attribute for CSS targeting.
   */
  @property({ type: Boolean, attribute: 'tight-hint', reflect: true }) tightHint = false;

  @property({ type: Boolean, reflect: true }) tile = true;
  @property({ type: String, reflect: true }) orientation: 'vertical' | 'horizontal' = 'vertical';
  /**
   * Tile rendering variant.
   * - `auto` (default) — picks `card` for groups of 4 or fewer options and
   *   `list` for groups of 5+, on the theory that long card stacks waste
   *   vertical space and read better as a connected list.
   * - `card` — each tile has its own rounded border with a gap. Best for
   *   short groups (≤4) where each option deserves visual weight.
   * - `list` — adjacent tiles share a single 1px border with rounded corners
   *   only on the first and last tile. Best for dense option lists.
   *
   * Only affects rendering when `tile` is also true and orientation is
   * vertical. The auto threshold counts slotted `<civ-checkbox>` children
   * (or `preset` option count when used).
   */
  @property({ type: String, reflect: true }) variant: 'card' | 'list' | 'auto' = 'auto';
  @property({ type: Boolean, attribute: 'show-select-all' }) showSelectAll = false;

  /** Pre-populate checkbox options from a built-in preset data set. */
  @property({ type: String }) preset?: SelectPresetName;

  /** Variant for presets with multiple tiers. */
  @property({ type: String, attribute: 'preset-variant' }) presetVariant?: string;
  @property({ type: Number, attribute: 'max-selections' }) maxSelections?: number;
  /**
   * Minimum number of options that must be checked. When > 0, the group
   * is treated as implicitly required (legend shows the required mark
   * and `_updateValidity` reports `valueMissing` until the count is met).
   * Surfaces only on submit / `checkValidity()` — does not block
   * mid-flow unchecks.
   */
  @property({ type: Number, attribute: 'min-selections' }) minSelections?: number;

  /** Whether `minSelections` should drive the implicit-required behavior. */
  private get _minSelections(): number {
    return Math.max(this.minSelections ?? 0, 0);
  }

  /**
   * Effective required state: explicit `required` OR a positive
   * `minSelections`. Used to drive both the legend asterisk and the
   * native validity check.
   */
  protected override _defaultValue = '';

  // civ-change / civ-input listeners wired by GroupListenerMixin —
  // it calls _onChildChange. (No keydown — checkbox-group has no
  // roving tabindex.)

  override connectedCallback(): void {
    super.connectedCallback();
    // If `value` wasn't supplied explicitly, hydrate it from any captured
    // child <civ-checkbox> with a `checked` attribute. Done before the first
    // render so we don't trigger a second update cycle from `firstUpdated`.
    if (!this.value) {
      const values: string[] = [];
      for (const node of this._getSlottedChildren('default')) {
        if (!(node instanceof Element)) continue;
        const candidates = node.matches?.('civ-checkbox')
          ? [node]
          : Array.from(node.querySelectorAll?.('civ-checkbox') ?? []);
        for (const cb of candidates) {
          if (cb.hasAttribute('checked')) {
            values.push(cb.getAttribute('value') || '');
          }
        }
      }
      if (values.length) {
        this.value = this._serializeValue(values);
      }
    }
    this._defaultValue = this.value;
  }

  override firstUpdated(): void {
    this._relocateSlots();

    const checkboxes = this._getCheckboxes();
    this._syncCheckboxNames(checkboxes);
    this._syncCheckboxDisabled(checkboxes);
    this._syncCheckboxTile(checkboxes);
    this._syncCheckboxChecked(checkboxes);
    this._updateGroupFormValue();
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    const needsCheckboxes =
      changed.has('name') || changed.has('disabled') ||
      changed.has('tile') || (changed.has('value') && changed.get('value') !== undefined);
    const checkboxes = needsCheckboxes ? this._getCheckboxes() : undefined;

    if (changed.has('name')) {
      this._syncCheckboxNames(checkboxes);
    }
    if (changed.has('disabled')) {
      this._syncCheckboxDisabled(checkboxes);
    }
    if (changed.has('tile')) {
      this._syncCheckboxTile(checkboxes);
    }
    if (changed.has('value') && changed.get('value') !== undefined) {
      this._syncCheckboxChecked(checkboxes);
    }
  }

  protected override _syncFormValue(): void {
    this._updateGroupFormValue();
  }

  protected override _updateValidity(): void {
    const checkedCount = this._parseValue(this.value).length;
    const min = this._minSelections;
    const anchor = this.querySelector('input, civ-checkbox') as HTMLElement | null;

    if (min > 0 && checkedCount < min) {
      this._setValidity(
        { valueMissing: true },
        this.error || interpolate(t('minSelectionsError'), { min }),
        anchor ?? undefined,
      );
    } else if (this.required && checkedCount === 0) {
      this._setValidity(
        { valueMissing: true },
        this.error || interpolate(this.requiredMessage || t('fieldRequired'), { label: this.legend || this.label || t('fieldFallbackLabel') }),
        anchor ?? undefined,
      );
    } else {
      this._setValidity({});
    }
  }

  override formDisabledCallback(disabled: boolean): void {
    super.formDisabledCallback(disabled);
    this._syncCheckboxDisabled();
  }

  /**
   * Resolve the effective variant. `auto` picks `list` once the group has
   * more than 4 options, otherwise `card`. Reads the captured slot map
   * because at first render LightDomSlotMixin has already pulled children
   * out of the DOM, so querySelector('civ-checkbox') would return 0.
   */
  private _resolveVariant(): 'card' | 'list' {
    if (this.variant !== 'auto') return this.variant;
    const presetCount = this.preset
      ? resolvePresetOptions(this.preset, this.presetVariant).length
      : 0;
    const slottedCount = this._getSlottedChildren('default').filter(
      (n) => n.nodeType === Node.ELEMENT_NODE && (n as Element).tagName === 'CIV-CHECKBOX',
    ).length;
    const count = presetCount || slottedCount;
    return count > 4 ? 'list' : 'card';
  }

  override render() {
    const layoutBase =
      this.orientation === 'horizontal'
        ? 'civ-group-layout--horizontal'
        : 'civ-group-layout--vertical';
    const effectiveVariant = this._resolveVariant();
    const layoutClass = effectiveVariant === 'list' && this.orientation !== 'horizontal'
      ? `${layoutBase} civ-group-list`
      : layoutBase;

    const presetOptions = this.preset && this._getSlottedChildren('default').length === 0
      ? resolvePresetOptions(this.preset, this.presetVariant)
      : [];

    const describedBy = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);

    // ARIA attributes live on the outer <fieldset> here — not on an
    // inner role-bearing div like civ-radio-group / civ-segmented-control
    // do. Checkboxes aren't mutually exclusive, so this group does NOT
    // use `role="radiogroup"`; native fieldset + legend semantics are
    // sufficient. With no overriding role, the fieldset itself is the
    // accessible group, and aria-describedby / aria-invalid / aria-required
    // belong directly on it.
    return html`
      <fieldset
        class="civ-fieldset"
        aria-describedby="${describedBy || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        aria-required="${this.required || nothing}"
        ?disabled="${this.disabled}"
      >
        ${this.legend
          ? renderFormHeader({
              label: renderLegend({ legend: this.legend, required: this.required, headingLevel: this.headingLevel, size: this.size }),
              hintId: this._hintId,
              hint: this.hint,
              errorId: this._errorId,
              error: this.error,
              fieldset: true,
            })
          : nothing}
        ${this.showSelectAll ? html`
          <civ-action-button
            variant="tertiary"
            label="${this._allChecked ? t('deselectAll') : t('selectAll')}"
            ?disabled="${this.disabled}"
            @click="${this._onToggleAll}"
            class="civ-mb-2"
          ></civ-action-button>` : nothing}
        <div class="${layoutClass}">${presetOptions.map(opt => html`<civ-checkbox value="${opt.value}" label="${opt.label}"></civ-checkbox>`)}</div>
      </fieldset>
    `;
  }

  /**
   * Get the values of all checked checkboxes in this group.
   */
  getCheckedValues(): string[] {
    return this._parseValue(this.value);
  }

  private get _allChecked(): boolean {
    const checkboxes = this._getCheckboxes();
    return checkboxes.length > 0 && checkboxes.every((cb) => cb.checked);
  }

  private _onToggleAll(): void {
    const checkboxes = this._getCheckboxes();
    const toCheck = !this._allChecked;
    const limit = toCheck && this.maxSelections ? this.maxSelections : Infinity;
    checkboxes.forEach((cb, i) => { cb.checked = toCheck && i < limit; });

    this._readCheckedFromChildren(checkboxes);
    const values = this.getCheckedValues();
    dispatch(this, 'civ-input', { values });
    dispatch(this, 'civ-change', { values });
    this.sendAnalytics('change');
  }

  // Called by multiple sync methods per update cycle. querySelectorAll is
  // efficient for typical group sizes (3–10 children) and avoids stale caches.
  private _getCheckboxes(): CivCheckbox[] {
    return Array.from(this.querySelectorAll('civ-checkbox')) as CivCheckbox[];
  }

  /**
   * Parse comma-separated value string into array.
   * Note: individual checkbox values must not contain commas.
   */
  private _parseValue(val: string): string[] {
    return val
      ? val.split(',').map((v) => v.trim()).filter(Boolean)
      : [];
  }

  private _serializeValue(values: string[]): string {
    return values.join(',');
  }

  private _syncCheckboxNames(checkboxes?: CivCheckbox[]): void {
    (checkboxes ?? this._getCheckboxes()).forEach((cb) => {
      if (this.name) cb.name = this.name;
      cb.disableAnalytics = true;
    });
  }

  private _groupDisabledSet = new WeakSet<Element>();

  private _syncCheckboxDisabled(checkboxes?: CivCheckbox[]): void {
    this._groupDisabledSet = syncGroupDisabled(checkboxes ?? this._getCheckboxes(), this.disabled, this._groupDisabledSet);
  }

  private _syncCheckboxTile(checkboxes?: CivCheckbox[]): void {
    (checkboxes ?? this._getCheckboxes()).forEach((cb) => {
      cb.tile = this.tile;
    });
  }

  private _syncCheckboxChecked(checkboxes?: CivCheckbox[]): void {
    const selected = this._parseValue(this.value);
    (checkboxes ?? this._getCheckboxes()).forEach((cb) => {
      cb.checked = selected.includes(cb.value);
    });
  }

  private _readCheckedFromChildren(checkboxes?: CivCheckbox[]): void {
    const values: string[] = [];
    (checkboxes ?? this._getCheckboxes()).forEach((cb) => {
      if (cb.checked) values.push(cb.value);
    });
    this.value = this._serializeValue(values);
    this._updateGroupFormValue();
  }

  private _updateGroupFormValue(): void {
    const values = this._parseValue(this.value);
    if (values.length === 0) {
      this.updateFormValue(null);
      return;
    }
    const fd = new FormData();
    for (const v of values) {
      fd.append(this.name, v);
    }
    this.updateFormValue(fd);
  }

  override _onChildChange(e: Event): void {
    // Only handle events from child checkboxes, not re-dispatched group events
    if (e.target === this) return;

    e.stopPropagation();

    // Re-read checked state from children
    const checkedValues: string[] = [];
    this._getCheckboxes().forEach((cb) => {
      if (cb.checked) checkedValues.push(cb.value);
    });

    // Enforce max selections
    if (this.maxSelections && checkedValues.length > this.maxSelections) {
      const checkbox = e.target as CivCheckbox;
      checkbox.checked = false;
      return;
    }

    this.value = this._serializeValue(checkedValues);
    this._updateGroupFormValue();

    const values = this.getCheckedValues();
    dispatch(this, 'civ-input', { values });
    dispatch(this, 'civ-change', { values });
    this.sendAnalytics('change');
  }

  override formResetCallback(): void {
    this.value = this._defaultValue;
    this.error = '';
    this._syncCheckboxChecked();
    this._updateGroupFormValue();
    dispatch(this, 'civ-reset');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-checkbox-group': CivCheckboxGroup;
  }
}
