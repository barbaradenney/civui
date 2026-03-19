// CivUI — CivFormState for SwiftUI
// Centralized form state management with field registration, validation, and reset.
// Mirrors the web CivFormElement's form participation pattern.

import SwiftUI

/// Centralized form state manager for CivUI forms.
///
/// Components register themselves when `formState` and `name` are provided.
/// Call `validate()` on submit to run required checks and custom validators.
///
/// Usage:
/// ```swift
/// struct MyForm: View {
///     @StateObject private var formState = CivFormState()
///     @State private var name = ""
///     @State private var nameError = ""
///
///     var body: some View {
///         CivForm(errors: $formState.errors, state: formState) {
///             CivTextInput(
///                 label: "Full name",
///                 value: $name,
///                 error: nameError.isEmpty ? nil : nameError,
///                 isRequired: true,
///                 formState: formState,
///                 formName: "name"
///             )
///             Button("Submit") {
///                 if formState.validate() {
///                     // submit
///                 }
///             }
///         }
///     }
/// }
/// ```
public class CivFormState: ObservableObject {
    @Published public var errors: [CivFormFieldError] = []
    private var fields: [String: CivFieldRegistration] = [:]

    public init() {}

    /// Registration info for a form-participating field.
    public struct CivFieldRegistration {
        public let name: String
        public let label: String
        public let getValue: () -> String
        public let setValue: (String) -> Void
        public let isRequired: Bool
        public let requiredMessage: String
        public let getError: () -> String
        public let setError: (String) -> Void
        public let validate: (() -> String?)?
        public let isPii: Bool

        public init(
            name: String,
            label: String = "",
            getValue: @escaping () -> String,
            setValue: @escaping (String) -> Void,
            isRequired: Bool = false,
            requiredMessage: String = "",
            getError: @escaping () -> String = { "" },
            setError: @escaping (String) -> Void = { _ in },
            validate: (() -> String?)? = nil,
            isPii: Bool = false
        ) {
            self.name = name
            self.label = label
            self.getValue = getValue
            self.setValue = setValue
            self.isRequired = isRequired
            self.requiredMessage = requiredMessage
            self.getError = getError
            self.setError = setError
            self.validate = validate
            self.isPii = isPii
        }
    }

    /// Register a field for form state management.
    public func register(_ reg: CivFieldRegistration) {
        fields[reg.name] = reg
    }

    /// Unregister a field (typically called in `.onDisappear`).
    public func unregister(_ name: String) {
        fields.removeValue(forKey: name)
    }

    /// Validate all registered fields. Returns `true` if no errors.
    ///
    /// Runs required checks first, then custom validators for non-empty fields.
    /// Sets error messages on individual fields and populates the `errors` array.
    @discardableResult
    public func validate() -> Bool {
        var newErrors: [CivFormFieldError] = []
        clearErrors()

        for (_, field) in fields.sorted(by: { $0.key < $1.key }) {
            // Required check
            if field.isRequired && field.getValue().isEmpty {
                let fallbackLabel = field.label.isEmpty ? field.name : field.label
                let msg = field.requiredMessage.isEmpty
                    ? CivLocale.shared.t("fieldRequired").replacingOccurrences(of: "{label}", with: fallbackLabel)
                    : field.requiredMessage
                newErrors.append(CivFormFieldError(fieldName: field.name, message: msg))
                field.setError(msg)
                continue
            }

            // Custom validation
            if let customValidate = field.validate, !field.getValue().isEmpty {
                if let error = customValidate() {
                    newErrors.append(CivFormFieldError(fieldName: field.name, message: error))
                    field.setError(error)
                }
            }
        }

        errors = newErrors
        return errors.isEmpty
    }

    /// Reset all fields to empty values and clear all errors.
    public func reset() {
        errors = []
        fields.values.forEach { $0.setValue(""); $0.setError("") }
    }

    /// Clear all errors without resetting field values.
    public func clearErrors() {
        errors = []
        fields.values.forEach { $0.setError("") }
    }

    /// Get form data as a dictionary, excluding PII fields.
    public func getFormData() -> [String: String] {
        var data: [String: String] = [:]
        for (name, field) in fields {
            if !field.isPii {
                data[name] = field.getValue()
            }
        }
        return data
    }

    /// Get form data including all fields (use with caution for PII).
    public func getAllFormData() -> [String: String] {
        var data: [String: String] = [:]
        for (name, field) in fields {
            data[name] = field.getValue()
        }
        return data
    }
}
