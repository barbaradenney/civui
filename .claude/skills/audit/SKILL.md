---
name: audit
description: Deep quality audit of CivUI components — accessibility, performance, consistency, simplicity, code quality, and developer experience
disable-model-invocation: true
allowed-tools: Bash, Read, Grep, Glob, Task, WebSearch
argument-hint: [component-name | package-path | "all"]
---

# CivUI Component Quality Audit

You are performing a rigorous, production-readiness audit of the CivUI design system. Your goal is to ensure every component meets the highest standards across six dimensions, from the perspective of both end users and developers who will consume this design system.

CivUI uses: **Lit 3 web components**, **Light DOM** (no Shadow DOM — `createRenderRoot()` returns `this`), **Tailwind CSS** with `civ-` prefix, **ElementInternals** for native form participation, **pnpm workspaces + Turborepo** monorepo, **W3C DTCG design tokens** via Style Dictionary, and a **React Native** companion package.

---

## Scope

1. **Single component audit**: If `$ARGUMENTS` names a component (e.g., `text-input`, `combobox`, `date-picker`), audit that component directory under `packages/forms/src/{name}/`. Read every file: source, tests, stories, index.
2. **Package audit**: If `$ARGUMENTS` is a package path (e.g., `packages/core`, `packages/forms`), audit the entire package directory.
3. **Full audit** (`all` or no arguments): Audit every component in `packages/forms/src/`, then `packages/core/src/`, then cross-cutting concerns.

For every file you audit, **read the full source** — never skim or skip sections. Cross-reference related files (base classes in `@civui/core`, token values in `@civui/tokens`, React Native counterparts in `@civui/react-native`).

---

## Audit Dimensions

### 1. Accessibility (WCAG 2.2 AA)

Audit against WAI-ARIA Authoring Practices and WCAG 2.2 Level AA. Every component must be usable by screen readers, keyboard-only users, switch devices, and magnification tools.

**Structural semantics:**
- Correct HTML element choices (`<button>` not `<div onclick>`, `<fieldset>/<legend>` for groups, `<label>` for inputs)
- No implicit roles overridden without justification
- Heading hierarchy maintained when components compose

**ARIA attributes (Light DOM — no shadow boundary issues):**
- `aria-describedby` chains correctly: hint + error + supplementary info, all IDs resolve to visible elements
- `aria-invalid="true"` set when error is present, `"false"` (not absent) when no error
- `aria-required` reflects the `required` property
- `aria-expanded`, `aria-controls`, `aria-activedescendant` for disclosure/listbox patterns (combobox, date-picker)
- `aria-checked` for custom checkbox/radio/toggle/segment controls
- `aria-orientation` for groups with directional keyboard nav
- `aria-live` regions: `polite` for status updates, `assertive` only for urgent errors. Debounced for rapid changes (character counts, search results)
- `aria-disabled` vs native `disabled` — prefer native `disabled` on form controls
- No duplicate or conflicting ARIA (e.g., `role="radio"` on `<input type="radio">` is redundant)

**Keyboard interaction (WAI-ARIA Authoring Practices):**
- **Single-field controls** (text-input, textarea, select, toggle): Standard Tab-to-focus, native keyboard behavior
- **Radio groups**: Roving tabindex — Tab enters group, Arrow keys move between options, selection follows focus
- **Checkbox groups**: Each checkbox independently focusable via Tab
- **Combobox**: Input focusable, Arrow Down opens listbox, Up/Down navigate options, Enter selects, Escape closes
- **Date picker**: Calendar grid navigable with Arrow keys, Page Up/Down for month, Home/End for week boundaries, Enter selects, Escape closes dialog
- **Segmented control**: Roving tabindex like radio group
- **Home/End** in linear lists, **Escape** to close overlays, **Space/Enter** to activate
- Focus visible indicator: `focus-visible:civ-focus-ring` class, not `focus:` (which fires on click too)
- Focus trapping in modal dialogs (date picker dialog)
- Focus restoration when closing overlays (return to trigger element)

**Screen reader announcements:**
- Dynamic content changes announced via `announce()` utility or `aria-live` regions
- Error messages have `role="alert"` for immediate announcement
- Character counts use `aria-live="polite"` with debounce (not announcing every keystroke)
- File upload results announced
- Date picker month navigation announced

**Form integration:**
- `static formAssociated = true` present
- `ElementInternals` form value updated on every value change
- `formResetCallback()` restores initial value
- `formDisabledCallback()` cascades disabled state
- Validation works with native `<form>` constraint validation API

**Color and contrast:**
- Error states don't rely solely on color (border thickening, icon, or text label accompanies red)
- Disabled states maintain 3:1 contrast minimum against background
- Focus indicators have 3:1 contrast against adjacent colors

**Touch targets:**
- Interactive elements have at least 24x24px touch target (WCAG 2.2 Target Size)
- Tile variants of checkbox/radio provide enlarged touch area

### 2. Performance

Every component runs in the browser's main thread. Audit for unnecessary work.

**Render efficiency:**
- No unnecessary reactive properties — use `@state` for internal state that doesn't need attribute reflection
- `willUpdate()` for synchronous derived state, not `updated()` (which causes a second render)
- Guard `updated()` checks: only act when the specific property changed (`changed.has('propName')`)
- No `requestUpdate()` calls inside `render()` or `updated()` that cause infinite loops
- Template expressions don't create new objects/arrays on every render (e.g., inline `${[...].join(' ')}` for class strings is fine, but `${new Map()}` is not)

**Event listener lifecycle:**
- Every `addEventListener` in `connectedCallback` has a matching `removeEventListener` in `disconnectedCallback`
- Document-level listeners (click-outside for dropdowns) only active when the dropdown is open
- Bound methods stored as class fields (`private _bound = this._handler.bind(this)`) not re-created each call

**Memory:**
- No closures that capture large scopes in event handlers
- Keyboard handlers created once (class field or connectedCallback), not per-keydown
- MutationObservers / ResizeObservers disconnected in `disconnectedCallback`

**Bundle size:**
- No unnecessary imports from large libraries
- Components export from their own sub-path (`@civui/forms/text-input`) for tree-shaking
- Barrel exports don't pull in unrelated code

### 3. Consistency

A design system's value is proportional to its consistency. Audit for deviations from established patterns.

**Property API surface (every form component should have):**
- `label` (string) — accessible label text
- `name` (string) — form field name
- `value` (string) — current value
- `hint` (string) — helper text below label
- `error` (string) — error message (triggers error state)
- `required` (boolean) — required indicator
- `disabled` (boolean, reflect: true) — disabled state
- Group components use `legend` instead of `label`

**Event naming:**
- `civ-input` — fires on every value change (like native `input`)
- `civ-change` — fires on committed value change (like native `change`)
- `civ-reset` — fires on form reset
- `civ-analytics` — fires for analytics tracking
- Event detail shape: `{ value: string }` for single-value components, `{ values: string[] }` for multi-value

**Rendering patterns:**
- Label → hint → error → control → supplementary (character count, file list)
- Error elements have `role="alert"` and an ID referenced in `aria-describedby`
- Hint elements have an ID referenced in `aria-describedby`
- Required indicator: `<abbr class="civ-text-error civ-no-underline" title="required">*</abbr>`
- Disabled state: `civ-opacity-50 civ-cursor-not-allowed` classes + native `disabled` attribute
- Focus style: `focus-visible:civ-focus-ring` (not deprecated `focus:civ-outline-*`)

**Base class usage:**
- Simple display components extend `CivBaseElement`
- Form-participating components extend `CivFormElement`
- Form components use `data-civ-form-field` attribute (set by `CivFormElement.connectedCallback`)
- `_inputId`, `_hintId`, `_errorId` from base for ARIA ID generation
- `updateFormValue()` for ElementInternals integration
- `sendAnalytics()` for analytics events

**Tailwind class patterns:**
- All classes use `civ-` prefix
- Colors from token palette: `civ-text-base-darkest`, `civ-text-error`, `civ-border-primary`, `civ-bg-white`
- Spacing from token scale: `civ-p-2`, `civ-mb-4`, `civ-gap-1`
- No arbitrary values (`civ-p-[13px]`) — everything comes from the token system
- Border patterns: `civ-border` + `civ-border-base-light` for normal, `civ-border-error civ-border-l-4` for error

**Test patterns:**
- Imports from `@civui/test-utils`: `fixture`, `cleanupFixtures`, `elementUpdated`, `pressKey`, `typeText`
- `afterEach(cleanupFixtures)` in every test file
- Test categories: rendering, ARIA/a11y, events, keyboard navigation, form participation, analytics, disabled states, edge cases

### 4. Simplicity of Design

A design system component should be the simplest possible implementation that meets requirements. Complexity is a bug.

**API minimalism:**
- No properties that could be derived from other properties
- No configuration that has only one valid value in practice
- Boolean properties with sensible defaults (false, so attributes are additive)
- String properties default to `''` (empty), not a placeholder value
- No "God component" that tries to handle too many variants — prefer composition

**Template clarity:**
- Render method is readable top-to-bottom
- Conditional rendering uses ternary with `nothing` (Lit's empty sentinel), not complex nested `if` chains
- Class string construction is clear — array `.filter(Boolean).join(' ')` pattern
- No deeply nested HTML (>4 levels of conditional nesting is a smell)

**State management:**
- Minimal state — derive what you can, store what you must
- No redundant state that mirrors props
- Group components sync state to children via properties, not DOM manipulation
- No imperative DOM manipulation that Lit's template system could handle declaratively

**File organization:**
- One primary component per file (companion sub-components like `civ-segment` in their own file)
- `index.ts` exports only the public API
- No utility functions that belong in `@civui/core`
- Test file mirrors source file structure

### 5. Code Quality

Production-grade TypeScript for a design system used across a government platform.

**TypeScript:**
- Strict mode compliance — no `any` casts except where ElementInternals API requires it (jsdom interop)
- Exported types for component properties, events, and public methods
- Generic types for reusable patterns (`SelectOption`, `ComboboxOption`)
- No `!` non-null assertions on values that could genuinely be null — use proper guards

**Error handling:**
- Form validation errors surface to users via `error` property and `role="alert"`
- No swallowed exceptions in event handlers
- Defensive guards on DOM queries that might return null (especially after async waits)
- File upload: validate file type, size, and count with clear error messages

**Naming:**
- Private methods prefixed with `_` (Lit convention)
- Event handler methods: `_on{EventType}` (e.g., `_onInput`, `_onKeydown`, `_onSelectChange`)
- Sync methods: `_sync{What}` (e.g., `_syncRadioChecked`, `_syncTabindex`)
- ID generators: `_inputId`, `_hintId`, `_errorId`, `_charCountId`
- Boolean properties are adjectives: `disabled`, `required`, `checked`, `selected`, `tile`

**Dead code:**
- No commented-out code
- No unused imports
- No unreachable branches
- No `TODO` comments for completed work
- No backwards-compatibility shims (`_unused` variables, re-exports of removed APIs)

### 6. Developer Experience (DX)

Audit from the perspective of a developer adopting CivUI for their project.

**Ease of use:**
- Can a developer use each component with just `label` and `name`? Minimal required configuration
- Do defaults make sense? (`rows="5"` for textarea, `orientation="vertical"` for groups)
- Is the component self-contained? No required CSS imports, no global setup, no provider wrappers
- Does it work in a plain HTML page with just a `<script type="module">` import?

**Predictability:**
- Setting a property always produces the expected visual and behavioral result
- Error states are visually obvious and accessible
- Disabled state prevents all interaction and looks disabled
- Form reset restores the initial value, not empty

**Composability:**
- Components work inside `<form>`, `<fieldset>`, `<civ-form>`, and `<civ-fieldset>`
- Group components accept their children via light DOM (slot)
- Components don't fight with each other for layout (no absolute positioning leaks, no z-index wars)
- Events bubble so parent containers can listen

**Documentation signals:**
- JSDoc on the class: `@element`, `@prop`, `@fires`, `@slot`
- Story files demonstrate primary use cases, variants, and edge cases
- Type exports so TypeScript users get autocomplete and type checking

**Parity across platforms:**
- Web component API matches React Native component API (same props, same events, same behavior)
- Token values are consistent across CSS, Tailwind, and React Native outputs
- Accessibility behavior matches across platforms (keyboard nav on web, VoiceOver/TalkBack on native)

---

## Audit Process

### For a single component:

1. Read the component source file(s) in full
2. Read the test file in full
3. Read the stories file
4. Read the index.ts exports
5. Read the base class it extends (`CivBaseElement` or `CivFormElement`)
6. Check the React Native counterpart (`packages/react-native/src/forms/{ComponentName}.tsx`)
7. Score each dimension
8. List all findings with file:line references
9. Prioritize fixes

### For a full audit (`all`):

1. Audit `packages/core/src/` first (base classes, utilities)
2. Audit each component in `packages/forms/src/` alphabetically
3. Audit cross-cutting concerns (token usage, event consistency, test patterns)
4. Generate a summary scorecard
5. Generate a prioritized fix list

---

## Output Format

### Single Component

```
## Component Audit: civ-{name}

**Files audited:** (list all files read)
**Overall Grade:** A | B | C | D | F

| Dimension | Grade | Issues |
|-----------|-------|--------|
| Accessibility | A-F | count |
| Performance | A-F | count |
| Consistency | A-F | count |
| Simplicity | A-F | count |
| Code Quality | A-F | count |
| Developer Experience | A-F | count |

---

### Accessibility
(numbered findings with file:line, severity [Critical/Major/Minor], and recommended fix)

### Performance
(findings)

### Consistency
(findings)

### Simplicity
(findings)

### Code Quality
(findings)

### Developer Experience
(findings)

---

## Fix List (prioritized)

### Critical (must fix)
- [ ] (fix with file:line reference)

### Major (should fix)
- [ ] (fix)

### Minor (nice to have)
- [ ] (fix)
```

### Full Audit (all)

After all individual component audits, produce a summary:

```
## CivUI Design System — Full Audit Summary

**Components audited:** (count)
**Overall System Grade:** A | B | C | D | F

### Scorecard

| Component | A11y | Perf | Consistency | Simplicity | Quality | DX | Overall |
|-----------|------|------|-------------|------------|---------|-----|---------|
| text-input | A | A | A | A | A | A | A |
| textarea | A | B | A | A | A | A | A |
| ... | ... | ... | ... | ... | ... | ... | ... |

### Cross-Cutting Issues
(patterns that affect multiple components — fix once, fix everywhere)

### Prioritized Fix Plan
(grouped by tier: Critical > Major > Minor, with effort estimates)

### Strengths
(what the system does well — acknowledge good patterns so they're preserved)
```

---

## Grading Scale

- **A** — Production-ready. Meets all best practices. No issues or only cosmetic nits.
- **B** — Good. Minor gaps that don't affect end users. Fix at convenience.
- **C** — Fair. Noticeable gaps that affect some users or developers. Fix before next release.
- **D** — Poor. Significant issues that affect accessibility, reliability, or DX. Fix immediately.
- **F** — Failing. Broken functionality, critical accessibility violations, or security issues. Block release.

Be honest. Don't inflate grades. A design system used across government services must earn its grades.
