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
 * @fires civ-change - When a date is selected
 * @fires civ-input - When the text input changes
 */
@customElement('civ-date-picker')
export class CivDatePicker extends CivFormElement {
  @property({ type: String }) min = '';
  @property({ type: String }) max = '';
  @property({ type: String }) placeholder = 'mm/dd/yyyy';
  @property({ type: String }) locale = 'en-US';
  @property({ type: Number, attribute: 'week-starts-on' }) weekStartsOn = 0;

  @property({ type: String, attribute: 'choose-date-label' }) chooseDateLabel = 'Choose date';
  @property({ type: String, attribute: 'selected-date-label' }) selectedDateLabel = 'Choose date, selected date is {date}';
  @property({ type: String, attribute: 'dialog-label' }) dialogLabel = 'Choose Date';
  @property({ type: String, attribute: 'previous-month-label' }) previousMonthLabel = 'Previous month';
  @property({ type: String, attribute: 'next-month-label' }) nextMonthLabel = 'Next month';
  @property({ type: String, attribute: 'dialog-opened-message' }) dialogOpenedMessage = 'Calendar dialog opened';
  @property({ type: String, attribute: 'date-selected-message' }) dateSelectedMessage = 'Selected {date}';

  @state() private _open = false;
  @state() private _focusedDate: Date = new Date();
  @state() private _displayMonth = new Date().getMonth();
  @state() private _displayYear = new Date().getFullYear();
  @state() private _inputValue = '';

  private _headingId = this.generateId('heading');
  private _gridId = this.generateId('grid');
  private _buttonId = this.generateId('btn');
  private _cleanupTrap: (() => void) | null = null;
  private _boundDocClick = this._onDocumentClick.bind(this);

  private get _constraints(): DateConstraints {
    return { min: this.min || undefined, max: this.max || undefined };
  }

  private _dialogKeyHandler = createKeyboardHandler([
    {
      key: 'Escape',
      handler: () => this._closeDialog(),
    },
    {
      key: 'ArrowRight',
      handler: () => this._moveFocusSkipDisabled(1),
    },
    {
      key: 'ArrowLeft',
      handler: () => this._moveFocusSkipDisabled(-1),
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
        if (!isDateDisabled(this._focusedDate, this._constraints)) {
          this._selectDate(this._focusedDate);
        }
      },
    },
    {
      key: ' ',
      handler: () => {
        if (!isDateDisabled(this._focusedDate, this._constraints)) {
          this._selectDate(this._focusedDate);
        }
      },
    },
  ]);

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('click', this._boundDocClick);
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
    const inputClasses = [
      'civ-block',
      'civ-w-full',
      'civ-border',
      'civ-rounded-l',
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

    const selectedDate = this.value ? parseISODate(this.value) : null;
    const buttonLabel = selectedDate
      ? interpolate(this.selectedDateLabel, { date: formatDateLong(selectedDate, this.locale) })
      : this.chooseDateLabel;

    return html`
      <div class="civ-mb-4 civ-relative">
        ${this.label
          ? html`
              <label
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
        <div class="civ-flex civ-items-center">
          <input
            class="${inputClasses}"
            id="${this._inputId}"
            type="text"
            .value="${this._inputValue}"
            placeholder="${this.placeholder}"
            ?disabled="${this.disabled}"
            ?required="${this.required}"
            aria-required="${this.required}"
            aria-describedby="${this._ariaDescribedBy || nothing}"
            aria-invalid="${this.error ? 'true' : 'false'}"
            @input="${this._onTextInput}"
            @change="${this._onTextChange}"
          />
          <button
            id="${this._buttonId}"
            type="button"
            class="civ-border civ-border-l-0 civ-border-base-light civ-rounded-r civ-px-2 civ-py-1.5 civ-bg-base-lightest hover:civ-bg-base-lighter focus-visible:civ-focus-ring ${this.disabled ? 'civ-opacity-50 civ-cursor-not-allowed' : ''}"
            aria-label="${buttonLabel}"
            ?disabled="${this.disabled}"
            @click="${this._toggleDialog}"
          >
            <svg aria-hidden="true" class="civ-w-5 civ-h-5 civ-text-base-dark" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        ${this._open ? this._renderDialog(selectedDate) : nothing}
      </div>
    `;
  }

  private _renderDialog(selectedDate: Date | null) {
    const cal = generateCalendarMonth(this._displayYear, this._displayMonth, {
      weekStartsOn: this.weekStartsOn,
    });
    const headers = getDayOfWeekHeaders(this.locale, this.weekStartsOn);
    const monthNames = getMonthNames(this.locale);
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
        aria-label="${this.dialogLabel}"
        class="civ-absolute civ-z-50 civ-mt-1 civ-bg-white civ-border civ-border-base-light civ-rounded civ-shadow-lg civ-p-4"
        @keydown="${this._onDialogKeydown}"
      >
        <div class="civ-flex civ-items-center civ-justify-between civ-mb-2">
          <button
            type="button"
            class="civ-p-1 civ-rounded hover:civ-bg-base-lightest focus-visible:civ-focus-ring"
            aria-label="${this.previousMonthLabel}"
            ?disabled="${prevMonthDisabled}"
            @click="${this._prevMonth}"
          >
            <svg aria-hidden="true" class="civ-w-5 civ-h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
          <div id="${this._headingId}" aria-live="polite" class="civ-font-bold civ-text-base">
            ${headingText}
          </div>
          <button
            type="button"
            class="civ-p-1 civ-rounded hover:civ-bg-base-lightest focus-visible:civ-focus-ring"
            aria-label="${this.nextMonthLabel}"
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
    const disabled = !day.inCurrentMonth || isDateDisabled(day.date, this._constraints);
    const selected = selectedDate ? isSameDay(day.date, selectedDate) : false;
    const focused = isSameDay(day.date, this._focusedDate);
    const tabIdx = focused && day.inCurrentMonth ? 0 : -1;

    const cellClasses = [
      'civ-w-10',
      'civ-h-10',
      'civ-text-center',
      'civ-text-sm',
      'civ-rounded',
      !day.inCurrentMonth ? 'civ-text-base-light' : '',
      disabled ? 'civ-opacity-40 civ-cursor-not-allowed' : 'civ-cursor-pointer hover:civ-bg-primary-lightest',
      selected ? 'civ-bg-primary civ-text-white civ-font-bold' : '',
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
          class="${cellClasses}"
          tabindex="${tabIdx}"
          aria-selected="${selected}"
          aria-disabled="${disabled}"
          aria-label="${formatDateLong(day.date, this.locale)}"
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
    document.addEventListener('click', this._boundDocClick);
    this.announce(this.dialogOpenedMessage);
  }

  private _closeDialog(): void {
    this._open = false;
    document.removeEventListener('click', this._boundDocClick);
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
    this.updateFormValue(iso);
    dispatch(this, 'civ-change', { value: iso });
    this.sendAnalytics('change');
    this.announce(interpolate(this.dateSelectedMessage, { date: formatDateLong(date, this.locale) }));
    this._closeDialog();
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
      this.updateFormValue('');
      dispatch(this, 'civ-change', { value: '' });
      return;
    }

    const parsed = parseDateString(text, this.locale);
    if (parsed) {
      // Validate against min/max constraints
      if (isDateDisabled(parsed, this._constraints)) {
        // Keep input text but don't set as value
        return;
      }
      const iso = toISODateString(parsed);
      this.value = iso;
      this._inputValue = formatDate(parsed, this.locale);
      this._displayMonth = parsed.getMonth();
      this._displayYear = parsed.getFullYear();
      this._focusedDate = parsed;
      this.updateFormValue(iso);
      dispatch(this, 'civ-change', { value: iso });
      this.sendAnalytics('change');
    }
    // Keep invalid text in the input — don't clear it
  }

  private _prevMonth(): void {
    if (this._displayMonth === 0) {
      this._displayMonth = 11;
      this._displayYear--;
    } else {
      this._displayMonth--;
    }
    this._focusedDate = new Date(this._displayYear, this._displayMonth, 1);
    const monthNames = getMonthNames(this.locale);
    this.announce(`${monthNames[this._displayMonth]} ${this._displayYear}`);
  }

  private _nextMonth(): void {
    if (this._displayMonth === 11) {
      this._displayMonth = 0;
      this._displayYear++;
    } else {
      this._displayMonth++;
    }
    this._focusedDate = new Date(this._displayYear, this._displayMonth, 1);
    const monthNames = getMonthNames(this.locale);
    this.announce(`${monthNames[this._displayMonth]} ${this._displayYear}`);
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
    // Focus the button after render
    this.updateComplete.then(() => {
      const iso = toISODateString(newDate);
      const btn = this.querySelector(`[data-date="${iso}"]`) as HTMLElement | null;
      btn?.focus();
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
      if (!isDateDisabled(candidate, this._constraints)) {
        this._moveFocus(candidate);
        return;
      }
      candidate = addDays(candidate, direction);
    }
    // If no valid date found within range, clamp to boundary
    if (this._constraints.min || this._constraints.max) {
      const clamped = clampDate(this._focusedDate, this._constraints);
      if (!isDateDisabled(clamped, this._constraints)) {
        this._moveFocus(clamped);
      }
    }
  }

  private _onDialogKeydown(e: KeyboardEvent): void {
    this._dialogKeyHandler(e);
  }

  private _onDocumentClick(e: MouseEvent): void {
    const path = e.composedPath();
    if (!path.includes(this)) {
      this._closeDialog();
    }
  }

  // --- Form integration ---

  override formResetCallback(): void {
    this.value = '';
    this._inputValue = '';
    this._open = false;
    this.error = '';
    this._focusedDate = new Date();
    this._displayMonth = new Date().getMonth();
    this._displayYear = new Date().getFullYear();
    this.updateFormValue('');
    dispatch(this, 'civ-reset');
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'civ-date-picker': CivDatePicker;
  }
}
