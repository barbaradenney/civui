// CivUI — CivDatePicker for SwiftUI
// Accessible date picker following government design system patterns.
// Renders: label → hint → error → native DatePicker (Section 508 compliant)

import SwiftUI

/// Accessible date picker for government applications.
///
/// Wraps SwiftUI's native `DatePicker` with CivUI form field chrome:
/// label, hint, error, and token-based styling. Uses ISO date string
/// binding for compatibility with the web component API.
///
/// Usage:
/// ```swift
/// CivDatePicker(
///     label: "Appointment date",
///     value: $appointmentDate,
///     hint: "Select a date within the next 30 days",
///     min: "2026-03-18",
///     max: "2026-04-17"
/// )
/// ```
public struct CivDatePicker: View {
    // MARK: - Properties

    /// Visible label text.
    public let label: String

    /// Bound date value as ISO string (YYYY-MM-DD).
    @Binding public var value: String

    /// Help text shown below the label.
    public var hint: String?

    /// Error message.
    public var error: String?

    /// Minimum date (YYYY-MM-DD).
    public var min: String?

    /// Maximum date (YYYY-MM-DD).
    public var max: String?

    /// Placeholder text shown when no date is selected.
    public var placeholder: String

    /// Density variant — "default" or "sm" (compact). Suppresses chrome
    /// for use in dense surfaces like data-grid cell editors.
    public var spacing: String

    /// Whether a date is required.
    public var isRequired: Bool

    /// Whether the picker is disabled.
    public var isDisabled: Bool

    /// Whether the picker is read-only (visible but non-interactive, no opacity change).
    public var isReadonly: Bool

    /// Called when the date changes.
    public var onChange: ((String) -> Void)?

    /// Called for analytics tracking (parallels `civ-analytics` event).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    /// Optional form state for centralized validation.
    public var formState: CivFormState?

    /// Field name for form state registration.
    public var formName: String?

    /// Custom required message for form validation.
    public var requiredMessage: String?

    /// Custom validation function. Returns error string or nil.
    public var formValidate: (() -> String?)?

    /// Locale identifier for date formatting (e.g., "es", "fr"). When empty, the system locale is used.
    public var locale: String

    /// Whether the field contains PII (excluded from getFormData).
    public var isPii: Bool

    /// Day the week starts on (0 = Sunday, 1 = Monday).
    public var weekStartsOn: Int

    /// Comma-separated list of disabled dates (YYYY-MM-DD).
    public var disabledDates: String

    /// Label for the clear button.
    public var clearLabel: String

    /// Label for the choose-date button.
    public var chooseDateLabel: String

    /// Label announced when a date is selected.
    public var selectedDateLabel: String

    /// Accessible label for the dialog.
    public var dialogLabel: String

    /// Label for the previous month button.
    public var previousMonthLabel: String

    /// Label for the next month button.
    public var nextMonthLabel: String

    /// Message announced when the dialog is opened.
    public var dialogOpenedMessage: String

    /// Message announced when a date is selected.
    public var dateSelectedMessage: String

    /// Label for today's date in the calendar.
    public var todayLabel: String

    /// Label for the today shortcut button.
    public var todayButtonLabel: String

    /// Whether to hide the today shortcut button.
    public var hideTodayButton: Bool

    /// Whether to render an inline "Today" shortcut inset in the input chrome.
    public var inlineToday: Bool

    /// Override the inline "Today" button label.
    public var inlineTodayLabel: String

    /// Error message for invalid date format.
    public var invalidFormatMessage: String

    /// Error message for dates outside the allowed range.
    public var dateRangeMessage: String

    /// Error message for dates before the minimum.
    public var minDateMessage: String

    /// Error message for dates after the maximum.
    public var maxDateMessage: String

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        label: String,
        value: Binding<String>,
        hint: String? = nil,
        error: String? = nil,
        min: String? = nil,
        max: String? = nil,
        placeholder: String = "",
        spacing: String = "default",
        isRequired: Bool = false,
        isDisabled: Bool = false,
        isReadonly: Bool = false,
        onChange: ((String) -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil,
        formState: CivFormState? = nil,
        formName: String? = nil,
        requiredMessage: String? = nil,
        formValidate: (() -> String?)? = nil,
        locale: String = "",
        isPii: Bool = false,
        weekStartsOn: Int = 0,
        disabledDates: String = "",
        clearLabel: String = "",
        chooseDateLabel: String = "",
        selectedDateLabel: String = "",
        dialogLabel: String = "",
        previousMonthLabel: String = "",
        nextMonthLabel: String = "",
        dialogOpenedMessage: String = "",
        dateSelectedMessage: String = "",
        todayLabel: String = "",
        todayButtonLabel: String = "",
        hideTodayButton: Bool = false,
        inlineToday: Bool = false,
        inlineTodayLabel: String = "",
        invalidFormatMessage: String = "",
        dateRangeMessage: String = "",
        minDateMessage: String = "",
        maxDateMessage: String = ""
    ) {
        self.label = label
        self._value = value
        self.hint = hint
        self.error = error
        self.min = min
        self.max = max
        self.placeholder = placeholder
        self.spacing = spacing
        self.isRequired = isRequired
        self.isDisabled = isDisabled
        self.isReadonly = isReadonly
        self.onChange = onChange
        self.onAnalytics = onAnalytics
        self.formState = formState
        self.formName = formName
        self.requiredMessage = requiredMessage
        self.formValidate = formValidate
        self.locale = locale
        self.isPii = isPii
        self.weekStartsOn = weekStartsOn
        self.disabledDates = disabledDates
        self.clearLabel = clearLabel
        self.chooseDateLabel = chooseDateLabel
        self.selectedDateLabel = selectedDateLabel
        self.dialogLabel = dialogLabel
        self.previousMonthLabel = previousMonthLabel
        self.nextMonthLabel = nextMonthLabel
        self.dialogOpenedMessage = dialogOpenedMessage
        self.dateSelectedMessage = dateSelectedMessage
        self.todayLabel = todayLabel
        self.todayButtonLabel = todayButtonLabel
        self.hideTodayButton = hideTodayButton
        self.inlineToday = inlineToday
        self.inlineTodayLabel = inlineTodayLabel
        self.invalidFormatMessage = invalidFormatMessage
        self.dateRangeMessage = dateRangeMessage
        self.minDateMessage = minDateMessage
        self.maxDateMessage = maxDateMessage
    }

    // MARK: - Date Helpers

    private static let isoFormatter: DateFormatter = {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        f.locale = Locale(identifier: "en_US_POSIX")
        return f
    }()

    private var dateBinding: Binding<Date> {
        Binding(
            get: {
                if !value.isEmpty, let date = Self.isoFormatter.date(from: value) {
                    return date
                }
                return Date()
            },
            set: { newDate in
                let iso = Self.isoFormatter.string(from: newDate)
                value = iso
                onChange?(iso)
                onAnalytics?("change", ["value": iso])
            }
        )
    }

    private var dateRange: ClosedRange<Date>? {
        let minDate = min.flatMap { Self.isoFormatter.date(from: $0) }
        let maxDate = max.flatMap { Self.isoFormatter.date(from: $0) }

        if let minDate, let maxDate {
            return minDate...maxDate
        } else if let minDate {
            return minDate...Date.distantFuture
        } else if let maxDate {
            return Date.distantPast...maxDate
        }
        return nil
    }

    // MARK: - Body

    public var body: some View {
        VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {
            // 1. Label
            labelView

            // 2. Hint
            if let hint, !hint.isEmpty {
                Text(hint)
                    .font(.system(size: CivTokens.Typography.FontSize.sm))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Base.dark,
                        dark: CivTokens.DarkColors.Base.dark
                    ))
                    .accessibilityIdentifier("civ-hint")
            }

            // 3. Error
            if let error, !error.isEmpty {
                Text(error)
                    .font(.system(size: CivTokens.Typography.FontSize.sm,
                                  weight: CivTokens.Typography.FontWeight.bold))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Error.default_,
                        dark: CivTokens.DarkColors.Error.default_
                    ))
                    .accessibilityIdentifier("civ-error")
            }

            // 4. DatePicker or Placeholder
            if value.isEmpty && !placeholder.isEmpty {
                Text(placeholder)
                    .font(.system(size: CivTokens.Typography.FontSize.base))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Base.dark,
                        dark: CivTokens.DarkColors.Base.dark
                    ))
                    .padding(.horizontal, CivTokens.Spacing._2)
                    .padding(.vertical, CivTokens.Spacing._1_5)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(adaptiveColor(
                        light: CivTokens.Colors.White.default_,
                        dark: CivTokens.DarkColors.White.default_
                    ))
                    .cornerRadius(CivTokens.Border.Radius.default_)
                    .overlay(
                        RoundedRectangle(cornerRadius: CivTokens.Border.Radius.default_)
                            .stroke(adaptiveColor(
                                light: CivTokens.Colors.Base.light,
                                dark: CivTokens.DarkColors.Base.light
                            ), lineWidth: CivTokens.Border.Width.default_)
                    )
                    .accessibilityLabel(accessibilityLabelText)
                    .accessibilityHint(accessibilityHintText)
                    .onTapGesture {
                        // Set to today to trigger the date picker
                        let today = Self.isoFormatter.string(from: Date())
                        value = today
                        onChange?(today)
                    }
            } else {
                Group {
                    if let range = dateRange {
                        DatePicker(
                            "",
                            selection: dateBinding,
                            in: range,
                            displayedComponents: .date
                        )
                        .labelsHidden()
                    } else {
                        DatePicker(
                            "",
                            selection: dateBinding,
                            displayedComponents: .date
                        )
                        .labelsHidden()
                    }
                }
                .datePickerStyle(.compact)
                .tint(adaptiveColor(
                    light: CivTokens.Colors.Primary.default_,
                    dark: CivTokens.DarkColors.Primary.default_
                ))
                .disabled(isDisabled || isReadonly)
                .opacity(isDisabled ? 0.5 : 1.0)
                .accessibilityLabel(accessibilityLabelText)
                .accessibilityHint(accessibilityHintText)
            }
        }
        .padding(.bottom, CivTokens.Spacing._4)
        .accessibilityElement(children: .contain)
        .onChange(of: error) { newError in
            if let newError, !newError.isEmpty {
                UIAccessibility.post(notification: .announcement, argument: newError)
            }
        }
        .onAppear { registerWithFormState() }
        .onDisappear { unregisterFromFormState() }
    }

    // MARK: - Form State Registration

    private func registerWithFormState() {
        guard let formState, let formName, !formName.isEmpty else { return }
        formState.register(CivFormState.CivFieldRegistration(
            name: formName,
            label: label,
            getValue: { value },
            setValue: { _ in },
            isRequired: isRequired,
            requiredMessage: requiredMessage ?? "",
            validate: formValidate,
            isPii: isPii
        ))
    }

    private func unregisterFromFormState() {
        guard let formState, let formName, !formName.isEmpty else { return }
        formState.unregister(formName)
    }

    // MARK: - Subviews

    private var labelView: some View {
        HStack(spacing: CivTokens.Spacing._0_5) {
            Text(label)
                .font(.system(size: CivTokens.Typography.FontSize.base,
                              weight: CivTokens.Typography.FontWeight.bold))
                .foregroundColor(adaptiveColor(
                    light: CivTokens.Colors.Base.darkest,
                    dark: CivTokens.DarkColors.Base.darkest
                ))

            if isRequired {
                Text("*")
                    .font(.system(size: CivTokens.Typography.FontSize.base,
                                  weight: CivTokens.Typography.FontWeight.bold))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Error.default_,
                        dark: CivTokens.DarkColors.Error.default_
                    ))
                    .accessibilityLabel("required")
            }
        }
    }

    // MARK: - Accessibility

    private var accessibilityLabelText: String {
        var parts = [label]
        if isRequired { parts.append("required") }
        return parts.joined(separator: ", ")
    }

    private var accessibilityHintText: String {
        var parts: [String] = []
        if let hint, !hint.isEmpty { parts.append(hint) }
        if let error, !error.isEmpty { parts.append("Error: \(error)") }
        return parts.joined(separator: ". ")
    }

    // MARK: - Color Helper

    private func adaptiveColor(light: Color, dark: Color) -> Color {
        colorScheme == .dark ? dark : light
    }
}

// MARK: - Preview

#if DEBUG
struct CivDatePicker_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var appointment = ""
        @State private var deadline = "2026-04-01"

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    CivDatePicker(
                        label: "Appointment date",
                        value: $appointment,
                        hint: "Select a date for your appointment",
                        isRequired: true
                    )

                    CivDatePicker(
                        label: "Submission deadline",
                        value: $deadline,
                        max: "2026-12-31"
                    )

                    CivDatePicker(
                        label: "Disabled date",
                        value: .constant(""),
                        isDisabled: true
                    )
                }
                .padding()
            }
        }
    }

    static var previews: some View {
        PreviewWrapper()
            .previewDisplayName("Light")
        PreviewWrapper()
            .preferredColorScheme(.dark)
            .previewDisplayName("Dark")
    }
}
#endif
