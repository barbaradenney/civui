import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomTextMixin, devWarn, sanitizeHref, t } from '@civui/core';
import '@civui/feedback/spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
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
 * @prop {ButtonVariant} variant - Visual variant
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
export class CivButton extends LightDomTextMixin(CivBaseElement) {
  @property({ type: String }) label = '';
  @property({ type: String }) variant: ButtonVariant = 'primary';
  @property({ type: Boolean, reflect: true }) danger = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  /**
   * Async-in-flight state. The button stays the same physical size, but
   * the leading-icon area swaps for a `civ-spinner`, the host disables
   * itself, and `aria-busy="true"` is announced to screen readers. Use
   * `loading-label` to set an action-specific verb ("Saving…").
   *
   * Link-mode buttons (`href` set) do not get a spinner — navigation
   * isn't a state we wait on. `loading` is silently ignored there.
   */
  @property({ type: Boolean, reflect: true }) loading = false;
  /** Visually-hidden label announced by the spinner. Default "Loading…". */
  @property({ type: String, attribute: 'loading-label' }) loadingLabel = 'Loading…';
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

  private get _text(): string {
    return this.label || this._initialText;
  }

  private get _isLink(): boolean {
    return Boolean(this.href);
  }

  /**
   * `loading` only applies to actual buttons; link-mode navigation
   * isn't a state we wait on, so loading is silently ignored when
   * `href` is set.
   */
  private get _isLoading(): boolean {
    return this.loading && !this._isLink;
  }

  /** Effective disabled state — `loading` implies disabled. */
  private get _effectiveDisabled(): boolean {
    return this.disabled || this._isLoading;
  }

  private get _classes(): string {
    const variantClass = this.danger
      ? `civ-btn--${this.variant}-danger`
      : `civ-btn--${this.variant}`;

    return [
      'civ-btn',
      variantClass,
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
    // Loading state swaps the leading icon for a spinner. The spinner's
    // own delay timer means fast responses (sub-200ms) never paint it,
    // matching the field-consensus flash-protection pattern.
    const leadingSlot = this._isLoading
      ? html`<civ-spinner size="sm" delay="0" label="${this.loadingLabel}"></civ-spinner>`
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

    return html`
      <button
        type="${this.type}"
        class="${this._classes}"
        ?disabled="${this._effectiveDisabled}"
        aria-busy="${this._isLoading ? 'true' : nothing}"
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
    'civ-button': CivButton;
  }
}
