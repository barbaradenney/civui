// CivUI — CivCombobox for SwiftUI
// Accessible combobox (autocomplete) following government design system patterns.
// Renders: label → hint → error → searchable text field with dropdown (Section 508 compliant)

import SwiftUI

/// Option for CivCombobox.
public struct CivComboboxOption: Identifiable, Equatable {
    public let id: String
    public let value: String
    public let label: String

    public init(value: String, label: String) {
        self.id = value
        self.value = value
        self.label = label
    }
}

/// Accessible combobox (autocomplete) for government applications.
///
/// Provides a searchable text field with a filtered dropdown list.
/// Implements keyboard and VoiceOver navigation.
///
/// Usage:
/// ```swift
/// CivCombobox(
///     label: "State",
///     value: $selectedState,
///     options: [
///         CivComboboxOption(value: "DC", label: "District of Columbia"),
///         CivComboboxOption(value: "MD", label: "Maryland"),
///         CivComboboxOption(value: "VA", label: "Virginia"),
///     ]
/// )
/// ```
public struct CivCombobox: View {
    // MARK: - Properties

    /// Visible label text.
    public let label: String

    /// Bound selected value.
    @Binding public var value: String

    /// Available options.
    public let options: [CivComboboxOption]

    /// Help text shown below the label.
    public var hint: String?

    /// Error message.
    public var error: String?

    /// Placeholder text for the input.
    public var placeholder: String?

    /// Mobile keyboard hint passed through to the input. On iOS this
    /// maps to `.keyboardType` (numberPad / decimalPad / etc.).
    public var inputmode: String

    /// Text shown when no results match the filter.
    public var noResultsText: String

    /// Whether a selection is required.
    public var isRequired: Bool

    /// Whether the combobox is disabled.
    public var isDisabled: Bool

    /// Whether the combobox is read-only (visible but non-interactive, no opacity change).
    public var isReadonly: Bool

    /// Called when a selection is made.
    public var onChange: ((String, String) -> Void)?

    /// Called on every filter text change.
    public var onInput: ((String) -> Void)?

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

    /// Width variant (e.g., "full", "md", "lg").
    public var width: String

    /// Debounce delay in milliseconds for async option loading.
    public var loadDebounce: Int

    /// Minimum query length before triggering option loading.
    /// Defaults to `0` — load on first focus with an empty query (matches the web/schema default).
    public var minQueryLength: Int

    /// Text shown while options are loading.
    public var loadingText: String

    /// Text shown when option loading fails.
    public var loadingErrorText: String

    /// Called to load options asynchronously (parallels `civ-load` event).
    public var loadOptions: ((String) -> Void)?

    // MARK: - Internal State

    @State private var filter = ""
    @State private var isOpen = false
    @State private var activeIndex: Int = -1
    @State private var resultsAnnouncementTimer: Timer?
    @FocusState private var isFocused: Bool
    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        label: String,
        value: Binding<String>,
        options: [CivComboboxOption],
        hint: String? = nil,
        error: String? = nil,
        placeholder: String? = nil,
        inputmode: String = "",
        noResultsText: String? = nil,
        isRequired: Bool = false,
        isDisabled: Bool = false,
        isReadonly: Bool = false,
        onChange: ((String, String) -> Void)? = nil,
        onInput: ((String) -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil,
        formState: CivFormState? = nil,
        formName: String? = nil,
        requiredMessage: String? = nil,
        formValidate: (() -> String?)? = nil,
        isPii: Bool = false,
        width: String = "full",
        loadDebounce: Int = 300,
        minQueryLength: Int = 0,
        loadingText: String = "",
        loadingErrorText: String = "",
        loadOptions: ((String) -> Void)? = nil
    ) {
        self.label = label
        self._value = value
        self.options = options
        self.hint = hint
        self.error = error
        self.placeholder = placeholder
        self.inputmode = inputmode
        self.noResultsText = noResultsText ?? CivLocale.shared.t("comboboxNoResults")
        self.isRequired = isRequired
        self.isDisabled = isDisabled
        self.isReadonly = isReadonly
        self.onChange = onChange
        self.onInput = onInput
        self.onAnalytics = onAnalytics
        self.formState = formState
        self.formName = formName
        self.requiredMessage = requiredMessage
        self.formValidate = formValidate
        self.isPii = isPii
        self.width = width
        self.loadDebounce = loadDebounce
        self.minQueryLength = minQueryLength
        self.loadingText = loadingText
        self.loadingErrorText = loadingErrorText
        self.loadOptions = loadOptions
    }

    // MARK: - Computed

    private var filteredOptions: [CivComboboxOption] {
        guard !filter.isEmpty else { return options }
        let lower = filter.lowercased()
        return options.filter { $0.label.lowercased().contains(lower) }
    }

    private var displayValue: String {
        if isOpen { return filter }
        if let selected = options.first(where: { $0.value == value }) {
            return selected.label
        }
        return filter
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

            // 4. Input + Dropdown
            ZStack(alignment: .topLeading) {
                VStack(spacing: 0) {
                    let textField = TextField(placeholder ?? "", text: inputBinding)
                        .textFieldStyle(.plain)
                        .font(.system(size: CivTokens.Typography.FontSize.base))
                        .padding(.horizontal, CivTokens.Spacing._2)
                        .padding(.vertical, CivTokens.Spacing._1_5)
                        .background(adaptiveColor(
                            light: CivTokens.Colors.White.default_,
                            dark: CivTokens.DarkColors.White.default_
                        ))
                        .cornerRadius(CivTokens.Border.Radius.default_)
                        .overlay(borderOverlay)
                        .civFocusRing(isFocused)
                        .focused($isFocused)
                        .disabled(isDisabled || isReadonly)
                        .opacity(isDisabled ? 0.5 : 1.0)
                        .accessibilityLabel(accessibilityLabelText)
                        .accessibilityHint(accessibilityHintText)

                    if #available(iOS 17.0, *) {
                        textField
                            .onKeyPress(.downArrow) {
                                moveActiveIndex(by: 1)
                                return .handled
                            }
                            .onKeyPress(.upArrow) {
                                moveActiveIndex(by: -1)
                                return .handled
                            }
                            .onKeyPress(.return) {
                                selectActiveOption()
                                return .handled
                            }
                            .onKeyPress(.escape) {
                                isOpen = false
                                activeIndex = -1
                                return .handled
                            }
                    } else {
                        textField
                    }

                    if isOpen && !filteredOptions.isEmpty {
                        ScrollView {
                            LazyVStack(alignment: .leading, spacing: 0) {
                                ForEach(Array(filteredOptions.enumerated()), id: \.element.id) { index, option in
                                    Button(action: { selectOption(option) }) {
                                        Text(option.label)
                                            .font(.system(size: CivTokens.Typography.FontSize.base,
                                                          weight: option.value == value ? .bold : .regular))
                                            .foregroundColor(adaptiveColor(
                                                light: CivTokens.Colors.Base.darkest,
                                                dark: CivTokens.DarkColors.Base.darkest
                                            ))
                                            .frame(maxWidth: .infinity, alignment: .leading)
                                            .padding(.horizontal, CivTokens.Spacing._3)
                                            .padding(.vertical, CivTokens.Spacing._2)
                                            .background(index == activeIndex
                                                ? adaptiveColor(
                                                    light: CivTokens.Colors.Primary.lightest,
                                                    dark: CivTokens.DarkColors.Primary.lightest)
                                                : Color.clear)
                                    }
                                    .buttonStyle(.plain)
                                    .accessibilityLabel(option.label)
                                    .accessibilityAddTraits(option.value == value ? .isSelected : [])
                                }
                            }
                        }
                        .frame(maxHeight: 200)
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
                        .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
                    }

                    if isOpen && filteredOptions.isEmpty && !filter.isEmpty {
                        Text(noResultsText)
                            .font(.system(size: CivTokens.Typography.FontSize.base))
                            .foregroundColor(adaptiveColor(
                                light: CivTokens.Colors.Base.dark,
                                dark: CivTokens.DarkColors.Base.dark
                            ))
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(CivTokens.Spacing._3)
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
                    }
                }
            }
        }
        .padding(.bottom, CivTokens.Spacing._4)
        .onChange(of: isFocused) { focused in
            if focused {
                isOpen = true
            } else {
                // Delay closing to allow tap on option
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
                    isOpen = false
                    activeIndex = -1
                }
            }
        }
        .onChange(of: error) { newError in
            if let newError, !newError.isEmpty {
                UIAccessibility.post(notification: .announcement, argument: newError)
            }
        }
        .accessibilityElement(children: .contain)
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

    // MARK: - Keyboard Navigation

    private func moveActiveIndex(by delta: Int) {
        guard !filteredOptions.isEmpty else { return }
        if !isOpen { isOpen = true }
        let count = filteredOptions.count
        if activeIndex < 0 {
            activeIndex = delta > 0 ? 0 : count - 1
        } else {
            activeIndex = (activeIndex + delta + count) % count
        }
        // Announce the active option
        let option = filteredOptions[activeIndex]
        UIAccessibility.post(notification: .announcement, argument: option.label)
    }

    private func selectActiveOption() {
        guard activeIndex >= 0 && activeIndex < filteredOptions.count else { return }
        selectOption(filteredOptions[activeIndex])
    }

    // MARK: - Input Binding

    private var inputBinding: Binding<String> {
        Binding(
            get: { displayValue },
            set: { newValue in
                filter = newValue
                isOpen = true
                value = ""
                activeIndex = -1
                onInput?(newValue)
                scheduleResultsAnnouncement()
            }
        )
    }

    /// Debounce the results count VoiceOver announcement.
    private func scheduleResultsAnnouncement() {
        resultsAnnouncementTimer?.invalidate()
        resultsAnnouncementTimer = Timer.scheduledTimer(withTimeInterval: 0.5, repeats: false) { [self] _ in
            let count = filteredOptions.count
            let message = count == 0
                ? CivLocale.shared.t("comboboxNoResults")
                : CivLocale.shared.t("comboboxResultsAvailable").replacingOccurrences(of: "{count}", with: "\(count)")
            UIAccessibility.post(notification: .announcement, argument: message)
        }
    }

    // MARK: - Actions

    private func selectOption(_ option: CivComboboxOption) {
        value = option.value
        filter = option.label
        isOpen = false
        activeIndex = -1
        isFocused = false
        onChange?(option.value, option.label)
        onAnalytics?("select", ["value": option.value, "label": option.label])
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
struct CivCombobox_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var state = ""

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    CivCombobox(
                        label: "State or territory",
                        value: $state,
                        options: [
                            CivComboboxOption(value: "DC", label: "District of Columbia"),
                            CivComboboxOption(value: "MD", label: "Maryland"),
                            CivComboboxOption(value: "VA", label: "Virginia"),
                            CivComboboxOption(value: "PA", label: "Pennsylvania"),
                        ],
                        hint: "Start typing to search",
                        isRequired: true
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
