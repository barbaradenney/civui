// CivUI — CivLocale for SwiftUI
// Centralized i18n string registry for component UI text.
// Components read strings via `CivLocale.shared.t("key")`.
// Consumers can override strings by calling `setStrings()`.

import SwiftUI

/// Centralized locale / i18n manager for CivUI components.
///
/// All UI-facing strings are stored here with English defaults.
/// Override any subset via `setStrings(_:)` for localization.
///
/// Usage:
/// ```swift
/// // Override strings for Spanish
/// CivLocale.shared.setStrings([
///     "required": "(obligatorio)",
///     "selectEmpty": "- Seleccionar -",
/// ])
///
/// // Read a string
/// let label = CivLocale.shared.t("required") // "(obligatorio)"
///
/// // Reset to English defaults
/// CivLocale.shared.reset()
/// ```
public class CivLocale: ObservableObject {
    public static let shared = CivLocale()

    private var overrides: [String: String] = [:]

    private let defaults: [String: String] = [
        // Required indicator
        "required": "(required)",

        // Select
        "selectEmpty": "- Select -",

        // Combobox
        "comboboxNoResults": "No results found",
        "comboboxResultsAvailable": "{count} {count, plural, one {result} other {results}} available",
        "comboboxSelected": "{label}, selected",

        // Form error summary
        "formErrorSingular": "There is 1 error in this form",
        "formErrorPlural": "There are {count} errors in this form",

        // Form validation
        "fieldRequired": "{label} is required",
        "fieldInvalid": "{label} is invalid",
        "fieldFallbackLabel": "This field",
        "formErrorAnnouncement": "{count} {count, plural, one {error} other {errors}} found. Review the error summary.",

        // File upload
        "fileUploadDragText": "Drag files here or",
        "fileUploadBrowseText": "choose from folder",
        "fileUploadAcceptedLabel": "Accepted: ",
        "fileUploadMaxSizeLabel": "Max size: ",
        "fileUploadRemoveText": "Remove",
        "fileUploadRemoveAriaLabel": "Remove {name}",
        "fileUploadFilesListLabel": "Selected files",
        "fileUploadFileAddedMessage": "{count} file(s) added. {total} file(s) selected.",
        "fileUploadFileRemovedMessage": "File removed. {total} file(s) selected.",
        "fileUploadFileSizeError": "{name} exceeds maximum size of {size}",
        "fileUploadFileTypeError": "{name} is not an accepted file type",
        "fileUploadMaxFilesError": "Maximum of {max} files allowed",

        // Date picker
        "datePickerPlaceholder": "mm/dd/yyyy",
        "datePickerChooseDateLabel": "Choose date",
        "datePickerSelectedDateLabel": "Choose date, selected date is {date}",
        "datePickerDialogLabel": "Choose Date",
        "datePickerPreviousMonthLabel": "Previous month",
        "datePickerNextMonthLabel": "Next month",
        "datePickerDialogOpenedMessage": "Calendar dialog opened",
        "datePickerDateSelectedMessage": "Selected {date}",
        "datePickerTodayLabel": "today",
        "datePickerInvalidFormatMessage": "Invalid date format",
        "datePickerDateRangeMessage": "Date must be between {min} and {max}",
        "datePickerMinDateMessage": "Date must be on or after {min}",
        "datePickerMaxDateMessage": "Date must be on or before {max}",

        // Memorable date
        "memorableDateMonthLabel": "Month",
        "memorableDateDayLabel": "Day",
        "memorableDateYearLabel": "Year",
        "memorableDateMonthEmptyLabel": "- Month -",
        "memorableDateDayPlaceholder": "DD",
        "memorableDateYearPlaceholder": "YYYY",
        "memorableDateDateSetMessage": "Date set to {date}",
        "memorableDateInvalidDateMessage": "Enter a valid date",

        // Mask
        "maskSsnHint": "For example: 123-45-6789",
        "maskPhoneUsHint": "For example: (555) 123-4567",
        "maskZipHint": "For example: 12345",
        "maskZip4Hint": "For example: 12345-6789",
        "maskEinHint": "For example: 12-3456789",
        "maskPhoneIntlHint": "For example: +1 (555) 123-4567",
        "maskSsnError": "Enter a 9-digit Social Security number",
        "maskPhoneUsError": "Enter a 10-digit phone number",
        "maskZipError": "Enter a 5-digit ZIP code",
        "maskZip4Error": "Enter a 9-digit ZIP+4 code",
        "maskEinError": "Enter a 9-digit Employer Identification Number",
        "maskPhoneIntlError": "Enter a valid phone number with country code",
        "maskPatternError": "{label} does not match the expected format",
        "maskCurrencyHint": "For example: 1,234.56",
        "maskCurrencyError": "Enter a valid dollar amount",

        // Textarea word count
        "textareaWordsRemaining": "{count} words remaining",
        "textareaWordLimit": "Word limit: {max}",

        // Alert dismiss
        "alertDismissLabel": "Dismiss alert",
        "alertDismissedMessage": "Alert dismissed",
    ]

    /// Get a translated string by key. Returns the override if present,
    /// then the English default, then the key itself as fallback.
    public func t(_ key: String) -> String {
        overrides[key] ?? defaults[key] ?? key
    }

    /// Set locale string overrides. Merges with any existing overrides.
    public func setStrings(_ strings: [String: String]) {
        overrides.merge(strings) { _, new in new }
        objectWillChange.send()
    }

    /// Reset all overrides back to English defaults.
    public func reset() {
        overrides.removeAll()
        objectWillChange.send()
    }

    /// Get all current strings (defaults merged with overrides) for inspection.
    public func allStrings() -> [String: String] {
        var result = defaults
        result.merge(overrides) { _, new in new }
        return result
    }
}

// MARK: - SwiftUI Environment Support

private struct CivLocaleKey: EnvironmentKey {
    static let defaultValue = CivLocale.shared
}

extension EnvironmentValues {
    public var civLocale: CivLocale {
        get { self[CivLocaleKey.self] }
        set { self[CivLocaleKey.self] = newValue }
    }
}
