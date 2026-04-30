// CivUI — CivTaskList for SwiftUI
// Task list hub for multi-chapter form navigation.
// Renders: task groups with status-tagged tasks (Section 508 compliant)

import SwiftUI

/// Task status matching the web `TaskStatus` type.
public enum CivTaskStatus: String {
    case notStarted = "not-started"
    case inProgress = "in-progress"
    case complete
    case cannotStart = "cannot-start"
    case error

    public var label: String {
        switch self {
        case .notStarted: return "Not started"
        case .inProgress: return "In progress"
        case .complete: return "Complete"
        case .cannotStart: return "Cannot start yet"
        case .error: return "There is a problem"
        }
    }
}

/// Container for task groups in a multi-chapter form hub.
public struct CivTaskList<Content: View>: View {
    @ViewBuilder public var content: () -> Content

    public init(@ViewBuilder content: @escaping () -> Content) {
        self.content = content
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            content()
        }
        .accessibilityElement(children: .contain)
    }
}

/// A labeled group of tasks within a task list.
public struct CivTaskGroup<Content: View>: View {
    public let heading: String
    @ViewBuilder public var content: () -> Content
    @Environment(\.colorScheme) private var colorScheme

    public init(heading: String, @ViewBuilder content: @escaping () -> Content) {
        self.heading = heading
        self.content = content
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            if !heading.isEmpty {
                Text(heading)
                    .font(.system(size: CivTokens.Typography.FontSize.lg,
                                  weight: CivTokens.Typography.FontWeight.semibold))
                    .foregroundColor(colorScheme == .dark
                        ? CivTokens.DarkColors.Base.darkest
                        : CivTokens.Colors.Base.darkest)
                    .padding(.bottom, CivTokens.Spacing._3)
            }
            VStack(alignment: .leading, spacing: 0) {
                content()
            }
        }
        .padding(.bottom, CivTokens.Spacing._6)
    }
}

/// An individual task with label, status tag, and optional hint.
public struct CivTask: View {
    public let label: String
    public var status: CivTaskStatus
    public var hint: String?
    public var onTap: (() -> Void)?

    /// Navigation URL for the task.
    public var href: String

    /// Whether the task has been prefilled with data.
    public var prefilled: Bool

    @Environment(\.colorScheme) private var colorScheme

    public init(label: String, status: CivTaskStatus = .notStarted, hint: String? = nil, onTap: (() -> Void)? = nil, href: String = "", prefilled: Bool = false) {
        self.label = label
        self.status = status
        self.hint = hint
        self.onTap = onTap
        self.href = href
        self.prefilled = prefilled
    }

    private var isNavigable: Bool { onTap != nil && status != .cannotStart }

    public var body: some View {
        VStack(spacing: 0) {
            Divider()
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: CivTokens.Spacing._0_5) {
                    if isNavigable {
                        Button(action: { onTap?() }) {
                            Text(label)
                                .font(.system(size: CivTokens.Typography.FontSize.base, weight: CivTokens.Typography.FontWeight.medium))
                                .foregroundColor(colorScheme == .dark ? CivTokens.DarkColors.Primary.default_ : CivTokens.Colors.Primary.default_)
                        }
                    } else {
                        Text(label)
                            .font(.system(size: CivTokens.Typography.FontSize.base, weight: CivTokens.Typography.FontWeight.medium))
                            .foregroundColor(status == .cannotStart
                                ? (colorScheme == .dark ? CivTokens.DarkColors.Base.default_ : CivTokens.Colors.Base.default_)
                                : (colorScheme == .dark ? CivTokens.DarkColors.Base.darkest : CivTokens.Colors.Base.darkest))
                    }
                    if let hint, !hint.isEmpty {
                        Text(hint)
                            .font(.system(size: CivTokens.Typography.FontSize.sm))
                            .foregroundColor(colorScheme == .dark ? CivTokens.DarkColors.Base.dark : CivTokens.Colors.Base.dark)
                    }
                }
                Spacer()
                statusView
            }
            .padding(.vertical, CivTokens.Spacing._3)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(label), \(status.label)")
    }

    @ViewBuilder private var statusView: some View {
        switch status {
        case .notStarted:
            tag(status.label, bg: CivTokens.Colors.Primary.lightest, fg: CivTokens.Colors.Primary.dark)
        case .inProgress:
            tag(status.label, bg: CivTokens.Colors.Info.lighter, fg: CivTokens.Colors.Info.dark)
        case .complete:
            Text(status.label).font(.system(size: CivTokens.Typography.FontSize.sm))
        case .cannotStart:
            Text(status.label).font(.system(size: CivTokens.Typography.FontSize.sm))
                .foregroundColor(colorScheme == .dark ? CivTokens.DarkColors.Base.default_ : CivTokens.Colors.Base.default_)
        case .error:
            tag(status.label, bg: CivTokens.Colors.Error.lighter, fg: CivTokens.Colors.Error.dark)
        }
    }

    private func tag(_ text: String, bg: Color, fg: Color) -> some View {
        Text(text)
            .font(.system(size: CivTokens.Typography.FontSize.xs, weight: CivTokens.Typography.FontWeight.bold))
            .foregroundColor(fg)
            .padding(.horizontal, CivTokens.Spacing._2)
            .padding(.vertical, CivTokens.Spacing._0_5)
            .background(bg)
            .cornerRadius(CivTokens.Border.Radius.default_)
    }
}

#if DEBUG
struct CivTaskList_Previews: PreviewProvider {
    static var previews: some View {
        ScrollView {
            VStack(alignment: .leading) {
                Text("Apply for disability compensation").font(.system(size: 24, weight: .bold)).padding(.bottom, 16)
                CivTaskList {
                    CivTaskGroup(heading: "Prepare") {
                        CivTask(label: "Check eligibility", status: .complete) { }
                    }
                    CivTaskGroup(heading: "Application") {
                        CivTask(label: "Personal info", status: .complete) { }
                        CivTask(label: "Contact info", status: .inProgress, hint: "Phone needed") { }
                        CivTask(label: "Service history", status: .notStarted) { }
                    }
                    CivTaskGroup(heading: "Submit") {
                        CivTask(label: "Review", status: .cannotStart, hint: "Complete all sections")
                    }
                }
            }.padding()
        }
    }
}
#endif
