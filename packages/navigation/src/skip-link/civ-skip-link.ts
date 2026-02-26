import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement } from '@civui/core';

/**
 * CivUI Skip Link
 *
 * An accessible skip navigation link that is visually hidden except
 * when focused. Allows keyboard users to bypass navigation and jump
 * directly to the main content area.
 *
 * @element civ-skip-link
 *
 * @prop {string} href - Target anchor for the skip link
 */
@customElement('civ-skip-link')
export class CivSkipLink extends CivBaseElement {
  @property({ type: String }) href = '#main-content';

  private _labelText = '';

  override connectedCallback(): void {
    super.connectedCallback();
    // Capture initial text content before Lit renders
    if (!this._labelText) {
      this._labelText = this.textContent?.trim() || 'Skip to main content';
    }
  }

  override render() {
    return html`
      <a
        href="${this.href}"
        class="civ-skip-link focus-visible:civ-focus-ring"
      >${this._labelText}</a>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-skip-link': CivSkipLink;
  }
}
