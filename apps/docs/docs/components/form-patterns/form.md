---
title: Form
sidebar_position: 2
sidebar_label: Form
---

# civ-form

Validation coordinator with accessible error summary. Validates child CivUI form elements on submit, renders an error summary with anchor links to each invalid field, and optionally persists form data to `sessionStorage`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `action` | `string` | `''` | Form action URL (for reference; submission is via events) |
| `method` | `'get' \| 'post'` | `'post'` | Form method (for reference) |
| `form-label` | `string` | `''` | Accessible label for the form (sets `aria-label`) |
| `persist` | `string` | `''` | Storage key for auto-saving to sessionStorage |
| `prefill` | `boolean` | `false` | Pre-fill fields from URL query parameters |
| `track-dirty` | `boolean` | `false` | Track whether any field has been modified |
| `error-heading-level` | `3 \| 4 \| 5 \| 6` | `3` | Heading level for the error summary |

## Persistence

When `persist` is set:
- Form data is auto-saved to `sessionStorage` on every field change (debounced 500ms)
- Data is restored on page reload
- Data is cleared on successful submit
- Fields with `data-civ-pii` (SSN/EIN masks) are automatically excluded
- Fields with `data-persist-exclude` are excluded

## Error Summary

On validation failure, an error summary is rendered at the top of the form with:
- A heading: "There is a problem" (1 error) or "There are N problems" (multiple)
- Anchor links to each invalid field
- `role="alert"` for screen reader announcement
- Focus is moved to the summary automatically

## Dirty Tracking

When `track-dirty` is enabled:
- The form tracks initial values of all fields after first render
- `civ-dirty` events fire when dirty state changes
- `beforeunload` warning is shown if the user tries to leave with unsaved changes

## Programmatic API

```js
const form = document.querySelector('civ-form');

form.validate();         // Returns array of errors, sets error on fields
form.clearErrors();      // Clear all field errors and error summary
form.reset();            // Reset all fields to initial values
form.getFormData();      // Returns Record<string, string>
form.toFormData();       // Returns FormData with files and multi-values
form.dirty;             // Whether any field has been modified
```

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `civ-submit` | `{ formData: FormData }` | Fires when validation passes |
| `civ-invalid` | `{ errors: FormFieldError[] }` | Fires when validation fails |
| `civ-dirty` | `{ dirty: boolean }` | Fires when dirty state changes |

## Submission

Submit is triggered by:
- Clicking a `<button type="submit">` (or button with no type) inside the form
- Pressing Enter in a form field

Native form submission is prevented. Handle the `civ-submit` event to process the data.

## Examples

```html
<!-- Basic form with validation -->
<civ-form form-label="Benefits application" @civ-submit="${handleSubmit}">
  <civ-text-input label="First name" name="firstName" required></civ-text-input>
  <civ-text-input label="Last name" name="lastName" required></civ-text-input>
  <civ-text-input label="Email" name="email" type="email" validate="email" required></civ-text-input>
  <button type="submit">Submit</button>
</civ-form>

<!-- With persistence and dirty tracking -->
<civ-form
  persist="my-application"
  track-dirty
  @civ-submit="${handleSubmit}"
  @civ-dirty="${handleDirty}"
>
  <!-- fields -->
  <button type="submit">Submit application</button>
</civ-form>

<!-- With URL prefill -->
<civ-form prefill>
  <!-- Fields will be prefilled from ?firstName=Jane&lastName=Doe -->
  <civ-text-input label="First name" name="firstName"></civ-text-input>
  <civ-text-input label="Last name" name="lastName"></civ-text-input>
</civ-form>
```



## Live Examples

### Default

<iframe
  src="/civui/storybook/iframe.html?id=forms-layout-form--default&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Validation

<iframe
  src="/civui/storybook/iframe.html?id=forms-layout-form--with-validation&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Error Summary

<iframe
  src="/civui/storybook/iframe.html?id=forms-layout-form--error-summary&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Persist Draft

<iframe
  src="/civui/storybook/iframe.html?id=forms-layout-form--persist-draft&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Dirty Tracking

<iframe
  src="/civui/storybook/iframe.html?id=forms-layout-form--dirty-tracking&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Prefill

<iframe
  src="/civui/storybook/iframe.html?id=forms-layout-form--prefill&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

[Open in Storybook →](/civui/storybook/?path=/story/forms-layout-form--default)
