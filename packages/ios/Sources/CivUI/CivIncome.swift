// CivUI — CivIncome for SwiftUI
// Compound dollar-amount + pay-frequency input (mirrors civ-income on web).
//
// Placeholder body — the prop surface satisfies schema parity.
// Implementation should compose CivCurrency + CivSelect (frequency).

import SwiftUI

/// Income reporting compound (amount + frequency).
public struct CivIncome: View {
    public var legend: String
    @Binding public var value: String
    public var amountLabel: String
    public var frequencyLabel: String
    public var amountError: String?
    public var frequencyError: String?
    public var frequencies: [String]
    public var hint: String?
    public var error: String?
    public var isRequired: Bool
    public var isDisabled: Bool
    public var isReadonly: Bool
    public var onInput: ((String) -> Void)?
    public var onChange: ((String) -> Void)?

    public init(
        legend: String = "",
        value: Binding<String>,
        amountLabel: String = "",
        frequencyLabel: String = "",
        amountError: String? = nil,
        frequencyError: String? = nil,
        frequencies: [String] = [
            "weekly", "biweekly", "semimonthly", "monthly",
            "quarterly", "annually", "one-time",
        ],
        hint: String? = nil,
        error: String? = nil,
        isRequired: Bool = false,
        isDisabled: Bool = false,
        isReadonly: Bool = false,
        onInput: ((String) -> Void)? = nil,
        onChange: ((String) -> Void)? = nil
    ) {
        self.legend = legend
        self._value = value
        self.amountLabel = amountLabel
        self.frequencyLabel = frequencyLabel
        self.amountError = amountError
        self.frequencyError = frequencyError
        self.frequencies = frequencies
        self.hint = hint
        self.error = error
        self.isRequired = isRequired
        self.isDisabled = isDisabled
        self.isReadonly = isReadonly
        self.onInput = onInput
        self.onChange = onChange
    }

    public var body: some View {
        EmptyView()
    }
}
