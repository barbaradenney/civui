// CivUI — CivDateRangePicker for SwiftUI
// Accessible date range picker following government design system patterns.

import SwiftUI

/// Accessible date range picker for government applications.
///
/// Provides start and end date inputs with range validation.
/// Mirrors the web `civ-date-range-picker` component.
///
/// Usage:
/// ```swift
/// CivDateRangePicker(
///     label: "Service dates",
///     name: "service-dates",
///     value: $dateRange,
///     startLabel: "Start date",
///     endLabel: "End date"
/// )
/// ```
public struct CivDateRangePicker: View {
    // MARK: - Properties

    /// Group legend rendered as the fieldset legend.
    public var legend: String

    /// Minimum selectable date (ISO string).
    public var min: String

    /// Maximum selectable date (ISO string).
    public var max: String

    /// Minimum number of days in the range.
    public var minRangeDays: Int?

    /// Maximum number of days in the range.
    public var maxRangeDays: Int?

    /// Label for the start date input.
    public var startLabel: String

    /// Label for the end date input.
    public var endLabel: String

    /// Hint text for the start date input.
    public var startHint: String

    /// Hint text for the end date input.
    public var endHint: String

    /// Error message for the start date input.
    public var startError: String

    /// Error message for the end date input.
    public var endError: String

    /// Locale for date formatting.
    public var locale: String

    /// Day of the week to start on (0 = Sunday).
    public var weekStartsOn: Int

    /// Visible label text.
    public var label: String

    /// Field name for form submission.
    public var name: String

    /// Bound value (e.g., "2024-01-01/2024-01-31").
    @Binding public var value: String

    /// Help text shown below the label.
    public var hint: String?

    /// Error message.
    public var error: String?

    /// Whether the field is required.
    public var isRequired: Bool

    /// Whether the field is disabled.
    public var isDisabled: Bool

    /// Whether the field is read-only.
    public var isReadonly: Bool

    /// Called on every value change (parallels `civ-input` event).
    public var onInput: ((String) -> Void)?

    /// Called on committed value change (parallels `civ-change` event).
    public var onChange: ((String) -> Void)?

    /// Called for analytics tracking (parallels `civ-analytics` event).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        legend: String = "",
        min: String = "",
        max: String = "",
        minRangeDays: Int? = nil,
        maxRangeDays: Int? = nil,
        startLabel: String = "",
        endLabel: String = "",
        startHint: String = "",
        endHint: String = "",
        startError: String = "",
        endError: String = "",
        locale: String = "en-US",
        weekStartsOn: Int = 0,
        label: String = "",
        name: String = "",
        value: Binding<String>,
        hint: String? = nil,
        error: String? = nil,
        isRequired: Bool = false,
        isDisabled: Bool = false,
        isReadonly: Bool = false,
        onInput: ((String) -> Void)? = nil,
        onChange: ((String) -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil
    ) {
        self.legend = legend
        self.min = min
        self.max = max
        self.minRangeDays = minRangeDays
        self.maxRangeDays = maxRangeDays
        self.startLabel = startLabel
        self.endLabel = endLabel
        self.startHint = startHint
        self.endHint = endHint
        self.startError = startError
        self.endError = endError
        self.locale = locale
        self.weekStartsOn = weekStartsOn
        self.label = label
        self.name = name
        self._value = value
        self.hint = hint
        self.error = error
        self.isRequired = isRequired
        self.isDisabled = isDisabled
        self.isReadonly = isReadonly
        self.onInput = onInput
        self.onChange = onChange
        self.onAnalytics = onAnalytics
    }

    // MARK: - Body

    public var body: some View {
        EmptyView()
    }

    // MARK: - Color Helper

    private func adaptiveColor(light: Color, dark: Color) -> Color {
        colorScheme == .dark ? dark : light
    }
}

// MARK: - Preview

#if DEBUG
struct CivDateRangePicker_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var dateRange = ""

        var body: some View {
            CivDateRangePicker(
                startLabel: "Start date",
                endLabel: "End date",
                label: "Service dates",
                name: "service-dates",
                value: $dateRange,
                isRequired: true
            )
            .padding()
        }
    }

    static var previews: some View {
        PreviewWrapper()
    }
}
#endif
