# CivUI for Drupal

Drupal module that exposes CivUI web components as [Single Directory Components (SDC)](https://www.drupal.org/docs/develop/theming-drupal/using-single-directory-components).

## Requirements

- Drupal 10.3+ or Drupal 11
- CivUI JS/CSS assets (built from the monorepo)

## Installation

1. Copy the `civui/` module directory into your Drupal site's `modules/custom/` folder
2. Build the CivUI assets and place them in the module:
   ```bash
   # From the CivUI monorepo root
   pnpm build
   cp packages/tokens/dist/css/tokens.css packages/drupal/civui/css/civui.css
   # Bundle the JS (use your bundler of choice)
   ```
3. Enable the module: `drush en civui`

## Usage

Use CivUI components in any Twig template:

```twig
{# Text input with form field wrapper #}
{% include 'civui:form-field' with {
  label: 'Email address',
  hint: 'We will use this to contact you',
  required: true,
} %}
  {% block default %}
    {% include 'civui:text-input' with {
      name: 'email',
      type: 'email',
      autocomplete: 'email',
      required: true,
    } %}
  {% endblock %}
{% endinclude %}

{# Button #}
{% include 'civui:button' with {
  label: 'Submit application',
  type: 'submit',
} %}

{# Alert #}
{% include 'civui:alert' with {
  variant: 'success',
  heading: 'Application received',
} %}
  {% block default %}
    Your application was submitted on {{ date }}.
  {% endblock %}
{% endinclude %}

{# Modal #}
{% include 'civui:modal' with {
  heading: 'Confirm submission',
  heading_level: 3,
} %}
  {% block default %}
    <p>Are you sure you want to submit?</p>
    {% include 'civui:button' with { label: 'Submit', type: 'submit' } %}
    {% include 'civui:button' with { label: 'Cancel', variant: 'secondary' } %}
  {% endblock %}
{% endinclude %}
```

## Available Components

### Inputs
- `civui:text-input` — Text, email, number, password, tel, URL
- `civui:textarea` — Multi-line text
- `civui:select` — Dropdown select with presets
- `civui:date-picker` — Calendar date picker
- `civui:file-upload` — File upload with drag-and-drop

### Controls
- `civui:checkbox` — Single checkbox
- `civui:radio` — Radio button
- `civui:toggle` — Toggle switch

### Actions
- `civui:button` — Button (primary, secondary, tertiary)
- `civui:link` — Link with variants and new-tab support

### Feedback
- `civui:alert` — Info, warning, error, success messages

### Form Patterns
- `civui:form-field` — Label/hint/error wrapper for inputs
- `civui:form-fieldset` — Legend/hint/error wrapper for groups
- `civui:form` — Form container with validation

### Overlays
- `civui:modal` — Dialog with heading and close button

## Customization

Themes can override any component by creating a matching SDC with the `replaces` key:

```yaml
# In your theme's components/text-input/text-input.component.yml
replaces: civui:text-input
```

## Accessibility

All components follow Section 508 and WCAG 2.1 AA guidelines. The web components handle ARIA attributes, focus management, and screen reader announcements automatically.
