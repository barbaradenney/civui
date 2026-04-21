---
title: Navigation
sidebar_position: 2
sidebar_label: Navigation
---

# Navigation Components

## civ-link

A styled anchor element with multiple variants for different navigation contexts.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string` | — | Destination URL |
| `label` | `string` | — | Link text |
| `variant` | `string` | `"primary"` | Visual style: `primary`, `secondary`, `tertiary`, `back` |
| `danger` | `boolean` | `false` | Applies destructive/danger styling |
| `disabled` | `boolean` | `false` | Disables the link |

### Variants

- **primary** — Standard link with underline
- **secondary** — Subdued color, underline on hover
- **tertiary** — Minimal styling, no underline until hover
- **back** — Left arrow prefix for "go back" navigation
- **danger** (modifier) — Red color indicating destructive navigation

### Example

```html
<civ-link href="/dashboard" label="Return to dashboard" variant="primary"></civ-link>

<civ-link href="/previous-step" label="Back" variant="back"></civ-link>

<civ-link href="/delete-account" label="Delete my account" variant="primary" danger></civ-link>
```

---

## civ-link-card

A card-style navigation link with heading and description, used for service or category navigation.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string` | — | Destination URL |
| `heading` | `string` | — | Card title |
| `description` | `string` | — | Supporting description text |
| `variant` | `string` | `"primary"` | Visual style: `primary`, `secondary`, `tertiary`, `critical` |

### Example

```html
<civ-link-card
  href="/benefits/apply"
  heading="Apply for benefits"
  description="Start a new application for disability compensation."
  variant="primary">
</civ-link-card>

<civ-link-card
  href="/account/close"
  heading="Close your account"
  description="Permanently delete your account and all data."
  variant="critical">
</civ-link-card>
```

---

## civ-task-list / civ-task-group / civ-task

A task list pattern for multi-section workflows (e.g., application checklists). Users can complete tasks in any order within groups.

### Structure

```
civ-task-list
  └── civ-task-group (one per section)
       └── civ-task (one per task)
```

### civ-task Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Task name |
| `hint` | `string` | — | Supporting description |
| `href` | `string` | — | Link to the task page |
| `status` | `string` | `"not-started"` | Current completion state |

### Status Values

| Status | Description |
|--------|-------------|
| `not-started` | Task has not been opened |
| `in-progress` | Task started but not complete |
| `complete` | Task finished successfully |
| `cannot-start` | Blocked by prerequisite tasks |

### Example

```html
<civ-task-list>
  <civ-task-group label="Personal details">
    <civ-task
      label="Your name"
      href="/form/name"
      status="complete">
    </civ-task>
    <civ-task
      label="Date of birth"
      hint="As shown on your birth certificate"
      href="/form/dob"
      status="in-progress">
    </civ-task>
  </civ-task-group>

  <civ-task-group label="Documents">
    <civ-task
      label="Upload identification"
      href="/form/id"
      status="not-started">
    </civ-task>
  </civ-task-group>
</civ-task-list>
```
