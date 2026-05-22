---
title: Destructive Actions
sidebar_label: Destructive actions
---

import StoryEmbed from "@site/src/components/StoryEmbed";

# Destructive Actions in CivUI

When an action **destroys user data or persistent state**, CivUI confirms
via a `civ-modal`. Never via an inline pattern (two-click confirm,
hold-to-delete, swipe-to-delete). This rule exists for accessibility:
inline patterns interact badly with screen readers, motor impairments,
cognitive load, and mobile-SR gestures.

## Live example — remove a dependent

<StoryEmbed id="foundations-destructive-actions--confirm-remove" />

## What counts as "destructive"

| Action | Destructive? | Needs confirmation? |
|---|---|---|
| Remove a repeater row containing user-entered data | Yes (data loss) | Yes (opt-in) |
| Delete an uploaded file / evidence attachment | Yes (server-side data) | Yes |
| Cancel an application mid-flow | Yes (form progress loss) | Yes |
| Withdraw a submitted claim | Yes (irreversible workflow) | Yes (consider type-to-confirm escalation) |
| Sign out while form is dirty | Maybe (depends on form-state persistence) | Yes (if `civ-form` dirty) |
| Clear a filter-chip selection | No (just a UI filter) | No |
| Dismiss an alert or banner | No (banner only) | No |
| Reset a single form field | No (one keystroke to re-enter) | No |
| Toggle a checkbox / radio | No | No |
| Remove an empty repeater row that has no entered data | No (nothing to lose) | No. But if the prop is opt-in across the whole repeater, accept the consistency cost |

Rule of thumb: **if undoing the action requires the user to find a Save
draft, re-upload a file, re-enter a multi-step form, or contact a
caseworker, it's destructive.** If undoing means clicking once more,
it's not.

## Why modal-only

Five inline patterns we considered and rejected, with the accessibility
reason each fails:

1. **Two-click on the same button** (button label flips to "Click to
   confirm"). Screen reader announces the label mutation as a property
   change. Many users read this as an error, not a step. Mobile SR
   gestures (double-tap to activate) collide with "tap twice." Motor
   impairment users defeat the safety by accidental double-tap.
2. **Hold-to-confirm** (long-press). No SR equivalent. Discoverable
   only by sighted users who happen to try it. Fails WCAG 2.5.1 *Pointer
   Gestures*.
3. **Swipe-to-delete** (mobile-style). Same problem as hold-to-confirm;
   gesture-only, no SR or keyboard equivalent.
4. **Toast + Undo** (action fires immediately, banner with Undo for ~5s).
   Requires a global notification surface CivUI doesn't have, and the
   5s window silently expires for keyboard / SR users who navigate
   slower. We'd need a separate notification system before this is even
   on the table.
5. **Disable the action behind a checkbox** ("I understand"). Adds a
   step but doesn't really confirm. Users tick and click in rapid
   succession. Accessibility-wise it's fine; UX-wise it's a friction
   tax with no real protection.

A modal `civ-modal`:

- Moves focus into the dialog (predictable for SR).
- Has explicit Confirm + Cancel buttons (no hidden state on one button).
- Persists until the user acts (no silent timeout).
- Is keyboard-trapped and Escape-dismissed (universal pattern).
- Can carry the consequences in body text ("Alex Chen will be removed.
  Their information will be lost.").

USWDS, VA.gov, and GOV.UK all converged on modal-for-destructive after
testing with disabled users. We follow the prior art.

## The standard wiring pattern

Components with destructive surfaces fire a **cancelable** event *before*
performing the destructive action. The consumer prevents default, opens
a `civ-modal`, and on confirm calls the component's `<action>(index, {
skipConfirm: true })` method (or equivalent) to perform the action
without re-firing the hook.

Components currently emitting the hook:

| Component | Cancelable event | Confirm method |
|---|---|---|
| `civ-repeater` (inline / form-steps) | `civ-repeater-before-remove` | `removeRow(index, { skipConfirm: true })` |
| `civ-repeater` (route mode) | n/a. Consumer already owns the array mutation in `civ-repeater-remove` | n/a |
| `civ-file-upload` | `civ-file-upload-before-remove` | `removeFile(index, { skipConfirm: true })` |

When other components grow destructive affordances, follow the same
shape: `civ-<X>-before-<action>` cancelable event + `skipConfirm` (or
analogous) bypass option on the imperative method.

## Wiring example

<StoryEmbed id="foundations-destructive-actions--confirm-delete-file" />

```ts
const repeater = document.querySelector('civ-repeater');
const modal = document.querySelector('#confirm-remove-modal');

repeater.addEventListener('civ-repeater-before-remove', (e) => {
  e.preventDefault();
  const index = e.detail.index;
  modal.heading = `Remove ${repeater.itemLabel} ${index + 1}?`;
  modal.body = `${repeater.itemLabel} ${index + 1} will be removed. This can't be undone.`;
  modal.confirmLabel = 'Remove';
  modal.cancelLabel = 'Cancel';
  modal.onConfirm = () => repeater.removeRow(index, { skipConfirm: true });
  modal.open();
});
```

In route mode, the consumer owns the rows array, so the same logic
goes inline in the `civ-repeater-remove` handler instead. Open the
modal, splice the array only after the user confirms.

## Modal copy contract

For consistency across .gov flows:

| Slot | Required? | Pattern |
|---|---|---|
| Heading | Yes | Action + object. "Remove dependent 1?" "Delete attachment?" "Cancel application?" Question form. |
| Body | Yes | Sentence stating what gets lost. "Alex Chen will be removed from your dependents list. This can't be undone." Plain language; no "Are you sure?". The heading already asked. |
| Confirm button | Yes | Verb. "Remove" / "Delete" / "Cancel application". Match the destructive action exactly. Renders with `danger` variant. |
| Cancel button | Yes | Verb. "Cancel" or "Keep [X]." Default focus lands here, not on the destructive button. |
| Escape key | Always | Closes (= Cancel). |

## Focus contract

- Modal opens → focus moves to **Cancel** (the safe default).
- Tab cycles inside the modal.
- Escape closes (= Cancel).
- After Confirm: focus moves to the nearest sensible target on the
  underlying page (for repeater, the next remaining row's remove button
  or the Add button if no rows remain. `civ-repeater` already handles
  this via its existing post-remove focus logic).
- After Cancel: focus returns to the element that opened the modal.

## Type-to-confirm (escalation)

For *high-stakes* actions where modal-tap-to-confirm isn't strong
enough (withdrawing a submitted claim, deleting an account) escalate
to type-to-confirm:

- Modal includes a text input.
- Confirm button is disabled until the user types an exact phrase
  (e.g. the claim ID, "DELETE", or the dependent's name).
- The phrase choice must be **content the user already knows from
  context**, not a random word. Typing "DELETE" is muscle memory
  defeat, typing the claim ID is a real cognitive check.

This pattern is out of scope for `civ-repeater` (rows aren't high-stakes
enough). Reserve it for application-level destructive actions where the
user can't easily redo what they undid.

<StoryEmbed id="foundations-destructive-actions--type-to-confirm" />

## Anti-patterns. Do not introduce

- **Two-click confirm** on a button. Even if you add ARIA-live
  announcements, the timeout-and-revert behavior is hostile to SR / SR
  users / users who walk away mid-flow.
- **Hold-to-confirm** (long-press). Fails WCAG 2.5.1 unless paired with
  a keyboard equivalent. And even then, the keyboard equivalent is
  just two-click, which we already rejected.
- **Confirmation toast with Undo** without a global notification surface.
  When CivUI grows one, revisit; until then, skip.
- **Silent destruction** on a one-click button. Don't ship a Delete
  button that just deletes without confirmation when the action is
  genuinely destructive (per the table above). Either the action isn't
  actually destructive, or it needs a modal.
- **Adding a "confirm-remove" boolean to a component that bakes in its
  own modal.** Tempting because it's one prop for consumers, but it
  hardcodes modal copy that won't fit every flow, and it forces every
  destructive surface to import `civ-modal`. The cancelable-event +
  consumer-owned-modal pattern is more flexible and lighter.

## Where to look next

- `civ-modal` component (`packages/overlays/`). The dialog primitive.
- `civ-repeater`'s `civ-repeater-before-remove` event. The reference
  implementation of the hook pattern.
- WCAG 2.5.1 *Pointer Gestures*, WCAG 2.4.3 *Focus Order*. The standards
  this rule is grounded in.
