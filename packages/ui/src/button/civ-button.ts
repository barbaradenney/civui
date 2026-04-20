import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomTextMixin } from '@civui/core';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';
export type LinkVariant = 'primary' | 'secondary' | 'tertiary';
export type ButtonType = 'button' | 'submit';

/**
 * CivUI Button
 *
 * An accessible button/link component with variant options.
 *
 * **Button variants** (no href):
 * - `primary` — filled blue button
 * - `secondary` — outlined border button
 * - `tertiary` — gray filled button
 * - `danger` — filled red button
 *
 * **Link variants** (with href):
 * - `primary` — looks like a primary button (filled blue, underlined)
 * - `secondary` — underlined link with trailing caret icon
 * - `tertiary` — plain underlined link
 *
 * All links are underlined for accessibility.
 *
 * @element civ-button
 *
 * @prop {string} label - Button text (preferred over child text)
 * @prop {ButtonVariant} variant - Visual variant
 * @prop {boolean} disabled - Disabled state
 * @prop {ButtonType} type - Button type attribute
 * @prop {string} href - When set, renders as <a> link instead of <button>
 *
 * @fires civ-analytics - Analytics tracking event on click
 */
@customElement('civ-button')
export class CivButton extends LightDomTextMixin(CivBaseElement) {
  @property({ type: String }) label = '';
  @property({ type: String }) variant: ButtonVariant = 'primary';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: String }) type: ButtonType = 'button';
  @property({ type: String }) href = '';

  private get _text(): string {
    return this.label || this._initialText;
  }

  private get _buttonClasses(): string {
    return [
      'civ-btn',
      `civ-btn--${this.variant}`,
      this.disabled ? 'civ-opacity-50 civ-cursor-not-allowed' : '',
      'focus-visible:civ-focus-ring',
    ]
      .filter(Boolean)
      .join(' ');
  }

  private get _linkClasses(): string {
    return [
      `civ-link--${this.variant}`,
      this.disabled ? 'civ-opacity-50 civ-cursor-not-allowed' : '',
      'focus-visible:civ-focus-ring',
    ]
      .filter(Boolean)
      .join(' ');
  }

  override render() {
    if (this.href) {
      if (this.disabled) {
        return html`
          <a
            class="${this._linkClasses}"
            aria-disabled="true"
            tabindex="-1"
          >${this._text}${this.variant === 'secondary' ? html`<civ-icon name="chevron-right" size="sm"></civ-icon>` : ''}</a>
        `;
      }
      return html`
        <a
          href="${this.href}"
          class="${this._linkClasses}"
          @click="${this._onClick}"
        >${this._text}${this.variant === 'secondary' ? html`<civ-icon name="chevron-right" size="sm"></civ-icon>` : ''}</a>
      `;
    }

    return html`
      <button
        type="${this.type}"
        class="${this._buttonClasses}"
        ?disabled="${this.disabled}"
        @click="${this._onClick}"
      >${this._text}</button>
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
