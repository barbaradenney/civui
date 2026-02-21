# Checkbox Web Component Research
## Modern Design System Trends & Best Practices (2025)

---

## 1. Core Component Properties (Cross-System Consensus)

After analyzing 10+ major design systems — including Shoelace/Web Awesome, Material Web, Radix, React Aria (Adobe Spectrum), Carbon (IBM), USWDS, VA.gov Design System, GitLab Pajamas, Duet, and Telerik — these are the properties that appear consistently across the most modern implementations:

### Universal Properties (Present in nearly every system)

| Property | Type | Description |
|----------|------|-------------|
| `checked` | `boolean` | Whether the checkbox is currently selected |
| `indeterminate` | `boolean` | Tri-state "mixed" state for parent-child group patterns |
| `disabled` | `boolean` | Prevents interaction, conveys inactive state to AT |
| `required` | `boolean` | Marks checkbox as required for form validation |
| `name` | `string` | Form submission identifier |
| `value` | `string` | Value submitted with the form when checked (defaults to `'on'`) |
| `label` | `string \| slot` | Visible text label (required for accessibility) |

### Widely Adopted Properties (Present in most modern systems)

| Property | Type | Description |
|----------|------|-------------|
| `defaultChecked` | `boolean` | Initial checked state for uncontrolled usage |
| `error` / `invalid` | `boolean` | Visual error state with error messaging |
| `error-message` | `string` | Validation error text shown when invalid |
| `help-text` / `hint` | `string \| slot` | Supplementary description below the label |
| `size` | `'small' \| 'medium' \| 'large'` | Controls visual scale of the checkbox |
| `readonly` | `boolean` | Visually checked but not toggleable; remains focusable (unlike disabled) |

### Growing Adoption Properties (Emerging across multiple systems)

| Property | Type | Description |
|----------|------|-------------|
| `label-position` | `'right' \| 'left'` | Position of label relative to the checkbox input |
| `description` | `string \| slot` | Secondary descriptive text (longer than hint-text) |
| `aria-describedby` | `string` | ID reference for screen reader description |
| `message-aria-describedby` | `string` | Custom screen reader announcement on focus |
| `form` | `string` | Associates checkbox with a form element by ID |

---

## 2. Checkbox Group Properties

Most systems also ship a `CheckboxGroup` wrapper component. Common group-level properties include:

| Property | Type | Description |
|----------|------|-------------|
| `label` / `legend` | `string` | Group heading (maps to `<legend>` in `<fieldset>`) |
| `orientation` | `'vertical' \| 'horizontal'` | Layout direction of checkboxes |
| `disabled` | `boolean` | Disables all child checkboxes |
| `required` | `boolean` | At least one selection required |
| `error` | `boolean` | Group-level error state |
| `error-message` | `string` | Group-level validation message |
| `value` / `defaultValue` | `string[]` | Controlled/uncontrolled selection state |
| `hint-text` | `string` | Group-level instructions (e.g., "Select all that apply") |

---

## 3. States to Support

The consensus across design systems includes these interactive and visual states:

**Selection states:** Unchecked, Checked, Indeterminate (mixed)

**Interactive states:** Default, Hover, Focus (visible focus ring), Active/Pressed, Disabled, Read-only

**Validation states:** Valid, Invalid/Error

**Combined states:** Every selection state × every interactive state should be accounted for (e.g., checked + disabled, indeterminate + hover, unchecked + error + focused)

---

## 4. Component Variants (Trending)

### Tile / Card Checkbox
Both USWDS and several other design systems now offer a **tile variant** — a larger card-style container around the checkbox with label and optional description. Key benefits:
- Larger touch/click target (especially for mobile)
- Supports a description slot for additional context per option
- Visually distinct selection states with border highlights

USWDS guidance: don't mix tile and default variants within the same group.

### Size Variants
Three sizes are the most common pattern: **small**, **medium** (default), and **large**. Shoelace, Telerik, Radix Themes, and Chakra all support this. Small is typically used inside compact components like data tables or tree views.

### AI Label Variant
Carbon (IBM) has introduced an **AI label** modification that shows an AI indicator and explainability popover when AI is involved in the selection — an emerging pattern worth watching.

---

## 5. Events

| Event | Description |
|-------|-------------|
| `change` | Fires when checked state changes (most common) |
| `input` | Fires on user input (before change completes) |
| `focus` | Checkbox receives focus |
| `blur` | Checkbox loses focus |
| `invalid` | Native constraint validation fails |

Shoelace uses prefixed events (`sl-change`, `sl-input`, `sl-blur`, `sl-focus`) to avoid collisions with native events. This is a common pattern in web component libraries.

---

## 6. Accessibility Requirements (WAI-ARIA Checkbox Pattern)

### Keyboard Interaction
- **Space** — Toggles checked/unchecked state
- **Tab / Shift+Tab** — Moves focus between checkboxes (each checkbox is a separate tab stop, unlike radio groups)

### ARIA Attributes
- `role="checkbox"` (implicit when using native `<input type="checkbox">`)
- `aria-checked="true | false | mixed"` — The `mixed` value corresponds to the indeterminate state
- `aria-label` or `aria-labelledby` — Required when no visible text label is associated
- `aria-describedby` — Links to hint text or error messages
- `aria-required="true"` — When the checkbox must be checked
- `aria-disabled="true"` — When disabled
- `aria-invalid="true"` — When in an error state

### Grouping
- Use `<fieldset>` + `<legend>` for checkbox groups (preferred semantic approach)
- Alternatively, `role="group"` with `aria-labelledby` on a container
- Don't use fieldset/legend for a standalone single checkbox

### Indeterminate State Considerations
Screen reader behavior for the indeterminate/mixed state varies significantly across assistive technologies:
- VoiceOver may announce "mixed," "partially selected," or just "selected"
- NVDA and JAWS have their own interpretations

**Best practice (from VA.gov):** Don't rely on the term "mixed" alone. Provide hint text explaining that the parent checkbox selects/deselects all options, and use semantic grouping so the parent-child relationship is clear.

---

## 7. Modern Web Component Architecture Recommendations

### Use the `formAssociated` API
The `ElementInternals` API (now supported in all major browsers) lets custom elements participate natively in forms. This is the modern replacement for the `formdata` event workaround. It enables:
- Native form validation
- `formResetCallback` and `formStateRestoreCallback`
- Proper `form`, `name`, and `value` semantics
- Works with `<label for="">` natively

### Build on Lit
Lit remains the leading foundation for web component libraries. Shoelace (now Web Awesome), Material Web, and many government design systems are built on Lit. Key advantages: reactive properties, declarative templates, and scoped styles with minimal overhead.

### Shadow DOM + CSS Custom Properties
The standard pattern is to encapsulate structure and base styles in shadow DOM, then expose theming via CSS custom properties (design tokens) and `::part()` selectors for deep customization.

### Expose CSS Parts
Allow consumers to style internal elements via the `::part()` pseudo-element:
- `base` — The root wrapper
- `control` — The checkbox input element
- `label` — The text label
- `checked-icon` — The checkmark indicator
- `indeterminate-icon` — The dash/minus indicator
- `help-text` — The description text

---

## 8. Design Token Recommendations for Checkbox

Based on Material Web and Shoelace patterns:

| Token Category | Example Tokens |
|---------------|----------------|
| Border | `--checkbox-outline-color`, `--checkbox-outline-width` |
| Selected | `--checkbox-selected-container-color`, `--checkbox-selected-icon-color` |
| Unselected | `--checkbox-unselected-outline-color` |
| Disabled | `--checkbox-disabled-opacity`, `--checkbox-disabled-outline-color` |
| Error | `--checkbox-error-outline-color`, `--checkbox-error-container-color` |
| Focus | `--checkbox-focus-ring-color`, `--checkbox-focus-ring-offset` |
| Size | `--checkbox-size`, `--checkbox-border-radius` |
| Spacing | `--checkbox-gap` (between control and label) |

---

## 9. Summary: Recommended Minimum Property Set

For a new, accessibility-first web component library, I'd recommend shipping with at minimum:

**Checkbox properties:** `checked`, `defaultChecked`, `indeterminate`, `disabled`, `required`, `readonly`, `name`, `value`, `size`, `error` (or `invalid`), `error-message`, `help-text`

**Slots:** `default` (label), `help-text`, `error-message`

**CheckboxGroup properties:** `label`, `orientation`, `disabled`, `required`, `error`, `error-message`, `hint-text`, `value`, `defaultValue`

**Events:** `change`, `input`, `focus`, `blur`

**Accessibility:** Native `<input type="checkbox">` under the hood, `formAssociated` via `ElementInternals`, full keyboard support, proper ARIA attribute management, fieldset/legend grouping

**Variants to consider for v1:** Default, Tile, and Size (small/medium/large)

---

## Sources Referenced

- WAI-ARIA Checkbox Pattern (W3C APG)
- Material Web (`material-web.dev`)
- Shoelace / Web Awesome (`shoelace.style`)
- Radix Primitives (`radix-ui.com`)
- React Aria / Adobe Spectrum (`react-spectrum.adobe.com`)
- Carbon Design System — IBM (`carbondesignsystem.com`)
- USWDS (`designsystem.digital.gov`)
- VA.gov Design System (`design.va.gov`)
- GitLab Pajamas (`design.gitlab.com`)
- Duet Design System (`duetds.com`)
- Telerik / Kendo UI Design System Kit (`telerik.com/design-system`)
