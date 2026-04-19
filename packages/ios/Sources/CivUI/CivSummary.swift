// CivUI — CivSummary for SwiftUI
// Accessible read-only review/summary page following government design system patterns.
// Renders: heading → sections with edit buttons → key-value pairs (Section 508 compliant)

import SwiftUI

/// Data model for a single summary item (key-value pair).
public struct SummaryItemData: Identifiable {
    public let id = UUID()

    /// Label (e.g., "First name").
    public let label: String

    /// Value to display. Empty or nil values render as "Not provided".
    public var value: SummaryItemValue

    /// Create a summary item with a single string value.
    public init(label: String, value: String?) {
        self.label = label
        if let value, !value.isEmpty {
            self.value = .single(value)
        } else {
            self.value = .notProvided
        }
    }

    /// Create a summary item with multiple string values.
    public init(label: String, values: [String]) {
        self.label = label
        self.value = values.isEmpty ? .notProvided : .multiple(values)
    }
}

/// Value type for summary items — single string, array of strings, or not provided.
public enum SummaryItemValue {
    case single(String)
    case multiple([String])
    case notProvided
}

/// Data model for a summary section (heading + items + optional edit link).
public struct SummarySectionData: Identifiable {
    public let id = UUID()

    /// Section heading (e.g., "Personal information").
    public let heading: String

    /// Optional href or step ID for the edit link.
    public var editHref: String?

    /// Key-value pairs to display.
    public var items: [SummaryItemData]

    public init(heading: String, editHref: String? = nil, items: [SummaryItemData]) {
        self.heading = heading
        self.editHref = editHref
        self.items = items
    }
}

/// Accessible read-only review page for government applications.
///
/// Displays form data before final submission as structured sections
/// with headings, edit links, and key-value pairs. Mirrors the web
/// `civ-summary` component.
///
/// VoiceOver reads section headings as headers and edit buttons with
/// contextual labels (e.g., "Edit Personal information").
///
/// Usage:
/// ```swift
/// CivSummary(
///     heading: "Review your information",
///     sections: [
///         SummarySectionData(
///             heading: "Personal information",
///             editHref: "#step-1",
///             items: [
///                 SummaryItemData(label: "First name", value: "Jane"),
///                 SummaryItemData(label: "Last name", value: "Doe"),
///             ]
///         ),
///     ],
///     onEdit: { section, href in navigateTo(href) }
/// )
/// ```
public struct CivSummary: View {
    // MARK: - Properties

    /// Main heading for the summary page.
    public let heading: String

    /// Sections to display.
    public var sections: [SummarySectionData]

    /// Called when an edit button is tapped (parallels `civ-summary-edit` event).
    /// Parameters: section heading, edit href.
    public var onEdit: ((String, String) -> Void)?

    /// Called for analytics tracking (parallels `civ-analytics` event).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    // MARK: - Internal State

    @Environment(\.colorScheme) private var colorScheme

    // MARK: - Initializer

    public init(
        heading: String = "",
        sections: [SummarySectionData] = [],
        onEdit: ((String, String) -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil
    ) {
        self.heading = heading
        self.sections = sections
        self.onEdit = onEdit
        self.onAnalytics = onAnalytics
    }

    // MARK: - Body

    public var body: some View {
        VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {
            // 1. Heading
            if !heading.isEmpty {
                Text(heading)
                    .font(.system(size: CivTokens.Typography.FontSize._2xl,
                                  weight: CivTokens.Typography.FontWeight.bold))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Base.darkest,
                        dark: CivTokens.DarkColors.Base.darkest
                    ))
                    .padding(.bottom, CivTokens.Spacing._6)
                    .accessibilityAddTraits(.isHeader)
            }

            // 2. Sections
            ForEach(sections) { section in
                sectionView(section)
            }
        }
        .accessibilityElement(children: .contain)
        .accessibilityLabel(heading.isEmpty ? "Summary" : heading)
    }

    // MARK: - Subviews

    private func sectionView(_ section: SummarySectionData) -> some View {
        VStack(alignment: .leading, spacing: CivTokens.Spacing._3) {
            // Section header row with heading and edit button
            HStack {
                Text(section.heading)
                    .font(.system(size: CivTokens.Typography.FontSize.lg,
                                  weight: CivTokens.Typography.FontWeight.semibold))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Base.darkest,
                        dark: CivTokens.DarkColors.Base.darkest
                    ))
                    .accessibilityAddTraits(.isHeader)

                Spacer()

                if let editHref = section.editHref, !editHref.isEmpty {
                    Button(action: {
                        onEdit?(section.heading, editHref)
                        onAnalytics?("click", ["section": section.heading])
                    }) {
                        Text("Edit")
                            .font(.system(size: CivTokens.Typography.FontSize.sm,
                                          weight: CivTokens.Typography.FontWeight.semibold))
                            .foregroundColor(adaptiveColor(
                                light: CivTokens.Colors.Primary.default_,
                                dark: CivTokens.DarkColors.Primary.default_
                            ))
                    }
                    .accessibilityLabel("Edit \(section.heading)")
                }
            }

            // Key-value items
            ForEach(section.items) { item in
                itemView(item)
            }

            // Section divider
            Divider()
                .background(adaptiveColor(
                    light: CivTokens.Colors.Base.lighter,
                    dark: CivTokens.DarkColors.Base.lighter
                ))
        }
        .padding(.bottom, CivTokens.Spacing._4)
    }

    private func itemView(_ item: SummaryItemData) -> some View {
        HStack(alignment: .top, spacing: CivTokens.Spacing._4) {
            // Label
            Text(item.label)
                .font(.system(size: CivTokens.Typography.FontSize.base,
                              weight: CivTokens.Typography.FontWeight.semibold))
                .foregroundColor(adaptiveColor(
                    light: CivTokens.Colors.Base.dark,
                    dark: CivTokens.DarkColors.Base.dark
                ))
                .frame(minWidth: 120, alignment: .leading)

            // Value
            VStack(alignment: .leading, spacing: CivTokens.Spacing._0_5) {
                switch item.value {
                case .single(let text):
                    Text(text)
                        .font(.system(size: CivTokens.Typography.FontSize.base))
                        .foregroundColor(adaptiveColor(
                            light: CivTokens.Colors.Base.darkest,
                            dark: CivTokens.DarkColors.Base.darkest
                        ))
                case .multiple(let values):
                    ForEach(values, id: \.self) { val in
                        Text(val)
                            .font(.system(size: CivTokens.Typography.FontSize.base))
                            .foregroundColor(adaptiveColor(
                                light: CivTokens.Colors.Base.darkest,
                                dark: CivTokens.DarkColors.Base.darkest
                            ))
                    }
                case .notProvided:
                    Text("Not provided")
                        .font(.system(size: CivTokens.Typography.FontSize.base))
                        .italic()
                        .foregroundColor(adaptiveColor(
                            light: CivTokens.Colors.Base.default_,
                            dark: CivTokens.DarkColors.Base.default_
                        ))
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(.vertical, CivTokens.Spacing._2)
    }

    // MARK: - Color Helper

    private func adaptiveColor(light: Color, dark: Color) -> Color {
        colorScheme == .dark ? dark : light
    }
}

// MARK: - Preview

#if DEBUG
struct CivSummary_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        var body: some View {
            ScrollView {
                CivSummary(
                    heading: "Review your information",
                    sections: [
                        SummarySectionData(
                            heading: "Personal information",
                            editHref: "#step-1",
                            items: [
                                SummaryItemData(label: "First name", value: "Jane"),
                                SummaryItemData(label: "Last name", value: "Doe"),
                                SummaryItemData(label: "Date of birth", value: "January 15, 1990"),
                                SummaryItemData(label: "Middle name", value: nil),
                            ]
                        ),
                        SummarySectionData(
                            heading: "Contact information",
                            editHref: "#step-2",
                            items: [
                                SummaryItemData(label: "Email", value: "jane.doe@example.gov"),
                                SummaryItemData(label: "Phone", value: "(555) 123-4567"),
                                SummaryItemData(label: "Preferred contact", values: ["Email", "Phone"]),
                            ]
                        ),
                        SummarySectionData(
                            heading: "Address",
                            editHref: "#step-3",
                            items: [
                                SummaryItemData(label: "Street", value: "1600 Pennsylvania Ave NW"),
                                SummaryItemData(label: "City", value: "Washington"),
                                SummaryItemData(label: "State", value: "DC"),
                                SummaryItemData(label: "ZIP code", value: "20500"),
                            ]
                        ),
                        SummarySectionData(
                            heading: "No edit link section",
                            items: [
                                SummaryItemData(label: "Status", value: "Pending"),
                                SummaryItemData(label: "Notes", value: nil),
                            ]
                        ),
                    ],
                    onEdit: { section, href in
                        print("Edit tapped: \(section) -> \(href)")
                    }
                )
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
