import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivFormElement, LegendHeadingMixin, LightDomSlotMixin, GroupListenerMixin, dispatch, resolveGroupNavIndex, isRtl, syncGroupDisabled, resolvePresetOptions, renderFormHeader, renderLegend, renderSkipButton, buildDescribedBy } from '@civui/core';
import type { SlotConfig, SelectPresetName } from '@civui/core';
import type { CivRadio } from './civ-radio.js';
import './civ-radio.js';

/**
 * CivUI Radio Group
 *
 * Self-contained group of civ-radio elements with mutual exclusivity,
 * a shared legend, hint, and error message using a native fieldset.
 * Uses ElementInternals for form participation. Implements WAI-ARIA
 * Radio Group pattern with roving tabindex.
 *
 * Renders its own legend / hint / error — do **not** wrap in
 * `<civ-fieldset>` (you'd get nested fieldsets with double
 * legends). Use the `legend` prop directly on the component.
 *
 * @element civ-radio-group
 *
 * @prop {string} legend - Group legend text
 * @prop {string} name - Shared form field name for all radios
 * @prop {string} value - Currently selected value
 * @prop {string} hint - Hint text displayed below legend
 * @prop {string} error - Error message for the group
 * @prop {boolean} tile - Apply tile variant to all child radios
 * @prop {boolean} required - Whether a selection is required
 * @prop {'vertical' | 'horizontal'} orientation - Layout direction
 *
 * @fires civ-change - When the selected value changes, detail: { value }
 * @fires civ-input - When the selected value changes (input event), detail: { value }
 * @fires civ-reset - When the form is reset
 * @fires civ-analytics - Analytics tracking event on change
 */
@customElement('civ-radio-group')
export class CivRadioGroup extends LegendHeadingMixin(GroupListenerMixin(LightDomSlotMixin(CivFormElement))) {
  override _getSlotConfig(): SlotConfig {
    return { default: '.civ-group-layout--vertical, .civ-group-layout--horizontal' };
  }

  /** Fieldset legend displayed above the radio choices. */
  @property({ type: String }) legend = '';
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
   * vertical. The auto threshold counts slotted `<civ-radio>` children
   * (or `preset` option count when used).
   */
  @property({ type: String, reflect: true }) layout: 'card' | 'list' | 'auto' = 'auto';

  /** Pre-populate radio options from a built-in preset data set. */
  @property({ type: String }) preset?: SelectPresetName;

  /** Variant for presets with multiple tiers. */
  @property({ type: String, attribute: 'preset-variant' }) presetVariant?: string;

  /**
   * When non-empty, renders a "Prefer not to answer" affordance below the
   * radio group. Selecting it sets `value` to `skipValue` (default: `'skip'`)
   * and fires the same civ-input / civ-change events as a radio selection.
   * Kept outside the roving tabindex so it isn't confused with a normal choice.
   */
  @property({ type: String, attribute: 'skip-label' }) skipLabel = '';

  /** Form value used when the skip affordance is selected. */
  @property({ type: String, attribute: 'skip-value' }) skipValue = 'skip';

  /** Legend ID — referenced by the inner radiogroup's `aria-labelledby`. */
  private _legendId = this.generateId('radio-group-legend');

  protected override _defaultValue = '';

  // civ-change / civ-input / keydown listeners wired by GroupListenerMixin —
  // it calls _onChildChange and _onKeydown when those methods are defined.

  override connectedCallback(): void {
    super.connectedCallback();
    // If `value` wasn't supplied explicitly, hydrate it from any captured
    // child <civ-radio> with a `checked` attribute. Done before the first
    // render so we don't trigger a second update cycle from `firstUpdated`.
    if (!this.value) {
      for (const node of this._getSlottedChildren('default')) {
        if (!(node instanceof Element)) continue;
        const checked = node.matches?.('civ-radio[checked]')
          ? node
          : node.querySelector?.('civ-radio[checked]');
        if (checked) {
          this.value = checked.getAttribute('value') || '';
          break;
        }
      }
    }
    this._defaultValue = this.value;
  }

  override firstUpdated(): void {
    this._relocateSlots();

    const radios = this._getRadios();
    this._syncRadioNames(radios);
    this._syncRadioChecked(radios);
    this._syncTabindex(radios);
    this._syncRadioRequired(radios);
    this._syncRadioTile(radios);
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    const needsRadios =
      changed.has('name') || changed.has('value') ||
      changed.has('disabled') || changed.has('required') || changed.has('tile') ||
      changed.has('preset') || changed.has('presetVariant');
    const radios = needsRadios ? this._getRadios() : undefined;

    if (changed.has('name')) {
      this._syncRadioNames(radios);
    }
    if (changed.has('value')) {
      this._syncRadioChecked(radios);
      this._syncTabindex(radios);
    }
    if (changed.has('disabled')) {
      this._syncRadioDisabled(radios);
    }
    if (changed.has('required')) {
      this._syncRadioRequired(radios);
    }
    if (changed.has('tile')) {
      this._syncRadioTile(radios);
    }
  }

  override formDisabledCallback(disabled: boolean): void {
    super.formDisabledCallback(disabled);
    this._syncRadioDisabled();
  }

  /**
   * Resolve the effective variant. `auto` picks `list` once the group has
   * more than 4 options, otherwise `card`. Reads the captured slot map
   * because at first render LightDomSlotMixin has already pulled children
   * out of the DOM, so querySelector('civ-radio') would return 0.
   */
  private _resolveVariant(): 'card' | 'list' {
    if (this.layout !== 'auto') return this.layout;
    const presetCount = this.preset
      ? resolvePresetOptions(this.preset, this.presetVariant).length
      : 0;
    const slottedCount = this._getSlottedChildren('default').filter(
      (n) => n.nodeType === Node.ELEMENT_NODE && (n as Element).tagName === 'CIV-RADIO',
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

    // The radiogroup role lives on the inner div so the optional skip
    // affordance (a toggle-button, not a radio) can sit alongside the radio
    // choices inside the fieldset without joining the mutually-exclusive
    // group.
    const presetOptions = this.preset && this._getSlottedChildren('default').length === 0
      ? resolvePresetOptions(this.preset, this.presetVariant)
      : [];

    const describedBy = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);

    return html`
      <fieldset
        class="civ-fieldset"
        ?disabled="${this.disabled}"
      >
        ${this.legend
          ? renderFormHeader({
              label: renderLegend({ legend: this.legend, required: this.required, showRequired: !this.hideRequiredIndicator && this.required, legendId: this._legendId, headingLevel: this.headingLevel, size: this.size }),
              hintId: this._hintId,
              hint: this.hint,
              errorId: this._errorId,
              error: this.error,
              fieldset: true,
            })
          : nothing}
        <div
          class="${layoutClass}"
          role="radiogroup"
          aria-labelledby="${this.legend ? this._legendId : nothing}"
          aria-orientation="${this.orientation}"
          aria-describedby="${describedBy || nothing}"
          aria-invalid="${this.error ? 'true' : nothing}"
          aria-required="${this.required || nothing}"
        >${presetOptions.map(opt => html`<civ-radio value="${opt.value}" label="${opt.label}"></civ-radio>`)}</div>
        ${this.skipLabel
          ? renderSkipButton({
              label: this.skipLabel,
              isPressed: this.value === this.skipValue,
              onClick: this._onSkipClick,
              disabled: this.disabled,
              extraClass: 'civ-radio-group__skip',
            })
          : nothing}
      </fieldset>
    `;
  }

  private _onSkipClick(): void {
    if (this.disabled) return;
    if (this.value === this.skipValue) return;

    // Uncheck any currently checked radio
    const radios = this._getRadios();
    radios.forEach((r) => {
      r.checked = false;
    });
    this._syncTabindex(radios);

    this.value = this.skipValue;
    this.updateFormValue(this.value);
    dispatch(this, 'civ-input', { value: this.value });
    dispatch(this, 'civ-change', { value: this.value });
    this.sendAnalytics('change', { skipped: true });
  }

  private _getRadios(): CivRadio[] {
    return Array.from(this.querySelectorAll('civ-radio')) as CivRadio[];
  }

  private _getEnabledRadios(): CivRadio[] {
    return this._getRadios().filter((r) => !r.disabled);
  }

  private _syncRadioNames(radios?: CivRadio[]): void {
    if (!this.name) return;
    (radios ?? this._getRadios()).forEach((radio) => {
      radio.name = this.name;
      radio.disableAnalytics = true;
    });
  }

  private _syncRadioChecked(radios?: CivRadio[]): void {
    (radios ?? this._getRadios()).forEach((radio) => {
      radio.checked = radio.value === this.value;
    });
  }

  private _groupDisabledSet = new WeakSet<Element>();

  private _syncRadioDisabled(radios?: CivRadio[]): void {
    this._groupDisabledSet = syncGroupDisabled(radios ?? this._getRadios(), this.disabled, this._groupDisabledSet);
  }

  private _syncRadioRequired(radios?: CivRadio[]): void {
    (radios ?? this._getRadios()).forEach((radio) => {
      radio.required = this.required;
    });
  }

  private _syncRadioTile(radios?: CivRadio[]): void {
    (radios ?? this._getRadios()).forEach((radio) => {
      radio.tile = this.tile;
    });
  }

  private _syncTabindex(radios?: CivRadio[]): void {
    const r = radios ?? this._getRadios();
    const checkedRadio = r.find((radio) => radio.checked);
    const enabledRadios = r.filter((radio) => !radio.disabled);
    const focusTarget =
      checkedRadio && !checkedRadio.disabled
        ? checkedRadio
        : enabledRadios[0];

    r.forEach((item) => {
      item.managedTabIndex = item === focusTarget ? 0 : -1;
    });
  }

  override _onChildChange(e: Event): void {
    const detail = (e as CustomEvent).detail;
    if (detail?.value == null) return;

    // Prevent re-dispatch loop — only handle events from child radios
    if (e.target === this) return;

    this.value = detail.value;
    this.updateFormValue(this.value);

    // Stop the child event and re-dispatch from the group
    e.stopPropagation();
    dispatch(this, 'civ-input', { value: this.value });
    dispatch(this, 'civ-change', { value: this.value });
    this.sendAnalytics('change');
  }

  override _onKeydown(e: KeyboardEvent): void {
    const radios = this._getEnabledRadios();
    if (radios.length === 0) return;

    const currentIndex = radios.findIndex((r) => r.checked);
    const nextIndex = resolveGroupNavIndex(e.key, currentIndex, radios.length, isRtl(this));

    if (nextIndex !== undefined) {
      e.preventDefault();
      const radio = radios[nextIndex];
      radio.checked = true;
      this.value = radio.value;
      this.updateFormValue(this.value);

      // Focus the input inside the radio
      const input = radio.querySelector('input[type="radio"]') as HTMLInputElement | null;
      if (input) input.focus();
      this.announce(radio.label);

      dispatch(this, 'civ-input', { value: this.value });
      dispatch(this, 'civ-change', { value: this.value });
      this.sendAnalytics('change');
    }
  }

  protected override _syncFormValue(): void {
    this.updateFormValue(this.value || null);
  }

  override formResetCallback(): void {
    this.value = this._defaultValue;
    this.error = '';
    const radios = this._getRadios();
    this._syncRadioChecked(radios);
    this._syncTabindex(radios);
    this.updateFormValue(this._defaultValue || '');
    dispatch(this, 'civ-reset');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-radio-group': CivRadioGroup;
  }
}
