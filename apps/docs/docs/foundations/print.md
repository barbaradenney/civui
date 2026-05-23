---
title: Print Styles
sidebar_position: 15
sidebar_label: Print
---

import StoryEmbed from "@site/src/components/StoryEmbed";

# Print Styles

CivUI includes print-specific CSS rules that clean up form rendering for paper output. Government forms are frequently printed for records, mailing, or offline review. The print styles ensure forms look professional without interactive UI clutter.

## Complete form — paper filing preview

The stories below simulate what each component looks like when printed (interactive UI hidden, borders simplified, hint text shrunken). To see the real thing, open browser print preview on any CivUI page.

<StoryEmbed id="foundations-print-preview--complete-form" />

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

Checkbox and radio states are preserved in print. Checked items render their visual indicators so reviewers can see what was selected.

## Page break control

Form field containers use `break-inside: avoid` to prevent a label from appearing at the bottom of one page with its input at the top of the next.

## Per-component previews

### Text inputs

<StoryEmbed id="foundations-print-preview--text-inputs" />

### Textarea and select

<StoryEmbed id="foundations-print-preview--textarea-and-select" />

### Checkboxes and radios

<StoryEmbed id="foundations-print-preview--selection-controls" />

### Date fields

<StoryEmbed id="foundations-print-preview--date-fields" />

### Compound fields (name, address)

<StoryEmbed id="foundations-print-preview--compound-fields" />

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
