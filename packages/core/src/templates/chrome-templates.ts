// Shared render helpers for chrome that recurs verbatim across
// multiple packages. Each helper is the canonical implementation of
// a small UI primitive that doesn't warrant a full custom element
// (or where composing one would invert the dependency layering).
//
// Pattern parallel to `renderFormHeader` / `renderLabel` etc. in
// form-templates.ts — these are template returns, not custom
// elements, so they introduce zero new tags and have no package
// dependency requirements beyond what the consumer already imports.

import { html, nothing, type TemplateResult } from 'lit';

// civ-icon is registered in @civui/core so all consumers already
// have it available — we render `<civ-icon>` inline rather than
// requiring the consumer to import anything extra.
import '../icon/civ-icon.js';

interface CloseButtonOptions {
  /** Accessible label announced by AT (e.g. "Close dialog", "Dismiss"). Required — close buttons must have an accessible name. */
  label: string;
  /** Click handler. Called with the synthetic event. */
  onClick: (event: MouseEvent) => void;
  /** Optional component-specific class appended to `civ-close-btn`. */
  extraClass?: string;
  /** Icon name. Defaults to `'close'` (the X). Override for variants. */
  iconName?: string;
  /** Disabled state (used by filter-chip's removable affordance). */
  disabled?: boolean;
}

// NOTE: civ-file-upload's per-file close button keeps a raw <button>
// because it carries a `data-file-remove` marker attribute used by the
// component's own keyboard-nav and removal-tracking logic
// (file-upload.ts queries `[data-file-remove]`). Rendering arbitrary
// data-* attribute names through this helper would require static-html
// trickery that isn't worth the saved boilerplate for one consumer.

/**
 * Renders the canonical close / dismiss button used by modal,
 * action-sheet, drawer, alert (dismissible), filter-chip (removable),
 * combobox / text-input / date-picker (clear), file-upload (cancel
 * file). All instances share the `.civ-close-btn` chrome class which
 * lives in `@civui/core/styles/components.css`.
 *
 * Composing `civ-button` instead is rejected because:
 *   - @civui/overlays depends only on @civui/core; adding @civui/actions
 *     would invert the layering (button is a heavier affordance).
 *   - @civui/feedback already pulls @civui/feedback/spinner via civ-button,
 *     so an alert composing civ-button would close a circular dep.
 *
 * The shared template eliminates ~9 near-identical hand-rolled
 * `<button class="civ-close-btn">…</button>` blocks across the codebase.
 */
export function renderCloseButton({
  label,
  onClick,
  extraClass,
  iconName = 'close',
  disabled,
}: CloseButtonOptions): TemplateResult {
  const classes = extraClass ? `civ-close-btn ${extraClass}` : 'civ-close-btn';
  return html`<button
    type="button"
    class="${classes}"
    aria-label="${label}"
    ?disabled="${disabled}"
    @click="${onClick}"
  ><civ-icon name="${iconName}" aria-hidden="true"></civ-icon></button>`;
}

interface SkipButtonOptions {
  /** Visible + accessible label. */
  label: string;
  /** Whether this button is the currently-selected option. Drives `aria-pressed`. */
  isPressed: boolean;
  /** Click handler. */
  onClick: () => void;
  /** Disabled state. */
  disabled?: boolean;
  /** Readonly state — sets `aria-readonly` for AT consumers. */
  readonly?: boolean;
  /** Component-specific class appended (e.g. `civ-yes-no__skip`, `civ-radio-group__skip`). */
  extraClass?: string;
}

/**
 * Renders the "skip this question" escape-hatch button used by
 * `civ-yes-no` and `civ-radio-group` — a link-styled button that
 * holds toggle state via `aria-pressed`. The pressed state is
 * externally controlled (derived from `value === skipValue`), which
 * is why this isn't `civ-toggle-button` (whose pressed state is
 * internally managed and auto-flips on click).
 *
 * The `data-civ-skip` marker attribute is preserved so any future
 * lint / tooling that targets it still works.
 */
export function renderSkipButton({
  label,
  isPressed,
  onClick,
  disabled,
  readonly,
  extraClass,
}: SkipButtonOptions): TemplateResult {
  const classes = extraClass
    ? `${extraClass} civ-link--secondary`
    : 'civ-link--secondary';
  return html`<button
    type="button"
    class="${classes}"
    aria-pressed="${isPressed ? 'true' : 'false'}"
    ?aria-readonly="${readonly}"
    data-civ-skip
    ?disabled="${disabled}"
    @click="${onClick}"
  >${label}</button>`;
}

interface DisclosureOptions {
  /** Whether the disclosure is currently open. Drives `<details open>`. */
  open: boolean;
  /**
   * Toggle handler. Receives the native `toggle` event from the
   * underlying `<details>`. Consumers read `(e.target as HTMLDetailsElement).open`
   * to get the new state and update their own reactive state.
   * They MAY revert `e.target.open` here if the change should be
   * rejected (e.g. accordion-item's disabled gate).
   */
  onToggle: (event: Event) => void;
  /**
   * Content rendered inside the `<summary>` after the chevron. Each
   * caller renders their own label markup (heading element, span,
   * id wiring) so the helper stays neutral on heading semantics.
   */
  summaryContent: TemplateResult;
  /**
   * Content rendered inside the disclosure's panel wrapper (the
   * div that `<details>` shows / hides). Callers pass their slot-target
   * div (`data-civ-X-content`) here so their LightDomSlotMixin can
   * relocate authored children into it.
   */
  panelContent: TemplateResult;
  /** Extra class appended to the `<details>` root (e.g. `civ-accordion-item`). */
  rootClass?: string;
  /** Extra class appended to the `<summary>` (e.g. `civ-accordion-item__trigger`). */
  summaryClass?: string;
  /** Extra class appended to the panel wrapper (e.g. `civ-accordion-item__content`). */
  panelClass?: string;
  /**
   * Disabled state. Applies `aria-disabled="true"` and `tabindex="-1"`
   * on `<summary>` so keyboard users skip it. The caller is also
   * responsible for reverting `details.open` inside `onToggle` if
   * the browser opens it on click.
   */
  disabled?: boolean;
}

/**
 * Shared `<details>`/`<summary>` disclosure primitive — single source
 * of truth for the markup, chevron icon, rotation animation, marker
 * reset, and inset focus indicator used by `civ-disclosure`,
 * `civ-accordion-item`, and the collapsible mode of `civ-alert`.
 *
 * The helper renders `<details class="civ-disclosure-primitive"><summary>
 * [chevron] [summaryContent]</summary><div>[panelContent]</div></details>`.
 * Per-consumer chrome (chip styling, full-row trigger, etc.) layers
 * via the optional `rootClass` / `summaryClass` / `panelClass`
 * options — the canonical `civ-disclosure-primitive*` classes carry
 * the shared visual treatment.
 *
 * Lives in @civui/core so all packages can call it without inverting
 * the dep graph (actions → feedback → layout cycle would otherwise
 * block civ-alert from composing civ-accordion-item).
 */
export function renderDisclosure({
  open,
  onToggle,
  summaryContent,
  panelContent,
  rootClass,
  summaryClass,
  panelClass,
  disabled,
}: DisclosureOptions): TemplateResult {
  const detailsClasses = rootClass
    ? `civ-disclosure-primitive ${rootClass}`
    : 'civ-disclosure-primitive';
  const summaryClasses = summaryClass
    ? `civ-disclosure-primitive__summary ${summaryClass}`
    : 'civ-disclosure-primitive__summary';
  const panelClasses = panelClass
    ? `civ-disclosure-primitive__panel ${panelClass}`
    : 'civ-disclosure-primitive__panel';

  return html`<details
    class="${detailsClasses}"
    ?open="${open}"
    @toggle="${onToggle}"
  ><summary
    class="${summaryClasses}"
    aria-disabled="${disabled ? 'true' : nothing}"
    tabindex="${disabled ? '-1' : nothing}"
  ><civ-icon
      name="chevron-right"
      class="civ-disclosure-primitive__icon"
      aria-hidden="true"
    ></civ-icon>${summaryContent}</summary><div
    class="${panelClasses}"
  >${panelContent}</div></details>`;
}

interface HeadingOptions {
  /**
   * Semantic heading level (1–6). The component's `headingLevel`
   * prop is passed through; values outside 1–6 are clamped so the
   * rendered `aria-level` stays valid.
   */
  level: number;
  /** Heading text content. */
  text: string;
  /** Optional id — useful for `aria-labelledby` wiring on a parent landmark. */
  id?: string;
  /** Optional class on the rendered element (e.g. `civ-alert__heading`). */
  className?: string;
}

/**
 * Shared heading template — renders `<p role="heading" aria-level="N">`
 * for components that want screen-reader heading semantics WITHOUT
 * forcing a specific `<h1>`–`<h6>` into the page outline.
 *
 * Used by `civ-alert` and `civ-section-intro` (and any future surface
 * that needs a configurable-level heading inside its chrome but
 * shouldn't dictate the document's heading structure — a card on a
 * marketing page can sit at any logical depth, the component shouldn't
 * pick).
 *
 * **Not for cases where a real `<hN>` element is the right answer.**
 * `civ-accordion-item` renders real `<h1>`–`<h6>` because each
 * accordion section IS a sub-section of the surrounding outline —
 * screen-reader rotor navigation by heading depends on the real tag.
 * That switch lives in `civ-accordion-item._renderLabel()` and isn't
 * shared (single consumer, different semantics).
 */
export function renderHeading({
  level,
  text,
  id,
  className,
}: HeadingOptions): TemplateResult {
  const safeLevel = Math.max(1, Math.min(6, Math.trunc(level)));
  return html`<p
    id="${id ?? nothing}"
    class="${className ?? nothing}"
    role="heading"
    aria-level="${safeLevel}"
  >${text}</p>`;
}
