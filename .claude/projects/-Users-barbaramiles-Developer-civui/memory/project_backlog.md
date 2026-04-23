---
name: Engineering backlog
description: Prioritized list of remaining engineering tasks across all platforms
type: project
---

## Engineering Backlog

### High Priority — Do Next

- [ ] **CSS icons for remaining 20 icons** — Convert the 20 `svg: true` placeholder icons to CSS-only using borders, clip-path, box-shadow, and pseudo-elements. Try CSS first; only fall back to SVG if a shape truly can't be done with CSS. Icons: arrow-back, external-link, edit, check-circle, error, warning, info, help, calendar, copy, trash, loading, lock, home, settings, star, star-filled, print, user, mail.

- [ ] **Add `pnpm parity` to CI** — Run the parity report in CI (GitHub Actions or similar) and fail the build if any component drops below 100%. Also consider a pre-commit hook.

- [ ] **Remove `phone-intl` mask preset** — It's misleadingly named (only handles +1 NANP format). Replace with documentation pointing to `validate="phoneIntl"` + `type="tel"` approach.

- [ ] **Build Tier 2 components (web + iOS + Android):**
  - `civ-yes-no` — simple boolean question (simpler than radio-group for yes/no)
  - `civ-conditional` — `when="field-name" equals="value"` declarative show/hide
  - `civ-progress-steps` — step indicator for multi-step forms

### Medium Priority — Do Soon

- [ ] **Set up XCTest for iOS components** — Add unit tests for CivTextInput, CivCheckbox, CivToggle, CivSelect, CivFormState, CivLocale at minimum.

- [ ] **Set up Compose UI tests for Android** — Add @Composable test functions for the same components using `createComposeRule()`.

- [ ] **Native CivFormState tests** — Test register/unregister, validate(), reset(), clearErrors(), getFormData() lifecycle on both platforms.

- [ ] **Native CivLocale tests** — Test t() lookup, setStrings() override, reset() on both platforms.

### Lower Priority — Backlog

- [ ] **Tier 3 components** — civ-repeater, civ-address, civ-form-wizard (larger compound components, need careful API design)
- [ ] **Extract icon library to separate repo** — Not doing now. Revisit when/if icons need to be shared beyond CivUI.
