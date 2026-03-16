import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomTextMixin } from '@civui/core';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'unstyled';
export type ButtonSize = 'default' | 'big';
export type ButtonType = 'button' | 'submit' | 'reset';

/**
 * CivUI Button
 *
 * An accessible button component with variant and size options.
 * Renders as `<a>` when `href` is set, otherwise `<button>`.
 *
 * Content is set via the `label` property. If `label` is not set,
 * initial Light DOM text content is used as a fallback.
 *
 * @element civ-button
 *
 * @prop {string} label - Button text (preferred over child text)
 * @prop {ButtonVariant} variant - Visual variant
 * @prop {ButtonSize} size - Size variant
 * @prop {boolean} disabled - Disabled state
 * @prop {ButtonType} type - Button type attribute
 * @prop {string} href - When set, renders as <a> instead of <button>
 *
 * @fires civ-analytics - Analytics tracking event on click
 */
@customElement('civ-button')
export class CivButton extends LightDomTextMixin(CivBaseElement) {
  @property({ type: String }) label = '';
  @property({ type: String }) variant: ButtonVariant = 'primary';
  @property({ type: String }) size: ButtonSize = 'default';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: String }) type: ButtonType = 'button';
  @property({ type: String }) href = '';

  private get _text(): string {
    return this.label || this._initialText;
  }

  private get _classes(): string {
    return [
      'civ-btn',
      `civ-btn--${this.variant}`,
      this.size === 'big' ? 'civ-btn--big' : '',
      this.disabled ? 'civ-opacity-50 civ-cursor-not-allowed' : '',
      'focus-visible:civ-focus-ring',
    ]
      .filter(Boolean)
      .join(' ');
  }

  override render() {
    if (this.href) {
      // When disabled, strip href and remove from tab order to prevent navigation
      if (this.disabled) {
        return html`
          <a
            class="${this._classes}"
            aria-disabled="true"
            tabindex="-1"
          >${this._text}</a>
        `;
      }
      return html`
        <a
          href="${this.href}"
          class="${this._classes}"
          @click="${this._onClick}"
        >${this._text}</a>
      `;
    }

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
