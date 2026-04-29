import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivFormElement, LightDomSlotMixin, dispatch, syncGroupDisabled, stopChildEvent, syncLegendToLabel, t, interpolate, resolvePresetOptions } from '@civui/core';
import type { SlotConfig, SelectPresetName } from '@civui/core';
import type { CivCheckbox } from './civ-checkbox.js';
import './civ-checkbox.js';

/**
 * CivUI Checkbox Group
 *
 * Groups multiple civ-checkbox elements with a shared legend,
 * hint, and error message using a native fieldset.
 * Uses ElementInternals for form participation.
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
export class CivCheckboxGroup extends LightDomSlotMixin(CivFormElement) {
  override _getSlotConfig(): SlotConfig {
    return { default: '.civ-group-layout--vertical, .civ-group-layout--horizontal' };
  }

  @property({ type: String }) legend = '';
  @property({ type: Boolean, reflect: true }) tile = false;
  @property({ type: String, reflect: true }) orientation: 'vertical' | 'horizontal' = 'vertical';
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
  private _boundOnChildChange = this._onChildChange.bind(this);
  private _boundStopChildInput = stopChildEvent(this);

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('civ-change', this._boundOnChildChange as EventListener);
    this.addEventListener('civ-input', this._boundStopChildInput as EventListener);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('civ-change', this._boundOnChildChange as EventListener);
    this.removeEventListener('civ-input', this._boundStopChildInput as EventListener);
  }

  override firstUpdated(): void {
    this._relocateSlots();

    const checkboxes = this._getCheckboxes();
    this._syncCheckboxNames(checkboxes);
    this._syncCheckboxDisabled(checkboxes);
    this._syncCheckboxTile(checkboxes);

    if (this.value) {
      this._syncCheckboxChecked(checkboxes);
    } else {
      this._readCheckedFromChildren(checkboxes);
    }

    this._defaultValue = this.value;
  }

  protected override willUpdate(changed: Map<string, unknown>): void {
    super.willUpdate(changed);
    syncLegendToLabel(this, changed);
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

  override render() {
    const layoutClass =
      this.orientation === 'horizontal'
        ? 'civ-group-layout--horizontal'
        : 'civ-group-layout--vertical';

    const presetOptions = this.preset && this._getSlottedChildren('default').length === 0
      ? resolvePresetOptions(this.preset, this.presetVariant)
      : [];

    return html`
        ${this.showSelectAll ? html`
          <civ-action-button
            variant="tertiary"
            label="${this._allChecked ? t('deselectAll') : t('selectAll')}"
            ?disabled="${this.disabled}"
            @click="${this._onToggleAll}"
            class="civ-mb-2"
          ></civ-action-button>` : nothing}
        <div class="${layoutClass}">${presetOptions.map(opt => html`<civ-checkbox value="${opt.value}" label="${opt.label}"></civ-checkbox>`)}</div>
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

  private _onChildChange(e: Event): void {
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
