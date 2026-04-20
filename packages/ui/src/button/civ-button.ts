import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomTextMixin } from '@civui/core';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
export type ButtonType = 'button' | 'submit' | 'reset';

/**
 * CivUI Button
 *
 * An accessible button component. Always renders a `<button>` element.
 * For links, use `<civ-link>` instead.
 *
 * **Variants:**
 * - `primary` — filled blue button
 * - `secondary` — outlined border button
 * - `tertiary` — gray filled button (same height as form inputs)
 *
 * Add `danger` attribute to any variant for destructive action styling.
 *
 * @element civ-button
 *
 * @prop {string} label - Button text (preferred over child text)
 * @prop {ButtonVariant} variant - Visual variant
 * @prop {boolean} danger - Destructive action styling
 * @prop {boolean} disabled - Disabled state
 * @prop {ButtonType} type - Button type attribute
 *
 * @fires civ-analytics - Analytics tracking event on click
 */
@customElement('civ-button')
export class CivButton extends LightDomTextMixin(CivBaseElement) {
  @property({ type: String }) label = '';
  @property({ type: String }) variant: ButtonVariant = 'primary';
  @property({ type: Boolean, reflect: true }) danger = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: String }) type: ButtonType = 'button';

  private get _text(): string {
    return this.label || this._initialText;
  }

  private get _classes(): string {
    const variantClass = this.danger
      ? `civ-btn--${this.variant}-danger`
      : `civ-btn--${this.variant}`;

    return [
      'civ-btn',
      variantClass,
      this.disabled ? 'civ-opacity-50 civ-cursor-not-allowed' : '',
      'focus-visible:civ-focus-ring',
    ]
      .filter(Boolean)
      .join(' ');
  }

  override render() {
    return html`
      <button
        type="${this.type}"
        class="${this._classes}"
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
