---
name: ai-friendly
description: Audit code for AI-agent readability and suggest improvements that make the CivUI repo efficient for future AI sessions
disable-model-invocation: true
allowed-tools: Bash, Read, Grep, Glob
argument-hint: [file-or-path]
---

# AI-Friendly Code Audit

You are auditing code to ensure it is **optimized for AI agent consumption** — meaning future Claude Code sessions (and other AI tools) can understand, navigate, and modify this CivUI codebase efficiently with minimal context-gathering overhead.

CivUI uses: **Lit web components**, **Light DOM**, **Tailwind CSS** with `civ-` prefix, **ElementInternals** for forms, **pnpm workspaces + Turborepo**, and a **React Native** package.

## What to Audit

1. If `$ARGUMENTS` is provided, audit those specific files or directories.
2. If no arguments, audit all uncommitted changes: run `git diff` (unstaged) and `git diff --cached` (staged). If both are empty, diff the latest commit against its parent with `git diff HEAD~1`.

Read every changed file in full to understand context.

## Audit Dimensions

### 1. Naming & Discoverability
- **`civ-` prefix**: Component tag names and custom Tailwind classes must consistently use the `civ-` prefix. Can an agent grep for `civ-text-input` and find all relevant files?
- **File names**: Do they clearly describe what's inside? Components named to match their tag (`civ-select` → `select.ts`)
- **Barrel exports**: Does each package have a clean `index.ts` re-exporting public APIs? Can an agent import from `@civui/forms` without knowing internal file paths?
- **Function/variable names**: Self-documenting? No abbreviations, acronyms, or overloaded names

### 2. Code Navigability
- **Monorepo package boundaries**: Is it clear which package owns which code? Can an agent follow `@civui/core` → `@civui/forms` → `@civui/react-native` import chains?
- **TypeScript project references**: Does `tsconfig.json` correctly reference dependent packages? Are path aliases clear?
- **Single responsibility**: Each file/function does one thing. Large files (>300 lines) are harder for AI to reason about
- **Consistent patterns**: Does new code follow existing Lit component patterns? (`@property`, `render()`, `createRenderRoot()`, test structure)

### 3. Context Clues for AI
- **CLAUDE.md accuracy**: Do the changes affect anything documented in CLAUDE.md or MEMORY.md? Flag what needs updating
- **"Why" comments on ElementInternals guards**: The `typeof setFormValue === 'function'` pattern is non-obvious — ensure a comment explains the jsdom limitation
- **Type annotations on public APIs**: Component properties, events, and methods should have explicit types. No implicit `any`
- **Magic values**: Hardcoded strings, numbers, or Tailwind classes that should be tokens or named constants

### 4. Testability & Verifiability
- **Vitest jsdom environment**: Tests run in jsdom. Are they structured so an AI agent can run `pnpm test` and verify changes?
- **`updateComplete` async patterns**: Lit tests must `await element.updateComplete` after property changes. Missing awaits cause flaky tests
- **`createFixture`/`cleanup` helpers**: Are test utilities from `@civui/test-utils` used consistently? Can an agent copy an existing test as a template?
- **Test co-location**: Tests next to source files. Can an agent find `select.test.ts` from `select.ts` without searching?

### 5. Maintenance Signals
- **Dead code**: Unused imports, unreachable branches, commented-out code — these waste AI context window tokens
- **Duplicated logic across packages**: If the same pattern appears in `@civui/core` and `@civui/forms`, it should live in core. AI agents may modify one copy and miss the others
- **Stale TODOs**: `// TODO` comments that reference completed work or outdated plans
- **Implicit coupling via CSS class names**: Are there hidden dependencies between components that rely on Tailwind class names defined elsewhere rather than explicit imports?

### 6. Documentation Hooks
- **Memory file updates**: Should any patterns, decisions, or file paths be recorded in MEMORY.md or topic-specific memory files?
- **CLAUDE.md changes needed**: Do the changes add new commands, env vars, architecture patterns, or conventions that should be documented?
- **Inline references**: When a file implements something described in docs, a brief reference helps AI agents connect the dots (e.g., `// See docs/FORM_INTERNALS.md for the setFormValue pattern`)

## Output Format

```
## AI-Friendly Audit

**Files audited:** (list files)
**AI Readability Score:** A | B | C | D
  - A = Excellent — an AI agent can understand and modify this with minimal exploration
  - B = Good — minor improvements would help
  - C = Fair — several areas need attention for efficient AI interaction
  - D = Poor — significant refactoring needed for AI readability

---

### Naming & Discoverability
(findings or "All clear.")

### Code Navigability
(findings or "All clear.")

### Context Clues
(findings or "All clear.")

### Testability
(findings or "All clear.")

### Maintenance Signals
(findings or "All clear.")

### Documentation Updates Needed
- [ ] CLAUDE.md: (what to add/change, if anything)
- [ ] MEMORY.md: (what to add/change, if anything)
- [ ] Inline: (what comments to add, if any)

---

## Recommendations
1. (prioritized list of improvements, most impactful first)
```

Be specific with file paths and line numbers. Focus on **actionable** improvements — don't flag things that are already good just to fill space. Prioritize changes that save the most AI context-window tokens or reduce the most exploration steps.
