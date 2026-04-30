// CivUI — CivServiceHistory for SwiftUI
// Accessible service history compound component following government design system patterns.

import SwiftUI

/// Accessible service history form for government applications.
///
/// Renders a structured form for capturing military service history.
/// Mirrors the web `civ-service-history` component.
///
/// Usage:
/// ```swift
/// CivServiceHistory(
///     legend: "Service period",
///     name: "service",
///     value: $serviceValue,
///     isRequired: true
/// )
/// ```
public struct CivServiceHistory: View {
    // MARK: - Properties

    /// Legend text displayed above the fields.
    public var legend: String

    /// Whether to show the service number field.
    public var showServiceNumber: Bool

    /// Error message for the branch field.
    public var branchError: String

    /// Error message for the start date field.
    public var startDateError: String

    /// Error message for the end date field.
    public var endDateError: String

    /// Error message for the discharge field.
    public var dischargeError: String

    /// Error message for the service number field.
    public var serviceNumberError: String

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
        showServiceNumber: Bool = false,
        branchError: String = "",
        startDateError: String = "",
        endDateError: String = "",
        dischargeError: String = "",
        serviceNumberError: String = "",
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
        self.showServiceNumber = showServiceNumber
        self.branchError = branchError
        self.startDateError = startDateError
        self.endDateError = endDateError
        self.dischargeError = dischargeError
        self.serviceNumberError = serviceNumberError
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
struct CivServiceHistory_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var value = ""

        var body: some View {
            CivServiceHistory(
                legend: "Service period",
                name: "service",
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
