---
sidebar_position: 1
title: Installation
---

# Installation

## NPM

```bash
# Core package (base classes, icons, utilities)
npm install @civui/core

# Form components
npm install @civui/inputs @civui/controls @civui/compound @civui/form-patterns

# Action components (button, link, action-button, link-card, button-group)
npm install @civui/actions

# Overlay components (modal, action-sheet)
npm install @civui/overlays

# Layout components (card, divider, input-group, page-header, tag)
npm install @civui/layout

# Navigation components (task list, skip link)
npm install @civui/navigation

# Feedback components (alert, progress bar)
npm install @civui/feedback
```

## Usage in HTML

```html
<script type="module">
  import '@civui/core';
  import '@civui/inputs';
import '@civui/controls';
import '@civui/compound';
import '@civui/form-patterns';
  import '@civui/actions';
  import '@civui/overlays';
  import '@civui/layout';
</script>

<civ-text-input
  label="Full name"
  name="name"
  required
  required-message="Enter your full name"
></civ-text-input>
```

## Usage in React

CivUI web components work in React as custom elements:

```tsx
import '@civui/core';
import '@civui/inputs';
import '@civui/controls';
import '@civui/compound';
import '@civui/form-patterns';
import '@civui/actions';
import '@civui/overlays';
import '@civui/layout';

function MyForm() {
  return (
    <civ-form>
      <civ-text-input label="Email" name="email" type="email" required />
      <civ-button label="Submit" type="submit" />
    </civ-form>
  );
}
```

## Build Order

Packages must be built in dependency order:

```
tokens → core → forms, actions, overlays, layout, feedback, navigation
```

```bash
pnpm build    # Builds all packages in order
pnpm test     # Runs all tests
pnpm storybook  # Dev server on port 6006
```

## Design Tokens

CivUI uses W3C DTCG design tokens. Import the CSS custom properties:

```css
@import '@civui/tokens/css';
```

Or use the Tailwind preset:

```js
// tailwind.config.js
import civuiPreset from '@civui/tokens/tailwind';

export default {
  presets: [civuiPreset],
  prefix: 'civ-',
  // ...
};
```
