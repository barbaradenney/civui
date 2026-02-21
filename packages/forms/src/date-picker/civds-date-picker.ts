import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  CivdsFormElement,
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
  dispatch,
  interpolate,
  type CalendarDay,
  type DateConstraints,
} from '@civds/core';

/**
 * CivDS Date Picker
 *
 * Accessible date picker implementing the W3C APG Dialog + Grid pattern.
 * Uses a text input for manual entry and a calendar dialog for browsing.
 * Light DOM, ElementInternals for form participation.
 *
 * @element civds-date-picker
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
 * @fires civds-change - When a date is selected
 * @fires civds-input - When the text input changes
 */
@customElement('civds-date-picker')
export class CivdsDatePicker extends CivdsFormElement {
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

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('click', this._boundDocClick);
  }

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
      const dialog = this.querySelector(`[data-civds-dialog]`) as HTMLElement | null;
      if (!dialog) return;
      this._cleanupTrap?.();
      this._cleanupTrap = trapFocus(dialog);
      // Focus the selected or today's date button
      const target =
        dialog.querySelector<HTMLElement>('[data-civds-day][tabindex="0"]');
      target?.focus();
    });
  }

  override render() {
    const inputClasses = [
      'civds-block',
      'civds-w-full',
      'civds-border',
      'civds-rounded-l',
      'civds-px-2',
      'civds-py-1.5',
      'civds-text-base',
      'civds-font-sans',
      'civds-text-base-darkest',
      'civds-bg-white',
      this.error ? 'civds-border-error civds-border-l-4' : 'civds-border-base-light',
      this.disabled ? 'civds-opacity-50 civds-cursor-not-allowed civds-bg-base-lightest' : '',
      'focus-visible:civds-focus-ring',
    ]
      .filter(Boolean)
      .join(' ');

    const selectedDate = this.value ? parseISODate(this.value) : null;
    const buttonLabel = selectedDate
      ? interpolate(this.selectedDateLabel, { date: formatDateLong(selectedDate, this.locale) })
      : this.chooseDateLabel;

    return html`
      <div class="civds-mb-4 civds-relative">
        ${this.label
          ? html`
              <label
                class="civds-block civds-mb-1 civds-text-base-darkest civds-font-bold civds-text-base"
                for="${this._inputId}"
              >
                ${this.label}
                ${this.required
                  ? html`<abbr class="civds-text-error civds-no-underline" title="required">*</abbr>`
                  : nothing}
              </label>
            `
          : nothing}
        ${this.hint
          ? html`<span class="civds-block civds-mb-1 civds-text-sm civds-text-base" id="${this._hintId}">${this.hint}</span>`
          : nothing}
        ${this.error
          ? html`<span class="civds-block civds-mb-1 civds-text-sm civds-text-error civds-font-bold" id="${this._errorId}" role="alert">${this.error}</span>`
          : nothing}
        <div class="civds-flex civds-items-center">
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
            class="civds-border civds-border-l-0 civds-border-base-light civds-rounded-r civds-px-2 civds-py-1.5 civds-bg-base-lightest hover:civds-bg-base-lighter focus-visible:civds-focus-ring ${this.disabled ? 'civds-opacity-50 civds-cursor-not-allowed' : ''}"
            aria-label="${buttonLabel}"
            ?disabled="${this.disabled}"
            @click="${this._toggleDialog}"
          >
            <svg aria-hidden="true" class="civds-w-5 civds-h-5 civds-text-base-dark" viewBox="0 0 20 20" fill="currentColor">
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
        data-civds-dialog
        role="dialog"
        aria-modal="true"
        aria-label="${this.dialogLabel}"
        class="civds-absolute civds-z-50 civds-mt-1 civds-bg-white civds-border civds-border-base-light civds-rounded civds-shadow-lg civds-p-4"
        @keydown="${this._onDialogKeydown}"
      >
        <div class="civds-flex civds-items-center civds-justify-between civds-mb-2">
          <button
            type="button"
            class="civds-p-1 civds-rounded hover:civds-bg-base-lightest focus-visible:civds-focus-ring"
            aria-label="${this.previousMonthLabel}"
            ?disabled="${prevMonthDisabled}"
            @click="${this._prevMonth}"
          >
            <svg aria-hidden="true" class="civds-w-5 civds-h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
          <div id="${this._headingId}" aria-live="polite" class="civds-font-bold civds-text-base">
            ${headingText}
          </div>
          <button
            type="button"
            class="civds-p-1 civds-rounded hover:civds-bg-base-lightest focus-visible:civds-focus-ring"
            aria-label="${this.nextMonthLabel}"
            ?disabled="${nextMonthDisabled}"
            @click="${this._nextMonth}"
          >
            <svg aria-hidden="true" class="civds-w-5 civds-h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        <table role="grid" id="${this._gridId}" aria-labelledby="${this._headingId}">
          <thead>
            <tr>
              ${headers.map(
                (h) => html`<th scope="col" class="civds-p-1 civds-text-center civds-text-sm civds-text-base-dark civds-font-normal">
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
      'civds-w-10',
      'civds-h-10',
      'civds-text-center',
      'civds-text-sm',
      'civds-rounded',
      !day.inCurrentMonth ? 'civds-text-base-light' : '',
      disabled ? 'civds-opacity-40 civds-cursor-not-allowed' : 'civds-cursor-pointer hover:civds-bg-primary-lightest',
      selected ? 'civds-bg-primary civds-text-white civds-font-bold' : '',
      day.isToday && !selected ? 'civds-font-bold civds-underline' : '',
      selected ? 'focus-visible:civds-focus-ring-inverse' : 'focus-visible:civds-focus-ring',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <td role="gridcell">
        <button
          type="button"
          data-civds-day
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
    this.announce(this.dialogOpenedMessage);
  }

  private _closeDialog(): void {
    this._open = false;
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
    dispatch(this, 'civds-change', { value: iso });
    this.sendAnalytics('change');
    this.announce(interpolate(this.dateSelectedMessage, { date: formatDateLong(date, this.locale) }));
    this._closeDialog();
  }

  private _onTextInput(e: Event): void {
    const target = e.target as HTMLInputElement;
    this._inputValue = target.value;
  }

  private _onTextChange(e: Event): void {
    const target = e.target as HTMLInputElement;
    const text = target.value.trim();

    if (!text) {
      this.value = '';
      this._inputValue = '';
      this.updateFormValue('');
      dispatch(this, 'civds-change', { value: '' });
      return;
    }

    const parsed = parseDateString(text, this.locale);
    if (parsed) {
      const iso = toISODateString(parsed);
      this.value = iso;
      this._inputValue = formatDate(parsed, this.locale);
      this._displayMonth = parsed.getMonth();
      this._displayYear = parsed.getFullYear();
      this._focusedDate = parsed;
      this.updateFormValue(iso);
      dispatch(this, 'civds-change', { value: iso });
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

  private _onDialogKeydown(e: KeyboardEvent): void {
    const handler = createKeyboardHandler([
      {
        key: 'Escape',
        handler: () => this._closeDialog(),
      },
      {
        key: 'ArrowRight',
        handler: () => this._moveFocus(addDays(this._focusedDate, 1)),
      },
      {
        key: 'ArrowLeft',
        handler: () => this._moveFocus(addDays(this._focusedDate, -1)),
      },
      {
        key: 'ArrowDown',
        handler: () => this._moveFocus(addDays(this._focusedDate, 7)),
      },
      {
        key: 'ArrowUp',
        handler: () => this._moveFocus(addDays(this._focusedDate, -7)),
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

    handler(e);
  }

  private _onDocumentClick(e: MouseEvent): void {
    if (!this._open) return;
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
    dispatch(this, 'civds-reset');
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'civds-date-picker': CivdsDatePicker;
  }
}
