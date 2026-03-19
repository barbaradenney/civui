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

    /// Whether a date is required.
    public var isRequired: Bool

    /// Whether the picker is disabled.
    public var isDisabled: Bool

    /// Called when the date changes.
    public var onChange: ((String) -> Void)?

    /// Called for analytics tracking (parallels `civ-analytics` event).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

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
        isRequired: Bool = false,
        isDisabled: Bool = false,
        onChange: ((String) -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil
    ) {
        self.label = label
        self._value = value
        self.hint = hint
        self.error = error
        self.min = min
        self.max = max
        self.isRequired = isRequired
        self.isDisabled = isDisabled
        self.onChange = onChange
        self.onAnalytics = onAnalytics
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

            // 4. DatePicker
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
            .disabled(isDisabled)
            .opacity(isDisabled ? 0.5 : 1.0)
            .accessibilityLabel(accessibilityLabelText)
            .accessibilityHint(accessibilityHintText)
        }
        .padding(.bottom, CivTokens.Spacing._4)
        .accessibilityElement(children: .contain)
        .onChange(of: error) { newError in
            if let newError, !newError.isEmpty {
                UIAccessibility.post(notification: .announcement, argument: newError)
            }
        }
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
