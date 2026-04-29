// Schema: packages/schema/src/components/civ-select.schema.ts

import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivFormElement, dispatch, inputClasses, inputWidthClass, t, resolvePresetOptions } from '@civui/core';
import type { InputWidth, SelectPresetName } from '@civui/core';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

/**
 * CivUI Select
 *
 * Accessible dropdown select with label, hint, error, and option list.
 * Uses native <select> on web for maximum accessibility.
 *
 * Options can be supplied two ways:
 *   1. The `options` JS property — best for dynamic lists.
 *   2. Slotted `<option>` and `<optgroup>` children — best for static
 *      declarative HTML and SSR. Read once on `connectedCallback` if
 *      the `options` property hasn't been populated.
 *
 * @element civ-select
 *
 * @example
 * ```html
 * <civ-select label="State" name="state">
 *   <option value="CA">California</option>
 *   <optgroup label="Pacific">
 *     <option value="OR">Oregon</option>
 *     <option value="WA" selected>Washington</option>
 *   </optgroup>
 * </civ-select>
 * ```
 */
@customElement('civ-select')
export class CivSelect extends CivFormElement {
  @property({ type: Array }) options: SelectOption[] = [];
  @property({ type: String, attribute: 'empty-label' }) emptyLabel: string = '';
  @property({ type: String }) width: InputWidth = 'default';
  @property({ type: String }) autocomplete = '';

  /**
   * Pre-populate options from a built-in data set. Available presets:
   * `us-state`, `service-branch`, `discharge-type`, `suffix`,
   * `relationship-type`, `marital-status`, `ethnicity`, `gender`, `language`,
   * `housing-status`, `education-level`, `employment-status`, `income-source`,
   * `veteran-status`, `disability-type`, `citizenship-status`,
   * `pay-frequency`, `contact-preference`.
   */
  @property({ type: String }) preset?: SelectPresetName;

  /**
   * Variant for presets with multiple tiers:
   * - service-branch: `"reserve"`, `"historical"`, `"all"`
   * - relationship-type: `"detailed"`, `"dependent"`, `"survivor"`
   * - gender: `"binary"`
   * - us-state: `"territories"`
   */
  @property({ type: String, attribute: 'preset-variant' }) presetVariant?: string;

  override connectedCallback(): void {
    super.connectedCallback();
    // Light DOM: original <option>/<optgroup> children would remain in the
    // host alongside the rendered template. Capture their data into
    // `options` (only when the property hasn't been populated otherwise),
    // then strip them so they don't double-render.
    if (this.options.length === 0) {
      const slotted = this._readSlottedOptions();
      if (slotted.options.length > 0) {
        this.options = slotted.options;
        if (!this.value && slotted.selected) {
          this.value = slotted.selected;
        }
      }
    }
    // Always strip any stray <option>/<optgroup> direct children so they
    // don't ghost behind the rendered <select>. Safe to run even when
    // the property took precedence — those children would never render.
    for (const child of Array.from(this.children)) {
      if (child.tagName === 'OPTION' || child.tagName === 'OPTGROUP') {
        child.remove();
      }
    }
    // Apply preset options (after slotted options, so explicit children win)
    if (this.preset && this.options.length === 0) {
      this.options = resolvePresetOptions(this.preset, this.presetVariant);
    }
  }

  /**
   * Read slotted `<option>` / `<optgroup>` children into a SelectOption[].
   * Honors `selected` (returns the first one as `selected`), `disabled`,
   * and the optgroup's `label` (mapped to the option's `group` field).
   */
  private _readSlottedOptions(): { options: SelectOption[]; selected: string } {
    const opts: SelectOption[] = [];
    let selected = '';
    for (const child of Array.from(this.children)) {
      if (child.tagName === 'OPTION') {
        const o = child as HTMLOptionElement;
        opts.push({
          value: o.value,
          label: (o.textContent ?? '').trim() || o.value,
          ...(o.disabled ? { disabled: true } : {}),
        });
        if (!selected && o.hasAttribute('selected')) selected = o.value;
      } else if (child.tagName === 'OPTGROUP') {
        const groupLabel = (child as HTMLElement).getAttribute('label') ?? '';
        for (const grandchild of Array.from(child.children)) {
          if (grandchild.tagName !== 'OPTION') continue;
          const o = grandchild as HTMLOptionElement;
          opts.push({
            value: o.value,
            label: (o.textContent ?? '').trim() || o.value,
            ...(o.disabled ? { disabled: true } : {}),
            ...(groupLabel ? { group: groupLabel } : {}),
          });
          if (!selected && o.hasAttribute('selected')) selected = o.value;
        }
      }
    }
    return { options: opts, selected };
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if ((changed.has('preset') || changed.has('presetVariant')) && this.preset) {
      this.options = resolvePresetOptions(this.preset, this.presetVariant);
    }
    if (changed.has('options') && this.value) {
      const select = this.querySelector('select') as HTMLSelectElement | null;
      if (select && select.value !== this.value) {
        select.value = this.value;
      }
    }
  }

  override render() {
    const widthClass = inputWidthClass(this.width);
    const classes = inputClasses({
      extra: ['civ-select-field', widthClass, 'civ-max-w-full'],
    });

    return html`
        <select
          class="${classes}"
          id="${this._inputId}"
          name="${this.name}"
          .value="${this.value}"
          ?disabled="${this.disabled || this.readonly}"
          ?required="${this.required}"
          aria-required="${this.required || nothing}"
          autocomplete="${this.autocomplete || nothing}"
          aria-describedby="${this._ariaDescribedBy || nothing}"
          aria-invalid="${this.error ? 'true' : nothing}"
          @change="${this._onSelectChange}"
        >
          <option value="">${this.emptyLabel || t('selectEmpty')}</option>
          ${this._renderGroupedOptions()}
        </select>
    `;
  }

  private _renderOption(opt: SelectOption) {
    return html`
      <option
        value="${opt.value}"
        ?selected="${opt.value === this.value}"
        ?disabled="${opt.disabled ?? false}"
      >
        ${opt.label}
      </option>
    `;
  }

  private _renderGroupedOptions() {
    const grouped = new Map<string, SelectOption[]>();
    const ungrouped: SelectOption[] = [];
    for (const opt of this.options) {
      if (opt.group) {
        if (!grouped.has(opt.group)) grouped.set(opt.group, []);
        grouped.get(opt.group)!.push(opt);
      } else {
        ungrouped.push(opt);
      }
    }

    return html`
      ${ungrouped.map((opt) => this._renderOption(opt))}
      ${[...grouped.entries()].map(([group, opts]) => html`
        <optgroup label="${group}">
          ${opts.map((opt) => this._renderOption(opt))}
        </optgroup>
      `)}
    `;
  }

  private _onSelectChange(e: Event): void {
    const target = e.target as HTMLSelectElement;
    this.value = target.value;
    dispatch(this, 'civ-input', { value: this.value });
    dispatch(this, 'civ-change', { value: this.value });
    this.sendAnalytics('change');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-select': CivSelect;
  }
}
