// CivUI — CivMemorableDate for SwiftUI
// Accessible memorable date input following government design system patterns.
// Renders: legend → hint → error → [month / day / year fields] (Section 508 compliant)

import SwiftUI

/// Three-field date input for known dates (birthdays, document dates).
///
/// Provides separate month, day, and year fields matching the web
/// component's civ-memorable-date. Assembles into YYYY-MM-DD format.
///
/// Usage:
/// ```swift
/// CivMemorableDate(
///     legend: "Date of birth",
///     value: $dateOfBirth,
///     hint: "For example: January 15 1990"
/// )
/// ```
public struct CivMemorableDate: View {
    // MARK: - Properties

    /// Legend text for the fieldset.
    public let legend: String

    /// Bound date value as ISO string (YYYY-MM-DD).
    @Binding public var value: String

    /// Help text shown below the legend.
    public var hint: String?

    /// Error message.
    public var error: String?

    /// Whether the date is required.
    public var isRequired: Bool

    /// Whether the fields are disabled.
    public var isDisabled: Bool

    /// Custom label for the month field.
    public var monthLabel: String

    /// Custom label for the day field.
    public var dayLabel: String

    /// Custom label for the year field.
    public var yearLabel: String

    /// Called when the date changes.
    public var onChange: ((String) -> Void)?

    // MARK: - Internal State

    @State private var month = ""
    @State private var day = ""
    @State private var year = ""
    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        legend: String,
        value: Binding<String>,
        hint: String? = nil,
        error: String? = nil,
        isRequired: Bool = false,
        isDisabled: Bool = false,
        monthLabel: String = "Month",
        dayLabel: String = "Day",
        yearLabel: String = "Year",
        onChange: ((String) -> Void)? = nil
    ) {
        self.legend = legend
        self._value = value
        self.hint = hint
        self.error = error
        self.isRequired = isRequired
        self.isDisabled = isDisabled
        self.monthLabel = monthLabel
        self.dayLabel = dayLabel
        self.yearLabel = yearLabel
        self.onChange = onChange
    }

    // MARK: - Month Options

    private static let monthNames: [(value: String, label: String)] = {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US")
        return (1...12).map { i in
            (value: String(format: "%02d", i), label: formatter.monthSymbols[i - 1])
        }
    }()

    // MARK: - Body

    public var body: some View {
        VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {
            // 1. Legend
            legendView

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
                    .accessibilityAddTraits(.updatesFrequently)
            }

            // 4. Date fields
            HStack(alignment: .top, spacing: CivTokens.Spacing._4) {
                // Month picker
                VStack(alignment: .leading, spacing: CivTokens.Spacing._0_5) {
                    Text(monthLabel)
                        .font(.system(size: CivTokens.Typography.FontSize.sm,
                                      weight: CivTokens.Typography.FontWeight.bold))
                        .foregroundColor(adaptiveColor(
                            light: CivTokens.Colors.Base.darkest,
                            dark: CivTokens.DarkColors.Base.darkest
                        ))

                    Picker(monthLabel, selection: $month) {
                        Text("- Select -").tag("")
                        ForEach(Self.monthNames, id: \.value) { option in
                            Text(option.label).tag(option.value)
                        }
                    }
                    .pickerStyle(.menu)
                    .tint(adaptiveColor(
                        light: CivTokens.Colors.Base.darkest,
                        dark: CivTokens.DarkColors.Base.darkest
                    ))
                    .padding(.horizontal, CivTokens.Spacing._2)
                    .padding(.vertical, CivTokens.Spacing._1)
                    .background(adaptiveColor(
                        light: CivTokens.Colors.White.default_,
                        dark: CivTokens.DarkColors.White.default_
                    ))
                    .cornerRadius(CivTokens.Border.Radius.default_)
                    .overlay(fieldBorder)
                    .disabled(isDisabled)
                    .accessibilityLabel(monthLabel)
                }
                .frame(minWidth: 120)

                // Day field
                VStack(alignment: .leading, spacing: CivTokens.Spacing._0_5) {
                    Text(dayLabel)
                        .font(.system(size: CivTokens.Typography.FontSize.sm,
                                      weight: CivTokens.Typography.FontWeight.bold))
                        .foregroundColor(adaptiveColor(
                            light: CivTokens.Colors.Base.darkest,
                            dark: CivTokens.DarkColors.Base.darkest
                        ))

                    TextField("DD", text: $day)
                        .textFieldStyle(.plain)
                        .keyboardType(.numberPad)
                        .font(.system(size: CivTokens.Typography.FontSize.base))
                        .padding(.horizontal, CivTokens.Spacing._2)
                        .padding(.vertical, CivTokens.Spacing._1_5)
                        .background(adaptiveColor(
                            light: CivTokens.Colors.White.default_,
                            dark: CivTokens.DarkColors.White.default_
                        ))
                        .cornerRadius(CivTokens.Border.Radius.default_)
                        .overlay(fieldBorder)
                        .disabled(isDisabled)
                        .accessibilityLabel(dayLabel)
                        .onChange(of: day) { _ in limitDay(); assembleDate() }
                }
                .frame(width: 64)

                // Year field
                VStack(alignment: .leading, spacing: CivTokens.Spacing._0_5) {
                    Text(yearLabel)
                        .font(.system(size: CivTokens.Typography.FontSize.sm,
                                      weight: CivTokens.Typography.FontWeight.bold))
                        .foregroundColor(adaptiveColor(
                            light: CivTokens.Colors.Base.darkest,
                            dark: CivTokens.DarkColors.Base.darkest
                        ))

                    TextField("YYYY", text: $year)
                        .textFieldStyle(.plain)
                        .keyboardType(.numberPad)
                        .font(.system(size: CivTokens.Typography.FontSize.base))
                        .padding(.horizontal, CivTokens.Spacing._2)
                        .padding(.vertical, CivTokens.Spacing._1_5)
                        .background(adaptiveColor(
                            light: CivTokens.Colors.White.default_,
                            dark: CivTokens.DarkColors.White.default_
                        ))
                        .cornerRadius(CivTokens.Border.Radius.default_)
                        .overlay(fieldBorder)
                        .disabled(isDisabled)
                        .accessibilityLabel(yearLabel)
                        .onChange(of: year) { _ in limitYear(); assembleDate() }
                }
                .frame(width: 80)
            }
            .onChange(of: month) { _ in assembleDate() }
        }
        .padding(.bottom, CivTokens.Spacing._4)
        .opacity(isDisabled ? 0.5 : 1.0)
        .onAppear { parseValue() }
        .onChange(of: value) { _ in parseValue() }
        .accessibilityElement(children: .contain)
    }

    // MARK: - Subviews

    private var legendView: some View {
        HStack(spacing: CivTokens.Spacing._0_5) {
            Text(legend)
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

    private var fieldBorder: some View {
        RoundedRectangle(cornerRadius: CivTokens.Border.Radius.default_)
            .stroke(
                error != nil
                    ? adaptiveColor(light: CivTokens.Colors.Error.default_, dark: CivTokens.DarkColors.Error.default_)
                    : adaptiveColor(light: CivTokens.Colors.Base.light, dark: CivTokens.DarkColors.Base.light),
                lineWidth: error != nil ? CivTokens.Border.Width._2 : CivTokens.Border.Width.default_
            )
    }

    // MARK: - Value Assembly

    private func parseValue() {
        guard !value.isEmpty else {
            month = ""
            day = ""
            year = ""
            return
        }
        let parts = value.split(separator: "-")
        guard parts.count == 3 else { return }
        year = String(parts[0])
        month = String(parts[1])
        day = String(parts[2])
    }

    private func limitDay() {
        day = String(day.filter { $0.isNumber }.prefix(2))
    }

    private func limitYear() {
        year = String(year.filter { $0.isNumber }.prefix(4))
    }

    private func assembleDate() {
        guard !month.isEmpty, !day.isEmpty, year.count == 4 else {
            if !value.isEmpty {
                value = ""
                onChange?("")
            }
            return
        }
        let assembled = "\(year.padding(toLength: 4, withPad: "0", startingAt: 0))-\(month.padding(toLength: 2, withPad: "0", startingAt: 0))-\(day.padding(toLength: 2, withPad: "0", startingAt: 0))"

        // Validate the date is real
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.locale = Locale(identifier: "en_US_POSIX")
        guard formatter.date(from: assembled) != nil else {
            value = ""
            onChange?("")
            return
        }

        value = assembled
        onChange?(assembled)
    }

    // MARK: - Color Helper

    private func adaptiveColor(light: Color, dark: Color) -> Color {
        colorScheme == .dark ? dark : light
    }
}

// MARK: - Preview

#if DEBUG
struct CivMemorableDate_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var dob = ""
        @State private var docDate = "1990-06-15"

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    CivMemorableDate(
                        legend: "Date of birth",
                        value: $dob,
                        hint: "For example: January 15 1990",
                        isRequired: true
                    )

                    CivMemorableDate(
                        legend: "Document date",
                        value: $docDate
                    )

                    CivMemorableDate(
                        legend: "Disabled date",
                        value: .constant(""),
                        isDisabled: true
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
