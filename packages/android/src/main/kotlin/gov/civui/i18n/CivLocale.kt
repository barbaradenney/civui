// CivUI — CivLocale i18n string registry for Android
// Centralized string registry for component UI text, mirroring the web locale.ts.
// Components read strings via `CivLocale.t("key")`. Consumers can override
// all strings by calling `setStrings()` with a partial translation map.

package gov.civui.i18n

import androidx.compose.runtime.staticCompositionLocalOf

object CivLocale {
    private val defaults = mapOf(
        // Required indicator
        "required" to "(required)",

        // Select
        "selectEmpty" to "- Select -",

        // Combobox
        "comboboxNoResults" to "No results found",
        "comboboxResultsAvailable" to "{count} results available",
        "comboboxSelected" to "{label}, selected",

        // Form error summary
        "formErrorSingular" to "There is 1 error in this form",
        "formErrorPlural" to "There are {count} errors in this form",

        // Form validation
        "fieldRequired" to "{label} is required",
        "fieldInvalid" to "{label} is invalid",
        "fieldFallbackLabel" to "This field",
        "formErrorAnnouncement" to "{count} errors found. Review the error summary.",

        // File upload
        "fileUploadDragText" to "Drag files here or",
        "fileUploadBrowseText" to "choose from folder",
        "fileUploadAcceptedLabel" to "Accepted: ",
        "fileUploadMaxSizeLabel" to "Max size: ",
        "fileUploadRemoveText" to "Remove",
        "fileUploadRemoveAriaLabel" to "Remove {name}",
        "fileUploadFilesListLabel" to "Selected files",
        "fileUploadFileAddedMessage" to "{count} file(s) added. {total} file(s) selected.",
        "fileUploadFileRemovedMessage" to "File removed. {total} file(s) selected.",
        "fileUploadFileSizeError" to "{name} exceeds maximum size of {size}",
        "fileUploadFileTypeError" to "{name} is not an accepted file type",
        "fileUploadMaxFilesError" to "Maximum of {max} files allowed",

        // Date picker
        "datePickerPlaceholder" to "mm/dd/yyyy",
        "datePickerChooseDateLabel" to "Choose date",
        "datePickerSelectedDateLabel" to "Choose date, selected date is {date}",
        "datePickerDialogLabel" to "Choose Date",
        "datePickerPreviousMonthLabel" to "Previous month",
        "datePickerNextMonthLabel" to "Next month",
        "datePickerDialogOpenedMessage" to "Calendar dialog opened",
        "datePickerDateSelectedMessage" to "Selected {date}",
        "datePickerTodayLabel" to "today",
        "datePickerInvalidFormatMessage" to "Invalid date format",
        "datePickerDateRangeMessage" to "Date must be between {min} and {max}",
        "datePickerMinDateMessage" to "Date must be on or after {min}",
        "datePickerMaxDateMessage" to "Date must be on or before {max}",

        // Memorable date
        "memorableDateMonthLabel" to "Month",
        "memorableDateDayLabel" to "Day",
        "memorableDateYearLabel" to "Year",
        "memorableDateMonthEmptyLabel" to "- Month -",
        "memorableDateDayPlaceholder" to "DD",
        "memorableDateYearPlaceholder" to "YYYY",
        "memorableDateDateSetMessage" to "Date set to {date}",
        "memorableDateInvalidDateMessage" to "Enter a valid date",

        // Mask
        "maskSsnHint" to "For example: 123-45-6789",
        "maskPhoneUsHint" to "For example: (555) 123-4567",
        "maskZipHint" to "For example: 12345",
        "maskZip4Hint" to "For example: 12345-6789",
        "maskEinHint" to "For example: 12-3456789",
        "maskPhoneIntlHint" to "For example: +1 (555) 123-4567",
        "maskSsnError" to "Enter a 9-digit Social Security number",
        "maskPhoneUsError" to "Enter a 10-digit phone number",
        "maskZipError" to "Enter a 5-digit ZIP code",
        "maskZip4Error" to "Enter a 9-digit ZIP+4 code",
        "maskEinError" to "Enter a 9-digit Employer Identification Number",
        "maskPhoneIntlError" to "Enter a valid phone number with country code",
        "maskPatternError" to "{label} does not match the expected format",
        "maskCurrencyHint" to "For example: 1,234.56",
        "maskCurrencyError" to "Enter a valid dollar amount",

        // Textarea word count
        "textareaWordsRemaining" to "{count} words remaining",
        "textareaWordLimit" to "Word limit: {max}",

        // Textarea character count
        "textareaCharsRemaining" to "{count} characters remaining",

        // Alert dismiss
        "alertDismissLabel" to "Dismiss alert",
        "alertDismissedMessage" to "Alert dismissed",
    )

    private val overrides = mutableMapOf<String, String>()

    /**
     * Get a translated string by key. Returns the override if set,
     * then the default, then the key itself as fallback.
     */
    fun t(key: String): String = overrides[key] ?: defaults[key] ?: key

    /**
     * Get a translated string with placeholder substitution.
     * Replaces `{placeholder}` patterns with provided values.
     */
    fun t(key: String, vararg args: Pair<String, Any>): String {
        var result = t(key)
        for ((placeholder, value) in args) {
            result = result.replace("{$placeholder}", value.toString())
        }
        return result
    }

    /**
     * Override locale strings. Merges with defaults — you only need to
     * provide the strings you want to override.
     */
    fun setStrings(strings: Map<String, String>) {
        overrides.putAll(strings)
    }

    /**
     * Reset to default English strings, clearing all overrides.
     */
    fun reset() {
        overrides.clear()
    }
}

val LocalCivLocale = staticCompositionLocalOf { CivLocale }
