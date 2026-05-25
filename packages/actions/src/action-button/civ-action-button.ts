import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { CivBaseElement, devWarn, sanitizeHref, t } from '@civui/core';

export type ActionButtonEmphasis = 'primary' | 'secondary' | 'tertiary';
export type ActionButtonSpacing = 'default' | 'sm';

/**
 * CivUI Action Button
 *
 * A compact button for toolbars, inline form controls, and secondary
 * actions. Same variant system as `civ-button` but with smaller
 * padding and font size.
 *
 * Can be used standalone or grouped inside `<civ-button-group>` to
 * form a connected toolbar.
 *
 * **Variants:**
 * - `primary` — filled blue
 * - `secondary` — light tint background
 * - `tertiary` (default) — outlined border
 *
 * **Link mode:** when `href` is set, renders an `<a>` element instead
 * of a `<button>` so it works as a real navigation affordance (right-
 * click "open in new tab", back-button history, screen-reader role).
 * The label gets underlined in link mode to keep the link identity
 * visible — readers can tell at a glance which siblings navigate vs
 * which trigger an in-page action.
 *
 * @element civ-action-button
 *
 * @prop {string} label - Button text
 * @prop {ActionButtonEmphasis} emphasis - Visual emphasis (primary / secondary / tertiary)
 * @prop {ActionButtonSpacing} spacing - Density variant. `sm` shrinks padding, min-height, and font-size so the button sits flush next to `civ-input--sm` (compact form controls in data-grid cell editors, dense toolbars).
 * @prop {boolean} danger - Destructive action styling
 * @prop {boolean} disabled - Disabled state
 * @prop {boolean} pressed - Toggle pressed state (for toolbar toggles)
 * @prop {string} iconStart - Leading icon name
 * @prop {string} iconEnd - Trailing icon name
 * @prop {boolean} iconOnly - Render the `label` visually hidden so only the icon is visible; the label still provides the accessible name. Use for kebab triggers, close buttons, and other compact square buttons.
 * @prop {string} href - When set, renders as `<a href>` instead of `<button>`
 * @prop {string} target - Anchor target (link mode only)
 * @prop {string} rel - Anchor rel (link mode only)
 * @prop {string} download - Anchor download (link mode only)
 * @prop {boolean} newTab - Opens link in a new tab (auto-sets target + rel)
 *
 * @fires civ-analytics - Analytics tracking event on click
 *
 * @example
 * ```html
 * <civ-action-button label="Bold"></civ-action-button>
 * <civ-action-button label="Save" emphasis="primary"></civ-action-button>
 * <civ-action-button label="Edit" href="/dependents/1/edit"></civ-action-button>
 * ```
 */
@customElement('civ-action-button')
export class CivActionButton extends CivBaseElement {
  @property({ type: String }) label = '';
  @property({ type: String }) emphasis: ActionButtonEmphasis = 'tertiary';
  @property({ type: String }) spacing: ActionButtonSpacing = 'default';
  @property({ type: Boolean, reflect: true }) danger = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) pressed: boolean | undefined = undefined;
  /**
   * Marks this button as the current item in a navigation set (e.g.
   * the active page in pagination, the current step in a wizard).
   * Renders `aria-current="page"` on the inner `<button>` so AT users
   * hear "current page" when they navigate to it. Distinct from
   * `pressed` (which is for toggle-button semantics via aria-pressed).
   */
  @property({ type: Boolean, reflect: true }) current = false;
  /**
   * Override the inner `<button>`'s accessible name with a richer
   * label for AT (e.g. pagination "Page 3 of 10" vs the visible "3").
   * When unset, the visible `label` doubles as the accessible name.
   * `null` matches the DOM's built-in `HTMLElement.ariaLabel` shape.
   */
  @property({ type: String, attribute: 'aria-label' }) ariaLabel: string | null = null;
  @property({ type: String }) type: 'button' | 'submit' | 'reset' = 'button';
  @property({ type: String, attribute: 'icon-start' }) iconStart = '';
  @property({ type: String, attribute: 'icon-end' }) iconEnd = '';
  /**
   * When true, the label is rendered visually hidden and used as the
   * accessible name only. Use with `icon-start` or `icon-end` to render
   * a square icon button (kebab triggers, close buttons, etc.). Requires
   * `label` to be set.
   */
  @property({ type: Boolean, attribute: 'icon-only', reflect: true }) iconOnly = false;
  @property({ type: String }) href = '';
  @property({ type: String }) target = '';
  @property({ type: String }) rel = '';
  @property({ type: String }) download = '';
  @property({ type: Boolean, attribute: 'new-tab' }) newTab = false;

  /** Tracks whether the icon-only-without-label dev warning has fired for this instance. */
  private _warnedNoAccessibleName = false;

  private get _isLink(): boolean {
    return Boolean(this.href);
  }

  private get _classes(): string {
    return [
      'civ-action-btn',
      `civ-action-btn--${this.emphasis}`,
      this.danger ? 'civ-action-btn--danger' : '',
      // Link mode adds an underline so the navigation affordance reads
      // as a link even when wearing button chrome.
      this._isLink ? 'civ-action-btn--link' : '',
      this.iconOnly ? 'civ-action-btn--icon-only' : '',
      this.spacing === 'sm' ? 'civ-action-btn--sm' : '',
      this.disabled ? 'civ-opacity-50 civ-cursor-not-allowed' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  override render() {
    // Dev-only nudge: an icon-only button with no label has no
    // accessible name. `civ-icon` defaults to `aria-hidden="true"`
    // when no `label` is set, so the button renders empty to AT.
    // Fires once per instance.
    if (
      (this.iconStart || this.iconEnd) &&
      !this.label &&
      !this._warnedNoAccessibleName
    ) {
      devWarn(
        'civ-action-button',
        'icon-only button has no accessible name. Set `label="…"` so screen-reader users hear what the button does.',
      );
      this._warnedNoAccessibleName = true;
    }

    // In icon-only mode the label provides the accessible name only;
    // it's wrapped in .civ-sr-only so AT picks it up while sighted users
    // see just the icon.
    const visibleLabel = this.iconOnly
      ? html`<span class="civ-sr-only">${this.label}</span>`
      : this.label;
    const inner = html`${this.iconStart ? html`<civ-icon name="${this.iconStart}"></civ-icon>` : ''}${visibleLabel}${this.iconEnd ? html`<civ-icon name="${this.iconEnd}"></civ-icon>` : ''}`;

    if (this._isLink) {
      if (this.disabled) {
        return html`
          <a
            class="${this._classes}"
            aria-disabled="true"
            tabindex="-1"
            title="${t('linkDisabledTitle')}"
          >${inner}</a>
        `;
      }

      const effectiveTarget = this.newTab ? '_blank' : this.target;
      const effectiveRel = this.newTab ? 'noopener noreferrer' : this.rel;

      return html`
        <a
          href="${sanitizeHref(this.href)}"
          class="${this._classes}"
          target="${effectiveTarget || nothing}"
          rel="${effectiveRel || nothing}"
          download="${this.download || nothing}"
          @click="${this._onClick}"
        >${inner}${this.newTab ? html`<span class="civ-sr-only">${t('externalLinkNewTab')}</span>` : nothing}</a>
      `;
    }

    // Only render aria-pressed when the component is used as a toggle
    // (i.e., pressed attribute has been explicitly set).
    const ariaPressed = this.pressed !== undefined
      ? (this.pressed ? 'true' : 'false')
      : undefined;

    return html`
      <button
        type="${this.type}"
        class="${this._classes}"
        ?disabled="${this.disabled}"
        aria-pressed="${ifDefined(ariaPressed)}"
        aria-current="${this.current ? 'page' : nothing}"
        aria-label="${this.ariaLabel ?? nothing}"
        @click="${this._onClick}"
      >${inner}</button>
    `;
  }

  private _onClick(): void {
    this.sendAnalytics('click');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-action-button': CivActionButton;
  }
}
