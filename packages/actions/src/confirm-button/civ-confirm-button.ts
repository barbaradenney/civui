// Schema: packages/schema/src/components/civ-confirm-button.schema.ts

import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivBaseElement, devWarn, dispatch, t } from '@civui/core';

export type ConfirmButtonEmphasis = 'primary' | 'secondary' | 'tertiary';
/** @deprecated Use `ConfirmButtonEmphasis` ("secondary" | "tertiary") instead. */
export type ConfirmButtonVariant = 'chip' | 'inline';

/**
 * CivUI Confirm Button
 *
 * Text button that fires an action and shows a transient "✓ <past-tense>"
 * confirmation for a configurable window before reverting. Used for
 * fire-and-forget actions whose feedback needs to be visible without
 * yanking the user's attention to a toast.
 *
 * **Use cases.** Copy / Paste / Scan / Generate — anywhere the user
 * clicks once, the action completes synchronously, and the UI needs to
 * acknowledge the receipt before reverting.
 *
 * **Not for.** Toggle states with two persistent labels (Show / Hide
 * password, expand / collapse). Use `<civ-toggle-button>` for those.
 * Or for primary form CTAs — use `<civ-button>`.
 *
 * **Padding stays stable across states.** The component owns the
 * variant class and never swaps it during the success window. Only
 * the `.is-success` flag is added; the label text changes; the
 * padding box does not shift.
 *
 * **Accessibility.** `aria-live="polite"` is enabled during the
 * success window so screen readers re-announce the receipt label
 * (a same-button text swap doesn't otherwise trigger SR re-read).
 *
 * @element civ-confirm-button
 *
 * @prop {string} label - The resting label ("Copy")
 * @prop {string} successLabel - The transient receipt label after activation. Defaults to the localized "Done".
 * @prop {number} successMs - How long the success state stays visible. Default 1500 ms. Re-clicks during the window restart the timer.
 * @prop {ConfirmButtonEmphasis} emphasis - Visual emphasis. `secondary` (default) is the gray pill — the common case. `primary` is the filled brand pill for a louder inline CTA. `tertiary` is the transparent text-link style.
 * @prop {ConfirmButtonVariant} variant - **Deprecated** alias for `emphasis`. `variant="chip"` maps to `emphasis="secondary"`; `variant="inline"` maps to `emphasis="tertiary"`. Will emit a one-time dev warning when set.
 * @prop {boolean} disabled - Standard disabled state.
 *
 * @fires civ-confirm - On activation, BEFORE entering the success window. Consumer does the actual work in the listener (clipboard write, share, etc.). detail: {}
 *
 * @example
 * ```html
 * <civ-confirm-button label="Copy" success-label="Copied"
 *   @civ-confirm=${async () => {
 *     await navigator.clipboard.writeText(value);
 *   }}>
 * </civ-confirm-button>
 * ```
 */
@customElement('civ-confirm-button')
export class CivConfirmButton extends CivBaseElement {
  @property({ type: String }) label = '';
  @property({ type: String, attribute: 'success-label' }) successLabel = '';
  @property({ type: Number, attribute: 'success-ms' }) successMs = 1500;
  @property({ type: String }) emphasis: ConfirmButtonEmphasis = 'secondary';
  /**
   * @deprecated Use `emphasis` instead. `variant="chip"` ≡ `emphasis="secondary"`;
   * `variant="inline"` ≡ `emphasis="tertiary"`. Setting this prop emits a one-time
   * dev warning and overrides `emphasis` (so existing markup keeps working).
   */
  @property({ type: String }) variant: ConfirmButtonVariant | '' = '';
  @property({ type: Boolean, reflect: true }) disabled = false;

  @state() private _success = false;
  private _warnedVariant = false;

  private _successTimer?: ReturnType<typeof setTimeout>;

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._successTimer !== undefined) {
      clearTimeout(this._successTimer);
      this._successTimer = undefined;
    }
  }

  /**
   * Programmatic reset — cancel any in-flight success state and revert.
   * Useful when the consumer's work fails after `civ-confirm` fires; call
   * this to dismiss the receipt without waiting for the timer.
   */
  reset(): void {
    if (this._successTimer !== undefined) clearTimeout(this._successTimer);
    this._successTimer = undefined;
    this._success = false;
  }

  private _onClick(): void {
    if (this.disabled) return;
    dispatch(this, 'civ-confirm', {});
    this.sendAnalytics('change');
    // Re-clicks during the success window restart the timer (no
    // stacking) — the second tap reads as "they meant it; reset the
    // confirmation."
    if (this._successTimer !== undefined) clearTimeout(this._successTimer);
    this._success = true;
    this._successTimer = setTimeout(() => {
      this._success = false;
      this._successTimer = undefined;
    }, this.successMs);
  }

  override render() {
    // Backward-compat: when `variant` is set, derive `emphasis` from it and
    // emit a one-time dev warning to nudge consumers toward the new prop.
    let effectiveEmphasis: ConfirmButtonEmphasis = this.emphasis;
    if (this.variant) {
      if (!this._warnedVariant) {
        devWarn(
          'civ-confirm-button',
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
    const classes = ['civ-text-btn', emphasisClass, this._success ? 'is-success' : ''].filter(Boolean).join(' ');
    const resting = this.label;
    const success = this.successLabel || t('confirmButtonSuccess') || 'Done';
    return html`
      <button
        type="button"
        class="${classes}"
        ?disabled="${this.disabled}"
        aria-live="${this._success ? 'polite' : 'off'}"
        @click="${this._onClick}"
      >${this._success ? success : resting}</button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-confirm-button': CivConfirmButton;
  }
}
