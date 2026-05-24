// Shared render helpers for chrome that recurs verbatim across
// multiple packages. Each helper is the canonical implementation of
// a small UI primitive that doesn't warrant a full custom element
// (or where composing one would invert the dependency layering).
//
// Pattern parallel to `renderFormHeader` / `renderLabel` etc. in
// form-templates.ts — these are template returns, not custom
// elements, so they introduce zero new tags and have no package
// dependency requirements beyond what the consumer already imports.

import { html, type TemplateResult } from 'lit';

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
