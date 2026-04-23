---
name: Cross-platform icon mapping
description: Build platform icon mapping into icon-library so CivUI icon names resolve to SF Symbols (iOS) and Material Symbols (Android)
type: project
---

Add platform-specific icon mappings to the icon library so native components resolve CivUI icon names to their platform equivalents.

**Why:** CivUI has SwiftUI and Kotlin Compose counterparts. CSS/SVG icons don't work natively. Each platform has its own icon system (SF Symbols on iOS, Material Symbols on Android). The icon library should be the single source of truth for which platform icon maps to which CivUI name.

**How to apply:**
- Extend `IconDef` in `icon-library.ts` with optional `ios` and `android` fields:
  ```typescript
  interface IconDef {
    label: string;
    type?: IconType;
    layers?: IconLayer[];
    ios?: string;      // SF Symbol name, e.g., "checkmark"
    android?: string;  // Material Symbol name, e.g., "check"
  }
  ```
- Populate mappings for all 44 icons
- Token build pipeline (`packages/tokens/build/build-tokens.js`) generates:
  - `CivTokens.swift` — icon name → SF Symbol mapping
  - `CivTokens.kt` — icon name → Material Symbol mapping
- Native `CivIcon` components in `packages/ios/` and `packages/android/` consume the mapping
- The icon builder tool could show platform previews alongside the CSS preview
