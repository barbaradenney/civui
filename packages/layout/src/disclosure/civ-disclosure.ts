// Schema: packages/schema/src/components/civ-disclosure.schema.ts

import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, dispatch, t } from '@civui/core';

/**
 * CivUI Disclosure
 *
 * Inline expandable content with a clickable trigger. Use it for
 * "Why we ask?" justifications next to PII fields, definitions of
 * jargon, or any supplementary text that doesn't need to be visible
 * by default. Built on the native `<details>`/`<summary>` semantics
 * so it works without JavaScript and is announced as a disclosure
 * widget by screen readers.
 *
 * Pass content via the default slot. The trigger renders an inline
 * icon (default `info`) plus the `label` text. Setting `open` opens
 * the disclosure programmatically; the component dispatches
 * `civ-toggle` with `{ open }` whenever the user toggles it.
 *
 * @element civ-disclosure
 *
 * @prop {string} label - Trigger text (defaults to "Why we ask?")
 * @prop {boolean} open - Whether the content is visible
 * @prop {string} icon - Icon name from the civ-icon library; pass an empty string to hide it
 * @prop {string} size - Trigger size: 'default' or 'sm'
 *
 * @fires civ-toggle - When the open/closed state changes, detail: { open }
 * @fires civ-analytics - Analytics tracking on toggle
 *
 * @slot - Disclosure content rendered when open
 */
@customElement('civ-disclosure')
export class CivDisclosure extends CivBaseElement {
  /** Trigger text displayed beside the icon. */
  @property({ type: String }) label = '';

  /** Whether the disclosure is currently expanded. */
  @property({ type: Boolean, reflect: true }) open = false;

  /**
   * Icon name from the civ-icon library. Pass an empty string to
   * suppress the icon (text-only trigger).
   */
  @property({ type: String }) icon = 'info';

  /** Trigger size: 'default' or 'sm'. */
  @property({ type: String }) size: 'default' | 'sm' = 'default';

  private _contentId = this.generateId('content');

  override render() {
    const labelText = this.label || t('disclosureDefaultLabel');
    const sizeClass = this.size === 'sm' ? 'civ-text-sm' : '';
    return html`
      <details
        class="civ-disclosure"
        ?open="${this.open}"
        @toggle="${this._onToggle}"
      >
        <summary
          class="civ-disclosure__trigger ${sizeClass}"
          aria-controls="${this._contentId}"
        >
          ${this.icon
            ? html`<civ-icon name="${this.icon}" class="civ-disclosure__icon" aria-hidden="true"></civ-icon>`
            : nothing}
          <span class="civ-disclosure__label">${labelText}</span>
        </summary>
        <div id="${this._contentId}" class="civ-disclosure__content">
          <slot></slot>
        </div>
      </details>
    `;
  }

  private _onToggle(e: Event): void {
    const details = e.target as HTMLDetailsElement;
    if (details.open === this.open) return;
    this.open = details.open;
    dispatch(this, 'civ-toggle', { open: this.open });
    this.sendAnalytics('change', { open: this.open });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-disclosure': CivDisclosure;
  }
}
