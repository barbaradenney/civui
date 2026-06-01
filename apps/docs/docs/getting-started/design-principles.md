---
sidebar_position: 3
title: Design Principles
---

# Design Principles

## Forms-First

The library is openly biased toward long, multi-step government flows: claim forms, eligibility checks, benefits applications. That bias shows up in:

- **Compound fields** (address, name, direct deposit, signature, race-ethnicity, partnership history, service history) that wrap the messy multi-input affordances real government forms need
- **Form orchestration components** (`civ-form`, `civ-form-step`, `civ-repeater`, `civ-conditional`, `civ-summary`, `civ-form-autosave`) for chaptered flows with branching logic, save-and-resume, and a final review step
- **Per-field state tracking:** `touched` set on first blur, `error` set by server-side validation, automatic error summary with anchor links to each failing field
- **Validation copy biased toward "say what to do":** the 16 built-in validators all return errors that name the expected format

If you're building a short marketing form or a single-screen settings panel, you will find CivUI heavy. If you're building a 30-question claim form that has to survive a Section 508 audit and read cleanly in JAWS, the affordances are already there.

## Use the Platform

CivUI uses native HTML elements (`<select>`, `<input>`, `<textarea>`, `<fieldset>`, `<button>`) not JavaScript re-implementations. Native elements get keyboard navigation, form participation, and screen reader support for free. Custom code is only added for components that don't exist natively (combobox, date picker).

## Accessibility First

Every component is designed for WCAG 2.2 AA compliance from the start, not retrofitted:

- **Light DOM:** ARIA references, labels, and focus management work without Shadow DOM workarounds
- **Semantic HTML:** correct elements, roles, and heading hierarchy
- **Keyboard operable:** every interactive component works with keyboard alone
- **Screen reader tested:** `announce()` utility for dynamic content, `aria-live` regions
- **Error states:** never rely on color alone (text + border + icon)
- **Focus visible:** applied globally by `civ.css` to every native interactive element

## Plain-Language Defaults

Visual hierarchy in government forms is fragile: the user is often distressed, in a hurry, or reading the page through a screen reader. CivUI's defaults bias toward plain text over visual codes.

- **"(required)" rendered as text** on the label, not a red asterisk. Color and shape are not accessible labels.
- **Error messages tell the user how to fix the field**, not just what went wrong: "Enter the date as MM/DD/YYYY" instead of "Invalid date".
- **Hint text shows the expected format** *before* the user types, not after they fail.
- **Field labels in plain language:** "Date of birth" instead of "DOB", "Social Security number" instead of "SSN".
- **Color is never the sole indicator** of a status. Errors carry text + border + `role="alert"`; success carries an icon and a label.
- **No gray body text.** Visual hierarchy comes from font size and weight, not color muting. Gray is reserved for hint text, placeholders, and disabled states.

These rules are enforced by drift lints (`lint:muted-body-text`, `lint:missing-labels`, `lint:double-labels`, `lint:stacked-required`) and documented in [`.claude/rules/government-patterns.md`](https://github.com/barbaradenney/civui/blob/main/.claude/rules/government-patterns.md). Overriding the defaults is supported but deliberate work.

## One Thing Per Page

Government forms follow the "one thing per page" pattern:
- Each page asks one question or a small related group
- Reduces cognitive load. Users focus on one decision at a time
- Better error handling. Errors caught immediately
- Mobile-friendly. No scrolling through walls of fields
- Screen reader friendly. Clear focus management

## Self-Contained Controls

Every input renders its own label, hint, error, and "(required)" text from its own props — there is no separate field-wrapper component to forget or mis-nest:

```html
<civ-text-input label="Email address" name="email" type="email" hint="Work email preferred" required></civ-text-input>
```

Group inputs (`civ-radio-group`, `civ-checkbox-group`, `civ-yes-no`, `civ-segmented-control`, `civ-memorable-date`) carry their own `<legend>` the same way — you never wrap them in a `civ-fieldset`. `civ-fieldset` is reserved for genuine multi-field grouping (an address with street / city / state). The payoff is that every control is accessible by construction: the label is bound to its input, errors carry `role="alert"`, and "(required)" lands in exactly one place.

Enforced by `lint:missing-labels`, `lint:double-labels`, `lint:fieldsets`, `lint:stacked-required`, and `lint:required-cascade`.

## Border Radius Signals Interactivity

Only clickable elements get rounded corners. Buttons, inputs, tiles. Static containers like alerts and cards use sharp edges. This visual convention helps users identify interactive elements at a glance.

## Underlines Signal Navigation

Text is only underlined when it navigates somewhere. Links get underlines; action buttons do not. This preserves the semantic distinction between navigation and action.

## Arrows Navigate, Carets Expand

Directional **arrow** icons (`arrow-right`, `arrow-back`) mean "go somewhere" — they live on navigation affordances like the `primary` and `back` link variants, pagination, and breadcrumbs. The **caret** (chevron) is reserved for on-page expand/collapse affordances: disclosures, accordions, in-page expanders, and select/combobox dropdowns. Keeping the two glyph families apart gives users a second, color-independent cue for "this takes me to a new place" versus "this opens something right here."

## Mobile Reshapes the UI

Below 480px, CivUI changes affordances, not just widths:

- Popups, dropdowns, and dialogs become **bottom sheets** — thumb-reachable, anchored to the bottom edge, no off-screen overflow
- The primary button goes **full-width**; primary + secondary clusters stack vertically via `.civ-button-row`
- Row-action clusters restack beneath their content, and list rows shed their side padding to reclaim the narrow viewport

A small screen is a different interaction model, not a scaled-down desktop. The one documented exception is the `civ-combobox` listbox: its typing surface keeps the soft keyboard up, so it stays an anchored popover rather than a sheet that the keyboard would crush.

## Required Indicator Logic

- If **all fields** in a fieldset are required → show "(required)" on the legend, hide on individual fields
- If **some fields** are optional → show "(required)" on each required field individually
- Components use `hide-required-indicator` to suppress the visual text while keeping validation active

## Schemas Are the Source of Truth

Every cross-platform component has a platform-neutral schema in [`@civui/schema`](https://github.com/barbaradenney/civui/tree/main/packages/schema/src/components): a single TypeScript file that declares the component's props, events, accessibility requirements, and form behavior in a form-agnostic way. The Lit web implementation is the canonical reference; the iOS (SwiftUI), Android (Compose), and Drupal SDC counterparts each satisfy the same contract.

Everything that needs to know a component's surface reads the schema:

- The **MCP server** exposes the schemas as resources, so AI agents generating forms read the same contract a human would
- **`pnpm generate:schema <tag>`** bootstraps a starter schema from an existing Lit component
- **`pnpm sync:drupal`** regenerates the Drupal SDC YAML + Twig from the schema (no hand-editing)
- The **Props / Events tables** on these docs pages are auto-generated MDX partials produced by `pnpm sync:doc-tables` from the same schemas
- The **Storybook Contract pages** are generated from the schemas by `pnpm storybook:contract`
- A **CI gate** (`pnpm parity:schema --platforms`) fails the build if any platform drifts from the contract

When you add a prop, you update the schema first. The parity check then tells you which platform implementations need a matching change. The contract is the floor; the implementations are interchangeable.

See [AI-Agent-Friendly](../foundations/ai-agent-friendly) for how this same property makes CivUI tractable for LLM coding agents, and [`packages/schema/README.md`](https://github.com/barbaradenney/civui/blob/main/packages/schema/README.md) for the naming-convention map and the "how to add a new schema" walkthrough.

## Tokens, Not Magic Numbers

Spacing, color, typography, motion, and z-index all flow through W3C design tokens — there are no hardcoded `px`, `rem`, or hex values in component styles. That single discipline is what makes the cross-cutting systems work for free:

- **Density** — `[data-civ-scale="dense|spacious"]` retunes the spacing and type tokens, so every component shrinks or grows with no per-component code
- **Dark mode** and **reduced motion** ride the same token swap
- **Theming** a federal brand is a token edit, not a component rewrite

One thing to know going in: the spacing scale is the **standard 4px-based scale** — `civ-p-4` is **16px**, exactly as a Tailwind user expects (it was re-based from a former 5px scale on 2026-06-01 to match Tailwind and the iOS/Android native tokens). Enforced by `lint:hardcoded-spacing`, `lint:hardcoded-hex`, and `lint:color-classes`.

## Dark Mode Is Built-In, Not Bolted-On

Every light-mode token has a hand-authored dark counterpart with measured contrast, and the token build *fails* if any token is missing its dark value. Dark mode follows `prefers-color-scheme` by default, or a consumer can force it with `[data-color-mode="dark"]` for an in-app toggle. Because color flows through tokens, components inherit dark mode without a single dark-specific line of component code.

## Semantic Intent vs Categorical Color

Two different "colored" component families, two different vocabularies — and the prop name tells you which one you're holding:

- **Semantic-intent** components (`civ-alert`, `civ-notice`, `civ-badge`, `civ-count`) take an `intent` of `info` / `success` / `warning` / `error` / `neutral`. The color *means* something, and the same intent renders with the same weight everywhere.
- **Categorical** components (`civ-tag`, `civ-card`) take a `color` of `blue` / `red` / `green` / … . The color groups items visually but carries no status meaning.

Don't reach for `color="red"` to signal an error, or `intent="error"` to color-code a category. ([`design-rules.md`](https://github.com/barbaradenney/civui/blob/main/.claude/rules/design-rules.md) has the full recipe.)

## CSS Over JavaScript

Visual states are handled with CSS:
- Error borders via `[aria-invalid]`
- Disabled opacity via `:disabled`
- Selection highlights via `:has(:checked)`
- Icons rendered as inline SVG paths. Zero external requests

## Progressive Enhancement

Modern CSS is used freely because each feature degrades to a plain, correct layout — never a regression. Headings use `text-wrap: balance` and body prose uses `text-wrap: pretty`; text at a container's edge trims its half-leading with `text-box-trim`; long-form prose hangs its punctuation. Browsers that don't yet support these fall back to ordinary wrapping with nothing broken. The baseline works everywhere; the polish appears where it's supported.

## Every Byte Is Earned

- 14 inline SVG icons from Material Icons Outlined (no icon fonts, no external requests). Full Material Symbols font available as opt-in
- No CSS-in-JS (static Tailwind)
- No hidden input hacks (ElementInternals)
- Lit (~16K gzipped) is the only runtime dependency
- System font stack. Zero font downloads
