// CivUI — CivTextarea for SwiftUI
// Accessible multi-line text input with optional word/character count.
// Renders: label → hint → error → textarea → count (Section 508 compliant)

import SwiftUI

/// Accessible multi-line text input for government applications.
///
/// Implements the CivUI form field pattern with:
/// - Visible label (required for Section 508)
/// - Optional hint text
/// - Error message with VoiceOver announcement
/// - Character count (via `maxlength`)
/// - Word count (via `maxwords`)
/// - Readonly mode
/// - Dark mode adaptive colors
///
/// Usage:
/// ```swift
/// CivTextarea(
///     label: "Describe the issue",
///     value: $description,
///     hint: "Be as specific as possible",
///     maxwords: 200
/// )
/// ```
public struct CivTextarea: View {
    // MARK: - Properties

    /// Visible label text (required — never use placeholder as sole label).
    public let label: String

    /// Bound text value.
    @Binding public var value: String

    /// Help text shown below the label.
    public var hint: String?

    /// Error message. When set, renders with VoiceOver announcement.
    public var error: String?

    /// Whether the field is required.
    public var isRequired: Bool

    /// Whether the field is disabled.
    public var isDisabled: Bool

    /// Whether the field is readonly.
    public var isReadonly: Bool

    /// Placeholder text.
    public var placeholder: String?

    /// Number of visible text rows (controls minimum height).
    public var rows: Int

    /// Maximum character length. When set, enables character count display.
    public var maxlength: Int?

    /// Maximum word count. When set, enables word count display.
    /// Ignored if `maxlength` is also set.
    public var maxwords: Int?

    /// Called on every value change (parallels `civ-input` event).
    public var onInput: ((String) -> Void)?

    /// Called on committed change / focus loss (parallels `civ-change` event).
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

    /// Whether the field contains PII (excluded from getFormData).
    public var isPii: Bool

    /// Minimum character length.
    public var minlength: Int?

    /// Whether the textarea auto-grows to fit content.
    public var autogrow: Bool

    /// Maximum height for auto-grow mode (CSS value, e.g., "300px").
    public var maxHeight: String?

    /// Validation type (e.g., "email", "url").
    public var validateType: String

    // MARK: - Internal State

    @FocusState private var isFocused: Bool
    @Environment(\.colorScheme) private var colorScheme

    /// Timer for debounced SR count announcement.
    @State private var countAnnouncementTimer: Timer?

    // MARK: - Initializer

    public init(
        label: String,
        value: Binding<String>,
        hint: String? = nil,
        error: String? = nil,
        isRequired: Bool = false,
        isDisabled: Bool = false,
        isReadonly: Bool = false,
        placeholder: String? = nil,
        rows: Int = 5,
        maxlength: Int? = nil,
        maxwords: Int? = nil,
        onInput: ((String) -> Void)? = nil,
        onChange: ((String) -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil,
        formState: CivFormState? = nil,
        formName: String? = nil,
        requiredMessage: String? = nil,
        formValidate: (() -> String?)? = nil,
        isPii: Bool = false,
        minlength: Int? = nil,
        autogrow: Bool = false,
        maxHeight: String? = nil,
        validateType: String = ""
    ) {
        self.label = label
        self._value = value
        self.hint = hint
        self.error = error
        self.isRequired = isRequired
        self.isDisabled = isDisabled
        self.isReadonly = isReadonly
        self.placeholder = placeholder
        self.rows = rows
        self.maxlength = maxlength
        self.maxwords = maxwords
        self.onInput = onInput
        self.onChange = onChange
        self.onAnalytics = onAnalytics
        self.formState = formState
        self.formName = formName
        self.requiredMessage = requiredMessage
        self.formValidate = formValidate
        self.isPii = isPii
        self.minlength = minlength
        self.autogrow = autogrow
        self.maxHeight = maxHeight
        self.validateType = validateType
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

            // 4. Textarea
            textareaField

            // 5. Count display
            countView
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

    @ViewBuilder
    private var textareaField: some View {
        let minHeight = CGFloat(rows) * CivTokens.Typography.FontSize.base * CivTokens.Typography.LineHeight.normal

        let field = Group {
            if isReadonly {
                ScrollView {
                    Text(value)
                        .font(.system(size: CivTokens.Typography.FontSize.base))
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
                .frame(minHeight: minHeight)
            } else {
                TextEditor(text: inputBinding)
                    .font(.system(size: CivTokens.Typography.FontSize.base))
                    .frame(minHeight: minHeight)
                    .scrollContentBackground(.hidden)
            }
        }
        .padding(.horizontal, CivTokens.Spacing._2)
        .padding(.vertical, CivTokens.Spacing._1_5)
        .background(adaptiveColor(
            light: isReadonly
                ? CivTokens.Colors.Base.lightest
                : CivTokens.Colors.White.default_,
            dark: isReadonly
                ? CivTokens.DarkColors.Base.lightest
                : CivTokens.DarkColors.White.default_
        ))
        .cornerRadius(CivTokens.Border.Radius.default_)
        .overlay(borderOverlay)
        .civFocusRing(isFocused)
        .focused($isFocused)
        .disabled(isDisabled || isReadonly)
        .opacity(isDisabled ? 0.5 : 1.0)
        .accessibilityLabel(accessibilityLabelText)
        .accessibilityHint(accessibilityHintText)
        .accessibilityValue(value)

        if #available(iOS 17.0, *) {
            field
                .onChange(of: isFocused) { oldValue, newValue in
                    if oldValue && !newValue {
                        onChange?(value)
                        onAnalytics?("change", ["value": value])
                    }
                }
        } else {
            field
                .onChange(of: isFocused) { newValue in
                    if !newValue {
                        onChange?(value)
                        onAnalytics?("change", ["value": value])
                    }
                }
        }
    }

    @ViewBuilder
    private var countView: some View {
        if showCharCount {
            let remaining = maxlength! - value.count
            Text("\(remaining) characters remaining")
                .font(.system(size: CivTokens.Typography.FontSize.sm,
                              weight: remaining < 0 ? CivTokens.Typography.FontWeight.bold : CivTokens.Typography.FontWeight.regular))
                .foregroundColor(remaining < 0
                    ? adaptiveColor(light: CivTokens.Colors.Error.default_, dark: CivTokens.DarkColors.Error.default_)
                    : adaptiveColor(light: CivTokens.Colors.Base.default_, dark: CivTokens.DarkColors.Base.default_))
                .accessibilityIdentifier("civ-charcount")
        } else if showWordCount {
            let remaining = maxwords! - wordCount
            Text(CivLocale.shared.t("textareaWordsRemaining").replacingOccurrences(of: "{count}", with: "\(remaining)"))
                .font(.system(size: CivTokens.Typography.FontSize.sm,
                              weight: remaining < 0 ? CivTokens.Typography.FontWeight.bold : CivTokens.Typography.FontWeight.regular))
                .foregroundColor(remaining < 0
                    ? adaptiveColor(light: CivTokens.Colors.Error.default_, dark: CivTokens.DarkColors.Error.default_)
                    : adaptiveColor(light: CivTokens.Colors.Base.default_, dark: CivTokens.DarkColors.Base.default_))
                .accessibilityIdentifier("civ-wordcount")
        }
    }

    // MARK: - Count Helpers

    private var showCharCount: Bool {
        maxlength != nil && maxlength! > 0
    }

    private var showWordCount: Bool {
        maxwords != nil && maxwords! > 0 && !showCharCount
    }

    private var wordCount: Int {
        value.trimmingCharacters(in: .whitespacesAndNewlines)
            .split(whereSeparator: { $0.isWhitespace })
            .count
    }

    // MARK: - Border

    private var borderOverlay: some View {
        RoundedRectangle(cornerRadius: CivTokens.Border.Radius.default_)
            .stroke(borderColor, lineWidth: error != nil
                ? CivTokens.Border.Width._2
                : CivTokens.Border.Width.default_)
    }

    private var borderColor: Color {
        if error != nil {
            return adaptiveColor(
                light: CivTokens.Colors.Error.default_,
                dark: CivTokens.DarkColors.Error.default_
            )
        }
        return adaptiveColor(
            light: CivTokens.Colors.Base.light,
            dark: CivTokens.DarkColors.Base.light
        )
    }

    // MARK: - Input Binding

    private var inputBinding: Binding<String> {
        Binding(
            get: { value },
            set: { newValue in
                value = newValue
                onInput?(newValue)
                scheduleCountAnnouncement()
            }
        )
    }

    /// Debounce the character/word count VoiceOver announcement (1 second).
    private func scheduleCountAnnouncement() {
        countAnnouncementTimer?.invalidate()
        let currentValue = value
        let ml = maxlength
        let mw = maxwords
        countAnnouncementTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: false) { _ in
            if let ml, ml > 0 {
                let remaining = ml - currentValue.count
                UIAccessibility.post(notification: .announcement, argument: "\(remaining) characters remaining")
            } else if let mw, mw > 0 {
                let wc = currentValue.trimmingCharacters(in: .whitespacesAndNewlines)
                    .split(whereSeparator: { $0.isWhitespace }).count
                let remaining = mw - wc
                let msg = CivLocale.shared.t("textareaWordsRemaining").replacingOccurrences(of: "{count}", with: "\(remaining)")
                UIAccessibility.post(notification: .announcement, argument: msg)
            }
        }
    }

    // MARK: - Accessibility

    private var accessibilityLabelText: String {
        var parts = [label]
        if isRequired { parts.append("required") }
        if isReadonly { parts.append("read only") }
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
struct CivTextarea_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var description = ""
        @State private var notes = "These are some existing notes that were previously entered."

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    CivTextarea(
                        label: "Describe the issue",
                        value: $description,
                        hint: "Be as specific as possible",
                        isRequired: true,
                        maxwords: 200
                    )

                    CivTextarea(
                        label: "Additional comments",
                        value: $notes,
                        maxlength: 500
                    )

                    CivTextarea(
                        label: "Previous submission",
                        value: .constant("This is a readonly textarea."),
                        isReadonly: true,
                        rows: 3
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
