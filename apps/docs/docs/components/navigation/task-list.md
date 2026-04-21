---
title: Task List
sidebar_position: 3
sidebar_label: Task List
---

# civ-task-list

A multi-chapter form hub pattern based on the GDS Task List, adapted for government benefit applications. Composed of three components: `civ-task-list`, `civ-task-group`, and `civ-task`.

## Components

### civ-task-list

Container for task groups. Renders a semantic list.

### civ-task-group

A group of related tasks with a heading. Use `data-task-group-heading` on the heading element.

### civ-task

An individual task row with label, optional hint, status tag, and optional navigation link.

## civ-task Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `''` | Task name |
| `hint` | `string` | `''` | Optional hint text below the label |
| `href` | `string` | `''` | Navigation target (omit for locked tasks) |
| `status` | `TaskStatus` | `'not-started'` | Current task status |

## Status values

| Status | Tag Label | Tag Color | Behavior |
|--------|-----------|-----------|----------|
| `not-started` | Not started | blue | Navigable link |
| `in-progress` | In progress | teal | Navigable link |
| `complete` | Complete | green (primary) | Navigable link |
| `cannot-start` | Cannot start yet | gray | Not navigable (no link) |
| `error` | Error | red | Navigable danger link |

## Sequential unlocking pattern

Tasks with `status="cannot-start"` render without a link and display a gray "Cannot start yet" tag. Update the status to `not-started` when prerequisite tasks are complete to unlock navigation.

## Examples

### Basic task list

```html
<civ-task-list>
  <civ-task-group>
    <h3 data-task-group-heading class="civ-heading-md">Personal details</h3>
    <civ-task label="Your name" href="/name" status="complete"></civ-task>
    <civ-task label="Date of birth" href="/dob" status="complete"></civ-task>
    <civ-task label="Your address" href="/address" status="in-progress"></civ-task>
  </civ-task-group>
  <civ-task-group>
    <h3 data-task-group-heading class="civ-heading-md">Service history</h3>
    <civ-task label="Periods of service" href="/service" status="not-started"></civ-task>
    <civ-task label="Upload DD-214" href="/upload" status="cannot-start"></civ-task>
  </civ-task-group>
</civ-task-list>
```

### Task with hint text

```html
<civ-task
  label="Contact information"
  hint="Phone number and email address"
  href="/contact"
  status="in-progress"
></civ-task>
```

### Error state

```html
<civ-task
  label="Income verification"
  hint="Documents failed validation"
  href="/income"
  status="error"
></civ-task>
```

## Live Examples

### Default

<iframe
  src="/civui/storybook/iframe.html?id=navigation-task-list--default&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### All Statuses

<iframe
  src="/civui/storybook/iframe.html?id=navigation-task-list--all-statuses&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Sequential Unlocking

<iframe
  src="/civui/storybook/iframe.html?id=navigation-task-list--sequential-unlocking&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### All Sections Complete

<iframe
  src="/civui/storybook/iframe.html?id=navigation-task-list--all-complete&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### All States

<iframe
  src="/civui/storybook/iframe.html?id=navigation-task-list--all-states&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Density Scale

<iframe
  src="/civui/storybook/iframe.html?id=navigation-task-list--density-scale&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Usage: VA Disability Application Hub

<iframe
  src="/civui/storybook/iframe.html?id=navigation-task-list--government-disability-application&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

[Open in Storybook →](/civui/storybook/?path=/story/navigation-task-list--default)
