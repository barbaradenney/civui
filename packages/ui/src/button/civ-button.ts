import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement } from '@civui/core';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'unstyled';
export type ButtonSize = 'default' | 'big';
export type ButtonType = 'button' | 'submit' | 'reset';

/**
 * CivUI Button
 *
 * An accessible button component with variant and size options.
 * Renders as `<a>` when `href` is set, otherwise `<button>`.
 * Content is provided via Light DOM children.
 *
 * @element civ-button
 *
 * @prop {ButtonVariant} variant - Visual variant
 * @prop {ButtonSize} size - Size variant
 * @prop {boolean} disabled - Disabled state
 * @prop {ButtonType} type - Button type attribute
 * @prop {string} href - When set, renders as <a> instead of <button>
 *
 * @fires civ-analytics - Analytics tracking event on click
 */
@customElement('civ-button')
export class CivButton extends CivBaseElement {
  @property({ type: String }) variant: ButtonVariant = 'primary';
  @property({ type: String }) size: ButtonSize = 'default';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: String }) type: ButtonType = 'button';
  @property({ type: String }) href = '';

  private _labelText = '';

  override connectedCallback(): void {
    super.connectedCallback();
    // Capture initial text content before Lit renders
    if (!this._labelText) {
      this._labelText = this.textContent?.trim() || '';
    }
  }

  private get _classes(): string {
    return [
      'civ-btn',
      `civ-btn--${this.variant}`,
      this.size === 'big' ? 'civ-btn--big' : '',
      'focus-visible:civ-focus-ring',
    ]
      .filter(Boolean)
      .join(' ');
  }

  override render() {
    if (this.href) {
      return html`
        <a
          href="${this.href}"
          class="${this._classes}"
          aria-disabled="${this.disabled ? 'true' : nothing}"
          @click="${this._onClick}"
        >${this._labelText}</a>
      `;
    }

    return html`
      <button
        type="${this.type}"
        class="${this._classes}"
        ?disabled="${this.disabled}"
        @click="${this._onClick}"
      >${this._labelText}</button>
    `;
  }

  private _onClick(e: Event): void {
    if (this.disabled) {
      e.preventDefault();
      return;
    }
    this.sendAnalytics('click');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-button': CivButton;
  }
}
