---
title: AI-Agent-Friendly
sidebar_position: 10.5
sidebar_label: AI-Agent-Friendly
---

# AI-Agent-Friendly

CivUI is designed for human developers and AI coding agents to share the same codebase confidently. "AI-friendly" doesn't mean a special mode or a different API — it means the conventions an agent needs to follow are enforced by tooling, the contract for each component is machine-readable, and the failure modes agents historically fall into are caught by explicit lints before they ship.

This page lists what those affordances are and where each one lives.

## Patterns are enforced, not implicit

LLMs are confident pattern-matchers. Where a codebase relies on tribal knowledge ("we always put the legend on the group component, not the wrapper"), an agent will eventually guess wrong. CivUI's response is to turn every such convention into a static check that fails CI.

The full list lives in [Quality Gates](./quality-gates) — 12 drift lints, 5 schema-as-contract gates, the parity report, the consistency check, the doc-tables-sync gate, the Storybook build gate, and the native compile check. The lints in particular were each written in response to a real failure mode (a story attribute that wasn't a real prop, a `civ-text-base-darker` class that doesn't resolve to a token, a `@prop` JSDoc tag that drifted from its `@property` declaration). Together they form a tight feedback loop: an agent edits a file, runs `pnpm validate:lints`, and gets a precise error message instead of a silent regression.

Run the fast preflight before pushing:

```bash
pnpm preflight             # typecheck + lints + schema parity + doc-tables sync (~30s)
pnpm validate              # comprehensive — also runs the full test suite (slower)
```

`preflight` covers 80% of regressions in under a minute. `validate` is the exhaustive option. Both are discoverable from `package.json`; agents that aren't sure which to run should default to `preflight`.

When a lint fails, the failure output ends with a `→ see <path>#<anchor>` line that links to the rule documentation explaining the failure mode and the canonical fix. Jump straight there instead of grepping for the pattern.

## Schemas are the machine-readable contract

Every cross-platform component has a schema in `packages/schema/src/components/civ-<name>.schema.ts` describing its props, events, accessibility role, render order, and form behaviour in a platform-neutral form. 53 components are covered today.

The schema is what an agent should read when answering "what props does this component support?" — not the TypeScript source, which mixes public API with internal implementation. The schema is also what the Drupal SDC YAMLs and Twig templates are regenerated from (`pnpm sync:drupal`), what the Props / Events tables on every doc page are generated from (`pnpm sync:doc-tables`), and what the auto-generated Storybook contract pages are built from. One source of truth, four downstream artefacts.

When an agent adds a prop to a component, the workflow is:

1. Add the `@property` to the Lit source.
2. Add the matching `PropDef` to the schema.
3. Add the prop to the iOS / Android stubs and Drupal SDC.
4. Run `pnpm parity:schema --platforms` — the gate confirms the four implementations match the contract.
5. Run `pnpm sync:doc-tables` and `pnpm sync:drupal` — the docs and Drupal SDCs regenerate from the schema.

If step 2 or 3 is skipped, CI fails with a precise diff. No silent drift.

### Scaffolding a new component

Two equivalent commands produce a full scaffold — web source + test + story + iOS + Android + Drupal SDC + schema + `COVERED_COMPONENTS` registration:

```bash
pnpm scaffold:component civ-<name>      # tool-driven scaffolder (recommended)
civ generate component <name>           # CLI alternative — same artefacts
```

Both create the schema alongside the platform stubs, so the contract is in place from the first commit. If you have an existing component without a schema:

```bash
pnpm generate:schema civ-<name>         # extract @property declarations → schema scaffold
```

The tool parses the Lit source, maps TypeScript types to schema types, preserves `attribute:` overrides, and emits a stub with `// TODO` markers for the bits it can't infer (enum values, ARIA role, event declarations).

## The AI guide and the rules folder

Three documents are written explicitly for AI agents (and for human developers who want the same condensed reference):

- **`CLAUDE.md`** (repo root) — architecture, tech stack, build order, the cross-package import rule, the self-contained-control rule, event conventions, rendering order, focus styles, schemas-as-contract overview. Every Claude Code session loads this automatically.
- **`docs/ai-guide.md`** — long-form component catalogue with HTML examples, government design patterns, accessibility checklist, validation system, mask system, anti-patterns. Reach for this when you need an example of how a specific component composes.
- **`.claude/rules/`** — three focused rule files:
  - `government-patterns.md` — render order, Section 508 non-negotiables, plain-language guidelines, event conventions, button polymorphism, mobile / bottom-sheet rules.
  - `common-traps.md` — every recurring AI failure mode captured as a single-page reference (self-contained controls, HTML boolean attribute truthiness, JSON-string attribute validity, Storybook export → slug rules, story-vs-implementation drift, muted-text rules, JSDoc drift, double-labelled controls, lockfile drift, Storybook sub-path aliases).
  - `audit-debt.md` — items deliberately deferred from an audit. **Always read this before "fixing" something that looks broken** — it might be a known platform-implementation gap that an agent shouldn't try to repair blind (the 15 iOS components that return `EmptyView()` are the canonical example).

If you discover a new failure mode while working in this repo, append it to `common-traps.md` so the next agent doesn't repeat it.

## The MCP server

The `@civui/mcp-server` package (`packages/mcp-server/`) exposes ~90 tools over the Model Context Protocol so an AI agent can interact with CivUI structurally instead of grepping source files. The tools cluster into a few groups:

- **Discovery** — `search_components({ query: "user uploads ID and signs" })` returns ranked component matches; `get_component_guide({ name: "civ-text-input" })` returns the schema + canonical examples + matching trap excerpts in one focused payload; `get_component_examples` pulls snippets from `*.stories.ts`.
- **Generation** — `generate-gov-form`, `generate-react-form`, `generate-bilingual-form`, `generate-a11y-tests`, `generate-progress-bar`, `generate-confirmation-page`, `generate-summary`, and ~60 more emit ready-to-use markup or scaffolding from structured inputs.
- **Validation** — `validate-gov-form`, `validate-reading-level`, `validate-cross-field`, `check-contrast`, `generate-508-report` lint a form or a fragment against CivUI rules and Section 508.
- **Form scaffolding** — `assemble-gov-form`, `compose-forms`, `inline-sub-forms`, `scaffold-from-template`, `generate-form-steps`, `generate-repeatable-section` build multi-step flows from form definitions.
- **Schema introspection** — `export-schema`, `compare-schemas`, `query-tokens`, `style-lookup` return structured answers about the design system.

Prefer these tools over loading the full `ai-guide.md` into context — they're cheaper, more current (they read live source), and return JSON the agent can act on without re-parsing prose.

## Auto-generated documentation can't lie

Hand-written Props / Events tables drift. The overview page once kept listing `civ-form-field` as a current component for months after it was deleted. CivUI's response is to generate every Props and Events table from `@civui/schema`:

- `apps/docs/docs/components/**/_<slug>.props.mdx` and `_<slug>.events.mdx` partials are regenerated by `pnpm sync:doc-tables`.
- Every component page imports the partials instead of writing the tables inline.
- `pnpm validate:doc-tables` (CI gate) re-syncs and fails on `git diff --exit-code`.

The same shape applies to Storybook: contract pages are regenerated from schemas on every `pnpm storybook` / `pnpm storybook:build` (via the `prestorybook` hook), and the generated directory is gitignored. Pages are byproducts, not source.

An agent reading a Props table can trust it. An agent editing a Props table is editing the wrong file.

## What an agent should do when starting work

A reasonable startup checklist for an AI agent dropped into this repo:

1. **Read `CLAUDE.md`** — architecture and conventions.
2. **Skim `.claude/rules/audit-debt.md`** — known deferred work; don't try to "fix" these without device verification.
3. **Skim `.claude/rules/common-traps.md`** — the recurring failure modes; many otherwise reasonable edits are caught here.
4. **For component-specific questions, read the schema first** — `packages/schema/src/components/civ-<name>.schema.ts` is the public contract. Source is implementation; schema is API.
5. **Before pushing, run `pnpm validate:lints && pnpm parity:schema`** — sub-second feedback for nearly every preventable mistake.
6. **If something looks wrong but a test passes, check `audit-debt.md`** — it might be intentional.

Patterns the codebase will catch if you violate them (non-exhaustive):

- Wrapping a self-contained group component in `<civ-fieldset>` (caught by `lint:fieldsets`).
- Using a `civ-X` tag in prose that doesn't correspond to a registered element (caught by `lint:prose-refs`).
- A `<civ-*>` story attribute that isn't a declared `@property` (caught by `lint:story-props`).
- A muted-text class on body text (caught by `lint:muted-body-text`).
- A `civ-{text|bg|border}-{family}-{shade}` class that doesn't resolve to a real token (caught by `lint:color-classes`).
- A `@prop` JSDoc tag that doesn't match a declared `@property` (caught by `lint:jsdoc-props`).
- A `@fires civ-X` JSDoc tag with no matching dispatch (caught by `lint:jsdoc-events`).
- An `addEventListener` in `connectedCallback` without a matching `removeEventListener` (caught by `lint:event-listener-leak`).
- Hardcoded motion durations, z-index values, or Tailwind arbitrary spacing (caught by `lint:hardcoded-tokens`).
- A schema added without a matching test / story / contract page (caught by `lint:coverage-trinity`).
- An iOS component with an `EmptyView()` body that isn't on the deferred-implementation allowlist (caught by `lint:ios-stub-allowlist`). Editing the allowlist requires a deliberate PR — see `.claude/rules/audit-debt.md`.
- Drupal SDC YAML hand-edits that diverge from the regenerator (caught by `drupal-sync-clean`).
- A doc table hand-edit that diverges from the schema (caught by `doc-tables-sync`).

Each lint has a one-line description on the [Quality Gates](./quality-gates) page and a longer rationale in `.claude/rules/common-traps.md`.

## Why this works

The recurring theme: **make the rules explicit, then enforce them**. An AI agent (or a new contributor) doesn't need to internalise the conventions before contributing — they need to be told when they violate one. Enforcement at PR time, with a precise error message, is faster and more reliable than enforcement at review time, with a vague comment.

The cost is upfront: writing the lints, writing the schemas, writing the rule docs. The payoff compounds — every prevented regression frees up reviewer attention for the substantive parts of the change.

## See also

- [Quality Gates](./quality-gates) — every CI check and what it protects against.
- [Native Platforms](./native-platforms) — how the schema-as-contract approach extends to iOS, Android, and Drupal.
- `CLAUDE.md` in the repo root — top-level architecture and conventions.
- `docs/ai-guide.md` — long-form component catalogue for AI agents.
- `packages/schema/README.md` — schema authoring guide and naming-convention map.
- `packages/mcp-server/` — MCP tool source for direct AI integration.
