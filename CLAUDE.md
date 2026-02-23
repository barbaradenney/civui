# CivUI Design System

Accessibility-first web components for government applications.

## Tech Stack

- **Lit 3** web components with **Light DOM** (`createRenderRoot()` returns `this`)
- **Tailwind CSS** with `civ-` prefix (e.g., `civ-p-2`, `civ-text-error`, `civ-border-primary`)
- **ElementInternals** for native form participation (no hidden inputs)
- **pnpm workspaces + Turborepo** monorepo
- **Vitest + jsdom** for testing
- **Storybook** for component documentation
- **W3C DTCG design tokens** via Style Dictionary

## Package Structure

Build order: `tokens → core → forms → react-native`

| Package | Path | Description |
|---------|------|-------------|
| `@civui/tokens` | `packages/tokens/` | Design tokens (colors, spacing, typography) |
| `@civui/core` | `packages/core/` | Base classes, a11y utilities, analytics, date utils |
| `@civui/forms` | `packages/forms/` | Form components (text-input, select, checkbox, etc.) |
| `@civui/react-native` | `packages/react-native/` | React Native companion components |
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
- Event detail shape: `{ value: string }` for single-value, `{ values: string[] }` for multi-value

### Rendering Order
Label → hint → error → control → supplementary info (character count, file list).

### Focus Styles
Use `focus-visible:civ-focus-ring` (not deprecated `focus:civ-outline-*` classes).

### Screen Reader Announcements
`announce(message, priority)` from `@civui/core` queues messages to `aria-live` regions. Uses polite/assertive priorities. Queue is capped at 10 messages with oldest-drop strategy.

## Testing Patterns

- Tests use **Vitest** with **jsdom** environment
- Import helpers from `@civui/test-utils`: `fixture`, `cleanupFixtures`, `elementUpdated`, `pressKey`, `typeText`
- Every test file must have `afterEach(cleanupFixtures)`
- After setting properties, `await elementUpdated(el)` before assertions
- Tests are co-located with source: `civ-select.ts` → `civ-select.test.ts`

## File Naming

- Component source: `packages/forms/src/{name}/civ-{name}.ts`
- Component test: `packages/forms/src/{name}/civ-{name}.test.ts`
- RN counterpart: `packages/react-native/src/forms/{Name}.tsx`
- Each component dir has an `index.ts` barrel export
