---
title: Address
sidebar_position: 2
sidebar_label: Address
---

# civ-address

Structured address input with street, city, state, and ZIP fields. Supports US domestic addresses, military addresses (AA/AE/AP), and international addresses with country selection.

## Shared Props

All form components share these props: `name`, `value`, `hint`, `error`, `required`, `disabled`.

## Component-Specific Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `legend` | `string` | `''` | Fieldset legend text |
| `show-country` | `boolean` | `false` | Show country selector (enables international addresses) |
| `show-military` | `boolean` | `false` | Show military address checkbox |
| `show-street2` | `boolean` | `true` | Show Street address line 2 |
| `show-street3` | `boolean` | `false` | Show Street address line 3 |
| `street-error` | `string` | `''` | Error for street address field |
| `city-error` | `string` | `''` | Error for city field |
| `state-error` | `string` | `''` | Error for state field |
| `zip-error` | `string` | `''` | Error for ZIP code field |

## Value Structure

The component stores its value as a JSON string:

```typescript
interface AddressValue {
  country: string;   // 'US', 'CA', 'MX'
  street1: string;
  street2: string;
  street3: string;
  city: string;
  state: string;     // 2-letter state/territory code
  zip: string;
  military: boolean;
}
```

## Form Data

The component submits as separate fields:
- `{name}.country`
- `{name}.street1`
- `{name}.street2`
- `{name}.street3`
- `{name}.city`
- `{name}.state`
- `{name}.zip`
- `{name}.military`

## Military Address Mode

When the military checkbox is checked:
- Country is locked to US
- State dropdown shows military options: AA (Americas), AE (Europe), AP (Pacific)
- Country selector is hidden

## State Field Behavior

- For US addresses: renders a `<select>` with all 50 states + territories
- For military: renders a `<select>` with AA/AE/AP
- For international: renders a text input for state/province

## Sub-field Autocomplete

Fields automatically set appropriate `autocomplete` values:
- Street: `address-line1`, `address-line2`, `address-line3`
- City: `address-level2`
- State: `address-level1`
- ZIP: `postal-code`
- Country: `country`

## Programmatic API

```js
const addr = document.querySelector('civ-address');
addr.addressValue;  // { country: 'US', street1: '123 Main St', ... }
addr.isEmpty();     // true if no fields are filled
```

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `civ-input` | `{ value: AddressValue }` | Fires on every field change |
| `civ-change` | `{ value: AddressValue }` | Fires on committed field change |

## Examples

```html
<!-- Basic US address -->
<civ-address
  legend="Mailing address"
  name="mailing"
  required
></civ-address>

<!-- With military option -->
<civ-address
  legend="Current address"
  name="currentAddress"
  show-military
  required
></civ-address>

<!-- International with all lines -->
<civ-address
  legend="Overseas address"
  name="overseas"
  show-country
  show-street3
></civ-address>

<!-- Minimal (no street2) -->
<civ-address
  legend="Home address"
  name="home"
  show-street2="false"
  required
></civ-address>
```


## Live Example

<iframe
  src="/civui/storybook/iframe.html?id=forms-compound-address--default&viewMode=story"
  width="100%"
  height="300"
  style={{border: '1px solid #dfe1e2', borderRadius: '6px'}}
></iframe>

[Open in Storybook →](/civui/storybook/?path=/story/forms-compound-address--default)
