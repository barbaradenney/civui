---
name: Forms roadmap
description: Prioritized feature roadmap for making CivUI a comprehensive government forms library
type: project
---

## Forms Feature Roadmap

### Tier 1 — No new components (extend existing)

- [ ] **Currency mask preset** — Add `mask="currency"` to civ-text-input with locale-aware formatting, $ prefix, decimal handling
- [ ] **Read-only / review mode** — Add `readonly` prop to all form components that renders value as plain text instead of an input (for review-before-submit)
- [ ] **Form persistence** — Add `persist` attribute to civ-form that auto-saves draft to sessionStorage, restores on page reload
- [ ] **Form prefill from URL params** — Add `prefill` attribute to civ-form that auto-populates fields from query string params matching field names
- [ ] **Word count option for textarea** — Add `maxwords` prop alongside existing `maxlength`

### Tier 2 — Small new components (lightweight)

- [ ] **civ-yes-no** — Single boolean question component (simpler than radio-group for yes/no)
- [ ] **Conditional visibility** — `civ-conditional` wrapper with `when="field-name" equals="value"` declarative show/hide
- [ ] **Progress indicator** — `civ-progress-steps` for multi-step form navigation display

### Tier 3 — Larger new components

- [ ] **civ-repeater** — "Add another" pattern, clones a fieldset template with add/remove, manages array of values
- [ ] **civ-address** — Compound component with street, city, state dropdown (built-in US states), ZIP with mask
- [ ] **civ-form-wizard** — Multi-step form with step validation, navigation, progress bar, save/resume

**Why this order:** Tier 1 adds value with zero bundle size impact for teams not using the features (tree-shakeable props on existing components). Tier 2 adds small focused components. Tier 3 adds larger compound components that warrant careful API design.
