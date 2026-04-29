---
title: Print Styles
sidebar_position: 15
sidebar_label: Print
---

# Print Styles

CivUI includes print-specific CSS rules that clean up form rendering for paper output. Government forms are frequently printed for records, mailing, or offline review — the print styles ensure forms look professional without interactive UI clutter.

## What gets hidden

Interactive elements that don't make sense on paper are hidden automatically:

| Hidden element | Why |
|----------------|-----|
| Buttons (`civ-button`, `civ-action-button`) | Can't click on paper |
| File upload dropzones (`.civ-dropzone`) | Can't drag files onto paper |
| Combobox chevrons and clear buttons | Interactive controls |
| Toggle tracks (`.civ-toggle-track`) | Replaced by text state |
| Modals and action sheets | Overlays don't apply |
| Skip links | Keyboard navigation only |
| Progress bar tracks | Visual-only indicator |

## What gets cleaned up

| Element | Print treatment |
|---------|----------------|
| Input borders | Simplified to `1px solid black` |
| Box shadows | Removed |
| Input backgrounds | Removed (transparent) |
| Labels and legends | Set to `10pt` |
| Hint text | Set to `9pt`, color `#333` |
| Form fields | `break-inside: avoid` prevents mid-field page breaks |

## Checkbox and radio state

Checkbox and radio states are preserved in print — checked items render their visual indicators so reviewers can see what was selected.

## Page break control

Form field containers use `break-inside: avoid` to prevent a label from appearing at the bottom of one page with its input at the top of the next.

## Testing print output

1. **Chrome:** Ctrl/Cmd+P to open print preview
2. **Chrome DevTools:** More tools > Rendering > Emulate CSS media type: `print`
3. **Firefox:** File > Print Preview

## Customizing print styles

If you need to hide additional elements in print, use the standard CSS approach:

```css
@media print {
  .my-custom-toolbar {
    display: none !important;
  }
}
```
