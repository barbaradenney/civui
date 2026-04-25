# CivUI Design System

Accessibility-first web components for government applications.

## Tech Stack

- **Lit 3** web components with **Light DOM** (`createRenderRoot()` returns `this`)
- **Tailwind CSS** with `civ-` prefix (e.g., `civ-p-2`, `civ-text-error`, `civ-border-primary`)
- **ElementInternals** for native form participation (no hidden inputs)
- **pnpm workspaces + Turborepo** monorepo
- **Vitest + jsdom** for testing
- **Storybook** for component documentation
- **W3C DTCG design tokens** with custom build pipeline (`packages/tokens/build/build-tokens.js`)

## Package Structure

Build order: `tokens → core → ui → inputs → controls → compound → form-patterns`

| Package | Path | Description |
|---------|------|-------------|
| `@civui/tokens` | `packages/tokens/` | Design tokens (colors, spacing, typography) |
| `@civui/core` | `packages/core/` | Base classes, a11y utilities, analytics, date utils |
| `@civui/inputs` | `packages/inputs/` | Input components (text-input, textarea, select, combobox, date-picker, file-upload, toggle, yes-no) |
| `@civui/controls` | `packages/controls/` | Selection controls (checkbox, radio, segmented-control) |
| `@civui/compound` | `packages/compound/` | Compound fields (address, name, direct-deposit, signature) |
| `@civui/form-patterns` | `packages/form-patterns/` | Form orchestration (form, form-step, repeater, summary, prefill, progress-steps) |
| `@civui/test-utils` | `packages/test-utils/` | Test helpers: `fixture`, `cleanupFixtures`, `elementUpdated`, `pressKey`, `typeText` |
| `@civui/cli` | `packages/cli/` | CLI tooling |
| `@civui/content` | `packages/content/` | Content/copy management |

## Commands

```bash
pnpm test          # Run all tests (422+ tests across packages)
pnpm build         # Build all packages (respects dependency order)
pnpm typecheck     # TypeScript type checking
pnpm lint          # ESLint
pnpm validate      # lint + typecheck + test (full CI check)
pnpm storybook     # Dev server on port 6006
```

## Architecture Patterns

### Light DOM Components
All components render to Light DOM (no Shadow DOM). `createRenderRoot()` returns `this`. This means Tailwind classes work directly and there are no style encapsulation boundaries.

### Cross-Package Component Imports
When a component renders child components from another `@civui/*` package (e.g., `civ-address` renders `<civ-text-input>`), use **bare side-effect imports** to ensure custom elements are registered:

```typescript
// CORRECT — direct sub-path imports, always preserved by bundlers
import '@civui/inputs/text-input';
import '@civui/inputs/select';
import '@civui/controls/radio';

// AVOID — barrel imports can be tree-shaken by Vite/esbuild
import '@civui/inputs';  // may get dropped!

// WRONG — named imports are always tree-shaken
import { CivTextInput } from '@civui/inputs';  // will get dropped!
```

Sub-path imports resolve to individual component index files, guaranteeing the `@customElement` decorator runs. Barrel imports go through a re-export chain that bundlers can optimize away, especially when resolved to source via Vite aliases.

An ESLint rule (`no-restricted-imports`) enforces this in component source files. Tests and stories are exempt.

### Form Components
Form-participating components extend `CivFormElement` (which extends `CivBaseElement`):
- `static formAssociated = true` enables ElementInternals
- `updateFormValue()` syncs value to the browser's form system
- `_syncFormValue()` is called automatically when `value` changes — override in subclasses with custom form value logic
- `formResetCallback()` restores initial value on form reset
- `formDisabledCallback()` cascades disabled state
- jsdom doesn't fully support ElementInternals, so guards like `typeof setFormValue === 'function'` are needed

### Standard Form Component API
Every form component has: `label`, `name`, `value`, `hint`, `error`, `required`, `disabled`.
Group components use `legend` instead of `label`.

### Events
- `civ-input` — fires on every value change (like native `input`)
- `civ-change` — fires on committed value change (like native `change`)
- `civ-analytics` — analytics tracking events
- Event detail shapes:
  - `{ value: string }` — single-value (text-input, textarea, select, radio-group, segmented-control, date-picker)
  - `{ values: string[] }` — multi-value (checkbox-group)
  - `{ checked: boolean, value: string }` — boolean controls (checkbox, toggle)
  - `{ files: File[] }` — file-upload
  - `{ value: string, label: string }` — combobox civ-change
  - `{ value: string, month: string, day: string, year: string }` — memorable-date

### Rendering Order
Label → hint → error → control → supplementary info (character count, file list).

### Mobile Popups — Bottom Sheet Rule
All popups, dropdowns, and dialogs **must** render as bottom sheets on mobile (≤480px). No absolute-positioned dropdowns on small screens — they overflow and are hard to tap.

```css
@media (max-width: 480px) {
  .my-popup {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: auto;
    width: 100%;
    margin: 0;
    border-radius: var(--civ-border-radius-lg) var(--civ-border-radius-lg) 0 0;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
    max-height: 50vh;
    overflow-y: auto;
  }
}
```

Components already following this: `civ-datepicker-dialog`, `civ-combobox-listbox`. Native `<select>` gets OS-level bottom sheet automatically.

### Focus Styles
Use `focus-visible:civ-focus-ring` (not deprecated `focus:civ-outline-*` classes).

### Screen Reader Announcements
`announce(message, priority)` from `@civui/core` queues messages to `aria-live` regions. Uses polite/assertive priorities. Queue is capped at 10 messages with oldest-drop strategy.

### Dark Mode
- `darkMode: 'media'` in Tailwind config — uses `prefers-color-scheme`
- `color-dark.tokens.json` provides dark palette with parity validation against light tokens
- Build script generates `@media (prefers-color-scheme: dark)` CSS overrides
- Focus ring colors switch to token-based values (`primary-lighter`, `primary-darker`) in dark mode

### Density System
- `scales.tokens.json` defines `dense`, `spacious`, and `fluid` scale variants
- Applied via `[data-civ-scale="dense|spacious"]` on a parent element
- Spacing and font size CSS variables adjust per scale

## Testing Patterns

- Tests use **Vitest** with **jsdom** environment
- Import helpers from `@civui/test-utils`: `fixture`, `cleanupFixtures`, `elementUpdated`, `pressKey`, `typeText`
- Every test file must have `afterEach(cleanupFixtures)`
- After setting properties, `await elementUpdated(el)` before assertions
- Tests are co-located with source: `civ-select.ts` → `civ-select.test.ts`

## File Naming

- Component source: `packages/forms/src/{name}/civ-{name}.ts`
- Component test: `packages/forms/src/{name}/civ-{name}.test.ts`
- iOS counterpart: `packages/ios/Sources/CivUI/Civ{Name}.swift`
- Android counterpart: `packages/android/src/main/kotlin/gov/civui/components/Civ{Name}.kt`
- Each component dir has an `index.ts` barrel export

## Validation System

15 built-in validators in `@civui/core` — `validate.required()`, `.email()`, `.phone()`, `.phoneIntl()`, `.ssn()`, `.ein()`, `.zip()`, `.zip4()`, `.usState()`, `.isoDate()`, `.url()`, `.currency()`, `.range()`, `.length()`, `.alphanumeric()`. Each returns `{ valid, error? }`. Use the declarative `validate` attribute on form components for auto-validation on submit.

## Mask System

Input masking engine in `@civui/core` with blur-mode default (mask on blur, raw input on focus). Presets: `ssn`, `phone-us`, `zip`, `zip4`, `ein`, `currency`. Pattern syntax: `#` = digit, `A` = letter, `*` = any. PII-flagged presets (`ssn`, `ein`) auto-enable blur-mode masking.

## Icon System

45 pure CSS icons via `::before`/`::after` pseudo-elements — no font files, no SVG, no Unicode. Icons inherit `color` and scale with `font-size`. Each icon maps to SF Symbols (iOS) and Material Symbols (Android). Use `<civ-icon name="..." label="...">`.

## Native Platform Support

iOS (SwiftUI) and Android (Jetpack Compose) implementations live at `packages/ios/` and `packages/android/`. CI enforces 95%+ API parity across platforms (`parity.yml`) and verifies native files compile (`native.yml`).

The parity check (`tools/parity-report.ts`) parses real source files on each platform — it does **not** consult `@civui/schema`.

## Schemas (`@civui/schema`) — currently dormant

`packages/schema/src/components/*.schema.ts` files describe component APIs in a platform-neutral form, intended as input to `@civui/codegen` (Lit / SwiftUI / Compose generators). **Today these are out of date and not consumed by CI:**

- Schemas don't exist for several recent components (`civ-yes-no`, `civ-address`, `civ-name`, `civ-direct-deposit`, `civ-signature`, `civ-form-step`, `civ-repeater`, `civ-progress-steps`, etc.).
- Existing schemas drift from the components — many props (e.g. `mask`, `validate`, `clearable`, `prefix`, `suffix`, `width`, `autogrow`, `maxwords`) aren't reflected.
- Codegen output writes to `packages/codegen/dist/` — never into the real platform packages — and isn't run by CI.

**If you're modifying a component, do not feel obligated to keep its schema in sync.** Treat the schema as design-time aspirational documentation. Before reviving codegen as a real source of truth, the schemas need a full sync pass + a decision on whether codegen output should replace hand-maintained native files.

## AI Component Usage Guide

For comprehensive component usage, HTML examples, government design patterns,
and accessibility requirements, see `docs/ai-guide.md`.

That guide covers:
- Component catalog with props, events, and HTML examples for all 20 web components (plus 2 child-only tags)
- New Tier 2 components: yes-no, conditional, progress-steps
- Validation system (15 validators, declarative `validate` attribute)
- Mask system (blur-mode default, 6 presets)
- Icon system (45 pure CSS icons, no Unicode)
- Native platform support (iOS + Android with 100% parity)
- Component selection decision tables (checkbox vs toggle, select vs combobox, date picker vs memorable date)
- Government design patterns (Section 508, plain language, form validation for .gov)
- WCAG 2.1 AA checklist specific to CivUI
- Anti-patterns to avoid
- Tailwind CSS reference (civ- prefix, semantic colors, density system, focus ring)
