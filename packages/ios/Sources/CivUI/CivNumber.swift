// CivUI — CivNumber for SwiftUI
// Generic numeric input (mirrors the web civ-number component).
//
// Placeholder body — the prop surface satisfies schema parity.
// SwiftUI implementation should use TextField with .keyboardType
// (.numberPad / .decimalPad) and an .onChange filter for non-digit input.
// See audit-debt.md for native implementation status.

import SwiftUI

/// Generic numeric input for quantities, counts, ages, and other non-currency numbers.
public struct CivNumber: View {
    public var label: String
    @Binding public var value: String
    public var min: Double?
    public var max: Double?
    public var allowDecimal: Bool
    public var allowNegative: Bool
    public var placeholder: String
    public var prefix: String
    public var suffix: String
    /// Density variant — "default" or "sm" (compact). Suppresses chrome
    /// for use in dense surfaces like data-grid cell editors.
    public var spacing: String
    public var hint: String?
    public var error: String?
    public var isRequired: Bool
    public var isDisabled: Bool
    public var isReadonly: Bool
    public var onInput: ((String) -> Void)?
    public var onChange: ((String) -> Void)?
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    public init(
        label: String,
        value: Binding<String>,
        min: Double? = nil,
        max: Double? = nil,
        allowDecimal: Bool = false,
        allowNegative: Bool = false,
        spacing: String = "default",
        placeholder: String = "",
        prefix: String = "",
        suffix: String = "",
        hint: String? = nil,
        error: String? = nil,
        isRequired: Bool = false,
        isDisabled: Bool = false,
        isReadonly: Bool = false,
        onInput: ((String) -> Void)? = nil,
        onChange: ((String) -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil
    ) {
        self.label = label
        self._value = value
        self.min = min
        self.max = max
        self.allowDecimal = allowDecimal
        self.allowNegative = allowNegative
        self.spacing = spacing
        self.placeholder = placeholder
        self.prefix = prefix
        self.suffix = suffix
        self.hint = hint
        self.error = error
        self.isRequired = isRequired
        self.isDisabled = isDisabled
        self.isReadonly = isReadonly
        self.onInput = onInput
        self.onChange = onChange
        self.onAnalytics = onAnalytics
    }

    public var body: some View {
        EmptyView()
    }
}
