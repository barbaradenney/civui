// CivUI — CivReadOnlyField for SwiftUI
// Read-only label + value display for verified data.

import SwiftUI

public struct CivReadOnlyField: View {
    public let label: String
    public var value: String
    public var hint: String?

    @Environment(\.colorScheme) private var colorScheme

    public init(label: String, value: String = "", hint: String? = nil) {
        self.label = label
        self.value = value
        self.hint = hint
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
struct CivReadOnlyField_Previews: PreviewProvider {
    static var previews: some View {
        VStack(alignment: .leading, spacing: 0) {
            CivReadOnlyField(label: "Full name", value: "Jane Doe")
            CivReadOnlyField(label: "SSN", value: "●●●-●●-6789", hint: "Last 4 digits shown")
            CivReadOnlyField(label: "Phone number")
        }.padding()
    }
}
#endif
