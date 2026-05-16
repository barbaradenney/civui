// CivUI — CivFormAutosave for SwiftUI
// JS-only orchestration utility — no rendered UI.
//
// Web civ-form-autosave persists in-progress form answers to the browser's
// localStorage / sessionStorage / custom adapter so users can resume
// after a refresh. Native iOS apps typically wire equivalent persistence
// through UserDefaults / Keychain in app code (not in a reusable
// design-system component), so this struct only exists to satisfy the
// cross-platform parity contract. The body renders EmptyView() and the
// declared callbacks are placeholders matching the web event surface.

import SwiftUI

/// Drops inside a host form to persist in-progress answers.
public struct CivFormAutosave: View {
    /// Unique key identifying this form's saved snapshot.
    public var storageKey: String

    /// Built-in storage type: "local" (default), "session", or "custom".
    public var storage: String

    /// Save debounce in ms.
    public var debounceMs: Int

    /// Suppress the "Resumed from saved progress" SR announcement.
    public var silentResume: Bool

    /// Called after a snapshot is restored from the adapter
    /// (mirrors `civ-autosave-loaded`).
    public var onAutosaveLoaded: ((Int, [String: String]) -> Void)?

    /// Called after each successful save (mirrors `civ-autosave-saved`).
    public var onAutosaveSaved: ((Int) -> Void)?

    /// Called when the snapshot is cleared on submit or via `.clear()`
    /// (mirrors `civ-autosave-cleared`).
    public var onAutosaveCleared: (() -> Void)?

    public init(
        storageKey: String = "",
        storage: String = "local",
        debounceMs: Int = 1000,
        silentResume: Bool = false,
        onAutosaveLoaded: ((Int, [String: String]) -> Void)? = nil,
        onAutosaveSaved: ((Int) -> Void)? = nil,
        onAutosaveCleared: (() -> Void)? = nil
    ) {
        self.storageKey = storageKey
        self.storage = storage
        self.debounceMs = debounceMs
        self.silentResume = silentResume
        self.onAutosaveLoaded = onAutosaveLoaded
        self.onAutosaveSaved = onAutosaveSaved
        self.onAutosaveCleared = onAutosaveCleared
    }

    public var body: some View {
        EmptyView()
    }
}
