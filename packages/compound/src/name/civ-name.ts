import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivCompoundElement, LegendHeadingMixin, renderLegend, renderFormHeader, buildDescribedBy, t } from '@civui/core';
import type { LabelSize, SelectLike } from '@civui/core';
import { resolvePresetOptions } from '@civui/core';
import '@civui/inputs/text-input';
import '@civui/inputs/select';

export interface NameValue {
  first: string;
  middle: string;
  last: string;
  suffix: string;
}

const SUFFIX_OPTIONS = resolvePresetOptions('suffix');

const EMPTY_NAME: NameValue = { first: '', middle: '', last: '', suffix: '' };

/**
 * CivUI Name
 *
 * Compound name input with first, middle (optional), last, and suffix fields.
 * Follows VA.gov name pattern with plain language labels and character validation.
 *
 * @element civ-name
 *
 * @example
 * ```html
 * <civ-name legend="Your name" name="veteranName" required></civ-name>
 * ```
 *
 * @fires civ-input - On every field change, detail: { value: NameValue }
 * @fires civ-change - On committed field change, detail: { value: NameValue }
 */
@customElement('civ-name')
export class CivName extends LegendHeadingMixin(CivCompoundElement) {
  protected override _empty: NameValue = { ...EMPTY_NAME };
  @state() protected override _data: NameValue = { ...EMPTY_NAME };

  /**
   * Fieldset legend displayed above the name fields. This component is
   * self-contained — render it on its own, not inside `<civ-fieldset>`,
   * or you'll get two stacked legends.
   */
  @property({ type: String }) legend = '';

  /**
   * Size defaults to `md` so the compound field reads as a section
   * heading above its sub-inputs (overrides the mixin's `undefined`
   * default). `sm` renders at body size; `lg`/`xl` step up further.
   */
  override size: LabelSize = 'md';

  // headingLevel inherited from LegendHeadingMixin (default: undefined).

  /** Whether to show the middle name field. */
  @property({ type: Boolean, attribute: 'show-middle' }) showMiddle = true;

  /** Whether to show the suffix field. */
  @property({ type: Boolean, attribute: 'show-suffix' }) showSuffix = true;

  /** Error for first name field. */
  @property({ type: String, attribute: 'first-error' }) firstError = '';

  /** Error for middle name field. */
  @property({ type: String, attribute: 'middle-error' }) middleError = '';

  /** Error for last name field. */
  @property({ type: String, attribute: 'last-error' }) lastError = '';

  /** Get the current name as a structured object. */
  get nameValue(): NameValue {
    return { ...this._data };
  }

  /** Set the name from a structured object. */
  set nameValue(val: NameValue) {
    this._data = { ...val };
    this.value = JSON.stringify(this._data);
  }

  override firstUpdated(): void {
    super.firstUpdated();
    this._syncSuffixOptions();
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('_data') || changed.has('showSuffix')) {
      this._syncSuffixOptions();
    }
  }

  /** Set suffix options on the select sub-component after render. */
  private _syncSuffixOptions(): void {
    const suffixSelect = this.querySelector('[data-name-suffix]') as SelectLike | null;
    if (suffixSelect) suffixSelect.options = SUFFIX_OPTIONS;
  }

  override render() {
    const describedBy = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);
    const firstLabel = t('nameFirst');
    const lastLabel = t('nameLast');

    return html`
      <fieldset
        class="civ-fieldset"
        aria-describedby="${describedBy || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        ?disabled="${this.disabled}"
      >
        ${renderFormHeader({ label: renderLegend({ legend: this.legend || this.label, required: this.required, showRequired: false, headingLevel: this.headingLevel, size: this.size }), hintId: this._hintId, hint: this.hint, errorId: this._errorId, error: this.error, fieldset: true })}

        <civ-text-input
          label="${firstLabel}"
          name="${this.name ? `${this.name}.first` : ''}"
          value="${this._data.first}"
          error="${this.firstError}"
          autocomplete="given-name"
          ?required="${this.required}"
          ?disabled="${this.disabled}"
          ?readonly="${this.readonly}"
          @civ-input="${(e: CustomEvent) => this._onSubInput('first', e)}"
          @civ-change="${(e: CustomEvent) => this._onSubChange('first', e)}"
        ></civ-text-input>

        ${this.showMiddle ? html`
          <civ-text-input
            label="${t('nameMiddle')}"
            name="${this.name ? `${this.name}.middle` : ''}"
            value="${this._data.middle}"
            error="${this.middleError}"
            autocomplete="additional-name"
            ?disabled="${this.disabled}"
            ?readonly="${this.readonly}"
            @civ-input="${(e: CustomEvent) => this._onSubInput('middle', e)}"
            @civ-change="${(e: CustomEvent) => this._onSubChange('middle', e)}"
          ></civ-text-input>
        ` : nothing}

        <civ-text-input
          label="${lastLabel}"
          name="${this.name ? `${this.name}.last` : ''}"
          value="${this._data.last}"
          error="${this.lastError}"
          autocomplete="family-name"
          ?required="${this.required}"
          ?disabled="${this.disabled}"
          ?readonly="${this.readonly}"
          @civ-input="${(e: CustomEvent) => this._onSubInput('last', e)}"
          @civ-change="${(e: CustomEvent) => this._onSubChange('last', e)}"
        ></civ-text-input>

        ${this.showSuffix ? html`
          <div class="civ-field-width-sm">
            <civ-select
              label="${t('nameSuffix')}"
              name="${this.name ? `${this.name}.suffix` : ''}"
              value="${this._data.suffix}"
              autocomplete="honorific-suffix"
              ?disabled="${this.disabled}"
              ?readonly="${this.readonly}"
              data-name-suffix
              @civ-change="${(e: CustomEvent) => this._onSubSelectChange('suffix', e)}"
            ></civ-select>
          </div>
        ` : nothing}
      </fieldset>
    `;
  }

  /** Combined handler for select sub-fields (fires both civ-input and civ-change in one update). */
  private _onSubSelectChange(field: keyof NameValue, e: CustomEvent<{ value: string }>): void {
    e.stopPropagation();
    this._data = this._patchStructured(this._data, { [field]: e.detail.value } as Partial<NameValue>, ['input', 'change']);
  }

  /**
   * A name is considered complete when both the first and last fields
   * are filled. Middle and suffix remain optional.
   */
  private _isComplete(): boolean {
    return !!(this._data.first.trim() && this._data.last.trim());
  }

  protected override get _fieldName(): string {
    return this.legend || super._fieldName;
  }

  protected override _updateValidity(): void {
    if (!this._setRequiredCompoundValidity(this._isComplete())) {
      this._setValidity({});
    }
  }

  override formResetCallback(): void {
    this._data = { ...EMPTY_NAME };
    this._resetCompound(['firstError', 'middleError', 'lastError']);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-name': CivName;
  }
}
