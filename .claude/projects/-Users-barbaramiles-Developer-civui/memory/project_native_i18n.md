---
name: Native i18n system
description: Plan for cross-platform localization system matching web's t() translation function on iOS and Android
type: project
---

## Native i18n System Plan

### Problem
Web components use `t('keyName')` for all user-facing strings (hints, errors, labels, announcements). iOS and Android components have English strings hardcoded throughout. This means native apps can't be localized.

### Web Pattern (reference)
```typescript
// locale.ts defines defaults
const defaultStrings = { maskSsnHint: 'For example: 123-45-6789', ... };
// Consumer overrides
setLocaleStrings({ maskSsnHint: 'Por ejemplo: 123-45-6789' });
// Component uses
t('maskSsnHint') // returns override or default
```

### iOS Plan

**1. Create `CivLocale.swift`** — a singleton with all string keys matching web's `CivLocaleStrings`:
```swift
public class CivLocale {
    public static let shared = CivLocale()
    private var overrides: [String: String] = [:]
    private let defaults: [String: String] = [
        "maskSsnHint": "For example: 123-45-6789",
        "maskSsnError": "Enter a 9-digit Social Security number",
        // ... all keys from web locale.ts
    ]

    public func t(_ key: String) -> String {
        overrides[key] ?? defaults[key] ?? key
    }

    public func setStrings(_ strings: [String: String]) {
        overrides.merge(strings) { _, new in new }
    }

    public func reset() { overrides.removeAll() }
}
```

**2. SwiftUI Environment alternative** — for per-view-tree overrides:
```swift
struct CivLocaleKey: EnvironmentKey {
    static let defaultValue = CivLocale.shared
}
extension EnvironmentValues {
    var civLocale: CivLocale { get/set }
}
```

**3. Update all components** — replace hardcoded strings with `CivLocale.shared.t("keyName")` or `@Environment(\.civLocale) var locale`.

### Android Plan

**1. Create `CivLocale.kt`** — matching the iOS pattern:
```kotlin
object CivLocale {
    private val defaults = mapOf(
        "maskSsnHint" to "For example: 123-45-6789",
        // ... all keys
    )
    private val overrides = mutableMapOf<String, String>()

    fun t(key: String): String = overrides[key] ?: defaults[key] ?: key
    fun setStrings(strings: Map<String, String>) { overrides.putAll(strings) }
    fun reset() { overrides.clear() }
}
```

**2. CompositionLocal alternative** — for per-subtree overrides:
```kotlin
val LocalCivLocale = staticCompositionLocalOf { CivLocale }
```

**3. Update all components** — replace hardcoded strings with `CivLocale.t("keyName")`.

### String Keys to Port
All keys from `packages/core/src/i18n/locale.ts` — approximately 50+ strings covering:
- Mask hints and errors (13 strings)
- Date picker labels (12 strings)
- File upload labels (8 strings)
- Form validation messages (5 strings)
- Combobox labels (3 strings)
- Textarea labels (2 strings)
- Required indicator text (1 string)
- Select empty label (1 string)

### Implementation Order
1. Create CivLocale on both platforms with all string keys
2. Update components one by one (start with TextInput since it has the most strings)
3. Add integration tests verifying override behavior
4. Document the localization API for consuming teams

### How to apply
This is a dedicated session — touch every native component file but the changes are mechanical (replace string literals with `t("key")` calls). Estimate: ~2 hours.
