---
name: Input mask system
description: Plan to add a mask/validation layer for formatted text inputs (SSN, phone, zip, EIN, custom patterns)
type: project
---

Add a mask/validation system as a utility layer on top of `civ-text-input`, not as separate components.

**Why:** Government forms frequently need formatted inputs (SSN, phone, zip, EIN, case numbers). Agencies have varying format requirements, so a configurable system is better than opinionated specialized components.

**How to apply:**
- Add `mask` attribute to `civ-text-input` (e.g., `mask="ssn"`, `mask="phone-us"`, `mask="custom"`)
- Ship common presets: SSN, US phone, zip, zip+4, EIN, date
- Support custom patterns via `mask-pattern` attribute (e.g., `AAA-####`)
- Auto-format input as the user types (insert dashes, parens, spaces)
- Auto-validate against the pattern with default error messages
- Auto-set hint text showing expected format (overridable)
- Auto-flag PII-sensitive masks (SSN, EIN) for analytics exclusion
- International phone support via a separate preset or pattern
- All formatting/validation logic lives in `@civui/core` as utilities, not in the component
