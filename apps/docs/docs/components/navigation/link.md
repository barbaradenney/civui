---
title: Link
sidebar_position: 1
sidebar_label: Link
---

# civ-link

An accessible link component that always renders an `<a>` element. For buttons, use `<civ-button>` instead. All variants are underlined for accessibility.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `''` | Link text (preferred over child text) |
| `href` | `string` | `''` | Link destination (required) |
| `variant` | `'primary' \| 'secondary' \| 'tertiary' \| 'back'` | `'tertiary'` | Visual variant |
| `danger` | `boolean` | `false` | Destructive action styling (red text) |
| `disabled` | `boolean` | `false` | Disabled state (sets `aria-disabled` and removes href) |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `civ-analytics` | — | Analytics tracking event fired on click |

## Variants

### Primary

Button-styled link with filled blue background and underlined text.

```html
<civ-link href="/apply" variant="primary" label="Start application"></civ-link>
```

### Secondary

Underlined text link with a trailing chevron-right icon.

```html
<civ-link href="/benefits" variant="secondary" label="View all benefits"></civ-link>
```

### Tertiary

Plain underlined link (default variant).

```html
<civ-link href="/privacy" label="Privacy policy"></civ-link>
```

### Back

Back-navigation link with a leading chevron-left icon.

```html
<civ-link href="/previous-step" variant="back" label="Go back"></civ-link>
```

## Danger modifier

Add `danger` to any variant for destructive action styling.

```html
<civ-link href="/delete" variant="secondary" danger label="Remove application"></civ-link>
```

## Disabled state

```html
<civ-link href="/locked" variant="secondary" disabled label="Locked section"></civ-link>
```


## Live Example

<iframe
  src="/civui/storybook/iframe.html?id=ui-link--default&viewMode=story"
  width="100%"
  height="300"
  style={{border: '1px solid #dfe1e2', borderRadius: '6px'}}
></iframe>

[Open in Storybook →](/civui/storybook/?path=/story/ui-link--default)
