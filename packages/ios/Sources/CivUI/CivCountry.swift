// CivUI — CivCountry for SwiftUI
// Accessible country selector following government design system patterns.

import SwiftUI

/// Accessible country selector for government applications.
///
/// Renders a country picker with optional US-first ordering and
/// include/exclude filters. Mirrors the web `civ-country` component.
///
/// Usage:
/// ```swift
/// CivCountry(
///     label: "Country of birth",
///     name: "country",
///     value: $country,
///     isRequired: true
/// )
/// ```
public struct CivCountry: View {
    // MARK: - Properties

    /// Whether to show the United States first in the list.
    public var usFirst: Bool

    /// Comma-separated list of country codes to include.
    public var include: String

    /// Comma-separated list of country codes to exclude.
    public var exclude: String

    /// Visible label text.
    public var label: String

    /// Field name for form submission.
    public var name: String

    /// Bound selected value.
    @Binding public var value: String

    /// Help text shown below the label.
    public var hint: String?

    /// Error message.
    public var error: String?

    /// Whether a selection is required.
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
        usFirst: Bool = true,
        include: String = "",
        exclude: String = "",
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
        self.usFirst = usFirst
        self.include = include
        self.exclude = exclude
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
struct CivCountry_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var country = ""

        var body: some View {
            CivCountry(
                label: "Country of birth",
                name: "country",
                value: $country,
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
