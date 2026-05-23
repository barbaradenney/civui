---
title: Internationalization
sidebar_position: 12
sidebar_label: i18n
---

import StoryEmbed from "@site/src/components/StoryEmbed";

# Internationalization (i18n)

CivUI ships with 580+ translatable locale strings covering every component's labels, hints, error messages, and screen reader announcements. Override any string with a single function call.

## Quick setup

```js
import { setLocaleStrings } from '@civui/core';

setLocaleStrings({
  required: '(obligatorio)',
  selectEmpty: '- Seleccionar -',
  formErrorSingular: 'Hay {count} error en este formulario',
  formErrorPlural: 'Hay {count} errores en este formulario',
  validateRequired: '{label} es obligatorio',
  validateEmail: 'Introduzca una dirección de correo válida',
});
```

That's it. All components reading via `t()` immediately pick up the new strings.

## API

| Function | Description |
|----------|-------------|
| `setLocaleStrings(partial)` | Merge custom translations into the active locale. Only override what you need. Unset keys fall back to English. |
| `t(key)` | Get the current translated string for a key. Used internally by all components. |
| `getLocaleStrings()` | Returns all current locale strings (for inspection/debugging). |
| `resetLocaleStrings()` | Reset to the default English strings. |

## Partial overrides

You only need to provide the strings you want to change. Everything else stays English (or whatever was previously set):

```js
// Only override two strings — the other 578+ stay English
setLocaleStrings({
  required: '(required field)',
  validateEmail: 'Please enter a valid email address',
});
```

## Component props always win

<StoryEmbed id="foundations-internationalization--component-props-beat-locale" />

Individual component props override locale strings. This lets you customize a specific instance without changing the global locale:

```html
<!-- Uses locale string for label -->
<civ-phone name="phone"></civ-phone>

<!-- This label overrides whatever the locale says -->
<civ-phone name="phone" label="Daytime phone number"></civ-phone>
```

## String categories

The locale system covers these categories:

| Category | Examples | Count |
|----------|----------|-------|
| General | `required` | 1 |
| Form validation | `formErrorSingular`, `fieldRequired`, `fieldInvalid` | 5 |
| Validators | `validateRequired`, `validateEmail`, `validatePhone`, ... | 20 |
| Mask hints/errors | `maskSsnHint`, `maskPhoneUsError`, ... | 16 |
| Select & Combobox | `selectEmpty`, `comboboxNoResults`, `comboboxLoading`, ... | 10 |
| File upload | `fileUploadDragText`, `fileUploadBrowseText`, `fileUploadFileSizeError`, ... | 25 |
| Date picker | `datePickerPlaceholder`, `datePickerChooseDateLabel`, ... | 16 |
| Memorable date | `memorableDateMonthLabel`, `memorableDateDayLabel`, ... | 8 |
| Alert | `alertDismissLabel`, `alertLabelInfo`, `alertLabelWarning`, ... | 6 |
| Name fields | `nameFirst`, `nameMiddle`, `nameLast`, `nameSuffix` | 7 |
| Address fields | `addressStreet1`, `addressCity`, `addressState`, ... | 11 |
| Direct deposit | `directDepositRouting`, `directDepositAccount`, ... | 7 |
| Signature | `signatureName`, `signatureCertify` | 3 |
| Form step wizard | `formStepBack`, `formStepContinue`, `formStepPauseLabel`, ... | 6 |
| Repeater | `repeaterAddButton`, `repeaterRemoveButton`, ... | 14 |
| Select presets | Service branches, discharge types, states, relationships, ... | 150+ |
| Sensitive patterns | `preferNotToAnswer`, `supportResourcesHeading`, ... | 3 |

## Locale-aware dates

Date components accept a `locale` prop for formatting month names and date display:

```html
<civ-date-picker locale="fr-FR"></civ-date-picker>
<civ-memorable-date locale="es-ES"></civ-memorable-date>
```

Internally, dates use `Intl.DateTimeFormat` with the specified locale for month names and formatted output.

<StoryEmbed id="foundations-internationalization--locale-aware-dates" />

## RTL support

CivUI supports right-to-left languages. Set `dir="rtl"` on a parent element or the `<html>` tag:

```html
<html dir="rtl" lang="ar">
```

### How it works

- All CSS uses **logical properties** (`margin-inline-start`, `padding-inline-end`, `border-inline-start`) instead of physical directions
- Arrow key navigation in radio groups, segmented controls, and date pickers automatically reverses
- Toggle thumb positioning uses `inset-inline-start`
- The `isRtl(el)` utility function from `@civui/core` detects RTL context via computed style

No additional configuration is needed beyond setting the `dir` attribute.

<StoryEmbed id="foundations-internationalization--rtl-mirror" />

### Logical property utilities

<StoryEmbed id="foundations-internationalization--logical-properties-demo" />

## Interpolation

Some locale strings contain `{placeholder}` tokens that are filled at runtime:

```js
// In the locale strings:
// validateRequired: '{label} is required'
// formErrorPlural: 'There are {count} errors in this form'

// These are interpolated automatically by the component:
// "Full name is required"
// "There are 3 errors in this form"
```

Use `interpolate(template, values)` from `@civui/core` if you need this in custom code.
