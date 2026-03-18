/**
 * CivUI i18n — centralized string registry for component UI text.
 *
 * Components read strings via `t('key')`. Consumers can override
 * all strings by calling `setLocaleStrings()` with a partial or
 * full translation object.
 */

export interface CivLocaleStrings {
  // Required indicator
  required: string;

  // Select
  selectEmpty: string;

  // Combobox
  comboboxNoResults: string;
  comboboxResultsAvailable: string; // "{count} results available"
  comboboxSelected: string; // "{label}, selected"

  // Form error summary
  formErrorSingular: string; // "There is 1 error in this form"
  formErrorPlural: string; // "There are {count} errors in this form"

  // Form validation
  fieldRequired: string; // "{label} is required"
  fieldInvalid: string; // "{label} is invalid"
  fieldFallbackLabel: string; // "This field" — fallback when no label provided
  formErrorAnnouncement: string; // "{count} errors found. Review the error summary."

  // File upload
  fileUploadDragText: string;
  fileUploadBrowseText: string;
  fileUploadAcceptedLabel: string;
  fileUploadMaxSizeLabel: string;
  fileUploadRemoveText: string;
  fileUploadRemoveAriaLabel: string; // "Remove {name}"
  fileUploadFilesListLabel: string;
  fileUploadFileAddedMessage: string; // "{count} file(s) added..."
  fileUploadFileRemovedMessage: string;
  fileUploadFileSizeError: string; // "{name} exceeds..."
  fileUploadFileTypeError: string;
  fileUploadMaxFilesError: string;

  // Date picker
  datePickerPlaceholder: string;
  datePickerChooseDateLabel: string;
  datePickerSelectedDateLabel: string;
  datePickerDialogLabel: string;
  datePickerPreviousMonthLabel: string;
  datePickerNextMonthLabel: string;
  datePickerDialogOpenedMessage: string;
  datePickerDateSelectedMessage: string;
  datePickerTodayLabel: string;
  datePickerInvalidFormatMessage: string;
  datePickerDateRangeMessage: string; // "Date must be between {min} and {max}"
  datePickerMinDateMessage: string; // "Date must be on or after {min}"
  datePickerMaxDateMessage: string; // "Date must be on or before {max}"

  // Memorable date
  memorableDateMonthLabel: string;
  memorableDateDayLabel: string;
  memorableDateYearLabel: string;
  memorableDateMonthEmptyLabel: string;
  memorableDateDayPlaceholder: string;
  memorableDateYearPlaceholder: string;
  memorableDateDateSetMessage: string;
  memorableDateInvalidDateMessage: string;

  // Mask
  maskSsnHint: string;
  maskPhoneUsHint: string;
  maskZipHint: string;
  maskZip4Hint: string;
  maskEinHint: string;
  maskPhoneIntlHint: string;
  maskSsnError: string;
  maskPhoneUsError: string;
  maskZipError: string;
  maskZip4Error: string;
  maskEinError: string;
  maskPhoneIntlError: string;
  maskPatternError: string;

  // Alert dismiss
  alertDismissLabel: string;
  alertDismissedMessage: string;
}

const defaultStrings: CivLocaleStrings = {
  required: '(required)',

  selectEmpty: '- Select -',

  comboboxNoResults: 'No results found',
  comboboxResultsAvailable: '{count} {count, plural, one {result} other {results}} available',
  comboboxSelected: '{label}, selected',

  formErrorSingular: 'There is 1 error in this form',
  formErrorPlural: 'There are {count} errors in this form',

  fieldRequired: '{label} is required',
  fieldInvalid: '{label} is invalid',
  fieldFallbackLabel: 'This field',
  formErrorAnnouncement: '{count} {count, plural, one {error} other {errors}} found. Review the error summary.',

  fileUploadDragText: 'Drag files here or',
  fileUploadBrowseText: 'choose from folder',
  fileUploadAcceptedLabel: 'Accepted: ',
  fileUploadMaxSizeLabel: 'Max size: ',
  fileUploadRemoveText: 'Remove',
  fileUploadRemoveAriaLabel: 'Remove {name}',
  fileUploadFilesListLabel: 'Selected files',
  fileUploadFileAddedMessage: '{count} file(s) added. {total} file(s) selected.',
  fileUploadFileRemovedMessage: 'File removed. {total} file(s) selected.',
  fileUploadFileSizeError: '{name} exceeds maximum size of {size}',
  fileUploadFileTypeError: '{name} is not an accepted file type',
  fileUploadMaxFilesError: 'Maximum of {max} files allowed',

  datePickerPlaceholder: 'mm/dd/yyyy',
  datePickerChooseDateLabel: 'Choose date',
  datePickerSelectedDateLabel: 'Choose date, selected date is {date}',
  datePickerDialogLabel: 'Choose Date',
  datePickerPreviousMonthLabel: 'Previous month',
  datePickerNextMonthLabel: 'Next month',
  datePickerDialogOpenedMessage: 'Calendar dialog opened',
  datePickerDateSelectedMessage: 'Selected {date}',
  datePickerTodayLabel: 'today',
  datePickerInvalidFormatMessage: 'Invalid date format',
  datePickerDateRangeMessage: 'Date must be between {min} and {max}',
  datePickerMinDateMessage: 'Date must be on or after {min}',
  datePickerMaxDateMessage: 'Date must be on or before {max}',

  memorableDateMonthLabel: 'Month',
  memorableDateDayLabel: 'Day',
  memorableDateYearLabel: 'Year',
  memorableDateMonthEmptyLabel: '- Month -',
  memorableDateDayPlaceholder: 'DD',
  memorableDateYearPlaceholder: 'YYYY',
  memorableDateDateSetMessage: 'Date set to {date}',
  memorableDateInvalidDateMessage: 'Enter a valid date',

  maskSsnHint: 'For example: 123-45-6789',
  maskPhoneUsHint: 'For example: (555) 123-4567',
  maskZipHint: 'For example: 12345',
  maskZip4Hint: 'For example: 12345-6789',
  maskEinHint: 'For example: 12-3456789',
  maskPhoneIntlHint: 'For example: +1 (555) 123-4567',
  maskSsnError: 'Enter a 9-digit Social Security number',
  maskPhoneUsError: 'Enter a 10-digit phone number',
  maskZipError: 'Enter a 5-digit ZIP code',
  maskZip4Error: 'Enter a 9-digit ZIP+4 code',
  maskEinError: 'Enter a 9-digit Employer Identification Number',
  maskPhoneIntlError: 'Enter a valid phone number with country code',
  maskPatternError: '{label} does not match the expected format',

  alertDismissLabel: 'Dismiss alert',
  alertDismissedMessage: 'Alert dismissed',
};

let currentStrings: CivLocaleStrings = { ...defaultStrings };

/**
 * Get a translated string by key. Returns the current locale's
 * version, falling back to the English default.
 */
export function t(key: keyof CivLocaleStrings): string {
  return currentStrings[key] ?? defaultStrings[key];
}

/**
 * Set locale strings. Merges with defaults — you only need to
 * provide the strings you want to override.
 */
export function setLocaleStrings(strings: Partial<CivLocaleStrings>): void {
  currentStrings = { ...defaultStrings, ...strings };
}

/**
 * Reset to default English strings.
 */
export function resetLocaleStrings(): void {
  currentStrings = { ...defaultStrings };
}

/**
 * Get all current locale strings (for inspection/debugging).
 */
export function getLocaleStrings(): Readonly<CivLocaleStrings> {
  return currentStrings;
}
