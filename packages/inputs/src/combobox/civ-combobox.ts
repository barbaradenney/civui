import { html, nothing, type TemplateResult } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { customElement, property, state } from 'lit/decorators.js';
import { CivFormElement, dispatch, renderLabel, renderFormHeader, inputClasses, inputWidthClass, clickOutside, t, interpolate, debounce } from '@civui/core';
import type { InputWidth } from '@civui/core';

export interface ComboboxOption {
  value: string;
  label: string;
  group?: string;
}

/** Signature for async option loaders. Reject (or throw) to surface a load error. */
export type LoadOptionsFn = (query: string) => Promise<ComboboxOption[]>;

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
 * @fires civ-change - When a selection is made, detail: { value }
 * @fires civ-input - When the filter text changes, detail: { value }
 * @fires civ-analytics - Analytics tracking event on change
 */
@customElement('civ-combobox')
export class CivCombobox extends CivFormElement {
  @property({ type: Array }) options: ComboboxOption[] = [];
  @property({ type: String }) placeholder = '';
  @property({ type: String, attribute: 'no-results-text' }) noResultsText = '';
  @property({ type: String }) width: InputWidth = 'default';

  /**
   * Async option loader. When set, the component switches into remote mode:
   * filtering no longer runs locally — the function is called (debounced)
   * with the current query string and is expected to return matching options.
   *
   * `options` is ignored in remote mode; the component holds the most recent
   * remote response in private state.
   *
   * @example
   * ```ts
   * combobox.loadOptions = async (q) => {
   *   const res = await fetch(`/api/agencies?q=${encodeURIComponent(q)}`);
   *   const items = await res.json();
   *   return items.map(({ code, name }) => ({ value: code, label: name }));
   * };
   * ```
   */
  @property({ attribute: false }) loadOptions: LoadOptionsFn | null = null;

  /** Debounce delay (ms) before calling `loadOptions` after the user types. Default 300. */
  @property({ type: Number, attribute: 'load-debounce' }) loadDebounce = 300;

  /**
   * Minimum query length required before `loadOptions` is invoked. When the
   * filter is shorter, the listbox shows a "type at least N characters" prompt
   * instead. Default 0 (fetches with empty query on focus / chevron toggle).
   */
  @property({ type: Number, attribute: 'min-query-length' }) minQueryLength = 0;

  /** Override the loading text shown in the dropdown while remote results load. */
  @property({ type: String, attribute: 'loading-text' }) loadingText = '';

  /** Override the error text shown when `loadOptions` rejects. */
  @property({ type: String, attribute: 'loading-error-text' }) loadingErrorText = '';

  @state() private _open = false;
  @state() private _filter = '';
  @state() private _activeIndex = -1;
  /** True while a remote `loadOptions` call is in flight. */
  @state() private _loading = false;
  /** Set when the most recent `loadOptions` call rejected. */
  @state() private _loadError = '';
  /** Most recent results returned by `loadOptions`. */
  @state() private _remoteOptions: ComboboxOption[] = [];

  private _listboxId = this.generateId('listbox');
  private _labelId = this.generateId('label');
  private _clickOutside = clickOutside(this, () => this._setOpen(false));
  private _announceTimer?: ReturnType<typeof setTimeout>;

  /** Incrementing request id — used to discard stale fetches when a newer query arrives. */
  private _requestId = 0;
  private _debouncedLoad = debounce((query: string) => this._runLoad(query), this.loadDebounce);

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('loadDebounce')) {
      this._debouncedLoad.cancel();
      this._debouncedLoad = debounce((query: string) => this._runLoad(query), this.loadDebounce);
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._clickOutside.remove();
    this._debouncedLoad.cancel();
    clearTimeout(this._announceTimer);
  }

  /** True when an async loader is wired up. */
  private get _isRemote(): boolean {
    return typeof this.loadOptions === 'function';
  }

  private _cachedFilter = '';
  private _cachedFilteredOptions: ComboboxOption[] = [];

  private get _filteredOptions(): ComboboxOption[] {
    // Remote mode: server-supplied results are already filtered.
    if (this._isRemote) return this._remoteOptions;
    if (!this._filter) return this.options;
    // Memoize: only re-filter when the filter text changes
    if (this._filter === this._cachedFilter && this._cachedFilteredOptions.length > 0) {
      return this._cachedFilteredOptions;
    }
    const lower = this._filter.toLowerCase();
    this._cachedFilter = this._filter;
    this._cachedFilteredOptions = this.options.filter((o) => o.label.toLowerCase().includes(lower));
    return this._cachedFilteredOptions;
  }

  /** True when remote mode is active and the user must type more to trigger a fetch. */
  private get _belowMinQuery(): boolean {
    return this._isRemote && this.minQueryLength > 0 && this._filter.length < this.minQueryLength;
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

    const widthClass = inputWidthClass(this.width);
    const classes = inputClasses({ extra: [widthClass, 'civ-max-w-full'] });

    return html`
      <div class="civ-mb-4 civ-relative">
        ${renderFormHeader({ label: renderLabel({ label: this.label, inputId: this._inputId, required: this.required, showRequired: this.required && !this.hideRequiredIndicator, labelId: this._labelId }), hintId: this._hintId, hint: this.hint, errorId: this._errorId, error: this.error })}

        <div class="civ-relative ${widthClass} civ-max-w-full" data-civ-combobox>
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
            @blur="${this._onBlur}"
            @keydown="${this._onKeydown}"
          />
          ${this.value && !this.disabled ? html`
            <button
              type="button"
              class="civ-clear-btn focus-visible:civ-focus-ring"
              aria-label="${t('comboboxClearLabel')}"
              @click="${this._onClear}"
            ><civ-icon name="close" size="sm" aria-hidden="true"></civ-icon></button>
          ` : nothing}
          <button
            type="button"
            class="civ-combobox-chevron"
            data-civ-combobox-chevron
            data-expanded="${this._open ? '' : nothing}"
            aria-hidden="true"
            tabindex="-1"
            ?disabled="${this.disabled}"
            @mousedown="${this._onChevronMousedown}"
            @click="${this._onChevronClick}"
          >
            <civ-icon name="chevron-down" aria-hidden="true"></civ-icon>
          </button>

          ${this._open && filtered.length > 0
            ? html`
                <ul
                  id="${this._listboxId}"
                  role="listbox"
                  class="civ-combobox-listbox"
                  aria-labelledby="${this.label ? this._labelId : nothing}"
                  aria-describedby="${this._ariaDescribedBy || nothing}"
                  aria-busy="${this._loading ? 'true' : nothing}"
                  @mousedown="${this._onListboxMousedown}"
                >
                  ${this._renderGroupedOptions(filtered)}
                </ul>
              `
            : nothing}
          ${this._open && filtered.length === 0 ? this._renderEmptyState() : nothing}
        </div>
      </div>
    `;
  }

  /**
   * Render the open-but-empty dropdown state. Loading / error / below-min-query
   * each get their own message; otherwise we fall back to "no results".
   */
  private _renderEmptyState(): TemplateResult {
    const baseClass = 'civ-absolute civ-z-10 civ-w-full civ-mt-0.5 civ-bg-white civ-border civ-border-base-light civ-rounded civ-shadow-md civ-p-3 civ-text-body';
    if (this._loading) {
      return html`
        <div class="${baseClass} civ-text-muted" role="status" aria-live="polite">
          ${this.loadingText || t('comboboxLoading')}
        </div>
      `;
    }
    if (this._loadError) {
      return html`
        <div class="${baseClass} civ-text-error" role="alert">
          ${this.loadingErrorText || this._loadError || t('comboboxLoadError')}
        </div>
      `;
    }
    if (this._belowMinQuery) {
      return html`
        <div class="${baseClass} civ-text-muted" role="status">
          ${interpolate(t('comboboxTypeToSearch'), { count: this.minQueryLength })}
        </div>
      `;
    }
    return html`
      <div class="${baseClass} civ-text-muted" role="status" aria-live="polite">
        ${this.noResultsText || t('comboboxNoResults')}
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
      return html`${repeat(filtered, (o) => o.value, (option, i) => this._renderOption(option, i))}`;
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
    if (this._isRemote) {
      this._debouncedLoad.cancel();
      this._loading = false;
      this._loadError = '';
      this._remoteOptions = [];
    }
    dispatch(this, 'civ-input', { value: '' });
    dispatch(this, 'civ-change', { value: '' });
    this._setOpen(false);
    // Return focus to the input
    const input = this.querySelector(`#${this._inputId}`) as HTMLInputElement | null;
    input?.focus();
  }

  /**
   * Prevent the input from losing focus when the chevron is clicked. Without
   * this, the click would fire `blur` first and the listbox close logic
   * would race the toggle.
   */
  private _onChevronMousedown(e: MouseEvent): void {
    e.preventDefault();
  }

  /**
   * Toggle the listbox. Clicking the chevron always shows the full unfiltered
   * list — clears any in-progress filter so users browsing all options see
   * everything.
   */
  private _onChevronClick(e: Event): void {
    if (this.disabled) return;
    e.stopPropagation();
    if (this._open) {
      this._setOpen(false);
    } else {
      this._filter = '';
      this._activeIndex = -1;
      this._setOpen(true);
      this._maybeLoad('', { immediate: true });
    }
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

    if (this._isRemote) {
      this._maybeLoad(this._filter);
      return;
    }

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
    if (this.disabled) return;
    this._setOpen(true);
    // First focus in remote mode with no filter yet: kick off an initial fetch
    // (so there's something to show immediately when minQueryLength is 0).
    if (this._isRemote && this._remoteOptions.length === 0 && !this._loading && !this._loadError) {
      this._maybeLoad(this._filter, { immediate: true });
    }
  }

  /** Close the listbox when focus leaves the input. */
  private _onBlur(): void {
    // Delay to let click events on options/chevron fire before closing.
    // mousedown handlers on the listbox and chevron call preventDefault()
    // to keep focus on the input, so this only fires for genuine blur
    // (e.g., clicking outside, tabbing away).
    requestAnimationFrame(() => {
      const active = document.activeElement;
      const wrapper = this.querySelector('[data-civ-combobox]');
      // If focus moved outside the combobox wrapper, close
      if (wrapper && !wrapper.contains(active)) {
        this._setOpen(false);
      }
    });
  }

  /** Prevent blur when clicking inside the listbox (options, scrollbar). */
  private _onListboxMousedown(e: MouseEvent): void {
    e.preventDefault();
  }

  /**
   * Decide whether to fetch and dispatch through the debounced loader, or
   * skip (when below `min-query-length`) by clearing remote state. The
   * `immediate` flag bypasses debounce — used for chevron / focus triggers
   * where a debounced delay would feel unresponsive.
   */
  private _maybeLoad(query: string, opts: { immediate?: boolean } = {}): void {
    if (!this._isRemote) return;

    if (this.minQueryLength > 0 && query.length < this.minQueryLength) {
      // Reset remote state so the dropdown shows the prompt, not stale results.
      this._debouncedLoad.cancel();
      this._loading = false;
      this._loadError = '';
      this._remoteOptions = [];
      return;
    }

    if (opts.immediate) {
      this._debouncedLoad.cancel();
      this._runLoad(query);
    } else {
      this._debouncedLoad(query);
    }
  }

  /**
   * Invoke the loader, ignore stale responses, and surface loading / error
   * state. Each call increments `_requestId`; only the most recent call's
   * resolution updates the listbox.
   */
  private async _runLoad(query: string): Promise<void> {
    if (!this.loadOptions) return;
    const id = ++this._requestId;
    this._loading = true;
    this._loadError = '';
    this.announce(this.loadingText || t('comboboxLoadingAnnouncement'));
    try {
      const results = await this.loadOptions(query);
      if (id !== this._requestId) return; // stale — newer request superseded us
      this._remoteOptions = Array.isArray(results) ? results : [];
      this._loading = false;
      const count = this._remoteOptions.length;
      this.announce(
        count === 0
          ? (this.noResultsText || t('comboboxNoResults'))
          : interpolate(t(count === 1 ? 'comboboxResultAvailable' : 'comboboxResultsAvailable'), { count }),
      );
    } catch (err) {
      if (id !== this._requestId) return;
      this._loading = false;
      this._remoteOptions = [];
      this._loadError = (err as Error)?.message || t('comboboxLoadError');
      this.announce(this.loadingErrorText || t('comboboxLoadError'), 'assertive');
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
    dispatch(this, 'civ-change', { value: this.value });
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
