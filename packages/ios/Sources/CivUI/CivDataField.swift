// CivUI — CivDataField for SwiftUI
// Read-only label + value display for verified data.

import SwiftUI

public struct CivDataField: View {
    public let label: String
    public var value: String
    public var hint: String?
    public var values: String
    public var editHref: String
    public var editLabel: String
    public var spacing: String

    @Environment(\.colorScheme) private var colorScheme

    public init(
        label: String,
        value: String = "",
        hint: String? = nil,
        values: String = "",
        editHref: String = "",
        editLabel: String = "",
        spacing: String = "default"
    ) {
        self.label = label
        self.value = value
        self.hint = hint
        self.values = values
        self.editHref = editHref
        self.editLabel = editLabel
        self.spacing = spacing
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: CivTokens.Spacing._0_5) {
            Text(label)
                .font(.system(size: CivTokens.Typography.FontSize.sm))
                .foregroundColor(colorScheme == .dark ? CivTokens.DarkColors.Base.dark : CivTokens.Colors.Base.dark)

            if value.isEmpty {
                Text("Not provided")
                    .font(.system(size: CivTokens.Typography.FontSize.base))
                    .italic()
                    .foregroundColor(colorScheme == .dark ? CivTokens.DarkColors.Base.default_ : CivTokens.Colors.Base.default_)
            } else {
                Text(value)
                    .font(.system(size: CivTokens.Typography.FontSize.base, weight: CivTokens.Typography.FontWeight.medium))
                    .foregroundColor(colorScheme == .dark ? CivTokens.DarkColors.Base.darkest : CivTokens.Colors.Base.darkest)
            }

            if let hint, !hint.isEmpty {
                Text(hint)
                    .font(.system(size: CivTokens.Typography.FontSize.sm))
                    .foregroundColor(colorScheme == .dark ? CivTokens.DarkColors.Base.dark : CivTokens.Colors.Base.dark)
            }
        }
        .padding(.vertical, CivTokens.Spacing._2)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(label): \(value.isEmpty ? "Not provided" : value)")
    }
}

#if DEBUG
struct CivDataField_Previews: PreviewProvider {
    static var previews: some View {
        VStack(alignment: .leading, spacing: 0) {
            CivDataField(label: "Full name", value: "Jane Doe")
            CivDataField(label: "SSN", value: "●●●-●●-6789", hint: "Last 4 digits shown")
            CivDataField(label: "Phone number")
        }.padding()
    }
}
#endif
