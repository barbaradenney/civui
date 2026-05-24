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
npm install @civui/inputs @civui/inputs @civui/compound @civui/form-patterns

# Action components (button, link, action-button, link-card, button-group, filter-chip, skip-link, confirm-button, toggle-button)
npm install @civui/actions

# Navigation surfaces (breadcrumb, nav, side-nav, tabs, tab-nav, on-this-page, back-to-top)
npm install @civui/navigation

# Overlay components (modal, action-sheet)
npm install @civui/overlays

# Layout components (card, divider, input-group, page-header, tag)
npm install @civui/layout

# Feedback components (alert, badge, count, spinner, skeleton)
npm install @civui/feedback
```

## Usage in HTML

```html
<script type="module">
  import '@civui/core';
  import '@civui/inputs';
import '@civui/inputs';
import '@civui/compound';
import '@civui/form-patterns';
  import '@civui/actions';
  import '@civui/navigation';
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
import '@civui/inputs';
import '@civui/compound';
import '@civui/form-patterns';
import '@civui/actions';
import '@civui/navigation';
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

## Usage in Drupal

CivUI provides a Drupal module with 71 Single Directory Components (SDC) for Drupal 10.3+ and Drupal 11.

### Setup

1. Copy `packages/drupal/civui/` into your Drupal `modules/custom/` folder
2. Build the CivUI assets and place them in the module:
   ```bash
   pnpm build
   ```
3. Enable the module:
   ```bash
   drush en civui
   ```

### Usage in Twig

```twig
{% include 'civui:form-field' with {
  label: 'Full name',
  required: true,
} %}
  {% block default %}
    {% include 'civui:text-input' with {
      name: 'name',
      required: true,
    } %}
  {% endblock %}
{% endinclude %}

{% include 'civui:button' with {
  label: 'Submit',
  type: 'submit',
} %}
```

All 69 web components are available as SDCs using the `civui:` namespace. See the [Native Platforms](/foundations/native-platforms) page for full details.

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
