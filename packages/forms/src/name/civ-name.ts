import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivFormElement, dispatch, renderLegend, renderHint, renderError, inputClasses, buildDescribedBy, t } from '@civui/core';

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

  private _firstId = this.generateId('first');
  private _middleId = this.generateId('middle');
  private _lastId = this.generateId('last');
  private _suffixId = this.generateId('suffix');
  private _firstErrId = this.generateId('first-err');
  private _middleErrId = this.generateId('middle-err');
  private _lastErrId = this.generateId('last-err');

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
    if (this.value) {
      try {
        this._name = { ...EMPTY_NAME, ...JSON.parse(this.value) };
      } catch { /* leave empty */ }
    }
  }

  override render() {
    const classes = inputClasses();
    const selectClasses = inputClasses({ extra: ['civ-select-field'] });
    const describedBy = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);

    return html`
      <fieldset
        class="civ-fieldset"
        aria-describedby="${describedBy || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        ?disabled="${this.disabled}"
      >
        ${renderLegend({ legend: this.legend || this.label, required: this.required, textSizeClass: 'civ-text-lg' })}
        ${renderHint(this._hintId, this.hint, true)}
        ${renderError(this._errorId, this.error, true)}

        <div class="civ-mb-3">
          <label class="civ-label" for="${this._firstId}">
            ${t('nameFirst')}
            ${this.required ? html`<span class="civ-sr-only">${t('required')}</span>` : nothing}
          </label>
          ${renderError(this._firstErrId, this.firstError)}
          <input
            type="text"
            class="${classes}"
            id="${this._firstId}"
            name="${this.name ? `${this.name}.first` : nothing}"
            .value="${this._name.first}"
            autocomplete="given-name"
            ?required="${this.required}"
            ?disabled="${this.disabled}"
            ?readonly="${this.readonly}"
            aria-required="${this.required || nothing}"
            aria-invalid="${this.firstError ? 'true' : nothing}"
            aria-describedby="${this.firstError ? this._firstErrId : nothing}"
            @input="${(e: Event) => this._onFieldInput('first', e)}"
            @change="${(e: Event) => this._onFieldChange('first', e)}"
          />
        </div>

        ${this.showMiddle ? html`
          <div class="civ-mb-3">
            <label class="civ-label" for="${this._middleId}">${t('nameMiddle')}</label>
            ${renderError(this._middleErrId, this.middleError)}
            <input
              type="text"
              class="${classes}"
              id="${this._middleId}"
              name="${this.name ? `${this.name}.middle` : nothing}"
              .value="${this._name.middle}"
              autocomplete="additional-name"
              ?disabled="${this.disabled}"
              ?readonly="${this.readonly}"
              aria-invalid="${this.middleError ? 'true' : nothing}"
              aria-describedby="${this.middleError ? this._middleErrId : nothing}"
              @input="${(e: Event) => this._onFieldInput('middle', e)}"
              @change="${(e: Event) => this._onFieldChange('middle', e)}"
            />
          </div>
        ` : nothing}

        <div class="civ-mb-3">
          <label class="civ-label" for="${this._lastId}">
            ${t('nameLast')}
            ${this.required ? html`<span class="civ-sr-only">${t('required')}</span>` : nothing}
          </label>
          ${renderError(this._lastErrId, this.lastError)}
          <input
            type="text"
            class="${classes}"
            id="${this._lastId}"
            name="${this.name ? `${this.name}.last` : nothing}"
            .value="${this._name.last}"
            autocomplete="family-name"
            ?required="${this.required}"
            ?disabled="${this.disabled}"
            ?readonly="${this.readonly}"
            aria-required="${this.required || nothing}"
            aria-invalid="${this.lastError ? 'true' : nothing}"
            aria-describedby="${this.lastError ? this._lastErrId : nothing}"
            @input="${(e: Event) => this._onFieldInput('last', e)}"
            @change="${(e: Event) => this._onFieldChange('last', e)}"
          />
        </div>

        ${this.showSuffix ? html`
          <div class="civ-mb-3" style="max-width:10rem">
            <label class="civ-label" for="${this._suffixId}">${t('nameSuffix')}</label>
            <select
              class="${selectClasses}"
              id="${this._suffixId}"
              name="${this.name ? `${this.name}.suffix` : nothing}"
              .value="${this._name.suffix}"
              autocomplete="honorific-suffix"
              ?disabled="${this.disabled || this.readonly}"
              @change="${(e: Event) => { this._onFieldInput('suffix', e); this._onFieldChange('suffix', e); }}"
            >
              <option value="">${t('selectEmpty')}</option>
              ${SUFFIX_OPTIONS.map(s => html`
                <option value="${s.value}" ?selected="${s.value === this._name.suffix}">${s.label}</option>
              `)}
            </select>
          </div>
        ` : nothing}
      </fieldset>
    `;
  }

  private _onFieldInput(field: keyof NameValue, e: Event): void {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    this._name = { ...this._name, [field]: target.value };
    this.value = JSON.stringify(this._name);
    dispatch(this, 'civ-input', { value: { ...this._name } });
  }

  private _onFieldChange(field: keyof NameValue, e: Event): void {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    this._name = { ...this._name, [field]: target.value };
    this.value = JSON.stringify(this._name);
    dispatch(this, 'civ-change', { value: { ...this._name } });
    this.sendAnalytics('change');
  }

  protected override _syncFormValue(): void {
    const fd = new FormData();
    const prefix = this.name || 'name';
    fd.append(`${prefix}.first`, this._name.first);
    fd.append(`${prefix}.middle`, this._name.middle);
    fd.append(`${prefix}.last`, this._name.last);
    fd.append(`${prefix}.suffix`, this._name.suffix);
    this.updateFormValue(fd);
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
