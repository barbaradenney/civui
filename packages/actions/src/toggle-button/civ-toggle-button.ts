// Schema: packages/schema/src/components/civ-toggle-button.schema.ts

import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, dispatch } from '@civui/core';

export type ToggleButtonVariant = 'chip' | 'inline';

/**
 * CivUI Toggle Button
 *
 * Text button with two persistent labels and an `aria-pressed` state.
 * Click flips `pressed` and swaps the visible label. Use for
 * show/hide toggles where each state has a clear name — password
 * reveal (Show / Hide), mute / unmute, expand / collapse on a
 * custom non-disclosure surface.
 *
 * **Not for.**
 * - Fire-and-forget actions with transient feedback — use
 *   `<civ-confirm-button>` (Copy / Paste / Scan).
 * - Native disclosure (open / closed sections) — use
 *   `<civ-disclosure>` so the browser owns the `<details>` machinery.
 * - Read-more expansion of prose — use `<civ-read-more>`.
 *
 * **Padding stays stable.** The component holds the variant class
 * constant; only the label text and `aria-pressed` flip. The
 * button does not visibly shrink between states.
 *
 * **Accessibility.** Renders `aria-pressed="true"|"false"` on the
 * inner `<button>` so screen readers announce the toggle state.
 * `pressed` reflects to the host attribute for two-way binding.
 *
 * @element civ-toggle-button
 *
 * @prop {string} label - Unpressed label ("Show")
 * @prop {string} pressedLabel - Pressed label ("Hide"). Required — the swap label gives the toggle its meaning.
 * @prop {boolean} pressed - Reflected boolean state. Two-way bindable.
 * @prop {ToggleButtonVariant} variant - Picks the text-btn modifier. `inline` (default) is the transparent text-link style typical for input-inset controls (password reveal). `chip` is the prominent pill, for helper-row or standalone use.
 * @prop {boolean} disabled - Standard disabled state.
 *
 * @fires civ-toggle - On click. detail: { pressed: boolean } — the NEW state after the toggle.
 *
 * @example
 * ```html
 * <civ-toggle-button
 *   label="Show"
 *   pressed-label="Hide"
 *   variant="inline"
 *   @civ-toggle=${(e) => {
 *     const input = document.querySelector('input[type="password"]');
 *     input.type = e.detail.pressed ? 'text' : 'password';
 *   }}>
 * </civ-toggle-button>
 * ```
 */
@customElement('civ-toggle-button')
export class CivToggleButton extends CivBaseElement {
  @property({ type: String }) label = '';
  @property({ type: String, attribute: 'pressed-label' }) pressedLabel = '';
  @property({ type: Boolean, reflect: true }) pressed = false;
  @property({ type: String }) variant: ToggleButtonVariant = 'inline';
  @property({ type: Boolean, reflect: true }) disabled = false;

  private _onClick(): void {
    if (this.disabled) return;
    this.pressed = !this.pressed;
    dispatch(this, 'civ-toggle', { pressed: this.pressed });
    this.sendAnalytics('change', { pressed: this.pressed });
  }

  override render() {
    const variantClass = this.variant === 'chip' ? 'civ-text-btn--chip' : 'civ-text-btn--inline';
    const classes = `civ-text-btn ${variantClass}`;
    const visibleLabel = this.pressed ? this.pressedLabel : this.label;
    return html`
      <button
        type="button"
        class="${classes}"
        aria-pressed="${this.pressed ? 'true' : 'false'}"
        ?disabled="${this.disabled}"
        @click="${this._onClick}"
      >${visibleLabel}</button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-toggle-button': CivToggleButton;
  }
}
