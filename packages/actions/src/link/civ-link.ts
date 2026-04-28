import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomTextMixin, t } from '@civui/core';

export type LinkVariant = 'primary' | 'secondary' | 'tertiary' | 'back';

/** Protocols that are never allowed in link href values. */
const UNSAFE_HREF_PATTERN = /^\s*javascript\s*:/i;

/**
 * CivUI Link
 *
 * An accessible link component. Always renders an `<a>` element.
 * For buttons, use `<civ-button>` instead.
 *
 * **Variants:**
 * - `primary` — button-styled link (filled blue, underlined)
 * - `secondary` — underlined text with trailing caret icon
 * - `tertiary` — plain underlined link
 * - `back` — back navigation link with leading left chevron
 *
 * Add `danger` attribute to any variant for destructive action styling.
 * All variants are underlined for accessibility.
 *
 * @element civ-link
 *
 * @prop {string} label - Link text (preferred over child text)
 * @prop {string} href - Link destination (required)
 * @prop {LinkVariant} variant - Visual variant
 * @prop {boolean} disabled - Disabled state
 *
 * @fires civ-analytics - Analytics tracking event on click
 */
@customElement('civ-link')
export class CivLink extends LightDomTextMixin(CivBaseElement) {
  @property({ type: String }) label = '';
  @property({ type: String }) href = '';
  @property({ type: String }) variant: LinkVariant = 'tertiary';
  @property({ type: Boolean, reflect: true }) danger = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: String, attribute: 'icon-start' }) iconStart = '';
  @property({ type: String, attribute: 'icon-end' }) iconEnd = '';
  @property({ type: String }) target = '';
  @property({ type: String }) rel = '';
  @property({ type: String }) download = '';

  private get _text(): string {
    return this.label || this._initialText;
  }

  private get _classes(): string {
    const variantClass = this.danger
      ? `civ-link--${this.variant}-danger`
      : `civ-link--${this.variant}`;

    return [
      variantClass,
      this.disabled ? 'civ-opacity-50 civ-cursor-not-allowed' : '',
      'focus-visible:civ-focus-ring',
    ]
      .filter(Boolean)
      .join(' ');
  }

  private get _trailingIcon() {
    const name = this.iconEnd || (this.variant === 'secondary' ? 'chevron-right' : '');
    return name ? html`<civ-icon name="${name}" size="sm"></civ-icon>` : '';
  }

  private get _leadingIcon() {
    const name = this.iconStart || (this.variant === 'back' ? 'chevron-left' : '');
    return name ? html`<civ-icon name="${name}" size="sm"></civ-icon>` : '';
  }

  /** Return sanitized href, stripping dangerous protocols. */
  private get _safeHref(): string {
    if (UNSAFE_HREF_PATTERN.test(this.href)) return '';
    return this.href;
  }

  override render() {
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

    return html`
      <a
        href="${this._safeHref}"
        class="${this._classes}"
        target="${this.target || nothing}"
        rel="${this.rel || nothing}"
        download="${this.download || nothing}"
        @click="${this._onClick}"
      >${this._leadingIcon}${this._text}${this._trailingIcon}</a>
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
