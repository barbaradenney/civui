import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivFormElement, dispatch, renderLabel, renderHint, renderError, inputClasses } from '@civui/core';

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
 * @fires civ-change - When a selection is made, detail: { value, label }
 * @fires civ-input - When the filter text changes, detail: { value }
 * @fires civ-analytics - Analytics tracking event on change
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
  private _announceTimer?: ReturnType<typeof setTimeout>;

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('click', this._boundDocClick);
    clearTimeout(this._announceTimer);
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

    const classes = inputClasses();

    return html`
      <div class="civ-mb-4 civ-relative">
        ${renderLabel({ label: this.label, inputId: this._inputId, required: this.required, labelId: this._labelId })}
        ${renderHint(this._hintId, this.hint)}
        ${renderError(this._errorId, this.error)}

        <div class="civ-relative" data-civ-combobox>
          <input
            class="${classes}"
            id="${this._inputId}"
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-expanded="${this._open}"
            aria-controls="${this._open ? this._listboxId : nothing}"
            aria-activedescendant="${this._open && activeOptionId ? activeOptionId : nothing}"
            aria-describedby="${this._ariaDescribedBy || nothing}"
            aria-invalid="${this.error ? 'true' : nothing}"
            .value="${this._displayValue}"
            placeholder="${this.placeholder || nothing}"
            ?disabled="${this.disabled}"
            ?required="${this.required}"
            aria-required="${this.required || nothing}"
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
                  class="civ-combobox-listbox"
                  aria-labelledby="${this.label ? this._labelId : nothing}"
                >
                  ${filtered.map(
                    (option, i) => html`
                      <li
                        id="${this._listboxId}-option-${i}"
                        role="option"
                        class="civ-combobox-option
                          ${i !== this._activeIndex ? 'hover:civ-bg-base-lightest' : ''}
                          ${option.value === this.value && i !== this._activeIndex
                            ? 'civ-font-bold'
                            : ''}"
                        aria-selected="${option.value === this.value}"
                        data-active="${i === this._activeIndex ? '' : nothing}"
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

  private _setOpen(open: boolean): void {
    if (open === this._open) return;
    this._open = open;
    if (open) {
      document.addEventListener('click', this._boundDocClick);
    } else {
      document.removeEventListener('click', this._boundDocClick);
    }
  }

  private _onFilterInput(e: Event): void {
    const target = e.target as HTMLInputElement;
    this._filter = target.value;
    this._setOpen(true);
    this._activeIndex = -1;
    // Clear the selected value when the user types — filtering invalidates
    // the previous selection. A new selection is committed via _selectOption().
    this.value = '';
    this.updateFormValue('');
    dispatch(this, 'civ-input', { value: this._filter });

    // Announce filtered results count for screen readers (debounced)
    clearTimeout(this._announceTimer);
    this._announceTimer = setTimeout(() => {
      const count = this._filteredOptions.length;
      this.announce(
        count === 0
          ? this.noResultsText
          : `${count} ${count === 1 ? 'result' : 'results'} available`,
      );
    }, 300);
  }

  private _onFocus(): void {
    if (!this.disabled) {
      this._setOpen(true);
    }
  }

  private _onKeydown(e: KeyboardEvent): void {
    const filtered = this._filteredOptions;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!this._open) {
          this._setOpen(true);
        } else {
          this._activeIndex = Math.min(this._activeIndex + 1, filtered.length - 1);
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (!this._open) {
          this._setOpen(true);
        } else {
          this._activeIndex = Math.max(this._activeIndex - 1, 0);
        }
        break;

      case 'Home':
        if (this._open && filtered.length > 0) {
          e.preventDefault();
          this._activeIndex = 0;
        }
        break;

      case 'End':
        if (this._open && filtered.length > 0) {
          e.preventDefault();
          this._activeIndex = filtered.length - 1;
        }
        break;

      case 'Enter':
        if (this._open && this._activeIndex >= 0 && this._activeIndex < filtered.length) {
          e.preventDefault();
          this._selectOption(filtered[this._activeIndex]);
        }
        break;

      case 'Escape': {
        // Restore display to the currently selected option's label
        const selected = this.options.find((o) => o.value === this.value);
        this._filter = selected ? selected.label : '';
        this._setOpen(false);
        this._activeIndex = -1;
        break;
      }

      case 'Tab':
        this._setOpen(false);
        break;
    }
  }

  private _selectOption(option: ComboboxOption): void {
    this.value = option.value;
    this._filter = option.label;
    this._setOpen(false);
    this._activeIndex = -1;
    this.updateFormValue(this.value);
    dispatch(this, 'civ-change', { value: this.value, label: option.label });
    this.sendAnalytics('select');
    this.announce(`${option.label}, selected`);
  }

  private _onDocumentClick(e: MouseEvent): void {
    const path = e.composedPath();
    if (!path.includes(this)) {
      this._setOpen(false);
    }
  }

  override formResetCallback(): void {
    this.value = this._defaultValue;
    const selected = this.options.find((o) => o.value === this._defaultValue);
    this._filter = selected ? selected.label : '';
    this._setOpen(false);
    this._activeIndex = -1;
    this.error = '';
    this.updateFormValue(this._defaultValue || '');
    dispatch(this, 'civ-reset');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-combobox': CivCombobox;
  }
}
