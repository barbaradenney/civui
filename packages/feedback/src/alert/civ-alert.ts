import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
  CivBaseElement,
  LightDomSlotMixin,
  devWarn,
  dispatch,
  renderCloseButton,
  renderDisclosure,
  renderHeading,
  t,
} from '@civui/core';
import type { SlotConfig } from '@civui/core';
// Collapsible mode composes the shared `renderDisclosure()` helper
// from @civui/core — same `<details>`/`<summary>`/chevron primitive
// that powers civ-disclosure and civ-accordion-item. The helper
// lives in core (not in @civui/layout where the component variants
// live) so feedback → layout's actions → feedback cycle stays
// broken.

export type AlertIntent = 'info' | 'warning' | 'error' | 'success' | 'neutral';
export type AlertEmphasis = 'primary' | 'secondary' | 'tertiary';
export type AlertHeadingLevel = 2 | 3 | 4 | 5 | 6;


/**
 * CivUI Alert
 *
 * An accessible alert component for informational, warning, error, or
 * success messages. Supports a heading, dismissible close button, and
 * slim (compact) variant.
 *
 * **Body content:** set via the `label` prop for plain text, or by
 * placing children inside the host for rich content (paragraphs,
 * links, or composed components like `<civ-notice>` and `<civ-link>`).
 * If `label` is set, it takes precedence and any captured children
 * stay hidden — set one OR the other, not both.
 *
 * **Heading level:** Renders at `heading-level` (default 4). Set to one
 * level below the nearest parent heading in your document outline.
 *
 * **Collapsible mode** (`collapsible` + `heading`): wraps heading +
 * body in a native `<details>`/`<summary>` via the shared
 * `renderDisclosure()` helper so the body collapses behind a
 * clickable chevron — identical primitive to `<civ-disclosure>` and
 * `<civ-accordion-item>`. `open` reflects + drives the expanded
 * state. Without `heading` the prop is a dev-mode no-op (the toggle
 * has no clickable surface).
 *
 * **Full-width mode** (`fullWidth`): treats the alert as a persistent
 * site-wide notice rather than a transient notification. ARIA role
 * switches from `alert`/`status` (live region) to `region` (landmark)
 * and `aria-label` is auto-derived from the heading. The inner content
 * is centered to `--civ-site-max-width` (defaults to 80rem) so the
 * banner spans the viewport while the text stays readable. Place
 * full-width alerts as the first child of `<body>` or your outermost
 * site wrapper so they truly span edge-to-edge.
 *
 * @element civ-alert
 *
 * @prop {AlertIntent} intent - Alert type (sets colors + ARIA role)
 * @prop {AlertEmphasis} emphasis - Visual treatment (primary, secondary, tertiary)
 * @prop {string} heading - Optional heading text
 * @prop {AlertHeadingLevel} headingLevel - Heading element level (2-6)
 * @prop {string} label - Body text (preferred over child content)
 * @prop {boolean} dismissible - Shows close button
 * @prop {boolean} slim - **Deprecated** — use `spacing="sm"` instead. Compact single-line variant (no heading). Fires a one-time dev warning.
 * @prop {boolean} collapsible - Wrap heading + body in a `<details>` disclosure; requires `heading`
 * @prop {boolean} open - When `collapsible`, controls / reflects the expanded state
 * @prop {boolean} fullWidth - Render as a site-wide banner (role="region", content centered to `--civ-site-max-width`)
 * @prop {string} spacing - Padding size: 'default' or 'sm' for compact layouts
 *
 * @slot - Body content. Used when `label` is unset. Accepts text or
 *   rich markup including composed CivUI components.
 * @slot data-civ-alert-prefix - Renders above the heading. Use for a
 *   status badge or other small chrome that describes the heading.
 *   Mark children with the `data-civ-alert-prefix` attribute.
 *
 * @fires civ-dismiss - When close button is clicked
 * @fires civ-toggle - When collapsible state changes, detail: { open }
 * @fires civ-analytics - Analytics tracking event on dismiss / toggle
 */
@customElement('civ-alert')
export class CivAlert extends LightDomSlotMixin(CivBaseElement) {
  @property({ type: String }) intent: AlertIntent = 'info';
  @property({ type: String, attribute: 'emphasis' }) emphasis: AlertEmphasis = 'secondary';
  @property({ type: String }) heading = '';
  @property({ type: Number, attribute: 'heading-level' }) headingLevel: AlertHeadingLevel = 4;
  @property({ type: String }) label = '';
  @property({ type: Boolean }) dismissible = false;
  /**
   * @deprecated Use `spacing="sm"` instead. The `slim` boolean
   * predates the system-wide density convention
   * (`.claude/rules/density-convention.md`); both attributes
   * currently produce the same `.civ-alert--sm` chrome but `slim`
   * fires a one-time dev-mode console warning so consumers can
   * migrate. The boolean will be removed in a future release.
   */
  @property({ type: Boolean }) slim = false;
  @property({ type: Boolean, reflect: true }) collapsible = false;
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: Boolean, reflect: true, attribute: 'full-width' }) fullWidth = false;

  /** Padding size: 'default' or 'sm' for compact layouts (applies slim styling). */
  @property({ type: String }) spacing: 'default' | 'sm' = 'default';

  private readonly _headingId = this.generateId('heading');

  override _getSlotConfig(): SlotConfig {
    return {
      'data-civ-alert-prefix': '[data-civ-alert-prefix-slot]',
      default: '[data-civ-alert-body-slot]',
    };
  }

  /**
   * The slot target div is rendered ONLY when `label` is unset, so
   * the mixin's `updated()` hook finds a target to relocate children
   * into. When `label` IS set, the slot target is absent — the
   * mixin's querySelector returns null and the captured children
   * stay hidden in `_slottedChildren`. This preserves the
   * "label wins" rule from the original LightDomTextMixin behavior.
   *
   * On the "label unset" path: text nodes (so
   * `<civ-alert>Plain text</civ-alert>` still works as a fallback)
   * AND element children (so consumers can compose `<civ-notice>` or
   * other markup inside the alert) both flow into the body. The
   * mixin's empty-check + idempotent appendChild keeps the
   * relocation correct across re-renders.
   */

  override render() {
    if (this.slim) {
      devWarn(
        'civ-alert',
        '`slim` is deprecated — use `spacing="sm"` instead. The boolean ' +
        'currently still produces the compact layout but will be ' +
        'removed in a future release.',
        'civ-alert:slim-deprecated',
      );
    }
    const collapsibleActive = this.collapsible && !!this.heading && !this.slim;
    if (this.collapsible && !this.heading && !this.slim) {
      devWarn(
        'civ-alert',
        '`collapsible` requires `heading` — the heading IS the toggle. Falling back to non-collapsible render.',
        'civ-alert:collapsible-no-heading',
      );
    }

    const classes = [
      'civ-alert',
      `civ-alert--${this.intent}`,
      `civ-alert--style-${this.emphasis}`,
      (this.slim || this.spacing === 'sm') ? 'civ-alert--sm' : '',
      this.fullWidth ? 'civ-alert--full-width' : '',
      collapsibleActive ? 'civ-alert--collapsible' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const hasHeading = !this.slim && this.heading;
    const level = Math.max(2, Math.min(6, this.headingLevel)) as AlertHeadingLevel;
    const variantLabelKey = `alertLabel${this.intent.charAt(0).toUpperCase()}${this.intent.slice(1)}` as
      'alertLabelInfo' | 'alertLabelWarning' | 'alertLabelError' | 'alertLabelSuccess' | 'alertLabelNeutral';
    const variantLabel = t(variantLabelKey);

    // Full-width mode is a persistent landmark, not a transient live
    // region. role="region" + aria-label gives it a landmark name that
    // screen-reader rotor can jump to without re-announcing on every
    // page navigation (which a live-region role="alert" would do).
    const role = this.fullWidth ? 'region' : this.intent === 'error' ? 'alert' : 'status';
    const ariaLabel = this.fullWidth
      ? (this.heading || variantLabel)
      : (hasHeading ? null : variantLabel);
    const ariaLabelledBy = !this.fullWidth && hasHeading ? this._headingId : null;

    const headingTpl = hasHeading
      ? renderHeading({
          level,
          text: this.heading,
          id: this._headingId,
          className: 'civ-alert__heading',
        })
      : nothing;

    const bodyTpl = html`<div class="civ-alert__body">${
      this.label
        ? this.label
        : html`<div data-civ-alert-body-slot></div>`
    }</div>`;

    // Prefix slot — rendered above the heading. Used for status
    // badges or other small chrome that describes the heading rather
    // than the body. Always rendered (slot mixin only relocates when
    // the slot has captured children, so the empty wrapper is a no-op
    // when unused).
    const prefixTpl = html`<div class="civ-alert__prefix" data-civ-alert-prefix-slot></div>`;

    const dismissTpl = this.dismissible
      ? renderCloseButton({
          label: t('alertDismissLabel'),
          onClick: this._onDismissClick,
        })
      : nothing;

    // Inner-content layout differs by mode:
    //  - Collapsible: renderDisclosure() supplies the details/summary
    //    chrome + chevron + focus inset. The alert's heading template
    //    sits inside <summary> as the toggle surface; the body
    //    template is the panel content. Dismiss button (if any) is
    //    a sibling of the <details> so its click reaches the dismiss
    //    handler without bubbling into the summary toggle.
    //  - Default: heading + body stacked, dismiss button to the right.
    const inner = collapsibleActive
      ? html`
          <div class="civ-flex-1 civ-min-w-0">
            ${prefixTpl}
            ${renderDisclosure({
              open: this.open,
              onToggle: this._onToggle,
              // `collapsibleActive` requires `heading` so the heading
              // is guaranteed non-empty here — re-rendered via the
              // shared helper so the type narrows to TemplateResult
              // without a cast on the shared `headingTpl` union.
              summaryContent: renderHeading({
                level,
                text: this.heading,
                id: this._headingId,
                className: 'civ-alert__heading',
              }),
              panelContent: bodyTpl,
              rootClass: 'civ-alert__details',
              summaryClass: 'civ-alert__summary',
              panelClass: 'civ-alert__panel',
            })}
          </div>
          ${dismissTpl}
        `
      : html`
          <div>
            ${prefixTpl}
            ${headingTpl}
            ${bodyTpl}
          </div>
          ${dismissTpl}
        `;

    return html`
      <div
        class="${classes}"
        role="${role}"
        aria-labelledby="${ariaLabelledBy ?? nothing}"
        aria-label="${ariaLabel ?? nothing}"
      >
        <div class="civ-alert__content">
          <div class="civ-flex civ-justify-between civ-items-start civ-gap-2">
            ${inner}
          </div>
        </div>
      </div>
    `;
  }

  private _onToggle = (e: Event): void => {
    const details = e.target as HTMLDetailsElement;
    if (details.open === this.open) return;
    this.open = details.open;
    dispatch(this, 'civ-toggle', { open: this.open });
    this.sendAnalytics(this.open ? 'expand' : 'collapse', { open: this.open });
  };

  /**
   * Click handler for the dismiss button. When the alert is
   * `collapsible`, the button lives next to the `<summary>` and any
   * click that bubbles back up to the summary would toggle the
   * details. Stop both default + propagation so the dismiss is the
   * only action.
   */
  private _onDismissClick = (e: Event): void => {
    e.preventDefault();
    e.stopPropagation();
    this._onDismiss();
  };

  private _onDismiss(): void {
    const allowed = dispatch(this, 'civ-dismiss', undefined, true);
    if (!allowed) return;
    this.sendAnalytics('dismiss');
    this.announce(t('alertDismissedMessage'), 'polite');
    // Defer removal so screen readers can announce and event propagation completes
    queueMicrotask(() => this.remove());
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-alert': CivAlert;
  }
}
