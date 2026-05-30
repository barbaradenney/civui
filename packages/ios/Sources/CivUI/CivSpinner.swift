// CivUI — CivSpinner for SwiftUI
// Loading indicator. Mirrors civ-spinner.
//
// Placeholder body — see .claude/rules/audit-debt.md → "Native platform implementation pass".

import SwiftUI

public struct CivSpinner: View {
    /// Pixel size. `sm` | `md` | `lg`.
    public var size: String

    /// Accessible label announced while loading.
    public var label: String

    /// Delay (ms) before the spinner appears, to avoid flashing on fast responses.
    public var delay: Int

    /// Minimum visible duration (ms) once shown.
    public var minDuration: Int

    /// Treat as decorative — skip assistive announcement.
    public var decorative: Bool

    public init(
        size: String = "md",
        label: String = "Loading",
        delay: Int = 200,
        minDuration: Int = 400,
        decorative: Bool = false
    ) {
        self.size = size
        self.label = label
        self.delay = delay
        self.minDuration = minDuration
        self.decorative = decorative
    }

    public var body: some View {
        EmptyView()
    }
}
