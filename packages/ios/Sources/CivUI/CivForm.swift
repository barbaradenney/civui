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

    /// Called when the form is submitted (validation must be done by the caller).
    public var onSubmit: (() -> Void)?

    /// Content rendered inside the form.
    public let content: Content

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        errors: Binding<[CivFormFieldError]>,
        formLabel: String? = nil,
        onSubmit: (() -> Void)? = nil,
        @ViewBuilder content: () -> Content
    ) {
        self._errors = errors
        self.formLabel = formLabel
        self.onSubmit = onSubmit
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
    }

    // MARK: - Error Summary

    private var errorSummary: some View {
        VStack(alignment: .leading, spacing: CivTokens.Spacing._2) {
            Text(errors.count == 1
                 ? "There is 1 error on this page"
                 : "There are \(errors.count) errors on this page")
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
        .accessibilityAddTraits(.updatesFrequently)
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
