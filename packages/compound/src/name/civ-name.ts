import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivFormElement, dispatch, renderLegend, renderHint, renderError, buildDescribedBy, interpolate, t } from '@civui/core';
import '@civui/inputs';

export interface NameValue {
  first: string;
  middle: string;
  last: string;
  suffix: string;
}

const SUFFIX_OPTIONS = [
  { value: 'Jr.', label: 'Jr.' },
  { value: 'Sr.', label: 'Sr.' },
  { value: 'II', label: 'II' },
  { value: 'III', label: 'III' },
  { value: 'IV', label: 'IV' },
];

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
export class CivName extends CivFormElement {
  /** Fieldset legend displayed above the name fields. */
  @property({ type: String }) legend = '';

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

  @state() private _name: NameValue = { ...EMPTY_NAME };

  /** Get the current name as a structured object. */
  get nameValue(): NameValue {
    return { ...this._name };
  }

  /** Set the name from a structured object. */
  set nameValue(val: NameValue) {
    this._name = { ...val };
    this.value = JSON.stringify(this._name);
  }

  override firstUpdated(): void {
    super.firstUpdated();
    this._name = this.parseStructuredValue(this.value, EMPTY_NAME);
    this._syncSuffixOptions();
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('_name') || changed.has('showSuffix')) {
      this._syncSuffixOptions();
    }
  }

  /** Set suffix options on the select sub-component after render. */
  private _syncSuffixOptions(): void {
    const suffixSelect = this.querySelector('[data-name-suffix]') as any;
    if (suffixSelect) suffixSelect.options = SUFFIX_OPTIONS;
  }

  override render() {
    const describedBy = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);

    return html`
      <fieldset
        class="civ-fieldset"
        aria-describedby="${describedBy || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        aria-required="${this.required || nothing}"
        ?disabled="${this.disabled}"
      >
        ${renderLegend({ legend: this.legend || this.label, required: this.required, textSizeClass: 'civ-text-lg' })}
        ${renderHint(this._hintId, this.hint, true)}
        ${renderError(this._errorId, this.error, true)}

        <civ-text-input
          label="${t('nameFirst')}"
          name="${this.name ? `${this.name}.first` : ''}"
          value="${this._name.first}"
          error="${this.firstError}"
          autocomplete="given-name"
          ?disabled="${this.disabled}"
          ?readonly="${this.readonly}"
          @civ-input="${(e: CustomEvent) => this._onSubInput('first', e)}"
          @civ-change="${(e: CustomEvent) => this._onSubChange('first', e)}"
        ></civ-text-input>

        ${this.showMiddle ? html`
          <civ-text-input
            label="${t('nameMiddle')}"
            name="${this.name ? `${this.name}.middle` : ''}"
            value="${this._name.middle}"
            error="${this.middleError}"
            autocomplete="additional-name"
            ?disabled="${this.disabled}"
            ?readonly="${this.readonly}"
            @civ-input="${(e: CustomEvent) => this._onSubInput('middle', e)}"
            @civ-change="${(e: CustomEvent) => this._onSubChange('middle', e)}"
          ></civ-text-input>
        ` : nothing}

        <civ-text-input
          label="${t('nameLast')}"
          name="${this.name ? `${this.name}.last` : ''}"
          value="${this._name.last}"
          error="${this.lastError}"
          autocomplete="family-name"
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
              value="${this._name.suffix}"
              ?disabled="${this.disabled}"
              data-name-suffix
              @civ-change="${(e: CustomEvent) => this._onSubSelectChange('suffix', e)}"
            ></civ-select>
          </div>
        ` : nothing}
      </fieldset>
    `;
  }

  private _onSubInput(field: keyof NameValue, e: CustomEvent<{ value: string }>): void {
    e.stopPropagation();
    this._name = { ...this._name, [field]: e.detail.value };
    this.value = JSON.stringify(this._name);
    dispatch(this, 'civ-input', { value: { ...this._name } });
  }

  private _onSubChange(field: keyof NameValue, e: CustomEvent<{ value: string }>): void {
    e.stopPropagation();
    this._name = { ...this._name, [field]: e.detail.value };
    this.value = JSON.stringify(this._name);
    dispatch(this, 'civ-change', { value: { ...this._name } });
  }

  /** Combined handler for select sub-fields (fires both civ-input and civ-change in one update). */
  private _onSubSelectChange(field: keyof NameValue, e: CustomEvent<{ value: string }>): void {
    e.stopPropagation();
    this._name = { ...this._name, [field]: e.detail.value };
    this.value = JSON.stringify(this._name);
    dispatch(this, 'civ-input', { value: { ...this._name } });
    dispatch(this, 'civ-change', { value: { ...this._name } });
  }

  protected override _syncFormValue(): void {
    this.syncFormDataFromState(this._name, this.name || 'name');
  }

  /**
   * A name is considered complete when both the first and last fields
   * are filled. Middle and suffix remain optional.
   */
  private _isComplete(): boolean {
    return !!(this._name.first.trim() && this._name.last.trim());
  }

  protected override _updateValidity(): void {
    if (this.required && !this._isComplete()) {
      const label = this.legend || this.label || t('fieldFallbackLabel');
      const anchor = this.querySelector('input, select, textarea') as HTMLElement | null;
      this._setValidity(
        { valueMissing: true },
        this.error || interpolate(this.requiredMessage || t('fieldRequired'), { label }),
        anchor ?? undefined,
      );
    } else {
      this._setValidity({});
    }
  }

  override formResetCallback(): void {
    this._name = { ...EMPTY_NAME };
    this.value = '';
    this.error = '';
    this.firstError = '';
    this.middleError = '';
    this.lastError = '';
    this.updateFormValue(null);
    dispatch(this, 'civ-reset');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-name': CivName;
  }
}
