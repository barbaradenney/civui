// CivUI — CivCheckbox for SwiftUI
// Accessible checkbox following government design system patterns.
// Renders: hint → error → [checkbox + label + description] (Section 508 compliant)

import SwiftUI

/// Accessible checkbox for government applications.
///
/// Implements the CivUI form field pattern with:
/// - Inline label beside the checkbox (required for Section 508)
/// - Optional description text below the label
/// - Optional hint and error messages
/// - Tile variant for card-style checkboxes
/// - Dark mode adaptive colors
///
/// The web component dispatches `{ checked, value }` detail — the `onChange`
/// callback mirrors this with both parameters.
///
/// Usage:
/// ```swift
/// CivCheckbox(
///     label: "I agree to the terms of service",
///     checked: $agreed,
///     isRequired: true
/// )
/// ```
public struct CivCheckbox: View {
    // MARK: - Properties

    /// Visible label text displayed beside the checkbox.
    public let label: String

    /// Bound checked state.
    @Binding public var checked: Bool

    /// Form value submitted when checked (defaults to "on").
    public var value: String

    /// Optional description shown below the label.
    public var description: String?

    /// Help text shown above the checkbox.
    public var hint: String?

    /// Error message. When set, renders with VoiceOver announcement.
    public var error: String?

    /// Whether the field is required.
    public var isRequired: Bool

    /// Whether the field is disabled.
    public var isDisabled: Bool

    /// Whether the field is read-only (visible but non-interactive, no opacity change).
    public var isReadonly: Bool

    /// Field name for form state registration.
    public var formName: String

    /// Whether the checkbox is in an indeterminate (mixed) state.
    /// When true, displays a dash instead of a checkmark.
    public var isIndeterminate: Bool

    /// Whether to render in tile (card) style.
    public var isTile: Bool

    /// Density variant — "default" or "sm" (compact). In "sm" mode, tile chrome
    /// is forced off and the checkbox renders at half the default size for use
    /// in dense surfaces like data-grid rows or column-toggle panels.
    public var spacing: String

    /// Called on every checked state change (parallels `civ-input`/`civ-change` events).
    /// Parameters: (checked: Bool, value: String)
    public var onChange: ((Bool, String) -> Void)?

    /// Called for analytics tracking (parallels `civ-analytics` event).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        label: String,
        checked: Binding<Bool>,
        value: String = "on",
        description: String? = nil,
        hint: String? = nil,
        error: String? = nil,
        isRequired: Bool = false,
        isDisabled: Bool = false,
        isReadonly: Bool = false,
        formName: String = "",
        isIndeterminate: Bool = false,
        isTile: Bool = true,
        spacing: String = "default",
        onChange: ((Bool, String) -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil
    ) {
        self.label = label
        self._checked = checked
        self.value = value
        self.description = description
        self.hint = hint
        self.error = error
        self.isRequired = isRequired
        self.isDisabled = isDisabled
        self.isReadonly = isReadonly
        self.formName = formName
        self.isIndeterminate = isIndeterminate
        self.isTile = isTile
        self.spacing = spacing
        self.onChange = onChange
        self.onAnalytics = onAnalytics
    }

    // MARK: - Body

    public var body: some View {
        VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {
            // 1. Hint
            if let hint, !hint.isEmpty {
                Text(hint)
                    .font(.system(size: CivTokens.Typography.FontSize.sm))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Base.dark,
                        dark: CivTokens.DarkColors.Base.dark
                    ))
                    .accessibilityIdentifier("civ-hint")
            }

            // 2. Error
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

            // 3. Checkbox + Label
            checkboxRow
        }
        .padding(.bottom, CivTokens.Spacing._2)
        .accessibilityElement(children: .contain)
        .onChange(of: error) { newError in
            if let newError, !newError.isEmpty {
                UIAccessibility.post(notification: .announcement, argument: newError)
            }
        }
    }

    // MARK: - Subviews

    private var checkboxRow: some View {
        Button(action: toggle) {
            HStack(alignment: .top, spacing: CivTokens.Spacing._2) {
                // Checkbox indicator
                checkboxIndicator

                // Label + description
                VStack(alignment: .leading, spacing: CivTokens.Spacing._0_5) {
                    HStack(spacing: CivTokens.Spacing._0_5) {
                        Text(label)
                            .font(.system(size: CivTokens.Typography.FontSize.base))
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

                    if let description, !description.isEmpty {
                        Text(description)
                            .font(.system(size: CivTokens.Typography.FontSize.sm))
                            .foregroundColor(adaptiveColor(
                                light: CivTokens.Colors.Base.dark,
                                dark: CivTokens.DarkColors.Base.dark
                            ))
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(isTile ? CivTokens.Spacing._3 : 0)
            .background(tileBackground)
            .cornerRadius(isTile ? CivTokens.Border.Radius.default_ : 0)
            .overlay(tileOverlay)
        }
        .buttonStyle(.plain)
        .disabled(isDisabled || isReadonly)
        .opacity(isDisabled ? 0.5 : 1.0)
        .accessibilityLabel(accessibilityLabelText)
        .accessibilityValue(isIndeterminate ? "mixed" : (checked ? "checked" : "unchecked"))
        .accessibilityAddTraits(.isButton)
        .accessibilityHint(accessibilityHintText)
    }

    private var checkboxIndicator: some View {
        ZStack {
            RoundedRectangle(cornerRadius: CivTokens.Border.Radius.sm)
                .stroke((checked || isIndeterminate)
                    ? adaptiveColor(light: CivTokens.Colors.Primary.default_, dark: CivTokens.DarkColors.Primary.default_)
                    : adaptiveColor(light: CivTokens.Colors.Base.light, dark: CivTokens.DarkColors.Base.light),
                    lineWidth: CivTokens.Border.Width._2)
                .frame(width: 20, height: 20)

            if isIndeterminate {
                RoundedRectangle(cornerRadius: CivTokens.Border.Radius.sm)
                    .fill(adaptiveColor(
                        light: CivTokens.Colors.Primary.default_,
                        dark: CivTokens.DarkColors.Primary.default_
                    ))
                    .frame(width: 20, height: 20)

                Image(systemName: "minus")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.white)
            } else if checked {
                RoundedRectangle(cornerRadius: CivTokens.Border.Radius.sm)
                    .fill(adaptiveColor(
                        light: CivTokens.Colors.Primary.default_,
                        dark: CivTokens.DarkColors.Primary.default_
                    ))
                    .frame(width: 20, height: 20)

                Image(systemName: "checkmark")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.white)
            }
        }
        .padding(.top, 2) // Align with first line of text
    }

    @ViewBuilder
    private var tileBackground: some View {
        if isTile {
            adaptiveColor(
                light: checked
                    ? CivTokens.Colors.Primary.lightest
                    : CivTokens.Colors.White.default_,
                dark: checked
                    ? CivTokens.DarkColors.Primary.lightest
                    : CivTokens.DarkColors.White.default_
            )
        } else {
            Color.clear
        }
    }

    @ViewBuilder
    private var tileOverlay: some View {
        if isTile {
            RoundedRectangle(cornerRadius: CivTokens.Border.Radius.default_)
                .stroke(
                    checked
                        ? adaptiveColor(light: CivTokens.Colors.Primary.default_, dark: CivTokens.DarkColors.Primary.default_)
                        : adaptiveColor(light: CivTokens.Colors.Base.light, dark: CivTokens.DarkColors.Base.light),
                    lineWidth: checked
                        ? CivTokens.Border.Width._2
                        : CivTokens.Border.Width.default_
                )
        }
    }

    // MARK: - Actions

    private func toggle() {
        checked.toggle()
        onChange?(checked, value)
        onAnalytics?("change", ["checked": checked, "value": value])
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
        if let description, !description.isEmpty { parts.append(description) }
        return parts.joined(separator: ". ")
    }

    // MARK: - Color Helper

    private func adaptiveColor(light: Color, dark: Color) -> Color {
        colorScheme == .dark ? dark : light
    }
}

// MARK: - Preview

#if DEBUG
struct CivCheckbox_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var agreed = false
        @State private var emailOpt = true
        @State private var option1 = false
        @State private var option2 = true

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    CivCheckbox(
                        label: "I agree to the terms of service",
                        checked: $agreed,
                        isRequired: true
                    )

                    CivCheckbox(
                        label: "Receive email notifications",
                        checked: $emailOpt,
                        description: "We will send you updates about your application status"
                    )

                    CivCheckbox(
                        label: "Standard mail delivery",
                        checked: $option1,
                        description: "5-7 business days",
                        isTile: true
                    )

                    CivCheckbox(
                        label: "Priority mail delivery",
                        checked: $option2,
                        description: "1-3 business days",
                        isTile: true
                    )

                    CivCheckbox(
                        label: "Disabled option",
                        checked: .constant(false),
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
