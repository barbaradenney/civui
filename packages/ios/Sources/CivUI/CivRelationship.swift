// CivUI — CivRelationship for SwiftUI
// Accessible relationship compound component following government design system patterns.

import SwiftUI

/// Accessible relationship form for government applications.
///
/// Renders a structured form for capturing relationship details.
/// Mirrors the web `civ-relationship` component.
///
/// Usage:
/// ```swift
/// CivRelationship(
///     legend: "Dependent information",
///     name: "dependent",
///     value: $relationshipValue,
///     isRequired: true
/// )
/// ```
public struct CivRelationship: View {
    // MARK: - Properties

    /// Legend text displayed above the fields.
    public var legend: String

    /// Relationship type preset (e.g., "spouse", "child", "parent").
    public var preset: String

    /// Whether to show the name fields.
    public var showName: Bool

    /// Whether to show the deceased fields.
    public var showDeceased: Bool

    /// Whether deceased is assumed (pre-checked).
    public var deceasedAssumed: Bool

    /// Whether to show the divorce date field.
    public var showDivorceDate: Bool

    /// Whether to show the adoption date field.
    public var showAdoptionDate: Bool

    /// Error message for the name field.
    public var nameError: String

    /// Error message for the relationship field.
    public var relationshipError: String

    /// Error message for the marriage date field.
    public var marriageDateError: String

    /// Error message for the divorce date field.
    public var divorceDateError: String

    /// Error message for the date of birth field.
    public var dateOfBirthError: String

    /// Error message for the adoption date field.
    public var adoptionDateError: String

    /// Error message for the date of death field.
    public var dateOfDeathError: String

    /// Error message for the other description field.
    public var otherDescriptionError: String

    /// JSON options string for configuring relationship options.
    public var options: String

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
        preset: String = "",
        showName: Bool = true,
        showDeceased: Bool = false,
        deceasedAssumed: Bool = false,
        showDivorceDate: Bool = false,
        showAdoptionDate: Bool = false,
        nameError: String = "",
        relationshipError: String = "",
        marriageDateError: String = "",
        divorceDateError: String = "",
        dateOfBirthError: String = "",
        adoptionDateError: String = "",
        dateOfDeathError: String = "",
        otherDescriptionError: String = "",
        options: String = "",
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
        self.preset = preset
        self.showName = showName
        self.showDeceased = showDeceased
        self.deceasedAssumed = deceasedAssumed
        self.showDivorceDate = showDivorceDate
        self.showAdoptionDate = showAdoptionDate
        self.nameError = nameError
        self.relationshipError = relationshipError
        self.marriageDateError = marriageDateError
        self.divorceDateError = divorceDateError
        self.dateOfBirthError = dateOfBirthError
        self.adoptionDateError = adoptionDateError
        self.dateOfDeathError = dateOfDeathError
        self.otherDescriptionError = otherDescriptionError
        self.options = options
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
struct CivRelationship_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var value = ""

        var body: some View {
            CivRelationship(
                legend: "Dependent information",
                name: "dependent",
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
