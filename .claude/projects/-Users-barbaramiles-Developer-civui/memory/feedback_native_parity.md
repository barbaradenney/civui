---
name: Always sync native components
description: Every web component change must be reflected in iOS (SwiftUI) and Android (Compose) counterparts
type: feedback
---

Every feature or API change to web components must also be applied to the iOS (SwiftUI) and Android (Kotlin Compose) counterparts.

**Why:** The design system serves web AND native apps. If features diverge, teams on different platforms get inconsistent behavior, and the design system loses its value as a single source of truth.

**How to apply:**
- When adding a new property, event, or behavior to a web component, also update the corresponding files in `packages/ios/Sources/CivUI/` and `packages/android/src/main/kotlin/gov/civui/components/`
- When creating a new web component, create the SwiftUI and Compose counterparts in the same commit
- Not all features port 1:1 (e.g., sessionStorage persistence is web-only, CSS text-box-trim is web-only) — use platform-appropriate equivalents where needed
- Icon mappings (SF Symbols for iOS, Material Symbols for Android) are defined in `icon-library.ts` and must stay in sync
- Token values are generated for all platforms via the build pipeline — always rebuild tokens after changes
