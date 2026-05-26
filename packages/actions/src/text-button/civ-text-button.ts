// Schema: packages/schema/src/components/civ-text-button.schema.ts

import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LoadingMixin, dispatch } from '@civui/core';
import '@civui/feedback/spinner';

export type TextButtonEmphasis = 'primary' | 'secondary' | 'tertiary';
export type TextButtonSpacing = 'default' | 'sm';

/**
 * CivUI Text Button
 *
 * The small button primitive — a thin element wrapping the shared
 * `.civ-text-btn` chrome that `civ-disclosure`, `civ-read-more`,
 * `civ-confirm-button`, and `civ-toggle-button` all compose. Use when
 * you need a click affordance with the text-btn visual idiom but
 * none of the state-machine behaviors of the confirm / toggle
 * siblings.
 *
 * **When to use vs. siblings**
 * - Plain click affordance (one-shot, no receipt, no toggle) → this.
 * - Fire-and-forget with a "✓ Copied" receipt → `civ-confirm-button`.
 * - Two-state toggle with `aria-pressed` → `civ-toggle-button`.
 * - Heavy page-level CTA → `civ-button`.
 * - Toolbar / row action → `civ-action-button`.
 *
 * **Emphasis levels**
 * - `primary` — filled brand color. Loudest text-btn; reserve for
 *   the rare inline CTA that outweighs siblings.
 * - `secondary` (default) — gray pill. The common case.
 * - `tertiary` — transparent text-link feel. For quiet shortcuts
 *   inside dense surfaces (date-picker "Today", time-picker "Now").
 *
 * @element civ-text-button
 *
 * @prop {string} label - Button text. Required.
 * @prop {TextButtonEmphasis} emphasis - Visual emphasis. Default `secondary`.
 * @prop {TextButtonSpacing} spacing - Density. `sm` shrinks padding + font-size for dense prose.
 * @prop {string} iconStart - Leading icon name (rendered with aria-hidden so the label remains the accessible name).
 * @prop {string} iconEnd - Trailing icon name.
 * @prop {string} type - HTML button type (`button` / `submit` / `reset`). Default `button`.
 * @prop {boolean} disabled - Standard disabled state.
 * @prop {boolean} loading - When true, swaps the leading icon for a `civ-spinner`, disables the button, and sets `aria-busy`. Use during in-flight async work (Generate / Scan / Copy that hits the network).
 * @prop {string} loadingLabel - Accessible label announced once on the loading transition (default "Loading…"). Pass an action-specific present-participle verb ("Generating…", "Scanning…").
 *
 * @fires civ-click - On activation. detail: {}
 *
 * @example
 * ```html
 * <civ-text-button label="Show more"></civ-text-button>
 * <civ-text-button label="Generate" emphasis="primary"></civ-text-button>
 * <civ-text-button label="Today" emphasis="tertiary" icon-start="today"></civ-text-button>
 * ```
 */
@customElement('civ-text-button')
export class CivTextButton extends LoadingMixin(CivBaseElement) {
  @property({ type: String }) label = '';
  @property({ type: String }) emphasis: TextButtonEmphasis = 'secondary';
  @property({ type: String }) spacing: TextButtonSpacing = 'default';
  @property({ type: String, attribute: 'icon-start' }) iconStart = '';
  @property({ type: String, attribute: 'icon-end' }) iconEnd = '';
  @property({ type: String }) type: 'button' | 'submit' | 'reset' = 'button';
  @property({ type: Boolean, reflect: true }) disabled = false;
  // `loading` and `loadingLabel` are inherited from `LoadingMixin`.

  /** Effective disabled state — `loading` implies disabled. */
  private get _effectiveDisabled(): boolean {
    return this.disabled || this.isLoading;
  }

  private get _classes(): string {
    const emphasisClass =
      this.emphasis === 'primary' ? 'civ-text-btn--primary' :
      this.emphasis === 'tertiary' ? 'civ-text-btn--inline' :
      'civ-text-btn--chip';
    return ['civ-text-btn', emphasisClass, this.spacing === 'sm' ? 'civ-text-btn--sm' : '']
      .filter(Boolean)
      .join(' ');
  }

  private _onClick(): void {
    if (this._effectiveDisabled) return;
    dispatch(this, 'civ-click', {});
    this.sendAnalytics('click');
  }

  override render() {
    // Loading swaps the leading icon for a decorative spinner so the
    // overall footprint stays stable across the state transition.
    // `sm` is the smallest size civ-spinner supports.
    const leadingSlot = this.isLoading
      ? this.renderLoadingSpinner('sm')
      : this.iconStart
        ? html`<civ-icon name="${this.iconStart}" aria-hidden="true"></civ-icon>`
        : null;
    return html`
      <button
        type="${this.type}"
        class="${this._classes}"
        ?disabled="${this._effectiveDisabled}"
        aria-busy="${this.isLoading ? 'true' : nothing}"
        aria-label="${this.isLoading ? this.effectiveLoadingLabel : nothing}"
        @click="${this._onClick}"
      >${leadingSlot}${this.label}${this.iconEnd ? html`<civ-icon name="${this.iconEnd}" aria-hidden="true"></civ-icon>` : null}</button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-text-button': CivTextButton;
  }
}
