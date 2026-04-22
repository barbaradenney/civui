import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement } from '@civui/core';

export type ActionButtonVariant = 'primary' | 'secondary' | 'tertiary';

/**
 * CivUI Action Button
 *
 * A compact button for toolbars, inline form controls, and secondary
 * actions. Same variant system as `civ-button` but with smaller
 * padding and font size.
 *
 * Can be used standalone or grouped inside `<civ-button-group>` to
 * form a connected toolbar.
 *
 * **Variants:**
 * - `primary` — filled blue
 * - `secondary` — light tint background
 * - `tertiary` (default) — outlined border
 *
 * @element civ-action-button
 *
 * @prop {string} label - Button text
 * @prop {ActionButtonVariant} variant - Visual variant
 * @prop {boolean} disabled - Disabled state
 * @prop {boolean} pressed - Toggle pressed state (for toolbar toggles)
 *
 * @fires civ-analytics - Analytics tracking event on click
 *
 * @example
 * ```html
 * <civ-action-button label="Bold"></civ-action-button>
 * <civ-action-button label="Save" variant="primary"></civ-action-button>
 * ```
 */
@customElement('civ-action-button')
export class CivActionButton extends CivBaseElement {
  @property({ type: String }) label = '';
  @property({ type: String }) variant: ActionButtonVariant = 'tertiary';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) pressed = false;
  @property({ type: String }) type: 'button' | 'submit' | 'reset' = 'button';

  private get _classes(): string {
    return [
      'civ-action-btn',
      `civ-action-btn--${this.variant}`,
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
        aria-pressed="${this.pressed ? 'true' : 'false'}"
        @click="${this._onClick}"
      >${this.label}</button>
    `;
  }

  private _onClick(): void {
    this.sendAnalytics('click');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-action-button': CivActionButton;
  }
}
