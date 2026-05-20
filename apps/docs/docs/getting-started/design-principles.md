---
sidebar_position: 3
title: Design Principles
---

# Design Principles

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

## One Thing Per Page

Government forms follow the "one thing per page" pattern:
- Each page asks one question or a small related group
- Reduces cognitive load. Users focus on one decision at a time
- Better error handling. Errors caught immediately
- Mobile-friendly. No scrolling through walls of fields
- Screen reader friendly. Clear focus management

## Border Radius Signals Interactivity

Only clickable elements get rounded corners. Buttons, inputs, tiles. Static containers like alerts and cards use sharp edges. This visual convention helps users identify interactive elements at a glance.

## Underlines Signal Navigation

Text is only underlined when it navigates somewhere. Links get underlines; action buttons do not. This preserves the semantic distinction between navigation and action.

## Required Indicator Logic

- If **all fields** in a fieldset are required → show "(required)" on the legend, hide on individual fields
- If **some fields** are optional → show "(required)" on each required field individually
- Components use `hide-required-indicator` to suppress the visual text while keeping validation active

## CSS Over JavaScript

Visual states are handled with CSS:
- Error borders via `[aria-invalid]`
- Disabled opacity via `:disabled`
- Selection highlights via `:has(:checked)`
- Icons rendered as inline SVG paths. Zero external requests

## Every Byte Is Earned

- 14 inline SVG icons from Material Icons Outlined (no icon fonts, no external requests). Full Material Symbols font available as opt-in
- No CSS-in-JS (static Tailwind)
- No hidden input hacks (ElementInternals)
- Lit (~16K gzipped) is the only runtime dependency
- System font stack. Zero font downloads
