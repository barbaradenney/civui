// Schema: packages/schema/src/components/civ-toggle-button.schema.ts

import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, devWarn, dispatch } from '@civui/core';

export type ToggleButtonEmphasis = 'primary' | 'secondary' | 'tertiary';
/** @deprecated Use `ToggleButtonEmphasis` ("secondary" | "tertiary") instead. */
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
 * @prop {ToggleButtonEmphasis} emphasis - Visual emphasis. `secondary` (default) is the gray pill — the common case (helper rows, standalone toggles, password reveal). `primary` is the filled brand pill. `tertiary` is the transparent text-link style for surfaces where the toggle should read as quiet.
 * @prop {ToggleButtonVariant} variant - **Deprecated** alias for `emphasis`. `variant="chip"` maps to `emphasis="secondary"`; `variant="inline"` maps to `emphasis="tertiary"`. Will emit a one-time dev warning when set.
 * @prop {string} iconStart - Optional leading icon name (e.g. `chevron-down` for an accordion expand-all toggle, `visibility` for a password reveal). Rendered with `aria-hidden="true"` so the label remains the accessible name.
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
  @property({ type: String }) emphasis: ToggleButtonEmphasis = 'secondary';
  /**
   * @deprecated Use `emphasis` instead. `variant="chip"` ≡ `emphasis="secondary"`;
   * `variant="inline"` ≡ `emphasis="tertiary"`. Setting this prop emits a one-time
   * dev warning and overrides `emphasis` (so existing markup keeps working).
   */
  @property({ type: String }) variant: ToggleButtonVariant | '' = '';
  @property({ type: String, attribute: 'icon-start' }) iconStart = '';
  @property({ type: Boolean, reflect: true }) disabled = false;

  private _warnedVariant = false;

  private _onClick(): void {
    if (this.disabled) return;
    this.pressed = !this.pressed;
    dispatch(this, 'civ-toggle', { pressed: this.pressed });
    this.sendAnalytics('change', { pressed: this.pressed });
  }

  override render() {
    // Backward-compat: when `variant` is set, derive `emphasis` from it and
    // emit a one-time dev warning to nudge consumers toward the new prop.
    let effectiveEmphasis: ToggleButtonEmphasis = this.emphasis;
    if (this.variant) {
      if (!this._warnedVariant) {
        devWarn(
          'civ-toggle-button',
          'The `variant` prop is deprecated. Use `emphasis="secondary"` (was `variant="chip"`) or `emphasis="tertiary"` (was `variant="inline"`).',
        );
        this._warnedVariant = true;
      }
      effectiveEmphasis = this.variant === 'inline' ? 'tertiary' : 'secondary';
    }
    const emphasisClass =
      effectiveEmphasis === 'primary' ? 'civ-text-btn--primary' :
      effectiveEmphasis === 'tertiary' ? 'civ-text-btn--inline' :
      'civ-text-btn--chip';
    const classes = `civ-text-btn ${emphasisClass}`;
    const visibleLabel = this.pressed ? this.pressedLabel : this.label;
    return html`
      <button
        type="button"
        class="${classes}"
        aria-pressed="${this.pressed ? 'true' : 'false'}"
        ?disabled="${this.disabled}"
        @click="${this._onClick}"
      >${this.iconStart ? html`<civ-icon name="${this.iconStart}" aria-hidden="true"></civ-icon>` : null}${visibleLabel}</button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-toggle-button': CivToggleButton;
  }
}
