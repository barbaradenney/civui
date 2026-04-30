// CivUI — CivFormStep for SwiftUI
// Multi-step wizard for navigating within a form chapter.

import SwiftUI

public struct CivFormStep<Content: View>: View {
    @Binding public var current: Int
    public let total: Int
    public var showProgress: Bool
    public var backLabel: String?
    public var continueLabel: String?
    public var completeLabel: String?
    public var onStepChange: ((Int) -> Void)?
    public var onComplete: (() -> Void)?
    public var persist: Bool
    public var validate: Bool
    public var sensitive: Bool
    public var showPause: Bool
    public var pauseLabel: String
    @ViewBuilder public var content: (Int) -> Content

    @Environment(\.colorScheme) private var colorScheme

    public init(
        current: Binding<Int>,
        total: Int,
        showProgress: Bool = true,
        backLabel: String? = nil,
        continueLabel: String? = nil,
        completeLabel: String? = nil,
        onStepChange: ((Int) -> Void)? = nil,
        onComplete: (() -> Void)? = nil,
        persist: Bool = false,
        validate: Bool = true,
        sensitive: Bool = false,
        showPause: Bool = false,
        pauseLabel: String = "",
        @ViewBuilder content: @escaping (Int) -> Content
    ) {
        self._current = current
        self.total = total
        self.showProgress = showProgress
        self.backLabel = backLabel
        self.continueLabel = continueLabel
        self.completeLabel = completeLabel
        self.onStepChange = onStepChange
        self.onComplete = onComplete
        self.persist = persist
        self.validate = validate
        self.sensitive = sensitive
        self.showPause = showPause
        self.pauseLabel = pauseLabel
        self.content = content
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: CivTokens.Spacing._4) {
            if showProgress && total > 1 {
                Text("Step \(current + 1) of \(total)")
                    .font(.system(size: CivTokens.Typography.FontSize.sm))
                    .foregroundColor(colorScheme == .dark ? CivTokens.DarkColors.Base.dark : CivTokens.Colors.Base.dark)
                    .accessibilityLabel("Step \(current + 1) of \(total)")
            }

            content(current)

            HStack {
                if current > 0 {
                    Button(backLabel ?? "Back") {
                        current -= 1
                        onStepChange?(current)
                    }
                    .font(.system(size: CivTokens.Typography.FontSize.base, weight: CivTokens.Typography.FontWeight.semibold))
                }
                Spacer()
                Button(current >= total - 1 ? (completeLabel ?? "Save and continue") : (continueLabel ?? "Continue")) {
                    if current >= total - 1 {
                        onComplete?()
                    } else {
                        current += 1
                        onStepChange?(current)
                    }
                }
                .font(.system(size: CivTokens.Typography.FontSize.base, weight: CivTokens.Typography.FontWeight.semibold))
                .foregroundColor(colorScheme == .dark ? CivTokens.DarkColors.White.default_ : CivTokens.Colors.White.default_)
                .padding(.horizontal, CivTokens.Spacing._6)
                .padding(.vertical, CivTokens.Spacing._2_5)
                .background(colorScheme == .dark ? CivTokens.DarkColors.Primary.default_ : CivTokens.Colors.Primary.default_)
                .cornerRadius(CivTokens.Border.Radius.default_)
            }
        }
    }
}

#if DEBUG
struct CivFormStep_Previews: PreviewProvider {
    struct Wrapper: View {
        @State var step = 0
        var body: some View {
            CivFormStep(current: $step, total: 3) { i in
                Text("Step \(i + 1) content").padding()
            }
            .padding()
        }
    }
    static var previews: some View { Wrapper() }
}
#endif
