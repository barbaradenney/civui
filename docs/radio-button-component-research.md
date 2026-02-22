# Radio Button Web Component Research
## Modern Design System Trends & Best Practices (2025)

---

## 1. Key Architectural Difference from Checkbox

The most important distinction between radio buttons and checkboxes from a component architecture standpoint is that **radio buttons are inherently group-level components**. Unlike checkboxes, which can function independently, a radio button only makes sense inside a group. This has major implications for your API design:

- Every major design system ships a **RadioGroup** wrapper as the primary component, with individual **Radio** items as children
- The group owns the `value`, `name`, `required`, and form submission behavior — not the individual radio items
- Keyboard navigation is managed at the group level (roving tabindex), not per-item
- Shoelace learned this the hard way: they originally had `checked` on individual `<sl-radio>` items but removed it in favor of a `value` attribute on `<sl-radio-group>`, because dual sources of truth caused conflicts

---

## 2. RadioGroup Properties (Cross-System Consensus)

After analyzing Shoelace, Material Web, Radix, React Aria (Adobe Spectrum), Carbon, USWDS, VA.gov, GitLab Pajamas, MUI, Angular Material, and shadcn/ui:

### Universal RadioGroup Properties

| Property | Type | Description |
|----------|------|-------------|
| `value` | `string` | The currently selected radio's value (controlled) |
| `defaultValue` | `string` | Initial selected value (uncontrolled) |
| `name` | `string` | Form submission identifier — shared across all radios in the group |
| `label` | `string \| slot` | Visible group label (maps to `<legend>` or `aria-label`) |
| `disabled` | `boolean` | Disables all radios in the group |
| `required` | `boolean` | At least one selection required for form validation |
| `orientation` | `'vertical' \| 'horizontal'` | Layout direction of the radio items |

### Widely Adopted RadioGroup Properties

| Property | Type | Description |
|----------|------|-------------|
| `error` / `invalid` | `boolean` | Visual error state |
| `error-message` | `string \| slot` | Validation error text |
| `help-text` / `hint` | `string \| slot` | Supplementary description below the group label |
| `size` | `'small' \| 'medium' \| 'large'` | Controls visual scale; propagated to child radios |
| `dir` | `'ltr' \| 'rtl'` | Text/layout direction |
| `loop` | `boolean` | Whether arrow keys loop from last→first and first→last (default: `true` in Radix) |

---

## 3. Radio Item Properties

Individual radio items have a deliberately slim API — the group handles most behavior.

### Universal Radio Item Properties

| Property | Type | Description |
|----------|------|-------------|
| `value` | `string` | The value submitted when this radio is selected (required) |
| `disabled` | `boolean` | Disables this specific radio option |
| `label` | `string \| slot` | Visible text label for this option |

### Additional Radio Item Properties (Select Systems)

| Property | Type | Description |
|----------|------|-------------|
| `description` | `string \| slot` | Secondary descriptive text (used in tile variants) |
| `required` | `boolean` | Material Web allows per-item `required` — if any radio in a group is required, all are implicitly required |

**Note:** Unlike checkboxes, radio buttons do **not** have an indeterminate state. A radio group can have no selection initially, but once a selection is made, it typically cannot return to an all-unchecked state through user interaction.

---

## 4. States to Support

**Selection states:** Unselected, Selected

**Interactive states:** Default, Hover, Focus (visible focus ring), Active/Pressed, Disabled

**Validation states:** Valid, Invalid/Error

**Note on "no selection":** Some implementations start with no radio selected. The WAI-ARIA pattern says when focus enters a group with no selection, focus goes to the first radio. Once any selection is made, returning to "none selected" is generally not possible through user interaction alone — only programmatically.

---

## 5. Component Variants (Trending)

### Tile / Card Radio
Just like with checkboxes, the **tile variant** is gaining traction for radio buttons. USWDS, VA.gov, Carbon, and shadcn/ui all support card-style radio selections with:
- Larger touch targets
- A `description` slot for additional context per option
- Visually distinct selected state with border/background changes
- Particularly useful for pricing plans, shipping options, and similar structured choices

USWDS guidance applies equally here: don't mix tile and default variants in the same group.

### Radio Button (Segmented Control)
Shoelace ships a separate **`<sl-radio-button>`** component — a button-like variant used inside the same `<sl-radio-group>`. This creates a segmented control / toggle bar appearance. Key details:
- Same group wrapper, different child component
- Supports `prefix` and `suffix` icon slots
- Can be `pill`-shaped
- Often used for view mode toggles, density settings, etc.

This pattern is effectively a segmented control built on radio group semantics — worth considering as a variant or separate component.

### Size Variants
Three sizes are standard: **small**, **medium** (default), and **large**. Importantly, size is set on the **group** and propagated to children, not set individually per radio.

### AI Label Variant
Carbon (IBM) offers the same AI label modification for radio buttons as for checkboxes — a visual indicator with an explainability popover for AI-involved selections.

---

## 6. Events

| Event | Description |
|-------|-------------|
| `change` / `onValueChange` | Fires when the selected radio changes (emitted by the group) |
| `input` | Fires on user input (some systems) |
| `focus` | Group or individual radio receives focus |
| `blur` | Group or individual radio loses focus |
| `invalid` | Native constraint validation fails |

Key difference from checkboxes: the **change event is emitted by the group**, carrying the new `value` string — not by individual radios carrying a boolean.

---

## 7. Accessibility Requirements (WAI-ARIA Radio Group Pattern)

### Keyboard Interaction

This is one of the most critical differences from checkboxes. Radio groups use **roving tabindex**:

| Key | Behavior |
|-----|----------|
| **Tab** | Moves focus into the group. If a radio is checked, focuses the checked one. If none are checked, focuses the first radio. |
| **Shift+Tab** | Moves focus out of the group. |
| **Space** | Checks the focused radio (if not already checked). |
| **↓ Arrow / → Arrow** | Moves focus to and checks the next radio. Wraps from last to first. |
| **↑ Arrow / ← Arrow** | Moves focus to and checks the previous radio. Wraps from first to last. |

**Critical:** The entire radio group is a **single tab stop**. Users navigate between options with arrow keys, not Tab. This is fundamentally different from checkboxes, where each checkbox is its own tab stop.

**Toolbar exception:** When a radio group is nested in a toolbar, arrow keys move focus but do **not** automatically check the focused radio. Only Space/Enter checks it.

### ARIA Attributes

**On the group container:**
- `role="radiogroup"` (or use native `<fieldset>`)
- `aria-label` or `aria-labelledby` — required
- `aria-describedby` — for supplementary help text
- `aria-required="true"` — when a selection is required
- `aria-orientation="vertical | horizontal"` — informs AT of navigation direction

**On each radio item:**
- `role="radio"` (implicit with native `<input type="radio">`)
- `aria-checked="true | false"` — reflects selection state
- `aria-disabled="true"` — when disabled
- `aria-label` or `aria-labelledby` — when visible label is insufficient

### Grouping
- Use `<fieldset>` + `<legend>` as the semantic grouping mechanism (preferred)
- Alternatively, `role="radiogroup"` with `aria-labelledby` on a container `<div>`
- **Do not** wrap radio items inside `<label>` elements — this stops screen readers from correctly announcing the number of options in the group (Material Web explicitly warns against this)

### Label Association
- Use `<label for="radio-id">` associated via `for`/`id` attributes
- Do **not** wrap the entire radio inside `<label>` — screen readers need to count radios in a group, and wrapping breaks that count

---

## 8. Focus Management: Roving Tabindex vs. aria-activedescendant

Two implementation strategies exist for managing keyboard focus within radio groups. Both are WAI-ARIA compliant:

### Roving Tabindex (Recommended for web components)
- Only the focused radio has `tabindex="0"`; all others have `tabindex="-1"`
- Arrow keys move `tabindex="0"` to the next item and call `.focus()`
- Radix and most web component libraries use this approach
- Pros: Works natively with browser focus management, no extra ARIA attributes needed
- Cons: Requires updating tabindex on multiple elements

### aria-activedescendant
- The group container is the focusable element (`tabindex="0"`)
- `aria-activedescendant` points to the currently "focused" radio's `id`
- Arrow keys update the `aria-activedescendant` value
- Pros: Simpler DOM focus management (only one focusable element)
- Cons: Less consistent screen reader support, especially on mobile

**Recommendation:** Use roving tabindex for web components. It has broader assistive technology support and is the approach used by Radix, Shoelace, and React Aria.

---

## 9. Modern Web Component Architecture Notes

### Group Owns Form Participation
The `<radio-group>` (not individual radios) should be the `formAssociated` custom element using `ElementInternals`. It owns the `name`, `value`, and validation. Individual radio items are not form controls — they're interactive children managed by the group.

### Value on the Group, Not the Items
Shoelace's migration story is instructive: they moved from per-radio `checked` attributes to a single `value` on the group. This eliminates conflicts where multiple radios could declare themselves checked.

### Don't Auto-Import Children
Shoelace's design philosophy: the group component should not auto-import radio items. Users might want to use `<radio>` or `<radio-button>` (segmented control) interchangeably inside the same group wrapper.

---

## 10. Design Token Recommendations for Radio

| Token Category | Example Tokens |
|---------------|----------------|
| Border | `--radio-outline-color`, `--radio-outline-width` |
| Selected | `--radio-selected-color`, `--radio-selected-inner-color` |
| Unselected | `--radio-unselected-outline-color` |
| Disabled | `--radio-disabled-opacity`, `--radio-disabled-outline-color` |
| Error | `--radio-error-outline-color` |
| Focus | `--radio-focus-ring-color`, `--radio-focus-ring-offset` |
| Size | `--radio-size` (outer circle), `--radio-inner-size` (filled dot) |
| Spacing | `--radio-gap` (between control and label), `--radio-group-gap` (between items) |

---

## 11. CSS Parts Recommendation

**RadioGroup:**
- `base` — The root wrapper
- `label` — The group label (legend)
- `help-text` — Group description
- `error-message` — Validation message
- `fieldset` — The semantic grouping container

**Radio Item:**
- `base` — Item wrapper
- `control` — The radio circle element
- `control--checked` — Checked state modifier
- `checked-icon` — The inner dot/fill indicator
- `label` — Item text label
- `description` — Secondary text (for tile variant)

---

## 12. Summary: Recommended Minimum Property Set

For a new, accessibility-first web component library:

**RadioGroup properties:** `value`, `defaultValue`, `name`, `label`, `orientation`, `disabled`, `required`, `size`, `error` (or `invalid`), `error-message`, `help-text`, `loop`

**RadioGroup slots:** `default` (radio items), `label`, `help-text`, `error-message`

**RadioGroup events:** `change` (emits new value string), `focus`, `blur`

**Radio item properties:** `value`, `disabled`, `label` (or default slot)

**Radio item slots:** `default` (label text), `description` (for tile variant)

**Variants to consider for v1:** Default, Tile, Radio Button / Segmented Control, and Size (small/medium/large)

**Accessibility:** Roving tabindex, `role="radiogroup"` with `aria-labelledby`, `formAssociated` via `ElementInternals` on the group, full arrow key + Space navigation

---

## 13. Key Differences from Checkbox (Quick Reference)

| Aspect | Checkbox | Radio |
|--------|----------|-------|
| Selection model | Multi-select (independent) | Single-select (mutually exclusive) |
| Group requirement | Optional (can stand alone) | Mandatory (must be in a group) |
| Form owner | Individual checkbox | The radio group |
| Tab behavior | Each is a separate tab stop | Group is one tab stop; arrows within |
| Indeterminate state | Yes (mixed/tri-state) | No |
| Keyboard: navigate | Tab between items | Arrow keys between items |
| Keyboard: toggle | Space to check/uncheck | Arrow keys auto-check; Space to check |
| Value type | Boolean per item | String (which item is selected) |
| Change event source | Individual checkbox | The group |

---

## Sources Referenced

- WAI-ARIA Radio Group Pattern (W3C APG)
- WAI-ARIA `radiogroup` role (MDN)
- Material Web (`material-web.dev/components/radio`)
- Shoelace / Web Awesome (`shoelace.style/components/radio`, `radio-group`, `radio-button`)
- Radix Primitives (`radix-ui.com/primitives/docs/components/radio-group`)
- React Aria / Adobe Spectrum (`react-spectrum.adobe.com`)
- Carbon Design System — IBM (`carbondesignsystem.com`)
- USWDS (`designsystem.digital.gov/components/radio-buttons`)
- VA.gov Design System (`design.va.gov/components/form/radio-button`)
- GitLab Pajamas (`design.gitlab.com/components/radio-button`)
- MUI (`mui.com/material-ui/react-radio-button`)
- Angular Material (`material.angular.dev/components/radio`)
- shadcn/ui (`ui.shadcn.com/docs/components/radix/radio-group`)
