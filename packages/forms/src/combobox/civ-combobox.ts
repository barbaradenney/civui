import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivFormElement } from '@civui/core';

export interface ComboboxOption {
  value: string;
  label: string;
}

/**
 * CivUI Combobox
 *
 * Accessible combobox (autocomplete) with text input and filterable
 * dropdown listbox. Implements the ARIA combobox pattern with
 * keyboard navigation (Arrow keys, Enter, Escape).
 *
 * @element civ-combobox
 *
 * @prop {string} label - Label text
 * @prop {string} name - Form field name
 * @prop {string} value - Selected value
 * @prop {string} hint - Hint text
 * @prop {string} error - Error message
 * @prop {ComboboxOption[]} options - Available options
 * @prop {string} placeholder - Placeholder text
 * @prop {boolean} required - Whether a selection is required
 * @prop {boolean} disabled - Whether the combobox is disabled
 *
 * @fires civ-change - When a selection is made
 * @fires civ-input - When the filter text changes
 */
@customElement('civ-combobox')
export class CivCombobox extends CivFormElement {
  @property({ type: Array }) options: ComboboxOption[] = [];
  @property({ type: String }) placeholder = '';
  @property({ type: String, attribute: 'no-results-text' }) noResultsText = 'No results found';

  @state() private _open = false;
  @state() private _filter = '';
  @state() private _activeIndex = -1;

  private _listboxId = this.generateId('listbox');
  private _labelId = this.generateId('label');
  private _boundDocClick = this._onDocumentClick.bind(this);

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('click', this._boundDocClick);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('click', this._boundDocClick);
  }

  private get _filteredOptions(): ComboboxOption[] {
    if (!this._filter) return this.options;
    const lower = this._filter.toLowerCase();
    return this.options.filter((o) => o.label.toLowerCase().includes(lower));
  }

  private get _displayValue(): string {
    if (this._open) return this._filter;
    const selected = this.options.find((o) => o.value === this.value);
    return selected ? selected.label : this._filter;
  }

  override render() {
    const filtered = this._filteredOptions;
    const activeOptionId =
      this._activeIndex >= 0 && this._activeIndex < filtered.length
        ? `${this._listboxId}-option-${this._activeIndex}`
        : '';

    const inputClasses = [
      'civ-block',
      'civ-w-full',
      'civ-border',
      'civ-rounded',
      'civ-px-2',
      'civ-py-1.5',
      'civ-text-base',
      'civ-font-sans',
      'civ-text-base-darkest',
      'civ-bg-white',
      this.error ? 'civ-border-error civ-border-l-4' : 'civ-border-base-light',
      this.disabled ? 'civ-opacity-50 civ-cursor-not-allowed civ-bg-base-lightest' : '',
      'focus-visible:civ-focus-ring',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <div class="civ-mb-4 civ-relative">
        ${this.label
          ? html`
              <label
                id="${this._labelId}"
                class="civ-block civ-mb-1 civ-text-base-darkest civ-font-bold civ-text-base"
                for="${this._inputId}"
              >
                ${this.label}
                ${this.required
                  ? html`<abbr class="civ-text-error civ-no-underline" title="required">*</abbr>`
                  : nothing}
              </label>
            `
          : nothing}
        ${this.hint
          ? html`<span class="civ-block civ-mb-1 civ-text-sm civ-text-base" id="${this._hintId}">${this.hint}</span>`
          : nothing}
        ${this.error
          ? html`<span class="civ-block civ-mb-1 civ-text-sm civ-text-error civ-font-bold" id="${this._errorId}" role="alert">${this.error}</span>`
          : nothing}

        <div class="civ-relative" data-civ-combobox>
          <input
            class="${inputClasses}"
            id="${this._inputId}"
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded="${this._open}"
            aria-controls="${this._listboxId}"
            aria-activedescendant="${activeOptionId || nothing}"
            aria-describedby="${this._ariaDescribedBy || nothing}"
            aria-invalid="${this.error ? 'true' : 'false'}"
            .value="${this._displayValue}"
            placeholder="${this.placeholder || nothing}"
            ?disabled="${this.disabled}"
            ?required="${this.required}"
            aria-required="${this.required}"
            autocomplete="off"
            @input="${this._onFilterInput}"
            @focus="${this._onFocus}"
            @keydown="${this._onKeydown}"
          />

          ${this._open && filtered.length > 0
            ? html`
                <ul
                  id="${this._listboxId}"
                  role="listbox"
                  class="civ-absolute civ-z-10 civ-w-full civ-mt-0.5 civ-bg-white civ-border civ-border-base-light civ-rounded civ-shadow-md civ-max-h-60 civ-overflow-y-auto civ-list-none civ-p-0 civ-m-0"
                  aria-labelledby="${this._labelId}"
                >
                  ${filtered.map(
                    (option, i) => html`
                      <li
                        id="${this._listboxId}-option-${i}"
                        role="option"
                        class="civ-px-3 civ-py-2 civ-text-base civ-cursor-pointer
                          ${i === this._activeIndex
                            ? 'civ-bg-primary civ-text-white'
                            : 'hover:civ-bg-base-lightest'}
                          ${option.value === this.value && i !== this._activeIndex
                            ? 'civ-font-bold'
                            : ''}"
                        aria-selected="${option.value === this.value}"
                        data-active="${i === this._activeIndex || nothing}"
                        @click="${() => this._selectOption(option)}"
                        @mouseenter="${() => { this._activeIndex = i; }}"
                      >
                        ${option.label}
                      </li>
                    `,
                  )}
                </ul>
              `
            : nothing}
          ${this._open && filtered.length === 0
            ? html`
                <div
                  class="civ-absolute civ-z-10 civ-w-full civ-mt-0.5 civ-bg-white civ-border civ-border-base-light civ-rounded civ-shadow-md civ-p-3 civ-text-base civ-text-base-dark"
                  role="status"
                  aria-live="polite"
                >
                  ${this.noResultsText}
                </div>
              `
            : nothing}
        </div>
      </div>
    `;
  }

  private _onFilterInput(e: Event): void {
    const target = e.target as HTMLInputElement;
    this._filter = target.value;
    this._open = true;
    this._activeIndex = -1;
    // Clear the selected value when typing
    this.value = '';
    this.updateFormValue('');
    this.dispatchEvent(
      new CustomEvent('civ-input', {
        detail: { filter: this._filter },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onFocus(): void {
    if (!this.disabled) {
      this._open = true;
    }
  }

  private _onKeydown(e: KeyboardEvent): void {
    const filtered = this._filteredOptions;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!this._open) {
          this._open = true;
        } else {
          this._activeIndex = Math.min(this._activeIndex + 1, filtered.length - 1);
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (!this._open) {
          this._open = true;
        } else {
          this._activeIndex = Math.max(this._activeIndex - 1, 0);
        }
        break;

      case 'Enter':
        e.preventDefault();
        if (this._open && this._activeIndex >= 0 && this._activeIndex < filtered.length) {
          this._selectOption(filtered[this._activeIndex]);
        }
        break;

      case 'Escape':
        this._open = false;
        this._activeIndex = -1;
        break;

      case 'Tab':
        this._open = false;
        break;
    }
  }

  private _selectOption(option: ComboboxOption): void {
    this.value = option.value;
    this._filter = option.label;
    this._open = false;
    this._activeIndex = -1;
    this.updateFormValue(this.value);
    this.dispatchEvent(
      new CustomEvent('civ-change', {
        detail: { value: this.value, label: option.label },
        bubbles: true,
        composed: true,
      }),
    );
    this.sendAnalytics('select');
  }

  private _onDocumentClick(e: MouseEvent): void {
    const path = e.composedPath();
    if (!path.includes(this)) {
      this._open = false;
    }
  }

  override formResetCallback(): void {
    this.value = '';
    this._filter = '';
    this._open = false;
    this._activeIndex = -1;
    this.error = '';
    this.updateFormValue('');
    this.dispatchEvent(new CustomEvent('civ-reset', { bubbles: true, composed: true }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-combobox': CivCombobox;
  }
}
