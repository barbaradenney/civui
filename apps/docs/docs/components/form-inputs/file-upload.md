---
title: File Upload
sidebar_position: 11
sidebar_label: File Upload
---

# civ-file-upload

File input with drag-and-drop, file list preview, size and type validation, upload progress tracking, and remove capability. Uses ElementInternals for form participation.

## Shared Props

All form components share these props: `label`, `name`, `value`, `hint`, `error`, `required`, `disabled`.

## Component-Specific Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `accept` | `string` | `''` | Accepted file types (e.g., `'.pdf,.jpg,image/*'`) |
| `multiple` | `boolean` | `false` | Allow multiple files |
| `max-size` | `number` | `0` | Maximum file size in bytes per file (0 = unlimited) |
| `max-files` | `number` | `0` | Maximum number of files (0 = unlimited) |
| `variant` | `'default' \| 'compact' \| 'full'` | `'default'` | Upload zone display variant |
| `show-preview` | `boolean` | `false` | Show image thumbnail previews in file list |

### Variant Descriptions

- **`default`**: Medium dropzone with icon, text, and browse button
- **`compact`**: Inline text field showing file names with a browse button (no drag zone)
- **`full`**: Large dropzone filling available space

### Customization Labels

| Prop | Description |
|------|-------------|
| `drag-text` | Dropzone instruction text |
| `browse-text` | Browse button label |
| `accepted-label` | Prefix for accepted types display |
| `max-size-label` | Prefix for max size display |
| `remove-text` | Remove button text |
| `remove-aria-label` | Remove button aria-label (supports `{name}` interpolation) |

## Upload Progress API

The component supports tracking upload progress via JavaScript:

```js
const upload = document.querySelector('civ-file-upload');

// Set file status
upload.setFileStatus(0, 'uploading', { progress: 50 });
upload.setFileStatus(0, 'success');
upload.setFileStatus(0, 'error', { error: 'Network timeout' });

// Get abort controller for cancellation
const controller = upload.getAbortController(0);
```

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `civ-input` | `{ files: File[] }` | Fires when files change |
| `civ-change` | `{ files: File[] }` | Fires when files are added or removed |
| `civ-upload-cancel` | `{ index: number, name: string }` | Fires when upload is cancelled |
| `civ-upload-retry` | `{ index: number, name: string, file: File }` | Fires when upload is retried |

## Examples

```html
<!-- Single file upload -->
<civ-file-upload
  label="Upload your DD214"
  name="dd214"
  accept=".pdf,.jpg,.png"
  max-size="10485760"
  hint="Upload a PDF or image of your DD214. Maximum file size: 10 MB."
  required
></civ-file-upload>

<!-- Multiple files with preview -->
<civ-file-upload
  label="Supporting documents"
  name="documents"
  accept=".pdf,.jpg,.png,.doc,.docx"
  multiple
  max-files="5"
  max-size="20971520"
  show-preview
></civ-file-upload>

<!-- Compact variant -->
<civ-file-upload
  label="Profile photo"
  name="photo"
  accept="image/*"
  variant="compact"
  max-size="5242880"
></civ-file-upload>
```

## Live Examples

### document

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-file-upload--default&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Hint

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-file-upload--with-hint&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Error

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-file-upload--with-error&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Required

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-file-upload--required&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Disabled

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-file-upload--disabled&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### All States

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-file-upload--all-states&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Density Scale

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-file-upload--density-scale&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Multiple Files

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-file-upload--multiple-files&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Image Preview

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-file-upload--image-preview&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Compact Variant

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-file-upload--compact-variant&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Full Variant

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-file-upload--full-variant&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### All Variants

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-file-upload--all-variants&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Upload Simulation

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-file-upload--upload-simulation&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Usage: Document Submission

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-file-upload--government-document-submission&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

[Open in Storybook →](/civui/storybook/?path=/story/forms-inputs-file-upload--default)
