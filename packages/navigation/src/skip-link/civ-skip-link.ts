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
 * Label text is set via the `label` property. If `label` is not set,
 * initial Light DOM text content is used, defaulting to
 * "Skip to main content".
 *
 * @element civ-skip-link
 *
 * @prop {string} label - Link text (preferred over child text)
 * @prop {string} href - Target anchor for the skip link
 */
@customElement('civ-skip-link')
export class CivSkipLink extends CivBaseElement {
  @property({ type: String }) label = '';
  @property({ type: String }) href = '#main-content';

  private _initialText = '';

  override connectedCallback(): void {
    // Capture initial text content before Lit renders (fallback for label prop)
    if (!this._initialText) {
      this._initialText = this.textContent?.trim() || '';
    }
    this.textContent = '';
    super.connectedCallback();
  }

  private get _text(): string {
    return this.label || this._initialText || 'Skip to main content';
  }

  override render() {
    return html`
      <a
        href="${this.href}"
        class="civ-skip-link focus-visible:civ-focus-ring"
      >${this._text}</a>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-skip-link': CivSkipLink;
  }
}
