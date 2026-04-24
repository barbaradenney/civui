// CivUI — CivDeceasedPerson for SwiftUI
// Compound field for collecting information about a person who has died.
// Used on VA burial (21P-530), SSA survivor benefit, and probate forms.
// Plain-language labels — "the person who died", not "decedent".

import SwiftUI

/// Structured value matching the web `DeceasedPersonValue` interface.
public struct DeceasedPersonValue: Equatable {
    public var first: String
    public var middle: String
    public var last: String
    public var suffix: String
    public var dateOfBirth: String
    public var dateOfDeath: String
    public var relationship: String

    public init(
        first: String = "",
        middle: String = "",
        last: String = "",
        suffix: String = "",
        dateOfBirth: String = "",
        dateOfDeath: String = "",
        relationship: String = ""
    ) {
        self.first = first
        self.middle = middle
        self.last = last
        self.suffix = suffix
        self.dateOfBirth = dateOfBirth
        self.dateOfDeath = dateOfDeath
        self.relationship = relationship
    }

    public var isEmpty: Bool {
        first.isEmpty && last.isEmpty && dateOfBirth.isEmpty && dateOfDeath.isEmpty
    }
}

private let RELATIONSHIP_OPTIONS: [(value: String, label: String)] = [
    ("", "- Select -"),
    ("spouse", "Spouse"),
    ("parent", "Parent"),
    ("child", "Child"),
    ("sibling", "Sibling"),
    ("other", "Other"),
]

public struct CivDeceasedPerson: View {
    @Binding public var value: DeceasedPersonValue

    public var legend: String
    public var name: String
    public var hint: String
    public var error: String
    public var nameError: String
    public var dateOfBirthError: String
    public var dateOfDeathError: String
    public var relationshipError: String
    public var hideRelationship: Bool
    public var required: Bool
    public var disabled: Bool
    public var readonly: Bool

    public var onChange: ((DeceasedPersonValue) -> Void)?

    @Environment(\.colorScheme) private var colorScheme

    public init(
        value: Binding<DeceasedPersonValue>,
        legend: String = "About the person who died",
        name: String = "deceased",
        hint: String = "",
        error: String = "",
        nameError: String = "",
        dateOfBirthError: String = "",
        dateOfDeathError: String = "",
        relationshipError: String = "",
        hideRelationship: Bool = false,
        required: Bool = false,
        disabled: Bool = false,
        readonly: Bool = false,
        onChange: ((DeceasedPersonValue) -> Void)? = nil
    ) {
        self._value = value
        self.legend = legend
        self.name = name
        self.hint = hint
        self.error = error
        self.nameError = nameError
        self.dateOfBirthError = dateOfBirthError
        self.dateOfDeathError = dateOfDeathError
        self.relationshipError = relationshipError
        self.hideRelationship = hideRelationship
        self.required = required
        self.disabled = disabled
        self.readonly = readonly
        self.onChange = onChange
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: CivTokens.Spacing._4) {
            if !legend.isEmpty {
                Text(legend + (required ? " (required)" : ""))
                    .font(.system(
                        size: CivTokens.Typography.FontSize.lg,
                        weight: CivTokens.Typography.FontWeight.semibold
                    ))
                    .accessibilityAddTraits(.isHeader)
            }
            if !hint.isEmpty {
                Text(hint)
                    .font(.system(size: CivTokens.Typography.FontSize.sm))
                    .foregroundColor(
                        colorScheme == .dark
                            ? CivTokens.DarkColors.Base.dark
                            : CivTokens.Colors.Base.dark
                    )
            }
            if !error.isEmpty {
                Text(error)
                    .font(.system(size: CivTokens.Typography.FontSize.sm))
                    .foregroundColor(
                        colorScheme == .dark
                            ? CivTokens.DarkColors.Error.default_
                            : CivTokens.Colors.Error.default_
                    )
                    .accessibilityAddTraits(.isStaticText)
            }

            VStack(alignment: .leading, spacing: CivTokens.Spacing._3) {
                Text("Their name")
                    .font(.system(size: CivTokens.Typography.FontSize.base, weight: .medium))
                TextField("First name", text: $value.first)
                    .textContentType(.givenName)
                    .disabled(disabled)
                TextField("Middle name", text: $value.middle)
                    .textContentType(.middleName)
                    .disabled(disabled)
                TextField("Last name", text: $value.last)
                    .textContentType(.familyName)
                    .disabled(disabled)
                if !nameError.isEmpty {
                    Text(nameError)
                        .font(.system(size: CivTokens.Typography.FontSize.sm))
                        .foregroundColor(
                            colorScheme == .dark
                                ? CivTokens.DarkColors.Error.default_
                                : CivTokens.Colors.Error.default_
                        )
                }
            }

            VStack(alignment: .leading, spacing: CivTokens.Spacing._2) {
                Text("Date of birth")
                TextField("YYYY-MM-DD", text: $value.dateOfBirth)
                    .disabled(disabled)
                if !dateOfBirthError.isEmpty {
                    Text(dateOfBirthError)
                        .font(.system(size: CivTokens.Typography.FontSize.sm))
                        .foregroundColor(
                            colorScheme == .dark
                                ? CivTokens.DarkColors.Error.default_
                                : CivTokens.Colors.Error.default_
                        )
                }
            }

            VStack(alignment: .leading, spacing: CivTokens.Spacing._2) {
                Text("Date of death" + (required ? " (required)" : ""))
                TextField("YYYY-MM-DD", text: $value.dateOfDeath)
                    .disabled(disabled)
                if !dateOfDeathError.isEmpty {
                    Text(dateOfDeathError)
                        .font(.system(size: CivTokens.Typography.FontSize.sm))
                        .foregroundColor(
                            colorScheme == .dark
                                ? CivTokens.DarkColors.Error.default_
                                : CivTokens.Colors.Error.default_
                        )
                }
            }

            if !hideRelationship {
                VStack(alignment: .leading, spacing: CivTokens.Spacing._2) {
                    Text("Their relationship to you")
                    Picker("Relationship", selection: $value.relationship) {
                        ForEach(RELATIONSHIP_OPTIONS, id: \.value) { option in
                            Text(option.label).tag(option.value)
                        }
                    }
                    .pickerStyle(.menu)
                    .disabled(disabled)
                    if !relationshipError.isEmpty {
                        Text(relationshipError)
                            .font(.system(size: CivTokens.Typography.FontSize.sm))
                            .foregroundColor(
                                colorScheme == .dark
                                    ? CivTokens.DarkColors.Error.default_
                                    : CivTokens.Colors.Error.default_
                            )
                    }
                }
            }
        }
        .onChange(of: value) { newValue in
            onChange?(newValue)
        }
    }
}

#if DEBUG
struct CivDeceasedPerson_Previews: PreviewProvider {
    struct Wrapper: View {
        @State var person = DeceasedPersonValue()
        var body: some View {
            CivDeceasedPerson(value: $person, legend: "About your spouse", required: true)
                .padding()
        }
    }
    static var previews: some View { Wrapper() }
}
#endif
