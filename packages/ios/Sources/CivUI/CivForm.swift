// CivUI — CivForm for SwiftUI
// Accessible form container following government design system patterns.
// Renders: error summary → form content (Section 508 compliant)

import SwiftUI

/// Form field error for CivForm error summary.
public struct CivFormFieldError: Identifiable {
    public let id = UUID()
    public let fieldName: String
    public let message: String

    public init(fieldName: String, message: String) {
        self.fieldName = fieldName
        self.message = message
    }
}

/// Accessible form container for government applications.
///
/// Provides validation coordination and error summary display.
/// Wraps content in a SwiftUI `VStack` with an accessible error summary
/// rendered above form fields when validation fails.
///
/// Usage:
/// ```swift
/// CivForm(errors: $formErrors, onSubmit: { handleSubmit() }) {
///     CivTextInput(label: "Full name", value: $name, isRequired: true)
///     CivTextInput(label: "Email", value: $email, isRequired: true, inputType: .email)
///
///     Button("Submit") { }
/// }
/// ```
public struct CivForm<Content: View>: View {
    // MARK: - Properties

    /// Current form errors to display in the summary.
    @Binding public var errors: [CivFormFieldError]

    /// Accessible label for the form.
    public var formLabel: String?

    /// Optional CivFormState for centralized validation and reset.
    public var state: CivFormState?

    /// Called when the form is submitted (validation must be done by the caller).
    public var onSubmit: (() -> Void)?

    /// Called for analytics tracking (parallels `civ-analytics` event).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    /// Form action URL.
    public var action: String

    /// HTTP method (e.g., "POST", "GET").
    public var method: String

    /// Heading level for the error summary (e.g., 3 for h3).
    public var errorHeadingLevel: Int

    /// Key for persisting form data to storage.
    public var persist: String

    /// Whether to enable prefill from external data.
    public var prefill: Bool

    /// Whether to track dirty state for unsaved changes warning.
    public var trackDirty: Bool

    /// URL for fetching prefill data.
    public var prefillSrc: String

    /// JSON headers for the prefill fetch request.
    public var prefillHeaders: String

    /// Heading for the support resources section.
    public var supportResourcesHeading: String

    /// Content rendered inside the form.
    public let content: Content

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        errors: Binding<[CivFormFieldError]>,
        formLabel: String? = nil,
        state: CivFormState? = nil,
        onSubmit: (() -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil,
        action: String = "",
        method: String = "POST",
        errorHeadingLevel: Int = 3,
        persist: String = "",
        prefill: Bool = false,
        trackDirty: Bool = false,
        prefillSrc: String = "",
        prefillHeaders: String = "",
        supportResourcesHeading: String = "",
        @ViewBuilder content: () -> Content
    ) {
        self._errors = errors
        self.formLabel = formLabel
        self.state = state
        self.onSubmit = onSubmit
        self.onAnalytics = onAnalytics
        self.action = action
        self.method = method
        self.errorHeadingLevel = errorHeadingLevel
        self.persist = persist
        self.prefill = prefill
        self.trackDirty = trackDirty
        self.prefillSrc = prefillSrc
        self.prefillHeaders = prefillHeaders
        self.supportResourcesHeading = supportResourcesHeading
        self.content = content()
    }

    // MARK: - Body

    public var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // 1. Error summary
            if !errors.isEmpty {
                errorSummary
            }

            // 2. Form content
            content
        }
        .accessibilityElement(children: .contain)
        .accessibilityLabel(formLabel ?? "Form")
        .onChange(of: errors.count) { count in
            if count > 0 {
                let message = count == 1
                    ? CivLocale.shared.t("formErrorSingular")
                    : CivLocale.shared.t("formErrorPlural").replacingOccurrences(of: "{count}", with: "\(count)")
                UIAccessibility.post(notification: .announcement, argument: message)
                onAnalytics?("validation-error", ["errorCount": count])
            }
        }
    }

    // MARK: - Error Summary

    private var errorSummary: some View {
        VStack(alignment: .leading, spacing: CivTokens.Spacing._2) {
            Text(errors.count == 1
                 ? CivLocale.shared.t("formErrorSingular")
                 : CivLocale.shared.t("formErrorPlural").replacingOccurrences(of: "{count}", with: "\(errors.count)"))
                .font(.system(size: CivTokens.Typography.FontSize.base,
                              weight: CivTokens.Typography.FontWeight.bold))
                .foregroundColor(adaptiveColor(
                    light: CivTokens.Colors.Error.dark,
                    dark: CivTokens.DarkColors.Error.dark
                ))

            VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {
                ForEach(errors) { error in
                    Text(error.message)
                        .font(.system(size: CivTokens.Typography.FontSize.sm))
                        .foregroundColor(adaptiveColor(
                            light: CivTokens.Colors.Error.default_,
                            dark: CivTokens.DarkColors.Error.default_
                        ))
                        .accessibilityLabel(error.message)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(CivTokens.Spacing._4)
        .background(adaptiveColor(
            light: CivTokens.Colors.Error.lighter,
            dark: CivTokens.DarkColors.Error.lighter
        ))
        .overlay(
            Rectangle()
                .frame(width: CivTokens.Border.Width._4)
                .foregroundColor(adaptiveColor(
                    light: CivTokens.Colors.Error.default_,
                    dark: CivTokens.DarkColors.Error.default_
                )),
            alignment: .leading
        )
        .cornerRadius(CivTokens.Border.Radius.default_)
        .padding(.bottom, CivTokens.Spacing._4)
        .accessibilityLabel("Form errors")
    }

    // MARK: - Color Helper

    private func adaptiveColor(light: Color, dark: Color) -> Color {
        colorScheme == .dark ? dark : light
    }
}

// MARK: - Preview

#if DEBUG
struct CivForm_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var name = ""
        @State private var email = ""
        @State private var errors: [CivFormFieldError] = [
            CivFormFieldError(fieldName: "name", message: "Enter your full name"),
            CivFormFieldError(fieldName: "email", message: "Enter a valid email address"),
        ]

        var body: some View {
            ScrollView {
                CivForm(errors: $errors) {
                    CivTextInput(label: "Full name", value: $name, isRequired: true)
                    CivTextInput(label: "Email address", value: $email, isRequired: true, inputType: .email)

                    Button("Submit") {
                        // Validate and submit
                    }
                    .padding(.top, CivTokens.Spacing._4)
                }
                .padding()
            }
        }
    }

    static var previews: some View {
        PreviewWrapper()
            .previewDisplayName("With Errors")
    }
}
#endif
