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
npm install @civui/forms

# UI components (button, link, tag, card, etc.)
npm install @civui/ui

# Navigation components (task list, skip link)
npm install @civui/navigation

# Feedback components (alert, progress bar)
npm install @civui/feedback
```

## Usage in HTML

```html
<script type="module">
  import '@civui/core';
  import '@civui/forms';
  import '@civui/ui';
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
import '@civui/forms';
import '@civui/ui';

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
tokens → core → forms, ui, feedback, navigation
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
