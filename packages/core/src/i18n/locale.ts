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
  comboboxResultAvailable: string; // "{count} result available" (singular)
  comboboxResultsAvailable: string; // "{count} results available" (plural)
  comboboxSelected: string; // "{label}, selected"
  comboboxClearLabel: string;

  // Form error summary
  formErrorSingular: string; // "There is 1 error in this form"
  formErrorPlural: string; // "There are {count} errors in this form"

  // Form validation
  fieldRequired: string; // "{label} is required"
  fieldInvalid: string; // "{label} is invalid"
  fieldFallbackLabel: string; // "This field" — fallback when no label provided
  formErrorAnnouncementSingular: string; // "1 error found. Review the error summary."
  formErrorAnnouncementPlural: string; // "{count} errors found. Review the error summary."

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
  datePickerClearLabel: string;

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

  // Alert
  alertDismissLabel: string;
  alertDismissedMessage: string;
  alertLabelInfo: string;
  alertLabelWarning: string;
  alertLabelError: string;
  alertLabelSuccess: string;

  // Checkbox group
  selectAll: string;
  deselectAll: string;
  maxSelectionsHint: string; // "Select up to {max}"
  clearButton: string;

  // Progress steps
  progressStepsLabel: string;
  progressStepLabel: string; // "Step {step} of {total}: {label}"
  progressStepGoTo: string; // "Go to step {step}: {label}"
  progressStepsCounter: string; // "Step {current} of {total}"

  // Name
  nameFirst: string;
  nameMiddle: string;
  nameLast: string;
  nameSuffix: string;
  nameInvalidChars: string; // "You entered a character we can't accept. Try removing '{chars}'"

  // Address
  addressStreet1: string;
  addressStreet2: string;
  addressStreet3: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  addressCountry: string;
  addressMilitary: string;
  addressMilitaryHint: string;
  addressStateProvince: string;
  addressPostalCode: string;

  // Direct deposit
  directDepositAccountType: string;
  directDepositChecking: string;
  directDepositSavings: string;
  directDepositRouting: string;
  directDepositRoutingHint: string;
  directDepositAccount: string;
  directDepositAccountHint: string;

  // Signature
  signatureName: string;
  signatureNameHint: string;
  signatureCertify: string;

  // Form step wizard
  formStepBack: string;
  formStepContinue: string;
  formStepSave: string;
  formStepOf: string; // "Step {current} of {total}"
  formStepPauseLabel: string; // "Save and come back later"
  formStepSensitiveNotice: string; // soft announcement when entering a sensitive step

  // Sensitive form patterns
  sectionIntroRegionLabel: string; // fallback aria-label for section-intro
  preferNotToAnswer: string; // "Prefer not to answer"
  supportResourcesHeading: string; // "If you need support"

  // Deceased person (bereavement / survivor benefit forms)
  deceasedPersonLegend: string; // "About the person who died"
  deceasedPersonNameLegend: string; // "Their name"
  deceasedPersonDateOfBirth: string; // "Date of birth"
  deceasedPersonDateOfDeath: string; // "Date of death"
  deceasedPersonRelationship: string; // "Their relationship to you"
  deceasedPersonRelationshipSpouse: string;
  deceasedPersonRelationshipParent: string;
  deceasedPersonRelationshipChild: string;
  deceasedPersonRelationshipSibling: string;
  deceasedPersonRelationshipOther: string;

  // Relationship (compound component for person + relationship type)
  relationshipLegend: string; // "About this person"
  relationshipTypeLabel: string; // "Relationship to you"
  relationshipNameLegend: string; // "Their name"
  relationshipMarriageDateLegend: string; // "Date of marriage"
  relationshipDivorceDateLegend: string; // "Date of divorce or separation"
  relationshipDateOfBirthLegend: string; // "Date of birth"
  relationshipAdoptionDateLegend: string; // "Date of adoption"
  relationshipDeceasedLegend: string; // "Is this person deceased?"
  relationshipDateOfDeathLegend: string; // "Date of death"
  relationshipOtherLabel: string; // "Describe the relationship"
  relationshipOtherHint: string; // "For example: cousin, family friend"
  relationshipSpouse: string;
  relationshipExSpouse: string;
  relationshipDomesticPartner: string;
  relationshipBiologicalChild: string;
  relationshipAdoptedChild: string;
  relationshipStepchild: string;
  relationshipFosterChild: string;
  relationshipChild: string;
  relationshipGrandchild: string;
  relationshipParent: string;
  relationshipSibling: string;
  relationshipExecutor: string;
  relationshipFuneralDirector: string;
  relationshipOther: string;

  // Prefill notice
  prefillNoticeHeading: string;
  prefillNoticeBody: string;
  prefillNoticeLink: string;

  // Read-only field
  readOnlyLabel: string; // fallback if no label

  // Repeater
  repeaterAddButton: string; // "Add another {item}"
  repeaterRemoveButton: string;
  repeaterRemoveAriaLabel: string; // "Remove {item} {index}"
  repeaterItemAdded: string; // "{item} {index} added"
  repeaterItemRemoved: string; // "{item} {index} removed"
  repeaterEditButton: string;
  repeaterEditAriaLabel: string; // "Edit {item} {index}"
  repeaterSaveButton: string;
  repeaterCancelButton: string;
  repeaterItemSaved: string; // "{item} {index} saved"
  repeaterItemLabel: string; // "{item} {index}"
  repeaterEditingAnnouncement: string; // "Editing {item} {index}"
  repeaterWizardAddTitle: string; // "Add {item}"
  repeaterWizardEditTitle: string; // "Edit {item} {index}"

  // Marriage history
  marriageLegend: string;
  marriageSpouseLegend: string;
  marriageDateLegend: string;
  marriageCityLabel: string;
  marriageStateLabel: string;
  marriageStatusLegend: string;
  marriageStatusCurrent: string;
  marriageStatusDivorced: string;
  marriageStatusWidowed: string;
  marriageStatusAnnulled: string;
  marriageEndDateLegend: string;

  // Service history
  serviceLegend: string;
  serviceBranchLabel: string;
  serviceStartDateLegend: string;
  serviceStartDateHint: string;
  serviceEndDateLegend: string;
  serviceEndDateHint: string;
  serviceDischargeLabel: string;
  serviceNumberLabel: string;
  serviceNumberHint: string;

  // Task list
  taskStatusNotStarted: string;
  taskStatusInProgress: string;
  taskStatusComplete: string;
  taskStatusCannotStart: string;
  taskStatusError: string;
  taskStatusReview: string;

  // Summary
  summaryEditLink: string;
  summaryEditAriaLabel: string; // "Edit {section}"
  summaryNotProvided: string;
  // Summary prefill
  summaryEditProfile: string;

  // Skip link
  skipLinkDefaultText: string;

  // Task prefill
  taskPrefillHint: string;

  // Prefill states
  prefillLoading: string;
  prefillError: string;
  prefillRetry: string;

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
  comboboxResultAvailable: '{count} result available',
  comboboxResultsAvailable: '{count} results available',
  comboboxSelected: '{label}, selected',
  comboboxClearLabel: 'Clear selection',

  formErrorSingular: 'There is 1 error in this form',
  formErrorPlural: 'There are {count} errors in this form',

  fieldRequired: '{label} is required',
  fieldInvalid: '{label} is invalid',
  fieldFallbackLabel: 'This field',
  formErrorAnnouncementSingular: '1 error found. Review the error summary.',
  formErrorAnnouncementPlural: '{count} errors found. Review the error summary.',

  fileUploadDragText: 'Drag files here or',
  fileUploadNoFileChosen: 'No file chosen',
  fileUploadBrowseText: 'Choose from folder',
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
  datePickerClearLabel: 'Clear date',

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
  alertLabelInfo: 'Informational alert',
  alertLabelWarning: 'Warning alert',
  alertLabelError: 'Error alert',
  alertLabelSuccess: 'Success alert',

  progressStepsLabel: 'Progress',
  progressStepLabel: 'Step {step} of {total}: {label}',
  progressStepGoTo: 'Go to step {step}: {label}',
  progressStepsCounter: 'Step {current} of {total}',

  selectAll: 'Select all',
  deselectAll: 'Deselect all',
  maxSelectionsHint: 'Select up to {max}',
  clearButton: 'Clear',

  nameFirst: 'First name',
  nameMiddle: 'Middle name',
  nameLast: 'Last name',
  nameSuffix: 'Suffix',
  nameInvalidChars: "You entered a character we can't accept. Try removing '{chars}'",

  addressStreet1: 'Street address',
  addressStreet2: 'Street address line 2',
  addressStreet3: 'Street address line 3',
  addressCity: 'City',
  addressState: 'State',
  addressZip: 'ZIP code',
  addressCountry: 'Country',
  addressMilitary: 'I receive mail outside of the United States on a military base',
  addressMilitaryHint: 'The United States is automatically chosen as your country if you have a military address',
  addressStateProvince: 'State, province, or region',
  addressPostalCode: 'Postal code',

  directDepositAccountType: 'Account type',
  directDepositChecking: 'Checking',
  directDepositSavings: 'Savings',
  directDepositRouting: 'Bank routing number',
  directDepositRoutingHint: 'The 9-digit number on the bottom left of a check',
  directDepositAccount: 'Bank account number',
  directDepositAccountHint: 'The account number on the bottom of a check',

  signatureName: 'Your full name',
  signatureNameHint: 'Please type your first and last name',
  signatureCertify: 'I certify the information above is correct and true to the best of my knowledge and belief',

  formStepBack: 'Back',
  formStepContinue: 'Continue',
  formStepSave: 'Save and continue',
  formStepOf: 'Step {current} of {total}',
  formStepPauseLabel: 'Save and come back later',
  formStepSensitiveNotice: 'This section asks personal questions. Your answers are saved as you go.',

  sectionIntroRegionLabel: 'Section introduction',
  preferNotToAnswer: 'Prefer not to answer',
  supportResourcesHeading: 'If you need support',

  deceasedPersonLegend: 'About the person who died',
  deceasedPersonNameLegend: 'Their name',
  deceasedPersonDateOfBirth: 'Date of birth',
  deceasedPersonDateOfDeath: 'Date of death',
  deceasedPersonRelationship: 'Their relationship to you',
  deceasedPersonRelationshipSpouse: 'Spouse',
  deceasedPersonRelationshipParent: 'Parent',
  deceasedPersonRelationshipChild: 'Child',
  deceasedPersonRelationshipSibling: 'Sibling',
  deceasedPersonRelationshipOther: 'Other',

  relationshipLegend: 'About this person',
  relationshipTypeLabel: 'Relationship to you',
  relationshipNameLegend: 'Their name',
  relationshipMarriageDateLegend: 'Date of marriage',
  relationshipDivorceDateLegend: 'Date of divorce or separation',
  relationshipDateOfBirthLegend: 'Date of birth',
  relationshipAdoptionDateLegend: 'Date of adoption',
  relationshipDeceasedLegend: 'Is this person deceased?',
  relationshipDateOfDeathLegend: 'Date of death',
  relationshipOtherLabel: 'Describe the relationship',
  relationshipOtherHint: 'For example: cousin, family friend',
  relationshipSpouse: 'Spouse',
  relationshipExSpouse: 'Former spouse',
  relationshipDomesticPartner: 'Domestic partner',
  relationshipBiologicalChild: 'Biological child',
  relationshipAdoptedChild: 'Adopted child',
  relationshipStepchild: 'Stepchild',
  relationshipFosterChild: 'Foster child',
  relationshipChild: 'Child',
  relationshipGrandchild: 'Grandchild',
  relationshipParent: 'Parent',
  relationshipSibling: 'Sibling',
  relationshipExecutor: 'Executor or personal representative',
  relationshipFuneralDirector: 'Funeral director',
  relationshipOther: 'Other',

  prefillNoticeHeading: 'We\u2019ve prefilled some of your information',
  prefillNoticeBody: 'We pulled this information from your account. If any of this is wrong, you can correct it here.',
  prefillNoticeLink: 'Update your profile',

  readOnlyLabel: 'Information',

  repeaterAddButton: 'Add another {item}',
  repeaterRemoveButton: 'Remove',
  repeaterRemoveAriaLabel: 'Remove {item} {index}',
  repeaterItemAdded: '{item} {index} added',
  repeaterItemRemoved: '{item} {index} removed',
  repeaterEditButton: 'Edit',
  repeaterEditAriaLabel: 'Edit {item} {index}',
  repeaterSaveButton: 'Save {item}',
  repeaterCancelButton: 'Cancel',
  repeaterItemSaved: '{item} {index} saved',
  repeaterItemLabel: '{item} {index}',
  repeaterEditingAnnouncement: 'Editing {item} {index}',
  repeaterWizardAddTitle: 'Add {item}',
  repeaterWizardEditTitle: 'Edit {item} {index}',

  marriageLegend: 'About this marriage',
  marriageSpouseLegend: 'Spouse\'s name',
  marriageDateLegend: 'Date of marriage',
  marriageCityLabel: 'City where you were married',
  marriageStateLabel: 'State or country where you were married',
  marriageStatusLegend: 'Marriage status',
  marriageStatusCurrent: 'Currently married',
  marriageStatusDivorced: 'Divorced',
  marriageStatusWidowed: 'Widowed',
  marriageStatusAnnulled: 'Annulled',
  marriageEndDateLegend: 'Date marriage ended',

  serviceLegend: 'About this service period',
  serviceBranchLabel: 'Branch of service',
  serviceStartDateLegend: 'Service start date',
  serviceStartDateHint: 'If you don\'t know the exact date, enter your best estimate',
  serviceEndDateLegend: 'Service end date',
  serviceEndDateHint: 'If you don\'t know the exact date, enter your best estimate',
  serviceDischargeLabel: 'Character of service',
  serviceNumberLabel: 'Service number',
  serviceNumberHint: 'If you served before 1974, enter your service number',

  taskStatusNotStarted: 'Not started',
  taskStatusInProgress: 'In progress',
  taskStatusComplete: 'Complete',
  taskStatusCannotStart: 'Cannot start yet',
  taskStatusError: 'There is a problem',
  taskStatusReview: 'Review',

  summaryEditLink: 'Edit',
  summaryEditAriaLabel: 'Edit {section}',
  summaryNotProvided: 'Not provided',
  summaryEditProfile: 'Edit',

  skipLinkDefaultText: 'Skip to main content',

  taskPrefillHint: 'We prefilled some information \u2014 please review',

  prefillLoading: 'Loading your information\u2026',
  prefillError: 'We couldn\u2019t load your information.',
  prefillRetry: 'Try again',

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
