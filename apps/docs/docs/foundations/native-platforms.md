---
title: Native Platforms
sidebar_position: 9
sidebar_label: Native Platforms
---

# Native Platforms

CivUI ships components for three platforms: web (Lit), iOS (SwiftUI), and Android (Jetpack Compose). All three share the same design tokens, the same component APIs, and the same accessibility standards.

## File Locations

| Platform | Path | Convention |
|----------|------|------------|
| Web | `packages/forms/src/{name}/civ-{name}.ts` | Lit web components |
| iOS | `packages/ios/Sources/CivUI/Civ{Name}.swift` | SwiftUI views |
| Android | `packages/android/src/main/kotlin/gov/civui/components/Civ{Name}.kt` | Jetpack Compose composables |

## How Native Components Mirror Web APIs

Native components replicate the web component API as closely as platform conventions allow:

- **Props** map directly. A web component's `label`, `hint`, `error`, `required`, and `disabled` properties appear as SwiftUI parameters and Compose function parameters with the same names.
- **Events** become callbacks. The web `civ-input` and `civ-change` events translate to `onInput` and `onChange` closure/lambda parameters on native platforms.
- **Validation** uses the same 15 validators. The validation logic is reimplemented natively to avoid WebView overhead.
- **Render order** is identical: label, hint, error, control, supplementary info.

## Token Pipeline

The token build at `packages/tokens/build/build-tokens.js` reads W3C DTCG JSON files and generates outputs for all platforms:

| Output | File | Contents |
|--------|------|----------|
| CSS custom properties | `@civui/tokens/css` | `--civ-color-primary`, `--civ-spacing-4`, etc. |
| Tailwind preset | `@civui/tokens/tailwind` | Tailwind utility mapping |
| Swift constants | `CivTokens.swift` | `CivTokens.colorPrimary`, `CivTokens.spacing4`, etc. |
| Kotlin constants | `CivTokens.kt` | `CivTokens.colorPrimary`, `CivTokens.spacing4`, etc. |

When you add or change a token in the JSON source files, all platform outputs regenerate automatically during `pnpm build`.

## Icon Mapping

Web icons are pure CSS (no font files, no SVG). Native platforms use platform-native icon systems:

| Web (CSS) | iOS | Android |
|-----------|-----|---------|
| `<civ-icon name="check">` | SF Symbols `checkmark` | Material Symbols `check` |
| `<civ-icon name="error">` | SF Symbols `xmark.circle` | Material Symbols `error` |
| `<civ-icon name="search">` | SF Symbols `magnifyingglass` | Material Symbols `search` |

The full mapping is maintained in each platform's `CivIcon` file. CI enforces that every web icon has native counterparts.

## Native Components

### iOS (SwiftUI) -- 43 files

CivAddress, CivAlert, CivButton, CivCard, CivCheckbox, CivCheckboxGroup, CivCombobox, CivConditional, CivDatePicker, CivDirectDeposit, CivDivider, CivFieldset, CivFileUpload, CivForm, CivFormGroup, CivFormState, CivFormStep, CivIcon, CivLink, CivLinkCard, CivLocale, CivMemorableDate, CivName, CivPageHeader, CivPrefillNotice, CivProgressBar, CivProgressSteps, CivRadio, CivReadOnlyField, CivRepeater, CivSegmentedControl, CivSelect, CivSignature, CivSkipLink, CivSummary, CivList, CivTag, CivTextInput, CivTextarea, CivToggle, CivTokens, CivUI, CivYesNo.

### Android (Jetpack Compose) -- 41 files

CivAddress, CivAlert, CivButton, CivCard, CivCheckbox, CivCheckboxGroup, CivCombobox, CivConditional, CivDatePicker, CivDirectDeposit, CivDivider, CivFieldHelpers, CivFieldset, CivFileUpload, CivForm, CivFormGroup, CivFormState, CivFormStep, CivIcon, CivLink, CivLinkCard, CivMemorableDate, CivName, CivPageHeader, CivPrefillNotice, CivProgressBar, CivProgressSteps, CivRadio, CivReadOnlyField, CivRepeater, CivSegmentedControl, CivSelect, CivSignature, CivSkipLink, CivSummary, CivList, CivTag, CivTextInput, CivTextarea, CivToggle, CivYesNo.

## Web-Only Features

Some features are inherently web-specific and have no native counterpart:

- **sessionStorage/persist** -- browser storage for form state persistence across page loads
- **URL prefill** -- populating form fields from URL query parameters
- **CSS pseudo-element icons** -- native platforms use SF Symbols and Material Symbols instead
- **Light DOM rendering** -- a Lit/web platform concept
- **ElementInternals** -- browser form participation API
- **Tailwind CSS utilities** -- native platforms use token constants directly

## Adding a New Native Component

1. Build the web component first and get it passing all tests.
2. Create `Civ{Name}.swift` in `packages/ios/Sources/CivUI/` with the same props and callbacks.
3. Create `Civ{Name}.kt` in `packages/android/src/main/kotlin/gov/civui/components/` with the same props and callbacks.
4. Run the parity report locally to verify 95%+ coverage: `node --experimental-strip-types tools/parity-report.ts`
5. Push and confirm the parity CI check passes.
