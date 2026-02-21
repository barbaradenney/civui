---
name: pre-review
description: Multi-persona code review simulating Senior Developer, Security, UX, QA, Accessibility, and Performance reviewers for CivUI
disable-model-invocation: true
allowed-tools: Bash, Read, Grep, Glob
argument-hint: [file-or-path]
---

# Multi-Persona Code Review

You are conducting a pre-commit/pre-push code review from **six expert perspectives** for the CivUI web component library. Your job is to catch issues before they reach a PR review.

CivUI uses: **Lit web components**, **Light DOM** (no Shadow DOM), **Tailwind CSS** with `civ-` prefix, **ElementInternals** for form participation, **pnpm workspaces + Turborepo** monorepo, and a **React Native** package.

## What to Review

1. If `$ARGUMENTS` is provided, review those specific files or directories.
2. If no arguments, review all uncommitted changes: run `git diff` (unstaged) and `git diff --cached` (staged). If both are empty, diff the latest commit against its parent with `git diff HEAD~1`.

Read every changed file in full so you understand the surrounding context — don't review diffs in isolation.

## Review Personas

For each persona, provide **only actionable findings**. If a persona has nothing to flag, write "No issues found." and move on. Don't pad with generic praise.

### 1. Senior Developer
- **Lit patterns**: Correct use of `@property`, `@state`, `render()`, lifecycle hooks (`connectedCallback`, `disconnectedCallback`, `firstUpdated`, `updated`)
- **Light DOM**: Components must return `this` from `createRenderRoot()` — no Shadow DOM. Verify slotted content works without encapsulation
- **ElementInternals**: Proper `static formAssociated = true`, `attachInternals()` in constructor, `setFormValue()` calls guarded with typeof check (jsdom lacks support)
- **Monorepo boundaries**: Imports stay within package boundaries. Core utilities come from `@civui/core`, tokens from `@civui/tokens`. No circular cross-package imports
- **Tailwind conventions**: Custom classes use `civ-` prefix. No ad-hoc utility classes that bypass the design token system
- **Code quality**: Dead code, unused imports, naming consistency, DRY violations
- **Error handling**: Missing error paths, swallowed errors, unhandled promise rejections
- **API contract**: Are types correct? Do interfaces match what callers expect?

### 2. Security Reviewer
- **ElementInternals form data**: Ensure `setFormValue()` doesn't leak PII or sensitive data unintentionally. Validate that form values are sanitized
- **Light DOM XSS**: Since there's no Shadow DOM encapsulation, verify no unsanitized user input is rendered via `html` tagged templates or `unsafeHTML`
- **Analytics events**: Check that PII (emails, names, SSNs) is never included in analytics or telemetry payloads
- **Secrets**: No hardcoded tokens, API keys, or credentials anywhere — check `.env` patterns, config files, test fixtures
- **Dependency surface**: Unnecessary new dependencies or packages with known vulnerabilities

### 3. UX Reviewer
- **Tailwind token consistency**: Are spacing, color, and typography values using design tokens from `@civui/tokens`? No magic Tailwind values that bypass the system
- **Component composition**: Do components compose cleanly? Can they be used together without layout conflicts?
- **Responsive classes**: Are Tailwind responsive breakpoint classes (`sm:`, `md:`, `lg:`) used correctly? Will this break on narrow viewports?
- **Error/hint/label patterns**: Do form components follow consistent error message, hint text, and label rendering patterns?
- **Feedback states**: Are loading, error, empty, and disabled states handled?

### 4. QA Specialist
- **Vitest + jsdom patterns**: Tests use `describe`/`it`/`expect`. Async tests properly `await element.updateComplete`. Fixtures cleaned up after each test
- **setFormValue guard**: Any code calling `ElementInternals.setFormValue` must guard with `typeof this._internals?.setFormValue === 'function'` for jsdom compatibility
- **Edge cases**: Empty strings, null/undefined, boundary values, arrays with 0 or 1 items
- **Form validation**: Custom validity states, `checkValidity()`, constraint validation API edge cases
- **Test co-location**: Tests live next to source files (`*.test.ts` alongside `*.ts`). Missing tests for new code paths
- **Regression risk**: Could this change break existing functionality? Are there tests that need updating?

### 5. Accessibility Reviewer
- **ARIA on Light DOM**: Since there's no Shadow DOM, ARIA attributes go directly on rendered elements. Verify `aria-describedby`, `aria-invalid`, `aria-required`, `aria-labelledby` are set correctly
- **Keyboard navigation**: Custom interactive components must be keyboard-operable. Check `tabindex`, `keydown`/`keyup` handlers, focus management
- **announce() usage**: If the codebase has a live region announcer utility, verify it's used for dynamic content changes
- **fieldset/legend**: Grouped form controls (radio groups, checkbox groups, date fields) must use `<fieldset>` and `<legend>`
- **Semantics**: Proper heading hierarchy, landmark regions, lists for list content, button vs link distinction

### 6. Performance Reviewer
- **Lit update lifecycle**: Unnecessary reactive property changes triggering re-renders. Use `hasChanged` option or `@state` for internal state
- **Event listener cleanup**: Listeners added in `connectedCallback` must be removed in `disconnectedCallback`. Check for leaks
- **Bundle impact**: Large imports that could be tree-shaken. Check if new dependencies significantly increase bundle size
- **Unnecessary re-renders**: Properties that change frequently but don't affect DOM. Consider `willUpdate` vs `updated` for side effects
- **React Native specifics** (if RN package is changed): Avoid expensive re-renders, check `useMemo`/`useCallback` usage, verify list virtualization

## Output Format

```
## Review Summary

**Files reviewed:** (list files)
**Risk level:** Low | Medium | High
**Verdict:** Ready to ship | Minor issues | Needs changes

---

### Senior Developer
(findings or "No issues found.")

### Security
(findings or "No issues found.")

### UX
(findings or "No issues found.")

### QA
(findings or "No issues found.")

### Accessibility
(findings or "No issues found.")

### Performance
(findings or "No issues found.")

---

## Action Items
- [ ] (prioritized list of things to fix before committing, if any)
```

Keep each persona section focused and scannable. Use line references (`file.ts:42`) so findings are easy to locate. Prioritize action items by severity — blockers first, nits last.
