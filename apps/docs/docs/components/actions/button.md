---
title: Button
sidebar_position: 1
sidebar_label: Button
---

# civ-button

An accessible button component that always renders a `<button>` element. For links, use `<civ-link>` instead.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `''` | Button text (preferred over child text) |
| `variant` | `'primary' \| 'secondary' \| 'tertiary'` | `'primary'` | Visual variant |
| `danger` | `boolean` | `false` | Destructive action styling |
| `disabled` | `boolean` | `false` | Disabled state |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type attribute |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `civ-analytics` | — | Analytics tracking event fired on click |

## Variants

### Primary

Filled blue button for the main action on a page.

```html
<civ-button label="Submit application"></civ-button>
```

### Secondary

Outlined border button for secondary actions.

```html
<civ-button variant="secondary" label="Save draft"></civ-button>
```

### Tertiary

Gray filled button sized to match form input height. Use for inline actions next to form fields.

```html
<civ-button variant="tertiary" label="Add another"></civ-button>
```

## Danger modifier

Add `danger` to any variant for destructive action styling.

```html
<civ-button danger label="Delete application"></civ-button>
<civ-button variant="secondary" danger label="Remove file"></civ-button>
```

## Submit button

```html
<civ-button type="submit" label="Submit form"></civ-button>
```

## Disabled state

```html
<civ-button disabled label="Processing..."></civ-button>
```


## Live Example

<iframe
  src="/civui/storybook/iframe.html?id=ui-button--default&viewMode=story"
  width="100%"
  height="300"
  style={{border: '1px solid #dfe1e2', borderRadius: '6px'}}
></iframe>

[Open in Storybook →](/civui/storybook/?path=/story/ui-button--default)
