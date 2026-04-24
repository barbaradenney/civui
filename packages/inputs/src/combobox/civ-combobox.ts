import { html, nothing, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivFormElement, dispatch, renderLabel, renderHint, renderError, inputClasses, clickOutside, t, interpolate } from '@civui/core';

export interface ComboboxOption {
  value: string;
  label: string;
  group?: string;
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
  @property({ type: String, attribute: 'no-results-text' }) noResultsText = '';

  @state() private _open = false;
  @state() private _filter = '';
  @state() private _activeIndex = -1;

  private _listboxId = this.generateId('listbox');
  private _labelId = this.generateId('label');
  private _clickOutside = clickOutside(this, () => this._setOpen(false));
  private _announceTimer?: ReturnType<typeof setTimeout>;

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._clickOutside.remove();
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
        ${renderLabel({ label: this.label, inputId: this._inputId, required: this.required, showRequired: this.required && !this.hideRequiredIndicator, labelId: this._labelId })}
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
          ${this.value && !this.disabled ? html`
            <button
              type="button"
              class="civ-clear-btn hover:civ-bg-base-lighter focus-visible:civ-focus-ring"
              aria-label="${t('comboboxClearLabel')}"
              @click="${this._onClear}"
            >
              <svg aria-hidden="true" class="civ-w-4 civ-h-4 civ-text-base-dark" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          ` : nothing}

          ${this._open && filtered.length > 0
            ? html`
                <ul
                  id="${this._listboxId}"
                  role="listbox"
                  class="civ-combobox-listbox"
                  aria-labelledby="${this.label ? this._labelId : nothing}"
                >
                  ${this._renderGroupedOptions(filtered)}
                </ul>
              `
            : nothing}
          ${this._open && filtered.length === 0
            ? html`
                <div
                  class="civ-absolute civ-z-10 civ-w-full civ-mt-0.5 civ-bg-white civ-border civ-border-base-light civ-rounded civ-shadow-md civ-p-3 civ-text-body civ-text-muted"
                  role="status"
                  aria-live="polite"
                >
                  ${this.noResultsText || t('comboboxNoResults')}
                </div>
              `
            : nothing}
        </div>
      </div>
    `;
  }

  private _highlightMatch(label: string, filter: string): TemplateResult {
    if (!filter) return html`${label}`;
    const lowerLabel = label.toLowerCase();
    const lowerFilter = filter.toLowerCase();
    const idx = lowerLabel.indexOf(lowerFilter);
    if (idx === -1) return html`${label}`;
    const before = label.substring(0, idx);
    const match = label.substring(idx, idx + filter.length);
    const after = label.substring(idx + filter.length);
    return html`${before}<mark class="civ-combobox-highlight">${match}</mark>${after}`;
  }

  private _renderOption(option: ComboboxOption, i: number): TemplateResult {
    return html`
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
        ${this._highlightMatch(option.label, this._filter)}
      </li>
    `;
  }

  private _renderGroupedOptions(filtered: ComboboxOption[]): TemplateResult {
    // Check if any options have groups
    const hasGroups = filtered.some((o) => o.group);
    if (!hasGroups) {
      return html`${filtered.map((option, i) => this._renderOption(option, i))}`;
    }

    // Group options preserving filtered order
    const grouped = new Map<string, { option: ComboboxOption; index: number }[]>();
    const ungrouped: { option: ComboboxOption; index: number }[] = [];
    for (let i = 0; i < filtered.length; i++) {
      const option = filtered[i];
      if (option.group) {
        if (!grouped.has(option.group)) grouped.set(option.group, []);
        grouped.get(option.group)!.push({ option, index: i });
      } else {
        ungrouped.push({ option, index: i });
      }
    }

    return html`
      ${ungrouped.map(({ option, index }) => this._renderOption(option, index))}
      ${[...grouped.entries()].map(([groupName, items]) => html`
        <div class="civ-combobox-group-header" role="presentation">${groupName}</div>
        ${items.map(({ option, index }) => this._renderOption(option, index))}
      `)}
    `;
  }

  private _setOpen(open: boolean): void {
    if (open === this._open) return;
    this._open = open;
    if (open) {
      this._clickOutside.add();
    } else {
      this._clickOutside.remove();
    }
  }

  private _onClear(): void {
    this.value = '';
    this._filter = '';
    this.updateFormValue('');
    dispatch(this, 'civ-input', { value: '' });
    dispatch(this, 'civ-change', { value: '', label: '' });
    this._setOpen(false);
    // Return focus to the input
    const input = this.querySelector(`#${this._inputId}`) as HTMLInputElement | null;
    input?.focus();
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
          ? (this.noResultsText || t('comboboxNoResults'))
          : interpolate(t(count === 1 ? 'comboboxResultAvailable' : 'comboboxResultsAvailable'), { count }),
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
          this._activeIndex = (this._activeIndex + 1) % filtered.length;
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (!this._open) {
          this._setOpen(true);
        } else {
          // APG: ArrowUp from no selection goes to last item
          this._activeIndex = this._activeIndex <= 0
            ? filtered.length - 1
            : this._activeIndex - 1;
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
        dispatch(this, 'civ-input', { value: this.value });
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
    this.announce(interpolate(t('comboboxSelected'), { label: option.label }));
  }

  override formResetCallback(): void {
    super.formResetCallback();
    const selected = this.options.find((o) => o.value === this._defaultValue);
    this._filter = selected ? selected.label : '';
    this._setOpen(false);
    this._activeIndex = -1;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-combobox': CivCombobox;
  }
}
