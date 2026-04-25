import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  CivFormElement,
  createKeyboardHandler,
  trapFocus,
  generateCalendarMonth,
  getDayOfWeekHeaders,
  getMonthNames,
  parseISODate,
  toISODateString,
  formatDate,
  formatDateLong,
  parseDateString,
  isSameDay,
  addDays,
  addMonths,
  addYears,
  isDateDisabled,
  isMonthDisabled,
  clampDate,
  dispatch,
  interpolate,
  isRtl,
  clickOutside,
  renderLabel,
  renderHint,
  renderError,
  inputClasses,
  t,
  type CalendarDay,
  type DateConstraints,
} from '@civui/core';

/**
 * CivUI Date Picker
 *
 * Accessible date picker implementing the W3C APG Dialog + Grid pattern.
 * Uses a text input for manual entry and a calendar dialog for browsing.
 * Light DOM, ElementInternals for form participation.
 *
 * @element civ-date-picker
 *
 * @prop {string} label - Label text
 * @prop {string} name - Form field name
 * @prop {string} value - Date value in YYYY-MM-DD format
 * @prop {string} hint - Hint text
 * @prop {string} error - Error message
 * @prop {string} min - Minimum date (YYYY-MM-DD)
 * @prop {string} max - Maximum date (YYYY-MM-DD)
 * @prop {string} placeholder - Input placeholder
 * @prop {string} locale - Locale for formatting (default: en-US)
 * @prop {number} weekStartsOn - Day week starts on (0=Sunday, 1=Monday)
 * @prop {boolean} required - Whether a date is required
 * @prop {boolean} disabled - Whether the picker is disabled
 *
 * @fires civ-change - When a date is selected, detail: { value }
 * @fires civ-input - When the text input changes, detail: { value }
 * @fires civ-analytics - Analytics tracking event on change
 */
@customElement('civ-date-picker')
export class CivDatePicker extends CivFormElement {
  @property({ type: String }) min = '';
  @property({ type: String }) max = '';
  @property({ type: String }) placeholder = '';
  @property({ type: String }) locale = 'en-US';
  @property({ type: Number, attribute: 'week-starts-on' }) weekStartsOn = 0;

  @property({ type: String, attribute: 'disabled-dates' }) disabledDates = '';
  @property({ type: String, attribute: 'clear-label' }) clearLabel = '';

  @property({ type: String, attribute: 'choose-date-label' }) chooseDateLabel = '';
  @property({ type: String, attribute: 'selected-date-label' }) selectedDateLabel = '';
  @property({ type: String, attribute: 'dialog-label' }) dialogLabel = '';
  @property({ type: String, attribute: 'previous-month-label' }) previousMonthLabel = '';
  @property({ type: String, attribute: 'next-month-label' }) nextMonthLabel = '';
  @property({ type: String, attribute: 'dialog-opened-message' }) dialogOpenedMessage = '';
  @property({ type: String, attribute: 'date-selected-message' }) dateSelectedMessage = '';
  @property({ type: String, attribute: 'today-label' }) todayLabel = '';
  @property({ type: String, attribute: 'invalid-format-message' }) invalidFormatMessage = '';
  @property({ type: String, attribute: 'date-range-message' }) dateRangeMessage = '';
  @property({ type: String, attribute: 'min-date-message' }) minDateMessage = '';
  @property({ type: String, attribute: 'max-date-message' }) maxDateMessage = '';

  @state() private _open = false;
  @state() private _focusedDate: Date = new Date();
  @state() private _displayMonth = this._focusedDate.getMonth();
  @state() private _displayYear = this._focusedDate.getFullYear();
  @state() private _inputValue = '';
  @state() private _parsedDisabledDates: Set<string> = new Set();

  private _headingId = this.generateId('heading');
  private _gridId = this.generateId('grid');
  private _buttonId = this.generateId('btn');
  private _cleanupTrap: (() => void) | null = null;
  private _clickOutside = clickOutside(this, () => this._closeDialog());
  private _cachedLocaleKey = '';
  private _cachedMonthNames: string[] = [];
  private _cachedDayHeaders: { short: string; long: string }[] = [];

  private _refreshLocaleCache(): void {
    const key = `${this.locale}|${this.weekStartsOn}`;
    if (this._cachedLocaleKey !== key) {
      this._cachedLocaleKey = key;
      this._cachedMonthNames = getMonthNames(this.locale);
      this._cachedDayHeaders = getDayOfWeekHeaders(this.locale, this.weekStartsOn);
    }
  }

  private get _monthNames(): string[] {
    this._refreshLocaleCache();
    return this._cachedMonthNames;
  }

  private get _dayHeaders(): { short: string; long: string }[] {
    this._refreshLocaleCache();
    return this._cachedDayHeaders;
  }

  override willUpdate(changed: Map<string, unknown>): void {
    super.willUpdate(changed);
    if (changed.has('disabledDates') && this.disabledDates) {
      try {
        this._parsedDisabledDates = new Set(JSON.parse(this.disabledDates));
      } catch { this._parsedDisabledDates = new Set(); }
    }
  }

  private get _constraints(): DateConstraints {
    return { min: this.min || undefined, max: this.max || undefined };
  }

  private _isDateDisabled(date: Date): boolean {
    if (isDateDisabled(date, this._constraints)) return true;
    const iso = toISODateString(date);
    return this._parsedDisabledDates.has(iso);
  }

  private _dialogKeyHandler = createKeyboardHandler([
    {
      key: 'Escape',
      handler: () => this._closeDialog(),
    },
    {
      key: 'ArrowRight',
      handler: () => this._moveFocusSkipDisabled(isRtl(this) ? -1 : 1),
    },
    {
      key: 'ArrowLeft',
      handler: () => this._moveFocusSkipDisabled(isRtl(this) ? 1 : -1),
    },
    {
      key: 'ArrowDown',
      handler: () => this._moveFocusSkipDisabled(7),
    },
    {
      key: 'ArrowUp',
      handler: () => this._moveFocusSkipDisabled(-7),
    },
    {
      key: 'Home',
      handler: () => {
        const d = new Date(this._focusedDate);
        const day = d.getDay();
        const diff = (day - this.weekStartsOn + 7) % 7;
        this._moveFocus(addDays(d, -diff));
      },
    },
    {
      key: 'End',
      handler: () => {
        const d = new Date(this._focusedDate);
        const day = d.getDay();
        const weekEnd = (this.weekStartsOn + 6) % 7;
        const diff = (weekEnd - day + 7) % 7;
        this._moveFocus(addDays(d, diff));
      },
    },
    {
      key: 'PageDown',
      shiftKey: true,
      handler: () => this._moveFocus(addYears(this._focusedDate, 1)),
    },
    {
      key: 'PageUp',
      shiftKey: true,
      handler: () => this._moveFocus(addYears(this._focusedDate, -1)),
    },
    {
      key: 'PageDown',
      handler: () => this._moveFocus(addMonths(this._focusedDate, 1)),
    },
    {
      key: 'PageUp',
      handler: () => this._moveFocus(addMonths(this._focusedDate, -1)),
    },
    {
      key: 'Enter',
      handler: () => {
        if (!this._isDateDisabled(this._focusedDate)) {
          this._selectDate(this._focusedDate);
        }
      },
    },
    {
      key: ' ',
      handler: () => {
        if (!this._isDateDisabled(this._focusedDate)) {
          this._selectDate(this._focusedDate);
        }
      },
    },
  ]);

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._clickOutside.remove();
    this._cleanupTrap?.();
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('value') && this.value) {
      const parsed = parseISODate(this.value);
      if (parsed) {
        this._inputValue = formatDate(parsed, this.locale);
        this._displayMonth = parsed.getMonth();
        this._displayYear = parsed.getFullYear();
        this._focusedDate = parsed;
      }
    }
    if (changed.has('_open') && this._open) {
      this._setupDialog();
    }
  }

  private _setupDialog(): void {
    requestAnimationFrame(() => {
      const dialog = this.querySelector(`[data-civ-dialog]`) as HTMLElement | null;
      if (!dialog) return;
      this._cleanupTrap?.();
      this._cleanupTrap = trapFocus(dialog);
      // Focus the selected or today's date button
      const target =
        dialog.querySelector<HTMLElement>('[data-civ-day][tabindex="0"]');
      target?.focus();
    });
  }

  override render() {
    const classes = inputClasses({ rounded: 'civ-rounded-s civ-rounded-e-none' });

    const selectedDate = this.value ? parseISODate(this.value) : null;
    const buttonLabel = selectedDate
      ? interpolate(this.selectedDateLabel || t('datePickerSelectedDateLabel'), { date: formatDateLong(selectedDate, this.locale) })
      : (this.chooseDateLabel || t('datePickerChooseDateLabel'));

    return html`
      <div class="civ-mb-4 civ-relative">
        ${renderLabel({ label: this.label, inputId: this._inputId, required: this.required, showRequired: this.required && !this.hideRequiredIndicator })}
        ${renderHint(this._hintId, this.hint)}
        ${renderError(this._errorId, this.error)}
        <div class="civ-input-group">
          <div class="civ-relative civ-flex-1">
            <input
              class="${classes}"
              id="${this._inputId}"
              type="text"
              .value="${this._inputValue}"
              placeholder="${this.placeholder || t('datePickerPlaceholder')}"
              ?disabled="${this.disabled}"
              ?required="${this.required}"
              aria-required="${this.required || nothing}"
              aria-describedby="${this._ariaDescribedBy || nothing}"
              aria-invalid="${this.error ? 'true' : nothing}"
              @input="${this._onTextInput}"
              @change="${this._onTextChange}"
            />
            ${this.value && !this.disabled ? html`
              <button
                type="button"
                class="civ-clear-btn hover:civ-bg-base-lighter focus-visible:civ-focus-ring"
                aria-label="${this.clearLabel || t('datePickerClearLabel')}"
                @click="${this._onClear}"
              >
                <svg aria-hidden="true" class="civ-w-4 civ-h-4 civ-text-base-dark" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            ` : nothing}
          </div>
          <button
            id="${this._buttonId}"
            type="button"
            class="civ-action-btn civ-action-btn--tertiary focus-visible:civ-focus-ring"
            aria-label="${buttonLabel}"
            aria-haspopup="dialog"
            aria-expanded="${this._open}"
            aria-controls="${this._open ? this._gridId : nothing}"
            ?disabled="${this.disabled}"
            @click="${this._toggleDialog}"
          >${this.chooseDateLabel || t('datePickerChooseDateLabel')}</button>
        </div>
        ${this._open ? this._renderDialog(selectedDate) : nothing}
      </div>
    `;
  }

  private _renderDialog(selectedDate: Date | null) {
    const cal = generateCalendarMonth(this._displayYear, this._displayMonth, {
      weekStartsOn: this.weekStartsOn,
    });
    const headers = this._dayHeaders;
    const monthNames = this._monthNames;
    const headingText = `${monthNames[this._displayMonth]} ${this._displayYear}`;

    const prevMonthDisabled = isMonthDisabled(
      this._displayMonth === 0 ? this._displayYear - 1 : this._displayYear,
      this._displayMonth === 0 ? 11 : this._displayMonth - 1,
      this._constraints,
    );
    const nextMonthDisabled = isMonthDisabled(
      this._displayMonth === 11 ? this._displayYear + 1 : this._displayYear,
      this._displayMonth === 11 ? 0 : this._displayMonth + 1,
      this._constraints,
    );

    return html`
      <div
        data-civ-dialog
        role="dialog"
        aria-modal="true"
        aria-label="${this.dialogLabel || t('datePickerDialogLabel')}"
        class="civ-datepicker-dialog"
        @keydown="${this._onDialogKeydown}"
      >
        <div class="civ-flex civ-items-center civ-justify-between civ-mb-2">
          <button
            type="button"
            class="civ-datepicker-nav-btn hover:civ-bg-base-lightest focus-visible:civ-focus-ring"
            aria-label="${this.previousMonthLabel || t('datePickerPreviousMonthLabel')}"
            ?disabled="${prevMonthDisabled}"
            @click="${this._prevMonth}"
          >
            <svg aria-hidden="true" class="civ-w-5 civ-h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
          <div id="${this._headingId}" class="civ-font-bold civ-text-body" aria-live="polite">
            ${headingText}
          </div>
          <button
            type="button"
            class="civ-datepicker-nav-btn hover:civ-bg-base-lightest focus-visible:civ-focus-ring"
            aria-label="${this.nextMonthLabel || t('datePickerNextMonthLabel')}"
            ?disabled="${nextMonthDisabled}"
            @click="${this._nextMonth}"
          >
            <svg aria-hidden="true" class="civ-w-5 civ-h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        <table role="grid" id="${this._gridId}" aria-labelledby="${this._headingId}">
          <thead>
            <tr>
              ${headers.map(
                (h) => html`<th scope="col" class="civ-p-1 civ-text-center civ-text-sm civ-text-base-dark civ-font-normal">
                  <abbr title="${h.long}">${h.short}</abbr>
                </th>`,
              )}
            </tr>
          </thead>
          <tbody>
            ${cal.weeks.map(
              (week) => html`
                <tr>
                  ${week.map((day) => this._renderDayCell(day, selectedDate))}
                </tr>
              `,
            )}
          </tbody>
        </table>
      </div>
    `;
  }

  private _renderDayCell(day: CalendarDay, selectedDate: Date | null) {
    const disabled = !day.inCurrentMonth || this._isDateDisabled(day.date);
    const selected = selectedDate ? isSameDay(day.date, selectedDate) : false;
    const focused = isSameDay(day.date, this._focusedDate);
    const tabIdx = focused && day.inCurrentMonth ? 0 : -1;

    const extraClasses = [
      !day.inCurrentMonth ? 'civ-text-base-light' : '',
      !disabled ? 'hover:civ-bg-primary-lightest' : '',
      day.isToday && !selected ? 'civ-font-bold civ-underline' : '',
      selected ? 'focus-visible:civ-focus-ring-inverse' : 'focus-visible:civ-focus-ring',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <td role="gridcell">
        <button
          type="button"
          data-civ-day
          data-date="${toISODateString(day.date)}"
          class="civ-datepicker-day ${extraClasses}"
          tabindex="${tabIdx}"
          aria-selected="${selected}"
          aria-disabled="${disabled}"
          aria-label="${formatDateLong(day.date, this.locale)}${day.isToday ? `, ${this.todayLabel || t('datePickerTodayLabel')}` : ''}"
          @click="${() => !disabled && this._selectDate(day.date)}"
        >
          ${day.day}
        </button>
      </td>
    `;
  }

  // --- Event handlers ---

  private _toggleDialog(): void {
    if (this.disabled) return;
    if (this._open) {
      this._closeDialog();
    } else {
      this._openDialog();
    }
  }

  private _openDialog(): void {
    const selected = this.value ? parseISODate(this.value) : null;
    const today = new Date();
    const initial = selected ?? today;
    this._focusedDate = initial;
    this._displayMonth = initial.getMonth();
    this._displayYear = initial.getFullYear();
    this._open = true;
    this._clickOutside.add();
    this.announce(this.dialogOpenedMessage || t('datePickerDialogOpenedMessage'));
  }

  private _closeDialog(): void {
    this._open = false;
    this._clickOutside.remove();
    this._cleanupTrap?.();
    this._cleanupTrap = null;
    // Return focus to calendar button
    requestAnimationFrame(() => {
      const btn = this.querySelector(`#${this._buttonId}`) as HTMLElement | null;
      btn?.focus();
    });
  }

  private _selectDate(date: Date): void {
    const iso = toISODateString(date);
    this.value = iso;
    this._inputValue = formatDate(date, this.locale);
    this.error = '';
    this.updateFormValue(iso);
    dispatch(this, 'civ-input', { value: iso });
    dispatch(this, 'civ-change', { value: iso });
    this.sendAnalytics('change');
    this.announce(interpolate(this.dateSelectedMessage || t('datePickerDateSelectedMessage'), { date: formatDateLong(date, this.locale) }));
    this._closeDialog();
  }

  private _onClear(): void {
    this.value = '';
    this._inputValue = '';
    this.error = '';
    this.updateFormValue('');
    dispatch(this, 'civ-input', { value: '' });
    dispatch(this, 'civ-change', { value: '' });
  }

  private _onTextInput(e: Event): void {
    const target = e.target as HTMLInputElement;
    this._inputValue = target.value;
    dispatch(this, 'civ-input', { value: target.value });
  }

  private _onTextChange(e: Event): void {
    const target = e.target as HTMLInputElement;
    const text = target.value.trim();

    if (!text) {
      this.value = '';
      this._inputValue = '';
      this.error = '';
      this.updateFormValue('');
      dispatch(this, 'civ-change', { value: '' });
      this.sendAnalytics('change');
      return;
    }

    const parsed = parseDateString(text, this.locale);
    if (parsed) {
      // Validate against min/max constraints
      if (isDateDisabled(parsed, this._constraints)) {
        const msg = this.min && this.max
          ? interpolate(this.dateRangeMessage || t('datePickerDateRangeMessage'), { min: formatDateLong(parseISODate(this.min)!, this.locale), max: formatDateLong(parseISODate(this.max)!, this.locale) })
          : this.min
            ? interpolate(this.minDateMessage || t('datePickerMinDateMessage'), { min: formatDateLong(parseISODate(this.min)!, this.locale) })
            : interpolate(this.maxDateMessage || t('datePickerMaxDateMessage'), { max: formatDateLong(parseISODate(this.max)!, this.locale) });
        this.error = msg;
        this.announce(msg, 'assertive');
        return;
      }
      const iso = toISODateString(parsed);
      this.value = iso;
      this._inputValue = formatDate(parsed, this.locale);
      this._displayMonth = parsed.getMonth();
      this._displayYear = parsed.getFullYear();
      this._focusedDate = parsed;
      this.error = '';
      this.updateFormValue(iso);
      dispatch(this, 'civ-change', { value: iso });
      this.sendAnalytics('change');
      this.announce(interpolate(this.dateSelectedMessage || t('datePickerDateSelectedMessage'), { date: formatDateLong(parsed, this.locale) }));
    } else {
      // Invalid text: keep it in the input so users can correct typos,
      // set the error visually and announce for screen readers.
      this.error = this.invalidFormatMessage || t('datePickerInvalidFormatMessage');
      this.announce(this.error, 'assertive');
    }
  }

  private _navigateMonth(delta: number): void {
    const newMonth = this._displayMonth + delta;
    if (newMonth < 0) {
      this._displayMonth = 11;
      this._displayYear--;
    } else if (newMonth > 11) {
      this._displayMonth = 0;
      this._displayYear++;
    } else {
      this._displayMonth = newMonth;
    }
    this._focusedDate = new Date(this._displayYear, this._displayMonth, 1);
    this.announce(`${this._monthNames[this._displayMonth]} ${this._displayYear}`);
  }

  private _prevMonth(): void {
    this._navigateMonth(-1);
  }

  private _nextMonth(): void {
    this._navigateMonth(1);
  }

  private _moveFocus(newDate: Date): void {
    // Navigate month if needed
    if (
      newDate.getMonth() !== this._displayMonth ||
      newDate.getFullYear() !== this._displayYear
    ) {
      this._displayMonth = newDate.getMonth();
      this._displayYear = newDate.getFullYear();
    }
    this._focusedDate = newDate;
    // Focus the button after render and announce the date for screen readers
    this.updateComplete.then(() => {
      const iso = toISODateString(newDate);
      const btn = this.querySelector(`[data-date="${iso}"]`) as HTMLElement | null;
      btn?.focus();
      this.announce(formatDateLong(newDate, this.locale));
    });
  }

  /**
   * Move focus by the given number of days, skipping disabled dates.
   * Clamps to the valid min/max range.
   */
  private _moveFocusSkipDisabled(days: number): void {
    const direction = days > 0 ? 1 : -1;
    let candidate = addDays(this._focusedDate, days);
    const maxAttempts = 31;
    for (let i = 0; i < maxAttempts; i++) {
      if (!this._isDateDisabled(candidate)) {
        this._moveFocus(candidate);
        return;
      }
      candidate = addDays(candidate, direction);
    }
    // If no valid date found within range, clamp to boundary
    if (this._constraints.min || this._constraints.max) {
      const clamped = clampDate(this._focusedDate, this._constraints);
      if (!this._isDateDisabled(clamped)) {
        this._moveFocus(clamped);
      }
    }
  }

  private _onDialogKeydown(e: KeyboardEvent): void {
    this._dialogKeyHandler(e);
  }

  // --- Form integration ---

  override formResetCallback(): void {
    this.value = this._defaultValue;
    const initial = this._defaultValue ? parseISODate(this._defaultValue) : null;
    this._inputValue = initial ? formatDate(initial, this.locale) : '';
    this._open = false;
    this.error = '';
    const fallback = initial || new Date();
    this._focusedDate = fallback;
    this._displayMonth = fallback.getMonth();
    this._displayYear = fallback.getFullYear();
    this.updateFormValue(this._defaultValue || '');
    dispatch(this, 'civ-reset');
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'civ-date-picker': CivDatePicker;
  }
}
