import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomTextMixin, LoadingMixin, devWarn, sanitizeHref, t } from '@civui/core';
import '@civui/feedback/spinner';

export type ButtonEmphasis = 'primary' | 'secondary' | 'tertiary';
export type ButtonType = 'button' | 'submit' | 'reset';

/**
 * CivUI Button
 *
 * An accessible button component.
 *
 * **Variants:**
 * - `primary` — filled blue button
 * - `secondary` — light tint background (matches secondary tag pattern)
 * - `tertiary` — outlined border button
 *
 * Add `danger` attribute to any variant for destructive action styling.
 *
 * **Link mode:** when `href` is set, renders an `<a>` element instead
 * of a `<button>` so it works as a real navigation affordance (right-
 * click "open in new tab", back-button history, screen-reader role).
 * The label is underlined in link mode to keep the link identity
 * visible. Use this when a navigation belongs visually with other
 * buttons (e.g. "Add another" on a repeater that links to /new).
 *
 * @element civ-button
 *
 * @prop {string} label - Button text (preferred over child text)
 * @prop {ButtonEmphasis} emphasis - Visual variant
 * @prop {boolean} danger - Destructive action styling
 * @prop {boolean} disabled - Disabled state
 * @prop {boolean} loading - When true, swaps the leading icon area for a `civ-spinner`, disables the button, and sets `aria-busy`. Use during in-flight async work (form submit, save).
 * @prop {string} loadingLabel - Accessible label for the spinner (default "Loading…"). Should be an action-specific present-participle verb ("Saving…", "Submitting…").
 * @prop {ButtonType} type - Button type attribute
 * @prop {string} iconStart - Leading icon name
 * @prop {string} iconEnd - Trailing icon name
 * @prop {boolean} iconOnly - Render the `label` visually hidden so the button shows only its icon; the label still serves as the accessible name. Use for kebab triggers and similar square icon-buttons.
 * @prop {string} href - When set, renders as `<a href>` instead of `<button>`
 * @prop {string} target - Anchor target (link mode only)
 * @prop {string} rel - Anchor rel (link mode only)
 * @prop {string} download - Anchor download (link mode only)
 * @prop {boolean} newTab - Opens link in a new tab (auto-sets target + rel)
 *
 * @fires civ-analytics - Analytics tracking event on click
 */
@customElement('civ-button')
export class CivButton extends LoadingMixin(LightDomTextMixin(CivBaseElement)) {
  @property({ type: String }) label = '';
  @property({ type: String }) emphasis: ButtonEmphasis = 'primary';
  @property({ type: Boolean, reflect: true }) danger = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  // `loading` and `loadingLabel` are inherited from `LoadingMixin`.
  // Link-mode buttons (`href` set) suppress loading because navigation
  // isn't a state we wait on — see the `isLoading` getter override
  // below.
  @property({ type: String }) type: ButtonType = 'button';
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
  /** Tracks whether the loading-on-link-mode dev warning has fired. */
  private _warnedLoadingOnLink = false;

  private get _text(): string {
    return this.label || this._initialText;
  }

  private get _isLink(): boolean {
    return Boolean(this.href);
  }

  /**
   * Override of `LoadingMixin#isLoading` — link-mode navigation isn't a
   * state we wait on, so the spinner / aria-busy / announcement are all
   * suppressed when `href` is set.
   */
  override get isLoading(): boolean {
    return this.loading && !this._isLink;
  }

  /** Effective disabled state — `loading` implies disabled. */
  private get _effectiveDisabled(): boolean {
    return this.disabled || this.isLoading;
  }

  private get _classes(): string {
    return [
      'civ-btn',
      `civ-btn--${this.emphasis}`,
      this.danger ? 'civ-btn--danger' : '',
      // Link mode adds an underline so the navigation affordance reads
      // as a link even when wearing button chrome.
      this._isLink ? 'civ-btn--link' : '',
      this.iconOnly ? 'civ-btn--icon-only' : '',
      this._effectiveDisabled ? 'civ-opacity-50 civ-cursor-not-allowed' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  override render() {
    // Dev-only nudge: an icon-only button with no label / text content
    // has no accessible name. `civ-icon` defaults to `aria-hidden="true"`
    // when no `label` is set, so the button renders empty to AT.
    // Fires once per instance so consumers see the warning during
    // development without flooding the console.
    if (
      (this.iconStart || this.iconEnd) &&
      !this._text &&
      !this._warnedNoAccessibleName
    ) {
      devWarn(
        'civ-button',
        'icon-only button has no accessible name. Set `label="…"` so screen-reader users hear what the button does.',
      );
      this._warnedNoAccessibleName = true;
    }

    // In icon-only mode the label provides the accessible name only;
    // it's rendered via .civ-sr-only so AT picks it up while sighted
    // users see just the icon.
    const visibleText = this.iconOnly
      ? html`<span class="civ-sr-only">${this._text}</span>`
      : this._text;
    // Loading state swaps the leading icon for a decorative spinner.
    // The spinner is `decorative` because the button's own aria-busy
    // is the AT signal (and aria-busy buffers any live regions in its
    // subtree under NVDA/JAWS, so the spinner's would be swallowed).
    // We let the spinner's default delay/min-duration apply so fast
    // sub-200ms responses don't flash a spinner inside the button —
    // the disabled+aria-busy state change is the brief visual cue,
    // and the spinner only appears if the wait is long enough to
    // matter.
    const leadingSlot = this.isLoading
      ? this.renderLoadingSpinner('sm')
      : this.iconStart
        ? html`<civ-icon name="${this.iconStart}"></civ-icon>`
        : '';
    const inner = html`${leadingSlot}${visibleText}${this.iconEnd ? html`<civ-icon name="${this.iconEnd}"></civ-icon>` : ''}`;

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

    // When loading, swap the accessible name to the loading label so
    // AT users re-tabbing to the button hear "Saving…, button, busy"
    // instead of the stale "Save". `aria-busy` carries the busy
    // state; the announce() call in `updated()` fires the one-shot
    // polite live-region announcement.
    return html`
      <button
        type="${this.type}"
        class="${this._classes}"
        ?disabled="${this._effectiveDisabled}"
        aria-busy="${this.isLoading ? 'true' : nothing}"
        aria-label="${this.isLoading ? this.effectiveLoadingLabel : nothing}"
        @click="${this._onClick}"
      >${inner}</button>
    `;
  }

  private _onClick(): void {
    this.sendAnalytics('click');
  }

  /**
   * Dev-warn when `loading` is set on a link-mode button. The
   * announce() lifecycle for the loading transition itself lives in
   * `LoadingMixin#updated`.
   */
  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (this.loading && this._isLink && !this._warnedLoadingOnLink) {
      devWarn(
        'civ-button',
        '`loading` is ignored on link-mode buttons (`href` set) — navigation is not a state we wait on. The button will render as a normal link.',
      );
      this._warnedLoadingOnLink = true;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-button': CivButton;
  }
}
