// CivUI — CivRepeater for SwiftUI
// Accessible add-another repeater pattern following government design system patterns.
// Renders: legend → hint → error → rows → add button (Section 508 compliant)

import SwiftUI

/// Accessible repeating form section for government applications.
///
/// Renders a dynamic list of form sections with add/remove controls.
/// Each row is labeled for VoiceOver as "{itemLabel} {index}".
/// Mirrors the web `civ-repeater` component.
///
/// VoiceOver announces when items are added or removed.
///
/// Usage:
/// ```swift
/// CivRepeater(
///     legend: "Dependents",
///     itemLabel: "dependent",
///     rowCount: $count,
///     hint: "Add all household members",
///     min: 1,
///     max: 10
/// ) { index in
///     CivTextInput(label: "First name", value: $names[index])
///     CivTextInput(label: "Last name", value: $lastNames[index])
/// }
/// ```
public struct CivRepeater<Content: View>: View {
    // MARK: - Properties

    /// Legend text displayed above the repeater rows.
    public let legend: String

    /// Base name for indexed form fields (matches web `name` attribute).
    public var name: String

    /// Human-readable label for each item (used in button text and announcements).
    public var itemLabel: String

    /// Bound row count. Controls how many rows are rendered.
    @Binding public var rowCount: Int

    /// Help text shown below the legend.
    public var hint: String?

    /// Error message. When set, renders with VoiceOver announcement.
    public var error: String?

    /// Whether at least one row is required.
    public var isRequired: Bool

    /// Whether the component is disabled.
    public var isDisabled: Bool

    /// Minimum number of rows. Defaults to 1.
    public var min: Int

    /// Maximum number of rows. 0 = unlimited.
    public var max: Int

    /// Called when a row is added (parallels `civ-repeater-add` event).
    public var onAdd: ((Int) -> Void)?

    /// Called when a row is removed (parallels `civ-repeater-remove` event).
    public var onRemove: ((Int) -> Void)?

    /// Called for analytics tracking (parallels `civ-analytics` event).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    /// Repeater mode: "inline" or "form-steps".
    public var mode: String

    /// Heading level for the legend (1–6).
    public var headingLevel: Int

    /// Visual size of the legend.
    public var size: String

    /// Whether form-steps mode content is sensitive.
    public var formStepsSensitive: Bool

    /// Whether to show a pause button in form-steps mode.
    public var formStepsShowPause: Bool

    /// Content builder that receives the row index.
    @ViewBuilder public var content: (Int) -> Content

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        legend: String,
        name: String = "",
        itemLabel: String = "item",
        rowCount: Binding<Int>,
        hint: String? = nil,
        error: String? = nil,
        isRequired: Bool = false,
        isDisabled: Bool = false,
        min: Int = 1,
        max: Int = 0,
        onAdd: ((Int) -> Void)? = nil,
        onRemove: ((Int) -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil,
        mode: String = "inline",
        headingLevel: Int = 2,
        size: String = "sm",
        formStepsSensitive: Bool = false,
        formStepsShowPause: Bool = false,
        @ViewBuilder content: @escaping (Int) -> Content
    ) {
        self.legend = legend
        self.name = name
        self.itemLabel = itemLabel
        self._rowCount = rowCount
        self.hint = hint
        self.error = error
        self.isRequired = isRequired
        self.isDisabled = isDisabled
        self.min = min
        self.max = max
        self.onAdd = onAdd
        self.onRemove = onRemove
        self.onAnalytics = onAnalytics
        self.mode = mode
        self.headingLevel = headingLevel
        self.size = size
        self.formStepsSensitive = formStepsSensitive
        self.formStepsShowPause = formStepsShowPause
        self.content = content
    }

    // MARK: - Computed

    private var canAdd: Bool {
        !isDisabled && (max == 0 || rowCount < max)
    }

    private var canRemove: Bool {
        !isDisabled && rowCount > min
    }

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
            }

            // 4. Repeater rows
            ForEach(0..<rowCount, id: \.self) { index in
                rowView(index: index)
            }

            // 5. Add button
            if canAdd {
                Button(action: { addRow() }) {
                    HStack(spacing: CivTokens.Spacing._1) {
                        Image(systemName: "plus.circle")
                        Text("Add another \(itemLabel)")
                    }
                    .font(.system(size: CivTokens.Typography.FontSize.base,
                                  weight: CivTokens.Typography.FontWeight.semibold))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Primary.default_,
                        dark: CivTokens.DarkColors.Primary.default_
                    ))
                }
                .padding(.top, CivTokens.Spacing._3)
                .accessibilityLabel("Add another \(itemLabel)")
                .disabled(isDisabled)
            }
        }
        .padding(.bottom, CivTokens.Spacing._4)
        .disabled(isDisabled)
        .opacity(isDisabled ? 0.5 : 1.0)
        .accessibilityElement(children: .contain)
        .onChange(of: error) { newError in
            if let newError, !newError.isEmpty {
                UIAccessibility.post(notification: .announcement, argument: newError)
            }
        }
    }

    // MARK: - Subviews

    private var legendView: some View {
        HStack(spacing: CivTokens.Spacing._0_5) {
            Text(legend)
                .font(.system(size: CivTokens.Typography.FontSize.lg,
                              weight: CivTokens.Typography.FontWeight.bold))
                .foregroundColor(adaptiveColor(
                    light: CivTokens.Colors.Base.darkest,
                    dark: CivTokens.DarkColors.Base.darkest
                ))

            if isRequired {
                Text("*")
                    .font(.system(size: CivTokens.Typography.FontSize.lg,
                                  weight: CivTokens.Typography.FontWeight.bold))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Error.default_,
                        dark: CivTokens.DarkColors.Error.default_
                    ))
                    .accessibilityLabel("required")
            }
        }
    }

    private func rowView(index: Int) -> some View {
        VStack(alignment: .leading, spacing: CivTokens.Spacing._2) {
            content(index)

            if canRemove {
                Button(action: { removeRow(at: index) }) {
                    HStack(spacing: CivTokens.Spacing._1) {
                        Image(systemName: "minus.circle")
                        Text("Remove")
                    }
                    .font(.system(size: CivTokens.Typography.FontSize.sm))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Error.default_,
                        dark: CivTokens.DarkColors.Error.default_
                    ))
                }
                .accessibilityLabel("Remove \(itemLabel) \(index + 1)")
                .padding(.top, CivTokens.Spacing._1)
            }
        }
        .padding(CivTokens.Spacing._4)
        .background(adaptiveColor(
            light: CivTokens.Colors.White.default_,
            dark: CivTokens.DarkColors.White.default_
        ))
        .overlay(
            RoundedRectangle(cornerRadius: 0)
                .stroke(
                    adaptiveColor(
                        light: CivTokens.Colors.Base.lighter,
                        dark: CivTokens.DarkColors.Base.lighter
                    ),
                    lineWidth: CivTokens.Border.Width.default_
                )
        )
        .accessibilityElement(children: .contain)
        .accessibilityLabel("\(itemLabel) \(index + 1)")
        .padding(.bottom, CivTokens.Spacing._2)
    }

    // MARK: - Actions

    private func addRow() {
        let index = rowCount
        rowCount += 1
        onAdd?(index)
        onAnalytics?("repeater-add", ["index": index])
        UIAccessibility.post(notification: .announcement,
                             argument: "\(itemLabel) \(index + 1) added")
    }

    private func removeRow(at index: Int) {
        guard rowCount > min else { return }
        rowCount -= 1
        onRemove?(index)
        onAnalytics?("repeater-remove", ["index": index])
        UIAccessibility.post(notification: .announcement,
                             argument: "\(itemLabel) \(index + 1) removed")
    }

    // MARK: - Color Helper

    private func adaptiveColor(light: Color, dark: Color) -> Color {
        colorScheme == .dark ? dark : light
    }
}

// MARK: - Preview

#if DEBUG
struct CivRepeater_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var count = 1
        @State private var names = ["", "", "", "", ""]

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    CivRepeater(
                        legend: "Dependents",
                        itemLabel: "dependent",
                        rowCount: $count,
                        hint: "Add all household members",
                        isRequired: true,
                        min: 1,
                        max: 5
                    ) { index in
                        TextField("Name", text: $names[index])
                            .textFieldStyle(.roundedBorder)
                    }

                    CivRepeater(
                        legend: "Disabled repeater",
                        itemLabel: "entry",
                        rowCount: .constant(2),
                        isDisabled: true
                    ) { _ in
                        Text("Disabled row content")
                    }

                    CivRepeater(
                        legend: "With error",
                        itemLabel: "reference",
                        rowCount: $count,
                        error: "At least one reference is required",
                        isRequired: true,
                        min: 1,
                        max: 3
                    ) { index in
                        TextField("Reference name", text: $names[index])
                            .textFieldStyle(.roundedBorder)
                    }
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
