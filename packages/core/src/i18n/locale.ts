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
  fileUploadNoFileChosen: string;
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
  fileUploadEmptyFile: string; // "{name} appears to be empty (0 bytes)"
  fileUploadCancelled: string;
  fileUploadUploading: string; // "Uploading {name}, {progress} percent complete"
  fileUploadSuccess: string; // "{name} uploaded successfully"
  fileUploadError: string; // "Upload failed for {name}: {error}"
  fileUploadCancelledAnnounce: string; // "Upload cancelled for {name}"

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
  maskCurrencyHint: string;
  maskCurrencyError: string;

  // Textarea word count
  textareaWordsRemaining: string; // "{count} words remaining"
  textareaWordLimit: string; // "Word limit: {max}"

  // Alert dismiss
  alertDismissLabel: string;
  alertDismissedMessage: string;

  // Checkbox group
  selectAll: string;
  deselectAll: string;
  maxSelectionsHint: string; // "Select up to {max}"

  // Validation
  validateRequired: string; // "{label} is required"
  validateEmail: string;
  validatePhone: string;
  validatePhoneIntl: string;
  validateSsn: string;
  validateEin: string;
  validateZip: string;
  validateZip4: string;
  validateUsState: string;
  validateIsoDate: string;
  validateUrl: string;
  validateCurrency: string;
  validateRangeMin: string; // "Must be at least {min}"
  validateRangeMax: string; // "Must be no more than {max}"
  validateRangeBetween: string; // "Must be between {min} and {max}"
  validateLengthMin: string; // "Must be at least {min} characters"
  validateLengthMax: string; // "Must be no more than {max} characters"
  validateLengthBetween: string; // "Must be between {min} and {max} characters"
  validateAlphanumeric: string;
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
  fileUploadNoFileChosen: 'No file chosen',
  fileUploadBrowseText: 'choose from folder',
  fileUploadAcceptedLabel: 'Accepted: ',
  fileUploadMaxSizeLabel: 'Max size: ',
  fileUploadRemoveText: 'Remove',
  fileUploadRemoveAriaLabel: 'Remove {name}',
  fileUploadFilesListLabel: 'Selected files',
  fileUploadFileAddedMessage: '{count} file(s) added. {total} file(s) selected.',
  fileUploadFileRemovedMessage: 'File removed. {total} file(s) selected.',
  fileUploadFileSizeError: '{name} exceeds the maximum size of {size}',
  fileUploadFileTypeError: '{name} is not an accepted file type. Accepted: {accepted}',
  fileUploadMaxFilesError: 'Maximum of {max} files allowed. {name} was not added',
  fileUploadEmptyFile: '{name} appears to be empty (0 bytes)',
  fileUploadCancelled: 'Upload cancelled',
  fileUploadUploading: 'Uploading {name}, {progress} percent complete',
  fileUploadSuccess: '{name} uploaded successfully',
  fileUploadError: 'Upload failed for {name}: {error}',
  fileUploadCancelledAnnounce: 'Upload cancelled for {name}',

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
  maskCurrencyHint: 'For example: 1,234.56',
  maskCurrencyError: 'Enter a valid dollar amount',

  textareaWordsRemaining: '{count} words remaining',
  textareaWordLimit: 'Word limit: {max}',

  alertDismissLabel: 'Dismiss alert',
  alertDismissedMessage: 'Alert dismissed',

  selectAll: 'Select all',
  deselectAll: 'Deselect all',
  maxSelectionsHint: 'Select up to {max}',

  validateRequired: '{label} is required',
  validateEmail: 'Enter a valid email address',
  validatePhone: 'Enter a 10-digit phone number',
  validatePhoneIntl: 'Enter a valid phone number with country code (e.g., +1 555 123 4567)',
  validateSsn: 'Enter a valid 9-digit Social Security number',
  validateEin: 'Enter a valid 9-digit Employer Identification Number',
  validateZip: 'Enter a 5-digit ZIP code',
  validateZip4: 'Enter a valid ZIP+4 code (e.g., 12345-6789)',
  validateUsState: 'Enter a valid 2-letter state abbreviation',
  validateIsoDate: 'Enter a valid date (YYYY-MM-DD)',
  validateUrl: 'Enter a valid URL starting with http:// or https://',
  validateCurrency: 'Enter a valid dollar amount',
  validateRangeMin: 'Must be at least {min}',
  validateRangeMax: 'Must be no more than {max}',
  validateRangeBetween: 'Must be between {min} and {max}',
  validateLengthMin: 'Must be at least {min} characters',
  validateLengthMax: 'Must be no more than {max} characters',
  validateLengthBetween: 'Must be between {min} and {max} characters',
  validateAlphanumeric: 'Only letters and numbers are allowed',
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
