**Checkbox & Radio Button**

Design System Component Research

*Use cases, component definitions, and pattern guidance*

**Part 1: Use Cases**

**Radio Buttons**

The core semantic: one choice from a mutually exclusive set. But this
gets stretched in interesting ways.

**Classic Selection**

The obvious case --- picking a shipping method, a subscription tier, a
payment option. Works best when there are 2--7 options and all options
should be visible simultaneously (vs. a dropdown, which hides them).

**Inline Toggle Tabs / Segmented Controls**

Tabs and pill-shaped segment controls are almost always radio buttons
under the hood. The visual treatment is completely different, but the
semantics are the same: one active state at a time. Common for view
switchers (List / Grid / Map) or time range selectors (Day / Week /
Month).

**Conditional Field Reveal**

Radio buttons drive progressive disclosure --- selecting \"Yes\" reveals
a nested set of fields, selecting \"No\" collapses them. This keeps
forms from feeling overwhelming by hiding irrelevant sections. The radio
is the gatekeeper.

**Rating Scales / Likert Scales**

Satisfaction surveys (Strongly Disagree → Strongly Agree) are
semantically radio buttons even when styled as stars, emoji faces, or
numbered buttons. One answer per question.

**Card / Tile Selection**

A full card with an image, title, and description where only one can be
selected (e.g. choosing a plan, a template, or an avatar). The radio
input is often visually hidden; the card border or background signals
selected state.

**Wizard / Step Branching**

Choosing a path at a fork in a multi-step flow. \"What kind of
account?\" determines which steps come next. The radio choice shapes the
entire downstream experience.

**Inline Editing Within Tables**

A column of radio buttons across rows (e.g. \"Set as primary\") where
selecting one deselects all others in that column.

**Checkboxes**

The core semantic: independent binary states. Each one is its own
yes/no, not relative to the others.

**Multi-Select Filters**

The most common use. Filter a product list by multiple categories,
colors, or sizes simultaneously. Unlike radios, these compose --- you
can pick \"Blue\" AND \"Green\".

**Settings and Preferences**

Feature flags, notification preferences, privacy options. Each setting
is truly independent of the others, which is the right fit.

**Agree to Terms / Consent**

A single standalone checkbox for \"I agree to the Terms of Service\" or
GDPR consent. The simplest case --- pure binary yes/no with no group
needed.

**Select-All / Bulk Actions**

A \"select all\" checkbox at the top of a list (often with an
indeterminate state when only some items are checked) that enables bulk
operations: delete, archive, export. The indeterminate state (−) is a
native behavior of checkboxes that radios don\'t have.

**To-Do Lists and Task Tracking**

Marking items complete. The checked state often triggers a visual
treatment like strikethrough text. This is the archetype of a
self-contained binary.

**Conditional Field Reveal**

Checkboxes do this too, but differently from radios. \"Billing address
same as shipping\" --- unchecking it reveals a new address form. \"Add a
gift message\" reveals a text area. Because it\'s binary, it\'s a
simpler branch than radio-driven disclosure.

**Feature Add-Ons and Configuration**

Enabling optional modules in a settings screen, or selecting add-ons
during a purchase flow. Each one adds or removes a feature
independently.

**Tree / Nested Selection**

Hierarchical checkboxes where a parent node checks all children, and
mixed children put the parent into indeterminate state. Common in file
system pickers, permission managers, or category trees.

**Table Row Selection**

Each row has a checkbox for individual selection, enabling bulk
operations. Combined with a \"select all\" header checkbox. Distinct
from radio-in-table because multiple rows can be selected.

**Where They Get Confused**

-   **Toggle switches vs. checkboxes ---** A toggle switch is
    semantically a checkbox (binary on/off) but with an immediate
    effect. Checkboxes typically require form submission; toggles apply
    instantly. Use toggles for settings that take effect immediately,
    checkboxes for form contexts.

-   **Dropdowns vs. radios ---** When you have more than \~6 mutually
    exclusive options, a select/dropdown is usually better for space.
    But radios win when comparison between options matters (pricing
    tiers, shipping speeds).

-   **Multi-select dropdowns vs. checkboxes ---** A multi-select
    combobox can replace a checkbox list when options are numerous (10+)
    or dynamic. Checkboxes win for scanability when the list is short
    and fixed.

-   **Button groups vs. radios ---** Toolbar buttons that look like a
    segmented control are functionally radios. The question is whether
    the visual affordance of a \"button\" or a \"field\" is more
    appropriate for the context.

  -----------------------------------------------------------------------
  **Key Insight:** The visual component and the semantic element often
  diverge completely. Your card selector, tab bar, star rating, and
  Likert scale may all share a single underlying radio button primitive.
  A well-structured design system surfaces that shared primitive and lets
  visual variants build on top of it.

  -----------------------------------------------------------------------

**Part 2: Components vs. Patterns**

The core question is what needs to be built vs. what needs to be
documented.

**Core Primitives (Build These)**

These require encapsulated behavior, styling, and accessibility
handling. They are the atoms of your system.

**Checkbox**

The atomic unit. Covers the binary yes/no. Needs to handle the
indeterminate state natively --- which is JS-only, not settable in HTML
alone. Everything in the checkbox family builds on this.

**Radio Group**

Not just a radio input, but the group. A single radio button in
isolation is nearly useless and semantically broken. The group manages
the shared name, keyboard navigation (arrow keys move between options,
not tab), and the mutual exclusion logic. This is where teams often go
wrong --- building individual radio inputs and forgetting the group is
the real component.

**Toggle Switch**

Despite being semantically a checkbox, it is different enough in visual
treatment and interaction expectation (immediate effect vs. form
submission) that it warrants its own component. Trying to style a
checkbox into a toggle gets messy quickly.

**Higher-Order Components (Build These Too)**

These compose the primitives with additional structure and visual
treatment. They earn their place because the composition is non-trivial
or because the structure is stable and predictable enough to
standardize.

**Segmented Control / Tab Bar**

A Radio Group with button-style rendering. The underlying inputs are
visually hidden; the labels become the clickable segments. Needs to
handle overflow gracefully. This is a component because the visual and
keyboard behavior is sufficiently different from a default radio group.

**Checkbox Group**

A labeled fieldset wrapping multiple checkboxes, with optional
select-all behavior and indeterminate state management on the parent.
Worth componentizing because the select-all + indeterminate logic is
non-trivial and you don\'t want teams re-implementing it.

**Card Selector (Single)**

A Radio Group where each option is rendered as a full card. The radio
input is hidden inside the card. This is a component because you need a
defined slot structure (image, title, description, metadata) and the
selected/hover/disabled states need to apply to the whole card, not just
a dot.

**Card Selector (Multi)**

Same idea but with checkboxes. A separate component from the single
version because the selection model is different and the visual
treatment of selected state often differs too.

**Data Table with Selection**

A component because the select-all header checkbox, the per-row
checkboxes, and the indeterminate state all need to be wired together
and kept in sync with the table\'s data model. This isn\'t just a
checkbox dropped into a table --- it\'s a coordinated system.

**Patterns (Document These, Don\'t Build)**

These don\'t need to be built --- they need to be documented with
examples showing how to compose existing components.

-   **Conditional field reveal ---** Just a checkbox or radio group plus
    a conditional wrapper in the consuming application. The show/hide
    logic belongs to the form, not the input component. Document with
    aria-expanded and aria-controls guidance.

-   **Likert scales / rating scales ---** Semantically a radio group,
    but the visual styling (stars, numbers, emoji) is so domain-specific
    that building a component locks you into opinions you don\'t want.
    Document as \"style a radio group like this.\"

-   **Settings / preferences lists ---** Just a vertical stack of toggle
    switches or checkboxes with consistent spacing and labels. A layout
    pattern, not a component.

-   **Filter panels ---** A composition of checkbox groups, possibly
    with search, with collapse/expand behavior. The groups are
    components; the panel itself is a pattern. Only promote to a
    component if divergent implementations are causing real problems.

-   **Inline table column radios ---** A pattern showing a radio group
    oriented within table rows, with guidance on accessible labeling
    (each radio needs to reference both its row and column for screen
    readers).

-   **Wizard branching ---** A radio group used as a decision point in a
    multi-step flow. The pattern documentation covers how to wire the
    selection to routing or step logic.

**The Decision Framework**

Ask three questions about any candidate component:

-   **1. Does it have non-trivial encapsulated behavior?** Indeterminate
    state, keyboard navigation, synchronized selection across rows ---
    these are reasons to build a component. If the \"behavior\" is just
    CSS, it\'s probably a pattern.

-   **2. Do teams keep building it inconsistently?** If you audit your
    product and find five different implementations of card selectors,
    that signals it should be componentized. If everyone\'s filter
    panels look a bit different but work fine, that may be acceptable
    variation.

-   **3. Does it have a stable, defined structure?** Card selectors have
    a predictable slot structure (image, title, body, badge). That
    stability justifies a component. Likert scales vary wildly --- that
    instability argues against one.

**Final Component Inventory**

**Components to build:**

-   Checkbox (with indeterminate support)

-   RadioGroup + RadioOption

-   ToggleSwitch

-   CheckboxGroup (with select-all)

-   SegmentedControl

-   CardSelector (single and multi variants, or one component with a
    multiple prop)

-   DataTable with selection mode (extension of existing table
    component)

**Patterns to document:**

-   Conditional reveal (checkbox binary + radio multi-branch)

-   Filter panels

-   Settings lists

-   Likert / rating scales

-   Wizard branching

-   Inline table radios

  -----------------------------------------------------------------------
  **Guiding Principle:** Keep the component library small and stable. Let
  patterns absorb the variation. The goal is a system where the
  primitives are rock-solid and well-documented, not one where every UI
  pattern becomes a component.

  -----------------------------------------------------------------------
