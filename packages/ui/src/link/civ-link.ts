import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomTextMixin } from '@civui/core';

export type LinkVariant = 'primary' | 'secondary' | 'tertiary' | 'back';

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
    if (this.variant === 'secondary') return html`<civ-icon name="chevron-right" size="sm"></civ-icon>`;
    return '';
  }

  private get _leadingIcon() {
    if (this.variant === 'back') return html`<civ-icon name="chevron-left" size="sm"></civ-icon>`;
    return '';
  }

  override render() {
    if (this.disabled) {
      return html`
        <a
          class="${this._classes}"
          aria-disabled="true"
          tabindex="-1"
        >${this._leadingIcon}${this._text}${this._trailingIcon}</a>
      `;
    }

    return html`
      <a
        href="${this.href}"
        class="${this._classes}"
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
