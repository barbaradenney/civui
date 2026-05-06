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
  comboboxLoading: string; // shown in dropdown while async loadOptions is in flight
  comboboxLoadError: string; // shown when loadOptions rejects
  comboboxTypeToSearch: string; // "Type at least {count} characters"
  comboboxLoadingAnnouncement: string; // SR announcement when fetch starts

  // Form error summary
  formErrorSingular: string; // "There is 1 error in this form"
  formErrorPlural: string; // "There are {count} errors in this form"

  // Form validation
  fieldRequired: string; // "{label} is required"
  fieldInvalid: string; // "{label} is invalid"
  fieldFallbackLabel: string; // "This field" — fallback when no label provided
  formErrorAnnouncementSingular: string; // "1 error found. Review the error summary."
  formErrorAnnouncementPlural: string; // "{count} errors found. Review the error summary."

  // Link
  linkDisabledTitle: string;
  externalLinkNewTab: string;

  // Filter chip
  filterChipRemoveLabel: string; // "Remove {label} filter"

  // Close button
  closeLabel: string;

  // File upload
  fileUploadShowAll: string; // "Show all {count} files"
  fileUploadDragText: string;
  fileUploadNoFileChosen: string;
  fileUploadBrowseText: string;
  fileUploadAcceptedLabel: string;
  fileUploadMaxSizeLabel: string;
  fileUploadRemoveText: string;
  fileUploadRemoveAriaLabel: string; // "Remove {name}"
  fileUploadFilesListLabel: string;
  fileUploadFileAddedMessage: string; // "{count} file(s) added..."
  fileUploadFileRemovedMessage: string; // "Removed {name}. {total} file(s) selected."
  fileUploadShowAllAnnounce: string; // "Showing all {count} files"
  fileUploadRetryAnnounce: string; // "Retrying upload of {name}"
  fileUploadFileSizeError: string; // "{name} exceeds..."
  fileUploadFileTypeError: string;
  fileUploadMaxFilesError: string;
  fileUploadEmptyFile: string; // "{name} appears to be empty (0 bytes)"
  fileUploadDuplicateError: string; // "{name} is already in the list"
  fileUploadCancelled: string;
  fileUploadCancelText: string; // "Cancel"
  fileUploadCancelAriaLabel: string; // "Cancel upload for {name}"
  fileUploadRetryText: string; // "Retry"
  fileUploadRetryAriaLabel: string; // "Retry upload for {name}"
  fileUploadProgressAriaLabel: string; // "Upload progress for {name}"
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
  datePickerTodayButton: string; // "Today" button in dialog footer
  datePickerMonthLabel: string; // aria-label for the month-jump <select> in the dialog header
  datePickerYearLabel: string;  // aria-label for the year-jump <select> in the dialog header
  datePickerInvalidFormatMessage: string;
  datePickerDateRangeMessage: string; // "Date must be between {min} and {max}"
  datePickerMinDateMessage: string; // "Date must be on or after {min}"
  datePickerMaxDateMessage: string; // "Date must be on or before {max}"
  datePickerClearLabel: string;

  // Date range picker
  dateRangeStartLabel: string;
  dateRangeEndLabel: string;
  dateRangeEndBeforeStartError: string; // "End date must be on or after start date"
  dateRangeMinRangeError: string; // "Range must be at least {count} days"
  dateRangeMaxRangeError: string; // "Range must be at most {count} days"

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
  // Specialized input labels
  ssnLabel: string;
  ssnLast4Label: string;
  ssnLast4Hint: string;
  phoneLabel: string;
  emailLabel: string;
  emailHint: string;
  zipLabel: string;
  einLabel: string;
  currencyLabel: string;
  routingNumberLabel: string;
  routingNumberHint: string;
  vaFileNumberLabel: string;
  vaFileNumberHint: string;

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

  // Input char/word counts (shared by civ-text-input and civ-textarea)
  inputCharsRemaining: string; // "{count} characters remaining"
  textareaWordsRemaining: string; // "{count} words remaining"
  textareaWordsOverLimit: string; // "{count} {count, plural, one {word} other {words}} over the limit"
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
  minSelectionsHint: string; // "Select at least {min}"
  minSelectionsError: string; // "Please select at least {min} options"
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
  addressMilitaryPostOffice: string;
  addressMilitaryState: string;
  addressStateProvince: string;
  addressPostalCode: string;

  // Housing status (no permanent address pattern)
  housingNoPermanentAddress: string;
  housingGeneralLocation: string;
  housingContactMethod: string;
  housingContactMethodHint: string;
  housingPointOfContact: string;
  housingPointOfContactHint: string;
  housingCanReceiveMail: string;
  housingLivingSituation: string;
  housingLivingSituationHint: string;

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

  // Form step (multi-step navigation within a form chapter)
  formStepBack: string;
  formStepContinue: string;
  formStepSave: string;
  formStepOf: string; // "Step {current} of {total}"
  formStepPauseLabel: string; // "Save and come back later"
  formStepSensitiveNotice: string; // soft announcement when entering a sensitive step
  formStepValidating: string; // "Validating…" — continue button label while async beforeContinue is pending

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
  relationshipStepparent: string;
  relationshipGrandparent: string;
  relationshipSibling: string;
  relationshipHalfSibling: string;
  relationshipLegalGuardian: string;
  relationshipWard: string;
  relationshipPowerOfAttorney: string;
  relationshipExecutor: string;
  relationshipTrustee: string;
  relationshipBeneficiary: string;
  relationshipFuneralDirector: string;
  relationshipCaretaker: string;
  relationshipDependent: string;
  relationshipSelf: string;
  relationshipOtherRelative: string;
  relationshipNonRelative: string;
  relationshipOther: string;

  // Prefill notice
  prefillNoticeHeading: string;
  prefillNoticeBody: string;
  prefillNoticeLink: string;

  // Data field
  dataFieldLabel: string; // fallback if no label
  /** @deprecated Use `dataFieldLabel` instead. */
  readOnlyLabel: string;

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
  repeaterFormStepsAddTitle: string; // "Add {item}"
  repeaterFormStepsEditTitle: string; // "Edit {item} {index}"
  repeaterMinReached: string; // "At least {min} {item} required"

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
  marriageEndDateWidowedLegend: string; // "Date of their passing"
  marriageTypeLabel: string; // "Type of marriage or union"
  marriageTypeLegal: string;
  marriageTypeCivilUnion: string;
  marriageTypeDomesticPartnership: string;
  marriageTypeCommonLaw: string;
  marriageTypeTribal: string;
  marriageTypeOther: string;
  marriageTypeDescriptionLabel: string; // "Describe the type of union"
  marriageTypeDescriptionHint: string;
  marriageRegistrationDateLegend: string; // "Date of registration"
  marriageJurisdictionLabel: string; // "Jurisdiction that issued the registration"
  marriageCohabitationStartLegend: string; // "Date you began living together"
  marriageCohabitationStateLabel: string; // "State where you live together"
  marriageApproxDateLegend: string; // "Approximate date union began"

  // Address validation
  addressValidationHeading: string;
  addressValidationOriginalLabel: string;
  addressValidationSuggestedLabel: string;
  addressValidationUseOriginal: string;
  addressValidationUseSuggested: string;
  addressValidationLoading: string;

  // Service history
  serviceLegend: string;
  serviceBranchLabel: string;
  dischargeTypeLabel: string;
  suffixLabel: string;
  serviceStartDateLegend: string;
  serviceStartDateHint: string;
  serviceEndDateLegend: string;
  serviceEndDateHint: string;
  serviceDischargeLabel: string;
  serviceNumberLabel: string;
  serviceNumberHint: string;

  // Demographics
  maritalStatusLabel: string;
  ethnicityLabel: string;
  genderLabel: string;
  languageLabel: string;

  // Task list
  taskStatusNotStarted: string;
  taskStatusInProgress: string;
  taskStatusComplete: string;
  taskStatusCannotStart: string;
  taskStatusError: string;
  taskStatusReview: string;

  // Summary
  summaryDefaultHeading: string; // fallback aria-label when no `heading` set
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

  // Select presets — service branch
  presetServiceBranchArmy: string;
  presetServiceBranchNavy: string;
  presetServiceBranchAirForce: string;
  presetServiceBranchMarineCorps: string;
  presetServiceBranchCoastGuard: string;
  presetServiceBranchSpaceForce: string;
  presetServiceBranchArmyReserve: string;
  presetServiceBranchNavyReserve: string;
  presetServiceBranchAirForceReserve: string;
  presetServiceBranchMarineCorpsReserve: string;
  presetServiceBranchCoastGuardReserve: string;
  presetServiceBranchArmyNationalGuard: string;
  presetServiceBranchAirNationalGuard: string;
  presetServiceBranchArmyAirCorps: string;
  presetServiceBranchArmyAirForces: string;
  presetServiceBranchWomensArmyCorps: string;
  presetServiceBranchNoaa: string;
  presetServiceBranchUsphs: string;

  // Select presets — discharge type
  presetDischargeHonorable: string;
  presetDischargeGeneral: string;
  presetDischargeOtherThanHonorable: string;
  presetDischargeBadConduct: string;
  presetDischargeDishonorable: string;
  presetDischargeUncharacterized: string;

  // Select presets — suffix
  presetSuffixJr: string;
  presetSuffixSr: string;
  presetSuffixII: string;
  presetSuffixIII: string;
  presetSuffixIV: string;
  presetSuffixV: string;

  // Select presets — relationship
  presetRelationshipSpouse: string;
  presetRelationshipDomesticPartner: string;
  presetRelationshipChild: string;
  presetRelationshipStepchild: string;
  presetRelationshipParent: string;
  presetRelationshipSibling: string;
  presetRelationshipGrandchild: string;
  presetRelationshipGrandparent: string;
  presetRelationshipLegalGuardian: string;
  presetRelationshipOther: string;
  presetRelationshipFormerSpouse: string;
  presetRelationshipBiologicalChild: string;
  presetRelationshipAdoptedChild: string;
  presetRelationshipFosterChild: string;
  presetRelationshipStepparent: string;
  presetRelationshipHalfSibling: string;
  presetRelationshipWard: string;
  presetRelationshipPowerOfAttorney: string;
  presetRelationshipExecutor: string;
  presetRelationshipTrustee: string;
  presetRelationshipBeneficiary: string;
  presetRelationshipCaretaker: string;
  presetRelationshipDependent: string;
  presetRelationshipFuneralDirector: string;
  presetRelationshipSelf: string;
  presetRelationshipOtherRelative: string;
  presetRelationshipNonRelative: string;
  presetRelationshipSurvivingSpouse: string;
  presetRelationshipSurvivingChild: string;
  presetRelationshipSurvivingParent: string;

  // Select presets — marital status
  presetMaritalNeverMarried: string;
  presetMaritalMarried: string;
  presetMaritalSeparated: string;
  presetMaritalDivorced: string;
  presetMaritalWidowed: string;

  // Select presets — ethnicity
  presetEthnicityHispanicLatino: string;
  presetEthnicityNotHispanicLatino: string;
  presetEthnicityPreferNotToAnswer: string;

  // Select presets — gender
  presetGenderMale: string;
  presetGenderFemale: string;
  presetGenderNonBinary: string;
  presetGenderPreferNotToAnswer: string;
  presetGenderOther: string;

  // Select presets — language
  presetLanguageEnglish: string;
  presetLanguageSpanish: string;
  presetLanguageChinese: string;
  presetLanguageTagalog: string;
  presetLanguageVietnamese: string;
  presetLanguageArabic: string;
  presetLanguageFrench: string;
  presetLanguageKorean: string;
  presetLanguageRussian: string;
  presetLanguagePortuguese: string;
  presetLanguageHaitianCreole: string;
  presetLanguageGerman: string;
  presetLanguageJapanese: string;
  presetLanguageHindi: string;
  presetLanguageOther: string;

  // Select presets — housing status
  presetHousingOwn: string;
  presetHousingRent: string;
  presetHousingLivingWithFamily: string;
  presetHousingTemporaryShelter: string;
  presetHousingTransitionalHousing: string;
  presetHousingMilitaryHousing: string;
  presetHousingHomeless: string;
  presetHousingOther: string;

  // Select presets — education level
  presetEducationLessThanHighSchool: string;
  presetEducationHighSchool: string;
  presetEducationSomeCollege: string;
  presetEducationAssociate: string;
  presetEducationBachelor: string;
  presetEducationMaster: string;
  presetEducationDoctoral: string;

  // Select presets — employment status
  presetEmploymentFullTime: string;
  presetEmploymentPartTime: string;
  presetEmploymentSelfEmployed: string;
  presetEmploymentUnemployed: string;
  presetEmploymentRetired: string;
  presetEmploymentStudent: string;
  presetEmploymentUnableToWork: string;
  presetEmploymentNotInLaborForce: string;

  // Select presets — income source
  presetIncomeEmployment: string;
  presetIncomeSelfEmployment: string;
  presetIncomeSocialSecurity: string;
  presetIncomePension: string;
  presetIncomeDisability: string;
  presetIncomeUnemployment: string;
  presetIncomeChildSupport: string;
  presetIncomeInvestment: string;
  presetIncomeRentalIncome: string;
  presetIncomeOther: string;

  // Select presets — veteran status
  presetVeteranNonVeteran: string;
  presetVeteranVeteran: string;
  presetVeteranActiveDuty: string;
  presetVeteranReserveGuard: string;
  presetVeteranRetiredMilitary: string;
  presetVeteranSpouse: string;
  presetVeteranSurvivingSpouse: string;

  // Select presets — disability type
  presetDisabilityPhysical: string;
  presetDisabilityCognitive: string;
  presetDisabilityMentalHealth: string;
  presetDisabilityVision: string;
  presetDisabilityHearing: string;
  presetDisabilitySpeech: string;
  presetDisabilityChronicIllness: string;
  presetDisabilityDevelopmental: string;
  presetDisabilityMultiple: string;
  presetDisabilityPreferNotToAnswer: string;

  // Select presets — citizenship status
  presetCitizenshipUsCitizenBirth: string;
  presetCitizenshipUsCitizenNaturalized: string;
  presetCitizenshipUsNational: string;
  presetCitizenshipPermanentResident: string;
  presetCitizenshipAuthorizedAlien: string;
  presetCitizenshipPreferNotToAnswer: string;

  // Select presets — pay frequency
  presetPayWeekly: string;
  presetPayBiWeekly: string;
  presetPaySemiMonthly: string;
  presetPayMonthly: string;
  presetPayAnnually: string;
  presetPayOneTime: string;

  // Select presets — contact preference
  presetContactEmail: string;
  presetContactPhone: string;
  presetContactText: string;
  presetContactMail: string;
  presetContactNoPreference: string;

  // Validation
  validateRequired: string; // "{label} is required"
  validateEmail: string;
  validatePhone: string;
  validatePhoneIntl: string;
  validateSsn: string;
  validateEin: string;
  validateRouting: string; // bank routing-number checksum failure
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

  // Filterable list
  filterableListNoResults: string;
  filterableListShowingAll: string; // "Showing all {total} results"
  filterableListShowingCount: string; // "Showing {count} of {total} results"
  filterableListResultAnnouncement: string; // "{count} results"
}

const defaultStrings: CivLocaleStrings = {
  required: '(required)',

  selectEmpty: '- Select -',

  comboboxNoResults: 'No results found',
  comboboxResultAvailable: '{count} result available',
  comboboxResultsAvailable: '{count} results available',
  comboboxSelected: '{label}, selected',
  comboboxClearLabel: 'Clear selection',
  comboboxLoading: 'Loading…',
  comboboxLoadError: 'Could not load results. Try again.',
  comboboxTypeToSearch: 'Type at least {count} characters to search',
  comboboxLoadingAnnouncement: 'Loading results',

  formErrorSingular: 'There is 1 error in this form',
  formErrorPlural: 'There are {count} errors in this form',

  fieldRequired: '{label} is required',
  fieldInvalid: '{label} is invalid',
  fieldFallbackLabel: 'This field',
  formErrorAnnouncementSingular: '1 error found. Review the error summary.',
  formErrorAnnouncementPlural: '{count} errors found. Review the error summary.',

  linkDisabledTitle: 'This link is currently unavailable',
  externalLinkNewTab: '(opens in new tab)',

  filterChipRemoveLabel: 'Remove {label} filter',

  closeLabel: 'Close',

  fileUploadShowAll: 'Show all {count} files',
  fileUploadDragText: 'Drag files here or',
  fileUploadNoFileChosen: 'No file chosen',
  fileUploadBrowseText: 'Choose from folder',
  fileUploadAcceptedLabel: 'Accepted: ',
  fileUploadMaxSizeLabel: 'Max size: ',
  fileUploadRemoveText: 'Remove',
  fileUploadRemoveAriaLabel: 'Remove {name}',
  fileUploadFilesListLabel: 'Selected files',
  fileUploadFileAddedMessage: '{count} file(s) added. {total} file(s) selected.',
  fileUploadFileRemovedMessage: 'Removed {name}. {total} file(s) selected.',
  fileUploadShowAllAnnounce: 'Showing all {count} files',
  fileUploadRetryAnnounce: 'Retrying upload of {name}',
  fileUploadFileSizeError: '{name} exceeds the maximum size of {size}',
  fileUploadFileTypeError: '{name} is not an accepted file type. Accepted: {accepted}',
  fileUploadMaxFilesError: 'Maximum of {max} files allowed. {name} was not added',
  fileUploadEmptyFile: '{name} appears to be empty (0 bytes)',
  fileUploadDuplicateError: '{name} is already in the list',
  fileUploadCancelled: 'Upload cancelled',
  fileUploadCancelText: 'Cancel',
  fileUploadCancelAriaLabel: 'Cancel upload for {name}',
  fileUploadRetryText: 'Retry',
  fileUploadRetryAriaLabel: 'Retry upload for {name}',
  fileUploadProgressAriaLabel: 'Upload progress for {name}',
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
  datePickerTodayButton: 'Today',
  datePickerMonthLabel: 'Month',
  datePickerYearLabel: 'Year',
  datePickerInvalidFormatMessage: 'Invalid date format',
  datePickerDateRangeMessage: 'Date must be between {min} and {max}',
  datePickerMinDateMessage: 'Date must be on or after {min}',
  datePickerMaxDateMessage: 'Date must be on or before {max}',
  datePickerClearLabel: 'Clear date',

  dateRangeStartLabel: 'Start date',
  dateRangeEndLabel: 'End date',
  dateRangeEndBeforeStartError: 'End date must be on or after start date',
  dateRangeMinRangeError: 'Range must be at least {count} days',
  dateRangeMaxRangeError: 'Range must be at most {count} days',

  memorableDateMonthLabel: 'Month',
  memorableDateDayLabel: 'Day',
  memorableDateYearLabel: 'Year',
  memorableDateMonthEmptyLabel: '- Month -',
  memorableDateDayPlaceholder: 'DD',
  memorableDateYearPlaceholder: 'YYYY',
  memorableDateDateSetMessage: 'Date set to {date}',
  memorableDateInvalidDateMessage: 'Enter a valid date',

  ssnLabel: 'Social Security number',
  ssnLast4Label: 'Last 4 digits of Social Security number',
  ssnLast4Hint: 'For example: 6789',
  phoneLabel: 'Phone number',
  emailLabel: 'Email address',
  emailHint: 'For example: name@example.com',
  zipLabel: 'ZIP code',
  einLabel: 'Employer Identification Number',
  currencyLabel: 'Amount',
  routingNumberLabel: 'Routing number',
  routingNumberHint: 'The 9-digit number on the bottom left of your check',
  vaFileNumberLabel: 'VA file number',
  vaFileNumberHint: 'Your VA file number is 8 or 9 digits. It may be the same as your Social Security number.',

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

  inputCharsRemaining: '{count} characters remaining',
  textareaWordsRemaining: '{count} words remaining',
  textareaWordsOverLimit: '{count} too many words',
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
  minSelectionsHint: 'Select at least {min}',
  minSelectionsError: 'Please select at least {min} options',
  clearButton: 'Clear',

  nameFirst: 'First name or given name',
  nameMiddle: 'Middle name',
  nameLast: 'Last name or family name',
  nameSuffix: 'Suffix',
  nameInvalidChars: "You entered a character we can't accept. Try removing '{chars}'",

  addressStreet1: 'Street address',
  addressStreet2: 'Street address line 2',
  addressStreet3: 'Street address line 3',
  addressCity: 'City',
  addressState: 'State',
  addressZip: 'ZIP code',
  addressCountry: 'Country',
  addressMilitary: 'I live on a U.S. military base outside of the United States',
  addressMilitaryHint: 'Learn more about military base addresses',
  addressMilitaryPostOffice: 'Military post office',
  addressMilitaryState: 'Overseas "state" abbreviation',
  addressStateProvince: 'State, province, or region',
  addressPostalCode: 'Postal code',

  housingNoPermanentAddress: 'I don\'t have a permanent address',
  housingGeneralLocation: 'City or area where you currently stay',
  housingContactMethod: 'Best way to reach you',
  housingContactMethodHint: 'Phone number, email, shelter name, or someone who can relay messages',
  housingPointOfContact: 'Point of contact',
  housingPointOfContactHint: 'Name and phone number of someone who can help us reach you',
  housingCanReceiveMail: 'Do you have an address where you can receive mail?',
  housingLivingSituation: 'Which of these describe your living situation?',
  housingLivingSituationHint: 'We ask this to connect you with the right services. Select all that apply.',

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
  formStepValidating: 'Validating…',
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
  relationshipStepparent: 'Stepparent',
  relationshipGrandparent: 'Grandparent',
  relationshipSibling: 'Sibling',
  relationshipHalfSibling: 'Half-sibling',
  relationshipLegalGuardian: 'Legal guardian',
  relationshipWard: 'Ward',
  relationshipPowerOfAttorney: 'Power of attorney',
  relationshipExecutor: 'Executor or personal representative',
  relationshipTrustee: 'Trustee',
  relationshipBeneficiary: 'Beneficiary',
  relationshipFuneralDirector: 'Funeral director',
  relationshipCaretaker: 'Caretaker or custodian',
  relationshipDependent: 'Dependent',
  relationshipSelf: 'Self',
  relationshipOtherRelative: 'Other relative',
  relationshipNonRelative: 'Non-relative',
  relationshipOther: 'Other',

  prefillNoticeHeading: 'We\u2019ve prefilled some of your information',
  prefillNoticeBody: 'We pulled this information from your account. If any of this is wrong, you can correct it here.',
  prefillNoticeLink: 'Update your profile',

  dataFieldLabel: 'Information',
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
  repeaterFormStepsAddTitle: 'Add {item}',
  repeaterFormStepsEditTitle: 'Edit {item} {index}',
  repeaterMinReached: 'At least {min} {item} required',

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
  marriageEndDateWidowedLegend: 'Date of their passing',
  marriageTypeLabel: 'Type of marriage or union',
  marriageTypeLegal: 'Legal marriage',
  marriageTypeCivilUnion: 'Civil union',
  marriageTypeDomesticPartnership: 'Domestic partnership',
  marriageTypeCommonLaw: 'Common law marriage',
  marriageTypeTribal: 'Tribal or customary marriage',
  marriageTypeOther: 'Other',
  marriageTypeDescriptionLabel: 'Describe the type of union',
  marriageTypeDescriptionHint: 'For example: religious ceremony, foreign marriage',
  marriageRegistrationDateLegend: 'Date of registration',
  marriageJurisdictionLabel: 'Jurisdiction that issued the registration',
  marriageCohabitationStartLegend: 'Date you began living together',
  marriageCohabitationStateLabel: 'State where you live together',
  marriageApproxDateLegend: 'Approximate date union began',

  addressValidationHeading: 'Verify your address',
  addressValidationOriginalLabel: 'You entered',
  addressValidationSuggestedLabel: 'Suggested address',
  addressValidationUseOriginal: 'Keep my address',
  addressValidationUseSuggested: 'Use suggested address',
  addressValidationLoading: 'Verifying address…',

  serviceLegend: 'About this service period',
  serviceBranchLabel: 'Branch of service',
  dischargeTypeLabel: 'Type of discharge',
  suffixLabel: 'Suffix',
  serviceStartDateLegend: 'Service start date',
  serviceStartDateHint: 'If you don\'t know the exact date, enter your best estimate',
  serviceEndDateLegend: 'Service end date',
  serviceEndDateHint: 'If you don\'t know the exact date, enter your best estimate',
  serviceDischargeLabel: 'Character of service',
  serviceNumberLabel: 'Service number',
  serviceNumberHint: 'If you served before 1974, enter your service number',

  maritalStatusLabel: 'Marital status',
  ethnicityLabel: 'Ethnicity',
  genderLabel: 'Gender',
  languageLabel: 'Preferred language',

  taskStatusNotStarted: 'Not started',
  taskStatusInProgress: 'In progress',
  taskStatusComplete: 'Complete',
  taskStatusCannotStart: 'Cannot start yet',
  taskStatusError: 'There is a problem',
  taskStatusReview: 'Review',

  summaryDefaultHeading: 'Summary',
  summaryEditLink: 'Edit',
  summaryEditAriaLabel: 'Edit {section}',
  summaryNotProvided: 'Not provided',
  summaryEditProfile: 'Edit',

  skipLinkDefaultText: 'Skip to main content',

  taskPrefillHint: 'We prefilled some information \u2014 please review',

  prefillLoading: 'Loading your information\u2026',
  prefillError: 'We couldn\u2019t load your information.',
  prefillRetry: 'Try again',

  // Select presets — service branch
  presetServiceBranchArmy: 'Army',
  presetServiceBranchNavy: 'Navy',
  presetServiceBranchAirForce: 'Air Force',
  presetServiceBranchMarineCorps: 'Marine Corps',
  presetServiceBranchCoastGuard: 'Coast Guard',
  presetServiceBranchSpaceForce: 'Space Force',
  presetServiceBranchArmyReserve: 'Army Reserve',
  presetServiceBranchNavyReserve: 'Navy Reserve',
  presetServiceBranchAirForceReserve: 'Air Force Reserve',
  presetServiceBranchMarineCorpsReserve: 'Marine Corps Reserve',
  presetServiceBranchCoastGuardReserve: 'Coast Guard Reserve',
  presetServiceBranchArmyNationalGuard: 'Army National Guard',
  presetServiceBranchAirNationalGuard: 'Air National Guard',
  presetServiceBranchArmyAirCorps: 'Army Air Corps',
  presetServiceBranchArmyAirForces: 'Army Air Forces',
  presetServiceBranchWomensArmyCorps: "Women's Army Corps (WAC)",
  presetServiceBranchNoaa: 'NOAA Corps',
  presetServiceBranchUsphs: 'US Public Health Service',

  // Select presets — discharge type
  presetDischargeHonorable: 'Honorable',
  presetDischargeGeneral: 'General (under honorable conditions)',
  presetDischargeOtherThanHonorable: 'Other than honorable',
  presetDischargeBadConduct: 'Bad conduct',
  presetDischargeDishonorable: 'Dishonorable',
  presetDischargeUncharacterized: 'Uncharacterized',

  // Select presets — suffix
  presetSuffixJr: 'Jr.',
  presetSuffixSr: 'Sr.',
  presetSuffixII: 'II',
  presetSuffixIII: 'III',
  presetSuffixIV: 'IV',
  presetSuffixV: 'V',

  // Select presets — relationship
  presetRelationshipSpouse: 'Spouse',
  presetRelationshipDomesticPartner: 'Domestic partner',
  presetRelationshipChild: 'Child',
  presetRelationshipStepchild: 'Stepchild',
  presetRelationshipParent: 'Parent',
  presetRelationshipSibling: 'Sibling',
  presetRelationshipGrandchild: 'Grandchild',
  presetRelationshipGrandparent: 'Grandparent',
  presetRelationshipLegalGuardian: 'Legal guardian',
  presetRelationshipOther: 'Other',
  presetRelationshipFormerSpouse: 'Former spouse',
  presetRelationshipBiologicalChild: 'Biological child',
  presetRelationshipAdoptedChild: 'Adopted child',
  presetRelationshipFosterChild: 'Foster child',
  presetRelationshipStepparent: 'Stepparent',
  presetRelationshipHalfSibling: 'Half-sibling',
  presetRelationshipWard: 'Ward',
  presetRelationshipPowerOfAttorney: 'Power of attorney',
  presetRelationshipExecutor: 'Executor or personal representative',
  presetRelationshipTrustee: 'Trustee',
  presetRelationshipBeneficiary: 'Beneficiary',
  presetRelationshipCaretaker: 'Caretaker or custodian',
  presetRelationshipDependent: 'Dependent',
  presetRelationshipFuneralDirector: 'Funeral director',
  presetRelationshipSelf: 'Self',
  presetRelationshipOtherRelative: 'Other relative',
  presetRelationshipNonRelative: 'Non-relative',
  presetRelationshipSurvivingSpouse: 'Surviving spouse',
  presetRelationshipSurvivingChild: 'Surviving child',
  presetRelationshipSurvivingParent: 'Surviving parent',

  // Select presets — marital status
  presetMaritalNeverMarried: 'Never married',
  presetMaritalMarried: 'Married',
  presetMaritalSeparated: 'Separated',
  presetMaritalDivorced: 'Divorced',
  presetMaritalWidowed: 'Widowed',

  // Select presets — ethnicity
  presetEthnicityHispanicLatino: 'Hispanic or Latino',
  presetEthnicityNotHispanicLatino: 'Not Hispanic or Latino',
  presetEthnicityPreferNotToAnswer: 'Prefer not to answer',

  // Select presets — gender
  presetGenderMale: 'Male',
  presetGenderFemale: 'Female',
  presetGenderNonBinary: 'Non-binary',
  presetGenderPreferNotToAnswer: 'Prefer not to answer',
  presetGenderOther: 'Other',

  // Select presets — language
  presetLanguageEnglish: 'English',
  presetLanguageSpanish: 'Spanish',
  presetLanguageChinese: 'Chinese',
  presetLanguageTagalog: 'Tagalog',
  presetLanguageVietnamese: 'Vietnamese',
  presetLanguageArabic: 'Arabic',
  presetLanguageFrench: 'French',
  presetLanguageKorean: 'Korean',
  presetLanguageRussian: 'Russian',
  presetLanguagePortuguese: 'Portuguese',
  presetLanguageHaitianCreole: 'Haitian Creole',
  presetLanguageGerman: 'German',
  presetLanguageJapanese: 'Japanese',
  presetLanguageHindi: 'Hindi',
  presetLanguageOther: 'Other',

  // Select presets — housing status
  presetHousingOwn: 'Own',
  presetHousingRent: 'Rent',
  presetHousingLivingWithFamily: 'Living with family or friends',
  presetHousingTemporaryShelter: 'Temporary shelter',
  presetHousingTransitionalHousing: 'Transitional housing',
  presetHousingMilitaryHousing: 'Military housing',
  presetHousingHomeless: 'Homeless or unsheltered',
  presetHousingOther: 'Other',

  // Select presets — education level
  presetEducationLessThanHighSchool: 'Less than high school',
  presetEducationHighSchool: 'High school diploma or GED',
  presetEducationSomeCollege: 'Some college (no degree)',
  presetEducationAssociate: "Associate's degree",
  presetEducationBachelor: "Bachelor's degree",
  presetEducationMaster: "Master's degree",
  presetEducationDoctoral: 'Doctoral or professional degree',

  // Select presets — employment status
  presetEmploymentFullTime: 'Employed full-time',
  presetEmploymentPartTime: 'Employed part-time',
  presetEmploymentSelfEmployed: 'Self-employed',
  presetEmploymentUnemployed: 'Unemployed',
  presetEmploymentRetired: 'Retired',
  presetEmploymentStudent: 'Student',
  presetEmploymentUnableToWork: 'Unable to work',
  presetEmploymentNotInLaborForce: 'Not in labor force',

  // Select presets — income source
  presetIncomeEmployment: 'Employment or wages',
  presetIncomeSelfEmployment: 'Self-employment',
  presetIncomeSocialSecurity: 'Social Security',
  presetIncomePension: 'Pension or retirement',
  presetIncomeDisability: 'Disability benefits',
  presetIncomeUnemployment: 'Unemployment benefits',
  presetIncomeChildSupport: 'Child support or alimony',
  presetIncomeInvestment: 'Investment income',
  presetIncomeRentalIncome: 'Rental income',
  presetIncomeOther: 'Other',

  // Select presets — veteran status
  presetVeteranNonVeteran: 'Not a veteran',
  presetVeteranVeteran: 'Veteran',
  presetVeteranActiveDuty: 'Active duty service member',
  presetVeteranReserveGuard: 'Reserve or National Guard',
  presetVeteranRetiredMilitary: 'Retired military',
  presetVeteranSpouse: 'Spouse of veteran',
  presetVeteranSurvivingSpouse: 'Surviving spouse of veteran',

  // Select presets — disability type
  presetDisabilityPhysical: 'Physical (mobility, dexterity)',
  presetDisabilityCognitive: 'Cognitive (memory, learning, intellectual)',
  presetDisabilityMentalHealth: 'Mental health (anxiety, depression, PTSD)',
  presetDisabilityVision: 'Vision (blindness, low vision)',
  presetDisabilityHearing: 'Hearing (deafness, hard of hearing)',
  presetDisabilitySpeech: 'Speech or communication',
  presetDisabilityChronicIllness: 'Chronic illness (diabetes, epilepsy, cancer)',
  presetDisabilityDevelopmental: 'Developmental (autism, cerebral palsy)',
  presetDisabilityMultiple: 'Multiple disabilities',
  presetDisabilityPreferNotToAnswer: 'Prefer not to answer',

  // Select presets — citizenship status
  presetCitizenshipUsCitizenBirth: 'US citizen (by birth)',
  presetCitizenshipUsCitizenNaturalized: 'US citizen (naturalized)',
  presetCitizenshipUsNational: 'US national',
  presetCitizenshipPermanentResident: 'Lawful permanent resident',
  presetCitizenshipAuthorizedAlien: 'Authorized to work (visa or other status)',
  presetCitizenshipPreferNotToAnswer: 'Prefer not to answer',

  // Select presets — pay frequency
  presetPayWeekly: 'Weekly',
  presetPayBiWeekly: 'Bi-weekly (every 2 weeks)',
  presetPaySemiMonthly: 'Semi-monthly (twice a month)',
  presetPayMonthly: 'Monthly',
  presetPayAnnually: 'Annually',
  presetPayOneTime: 'One-time payment',

  // Select presets — contact preference
  presetContactEmail: 'Email',
  presetContactPhone: 'Phone call',
  presetContactText: 'Text message (SMS)',
  presetContactMail: 'US Mail',
  presetContactNoPreference: 'No preference',

  validateRequired: '{label} is required',
  validateEmail: 'Enter a valid email address',
  validatePhone: 'Enter a 10-digit phone number',
  validatePhoneIntl: 'Enter a valid phone number with country code (e.g., +1 555 123 4567)',
  validateSsn: 'Enter a valid 9-digit Social Security number',
  validateEin: 'Enter a valid 9-digit Employer Identification Number',
  validateRouting: 'Enter a valid 9-digit bank routing number',
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

  filterableListNoResults: 'No results found.',
  filterableListShowingAll: 'Showing all {total} results',
  filterableListShowingCount: 'Showing {count} of {total} results',
  filterableListResultAnnouncement: '{count} results',
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
