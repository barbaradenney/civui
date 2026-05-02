---
title: Native Platforms
sidebar_position: 9
sidebar_label: Native Platforms
---

# Native Platforms

CivUI ships components for four platforms: Web (Lit), iOS (SwiftUI), Android (Jetpack Compose), and Drupal (SDC). All platforms share the same design tokens, the same component APIs, and the same accessibility standards.

## File Locations

| Platform | Path | Convention |
|----------|------|------------|
| Web | `packages/{package}/src/{name}/civ-{name}.ts` | Lit web components |
| iOS | `packages/ios/Sources/CivUI/Civ{Name}.swift` | SwiftUI views |
| Android | `packages/android/src/main/kotlin/gov/civui/components/Civ{Name}.kt` | Jetpack Compose composables |
| Drupal | `packages/drupal/civui/components/{name}/{name}.twig` | Twig SDC templates |

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
| `<civ-icon name="error">` | SF Symbols `exclamationmark.circle` | Material Symbols `error` |
| `<civ-icon name="phone">` | SF Symbols `phone` | Material Symbols `call` |

The full mapping is maintained in each platform's `CivIcon` file. CI enforces that every web icon has native counterparts.

## Native Components

### iOS (SwiftUI) -- 43 files

CivAddress, CivAlert, CivButton, CivCard, CivCheckbox, CivCheckboxGroup, CivCombobox, CivConditional, CivDatePicker, CivDirectDeposit, CivDivider, CivFieldset, CivFileUpload, CivForm, CivFormGroup, CivFormState, CivFormStep, CivIcon, CivLink, CivLinkCard, CivLocale, CivMemorableDate, CivName, CivPageHeader, CivPrefillNotice, CivProgressBar, CivProgressSteps, CivRadio, CivDataField, CivRepeater, CivSegmentedControl, CivSelect, CivSignature, CivSkipLink, CivSummary, CivList, CivTag, CivTextInput, CivTextarea, CivToggle, CivTokens, CivUI, CivYesNo.

### Android (Jetpack Compose) -- 41 files

CivAddress, CivAlert, CivButton, CivCard, CivCheckbox, CivCheckboxGroup, CivCombobox, CivConditional, CivDatePicker, CivDirectDeposit, CivDivider, CivFieldHelpers, CivFieldset, CivFileUpload, CivForm, CivFormGroup, CivFormState, CivFormStep, CivIcon, CivLink, CivLinkCard, CivMemorableDate, CivName, CivPageHeader, CivPrefillNotice, CivProgressBar, CivProgressSteps, CivRadio, CivDataField, CivRepeater, CivSegmentedControl, CivSelect, CivSignature, CivSkipLink, CivSummary, CivList, CivTag, CivTextInput, CivTextarea, CivToggle, CivYesNo.

## Web-Only Features

Some features are inherently web-specific and have no native counterpart:

- **sessionStorage/persist** -- browser storage for form state persistence across page loads
- **URL prefill** -- populating form fields from URL query parameters
- **CSS pseudo-element icons** -- native platforms use SF Symbols and Material Symbols instead
- **Light DOM rendering** -- a Lit/web platform concept
- **ElementInternals** -- browser form participation API
- **Tailwind CSS utilities** -- native platforms use token constants directly

## Drupal (Single Directory Components)

CivUI includes a Drupal module at `packages/drupal/civui/` with 69 Single Directory Components for Drupal 10.3+ and Drupal 11. Each SDC consists of:

- **`{name}.component.yml`** — Schema defining props, their types, and descriptions
- **`{name}.twig`** — Twig template that renders the corresponding `<civ-*>` web component

### Installation

1. Copy `packages/drupal/civui/` into your Drupal site's `modules/custom/` folder
2. Build the CivUI assets (`pnpm build`) and place them in the module
3. Enable the module: `drush en civui`

### Usage in Twig

```twig
{% include 'civui:form-field' with {
  label: 'Email address',
  hint: 'We will use this to contact you',
  required: true,
} %}
  {% block default %}
    {% include 'civui:text-input' with {
      name: 'email',
      type: 'email',
    } %}
  {% endblock %}
{% endinclude %}
```

### Storybook Preview

Drupal components can be previewed in Storybook using `vite-plugin-twig-drupal`. Story files are co-located next to each web component as `*.drupal.stories.ts` files. Run `pnpm storybook` and look for the "Drupal" sidebar entries.

### Validation

Run the SDC validator to check all 69 components:

```bash
node --experimental-strip-types tools/validate-drupal-sdc.ts
```

### Customization

Themes can override any CivUI SDC by creating a matching component with the `replaces` key in the YAML schema:

```yaml
# your-theme/components/text-input/text-input.component.yml
replaces: civui:text-input
```

## Adding a New Platform Component

The CLI scaffolder generates stubs for all four platforms at once:

```bash
civui generate component my-widget
```

This creates:
- **Web:** `packages/forms/src/my-widget/civ-my-widget.ts` (component, test, story, index)
- **iOS:** `packages/ios/Sources/CivUI/CivMyWidget.swift` (SwiftUI stub)
- **Android:** `packages/android/src/main/kotlin/gov/civui/components/CivMyWidget.kt` (Compose stub)
- **Drupal:** `packages/drupal/civui/components/my-widget/` (`.component.yml` + `.twig` + co-located `.drupal.stories.ts`)

After scaffolding:

1. Implement the web component and get it passing all tests.
2. Implement the native views in the iOS and Android stubs.
3. Add any additional props to the Drupal SDC YAML schema.
4. Run the parity report locally to verify 85%+ coverage: `node --experimental-strip-types tools/parity-report.ts`
5. Run the Drupal SDC validator: `node --experimental-strip-types tools/validate-drupal-sdc.ts`
6. Push and confirm the parity CI check passes.

## PR Checklist

Every pull request uses a template (`.github/PULL_REQUEST_TEMPLATE.md`) that includes a platform checklist. Before merging, verify that all affected platforms have been updated.
