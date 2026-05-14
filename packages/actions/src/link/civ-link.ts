import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomTextMixin, devWarn, sanitizeHref, t } from '@civui/core';

export type LinkVariant = 'primary' | 'secondary' | 'back';
export type LinkType = 'phone' | 'email' | 'download';

/**
 * CivUI Link
 *
 * An accessible link component. Renders an `<a>` element.
 *
 * **Variants** (visual style):
 * - `primary` — bold underlined link with trailing caret icon (most emphasis)
 * - `secondary` (default) — plain underlined link
 * - `back` — back-navigation link with leading left chevron
 *
 * For a navigation affordance that should look like a button, use
 * `<civ-button href="…">` or `<civ-action-button href="…">` — those
 * render an `<a>` with full button chrome plus an underline so the
 * link identity stays visible.
 *
 * **Type** (device-action shorthand, orthogonal to variant):
 * - `phone` — `tel:` href with phone icon and `(800) 555-0000` formatting
 * - `email` — `mailto:` href with mail icon and optional subject
 * - `download` — passthrough href + download attribute, with optional file-size hint
 *
 * Add `danger` attribute to any variant for destructive action styling.
 * All variants are underlined for accessibility.
 *
 * @element civ-link
 *
 * @prop {string} label - Link text (preferred over child text). When `type` is set, falls back to a formatted display string
 * @prop {string} href - Link destination. When `type` is `phone`/`email`, ignored — the type-specific props build the href instead
 * @prop {LinkVariant} variant - Visual variant
 * @prop {LinkType} type - Device-action type (phone / email / download)
 * @prop {string} number - Phone number (when type="phone")
 * @prop {string} address - Email address (when type="email")
 * @prop {string} subject - Pre-filled email subject (when type="email")
 * @prop {string} filename - Suggested download filename (when type="download")
 * @prop {string} fileSize - Human-readable size suffix e.g. "1.2 MB" (when type="download")
 * @prop {boolean} disabled - Disabled state
 *
 * @fires civ-analytics - Analytics tracking event on click
 */
@customElement('civ-link')
export class CivLink extends LightDomTextMixin(CivBaseElement) {
  @property({ type: String }) label = '';
  @property({ type: String }) href = '';
  @property({ type: String }) variant: LinkVariant = 'secondary';
  @property({ type: String }) type?: LinkType;
  @property({ type: Boolean, reflect: true }) danger = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: String, attribute: 'icon-start' }) iconStart = '';
  @property({ type: String, attribute: 'icon-end' }) iconEnd = '';
  @property({ type: String }) target = '';
  @property({ type: String }) rel = '';
  @property({ type: String }) download = '';

  /** Opens in a new tab — auto-sets target="_blank", rel="noopener noreferrer", external-link icon, and SR "(opens in new tab)" text. */
  @property({ type: Boolean, attribute: 'new-tab' }) newTab = false;

  /** Phone number — digits, dashes, spaces, parens, and + allowed. Used when type="phone". */
  @property({ type: String }) number = '';

  /** Email address. Used when type="email". */
  @property({ type: String }) address = '';

  /** Pre-filled email subject line. Used when type="email". */
  @property({ type: String }) subject = '';

  /** Suggested download filename. Used when type="download". */
  @property({ type: String }) filename = '';

  /** Human-readable file size displayed after link text. Used when type="download". */
  @property({ type: String, attribute: 'file-size' }) fileSize = '';

  /** Build the type-specific href, or fall back to the `href` prop. */
  private get _typedHref(): string {
    if (this.type === 'phone') {
      const digits = this.number.replace(/[^\d+]/g, '');
      return digits ? `tel:${digits}` : '';
    }
    if (this.type === 'email') {
      if (!this.address) return '';
      const params = this.subject ? `?subject=${encodeURIComponent(this.subject)}` : '';
      return `mailto:${this.address}${params}`;
    }
    return this.href;
  }

  /** Type-specific display text, used when no `label` / slotted text is set. */
  private get _typedDisplay(): string {
    if (this.type === 'phone') {
      const digits = this.number.replace(/\D/g, '');
      if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      }
      return this.number;
    }
    if (this.type === 'email') return this.address;
    if (this.type === 'download') return this.filename || this.href;
    return '';
  }

  /** Type-specific leading icon (only applied when `iconStart` is unset). */
  private get _typedIcon(): string {
    if (this.type === 'phone') return 'phone';
    if (this.type === 'email') return 'mail';
    if (this.type === 'download') return 'download';
    return '';
  }

  private get _text(): string {
    return this.label || this._initialText || this._typedDisplay;
  }

  private get _classes(): string {
    const variantClass = this.danger
      ? `civ-link--${this.variant}-danger`
      : `civ-link--${this.variant}`;

    return [
      variantClass,
      this.disabled ? 'civ-opacity-50 civ-cursor-not-allowed' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  private get _trailingIcon() {
    const name = this.iconEnd || (this.newTab ? 'external-link' : '') || (this.variant === 'primary' ? 'chevron-right' : '');
    return name ? html`<civ-icon name="${name}"></civ-icon>` : '';
  }

  private get _leadingIcon() {
    const name = this.iconStart || this._typedIcon || (this.variant === 'back' ? 'chevron-left' : '');
    return name ? html`<civ-icon name="${name}"></civ-icon>` : '';
  }

  /** Tracks whether the icon-only-without-label dev warning has fired for this instance. */
  private _warnedNoAccessibleName = false;

  /** Return sanitized href, stripping dangerous protocols. */
  private get _safeHref(): string {
    return sanitizeHref(this._typedHref);
  }

  /** Effective `download` attribute — falls back to `filename` when type="download". */
  private get _effectiveDownload(): string {
    if (this.download) return this.download;
    if (this.type === 'download') return this.filename;
    return '';
  }

  override render() {
    // Dev-only nudge: an icon-only link with no label / text content
    // has no accessible name. `civ-icon` defaults to `aria-hidden="true"`
    // when no `label` is set, so the link renders empty to AT.
    // Fires once per instance.
    if (
      (this.iconStart || this.iconEnd) &&
      !this._text &&
      !this._warnedNoAccessibleName
    ) {
      devWarn(
        'civ-link',
        'icon-only link has no accessible name. Set `label="…"` so screen-reader users hear where the link goes.',
      );
      this._warnedNoAccessibleName = true;
    }

    if (this.disabled) {
      return html`
        <a
          class="${this._classes}"
          aria-disabled="true"
          tabindex="-1"
          title="${t('linkDisabledTitle')}"
        >${this._leadingIcon}${this._text}${this._trailingIcon}</a>
      `;
    }

    const effectiveTarget = this.newTab ? '_blank' : this.target;
    const effectiveRel = this.newTab ? 'noopener noreferrer' : this.rel;

    return html`
      <a
        href="${this._safeHref}"
        class="${this._classes}"
        target="${effectiveTarget || nothing}"
        rel="${effectiveRel || nothing}"
        download="${this._effectiveDownload || nothing}"
        @click="${this._onClick}"
      >${this._leadingIcon}${this._text}${this._trailingIcon}${this.type === 'download' && this.fileSize ? html`<span class="civ-text-sm civ-ms-1">(${this.fileSize})</span>` : nothing}${this.newTab ? html`<span class="civ-sr-only">${t('externalLinkNewTab')}</span>` : nothing}</a>
    `;
  }

  private _onClick(): void {
    this.sendAnalytics('click');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-link': CivLink;
  }
}
