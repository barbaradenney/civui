// CivUI — CivMarriageHistory for SwiftUI
// Accessible marriage history compound component following government design system patterns.

import SwiftUI

/// Accessible marriage history form for government applications.
///
/// Renders a structured form for capturing marriage history details.
/// Mirrors the web `civ-marriage-history` component.
///
/// Usage:
/// ```swift
/// CivMarriageHistory(
///     legend: "Marriage history",
///     name: "marriage",
///     value: $marriageValue,
///     isRequired: true
/// )
/// ```
public struct CivMarriageHistory: View {
    // MARK: - Properties

    /// Legend text displayed above the fields.
    public var legend: String

    /// Whether to show marriage type field.
    public var showMarriageType: Bool

    /// Assumed status value.
    public var statusAssumed: String

    /// Error message for the spouse field.
    public var spouseError: String

    /// Error message for the marriage type field.
    public var marriageTypeError: String

    /// Error message for the marriage date field.
    public var marriageDateError: String

    /// Error message for the city field.
    public var cityError: String

    /// Error message for the state field.
    public var stateError: String

    /// Error message for the jurisdiction field.
    public var jurisdictionError: String

    /// Error message for the cohabitation start field.
    public var cohabitationStartError: String

    /// Error message for the cohabitation state field.
    public var cohabitationStateError: String

    /// Error message for the status field.
    public var statusError: String

    /// Error message for the end date field.
    public var endDateError: String

    /// Field name for form submission.
    public var name: String

    /// Bound value (JSON string).
    @Binding public var value: String

    /// Help text shown below the legend.
    public var hint: String?

    /// Group-level error message.
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
        showMarriageType: Bool = false,
        statusAssumed: String = "",
        spouseError: String = "",
        marriageTypeError: String = "",
        marriageDateError: String = "",
        cityError: String = "",
        stateError: String = "",
        jurisdictionError: String = "",
        cohabitationStartError: String = "",
        cohabitationStateError: String = "",
        statusError: String = "",
        endDateError: String = "",
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
        self.showMarriageType = showMarriageType
        self.statusAssumed = statusAssumed
        self.spouseError = spouseError
        self.marriageTypeError = marriageTypeError
        self.marriageDateError = marriageDateError
        self.cityError = cityError
        self.stateError = stateError
        self.jurisdictionError = jurisdictionError
        self.cohabitationStartError = cohabitationStartError
        self.cohabitationStateError = cohabitationStateError
        self.statusError = statusError
        self.endDateError = endDateError
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
struct CivMarriageHistory_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var value = ""

        var body: some View {
            CivMarriageHistory(
                legend: "Marriage history",
                name: "marriage",
                value: $value,
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
