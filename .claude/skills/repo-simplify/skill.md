---
name: repo-simplify
description: Full-repo review for code reuse, quality, and efficiency. Launches three parallel agents to audit the entire codebase, then fixes issues found.
disable-model-invocation: true
allowed-tools: Agent, Bash, Read, Grep, Glob, Edit, Write
argument-hint: [package-or-path]
---

# Repo Simplify: Full Codebase Review and Cleanup

Review the entire codebase (or a specified package/path) for reuse, quality, and efficiency. Fix any issues found.

## Phase 1: Determine Scope

- If `$ARGUMENTS` names a package or path (e.g., `packages/forms`, `packages/core`), scope the review to that directory.
- If no arguments, review all source code under `packages/` (excluding `node_modules/`, `dist/`, and test files for the initial scan — but read tests when verifying specific component behavior).

## Phase 2: Launch Three Review Agents in Parallel

Use the Agent tool to launch all three agents concurrently in a single message. Each agent should be told the scope.

### Agent 1: Code Reuse Review

Scan the entire scoped codebase for:

1. **Duplicated logic across files** — search for near-identical functions, methods, or code blocks that appear in multiple components. Common locations: event handlers, lifecycle hooks, sync methods, utility helpers.
2. **Existing utilities that are underused** — check `packages/core/src/utils/`, `packages/core/src/base/`, and `packages/core/src/a11y/` for utilities that could replace hand-rolled logic in component files.
3. **Inline logic that could use an existing utility** — hand-rolled string manipulation, manual DOM queries, ad-hoc type guards, custom event dispatch patterns.
4. **Missing abstractions** — patterns repeated 3+ times that warrant a shared helper, mixin, or base class.
5. **Cross-package boundary violations** — utilities defined in a component package that belong in `@civui/core`, or circular imports.

### Agent 2: Code Quality Review

Scan the entire scoped codebase for:

1. **Redundant state**: state that duplicates existing state, cached values that could be derived, observers/effects that could be direct calls
2. **Parameter sprawl**: functions with too many parameters that should be restructured
3. **Copy-paste with slight variation**: near-duplicate code blocks that should be unified with a shared abstraction
4. **Leaky abstractions**: internal details exposed that should be encapsulated, or broken abstraction boundaries
5. **Stringly-typed code**: raw strings where constants, enums, or branded types already exist in the codebase
6. **Dead code**: unused imports, unreachable branches, commented-out code, TODO comments for completed work
7. **Type safety gaps**: `any` casts that could be avoided, missing type exports, type lies (declared type doesn't match runtime value)
8. **Inconsistent patterns**: places where one component diverges from established conventions without justification

### Agent 3: Efficiency Review

Scan the entire scoped codebase for:

1. **Unnecessary work**: redundant DOM queries (multiple `querySelectorAll` for the same selector in one update cycle), repeated computations, uncached expensive operations
2. **Event listener leaks**: `addEventListener` without matching `removeEventListener`, listeners not cleaned up in `disconnectedCallback`
3. **Memory issues**: unbounded data structures, closures capturing large scopes, module-level mutable state without cleanup
4. **Hot-path bloat**: expensive operations in `render()`, `updated()`, or frequently-fired event handlers
5. **No-op updates**: state updates that fire even when the value hasn't changed, missing change-detection guards
6. **Module-level side effects**: mutable global state that could cause issues with multiple instances, SSR, or micro-frontend architectures
7. **Missed caching**: computed values recalculated on every access that could be memoized (especially `getComputedStyle`, `Intl.*`, `querySelectorAll`)

## Phase 3: Fix Issues

Wait for all three agents to complete. Aggregate their findings, deduplicate overlapping reports, and fix each genuine issue directly. If a finding is a false positive or not worth addressing, note it and move on.

**Prioritize fixes:**
1. **Critical** — type safety violations, runtime errors, broken abstractions → fix immediately
2. **Major** — significant duplication (3+ occurrences), performance issues on hot paths, dead code → fix now
3. **Minor** — 2-occurrence duplication, style inconsistencies, micro-optimizations → fix if quick, otherwise note for later

When done, run `pnpm test` and `pnpm typecheck` to verify no regressions, then briefly summarize what was fixed (or confirm the code was already clean).
