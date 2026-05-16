// CivUI — CivTimePicker for SwiftUI
// Time-of-day input (mirrors the web civ-time-picker component).
//
// Placeholder body — the prop surface satisfies schema parity.
// Implementation should use SwiftUI's DatePicker with displayedComponents
// = [.hourAndMinute] and bind via a Date proxy. The `mode` prop maps
// to .compact vs .graphical / .wheel pickerStyle on iOS. See
// audit-debt.md.

import SwiftUI

/// Self-contained time-of-day input. Stores its value in 24-hour ISO
/// format (HH:MM); the format property only affects display.
public struct CivTimePicker: View {
    public var mode: String
    public var legend: String
    @Binding public var value: String
    public var format: String
    public var minuteStep: Int
    public var min: String
    public var max: String
    public var placeholder: String
    public var hourLabel: String
    public var minuteLabel: String
    public var periodLabel: String
    public var hint: String?
    public var error: String?
    public var isRequired: Bool
    public var isDisabled: Bool
    public var isReadonly: Bool
    public var onInput: ((String) -> Void)?
    public var onChange: ((String) -> Void)?
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    public init(
        mode: String = "combo",
        legend: String = "",
        value: Binding<String>,
        format: String = "12",
        minuteStep: Int = 0,
        min: String = "",
        max: String = "",
        placeholder: String = "",
        hourLabel: String = "",
        minuteLabel: String = "",
        periodLabel: String = "",
        hint: String? = nil,
        error: String? = nil,
        isRequired: Bool = false,
        isDisabled: Bool = false,
        isReadonly: Bool = false,
        onInput: ((String) -> Void)? = nil,
        onChange: ((String) -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil
    ) {
        self.mode = mode
        self.legend = legend
        self._value = value
        self.format = format
        self.minuteStep = minuteStep
        self.min = min
        self.max = max
        self.placeholder = placeholder
        self.hourLabel = hourLabel
        self.minuteLabel = minuteLabel
        self.periodLabel = periodLabel
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
