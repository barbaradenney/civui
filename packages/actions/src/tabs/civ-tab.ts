import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomTextMixin, dispatch } from '@civui/core';

/**
 * CivUI Tab
 *
 * A single tab inside `<civ-tabs>`. The parent `<civ-tabs>` controls
 * selection, roving tabindex, and `aria-controls` wiring — set `value`
 * to match the corresponding `<civ-tab-panel>` and let the parent do
 * the rest.
 *
 * Renders a `<button role="tab">`. The button is the focusable element;
 * the host element is structural.
 *
 * @element civ-tab
 *
 * @prop {string} value - Unique identifier — must match a sibling `<civ-tab-panel>`'s `value`
 * @prop {string} label - Visible tab label. Falls back to initial child text
 * @prop {boolean} selected - Set by the parent `<civ-tabs>`. Don't set this directly — set `value` on `<civ-tabs>` instead
 * @prop {boolean} disabled - Disabled state — tab is skipped during keyboard navigation
 */
@customElement('civ-tab')
export class CivTab extends LightDomTextMixin(CivBaseElement) {
  @property({ type: String }) value = '';
  @property({ type: String }) label = '';
  @property({ type: Boolean, reflect: true }) selected = false;
  @property({ type: Boolean, reflect: true }) disabled = false;

  private get _text(): string {
    return this.label || this._initialText;
  }

  /** Focus the inner `<button role="tab">` — called by the parent during keyboard navigation. */
  override focus(options?: FocusOptions): void {
    const btn = this.querySelector<HTMLButtonElement>('button[role="tab"]');
    if (btn) {
      btn.focus(options);
    } else {
      super.focus(options);
    }
  }

  override render() {
    const classes = [
      'civ-tab',
      this.selected ? 'civ-tab--selected' : '',
      this.disabled ? 'civ-tab--disabled' : '',
    ].filter(Boolean).join(' ');

    return html`
      <button
        type="button"
        role="tab"
        class="${classes}"
        tabindex="${this.selected ? 0 : -1}"
        aria-selected="${this.selected ? 'true' : 'false'}"
        ?disabled="${this.disabled}"
        @click="${this._onClick}"
      >${this._text}</button>
    `;
  }

  private _onClick(): void {
    if (this.disabled) return;
    dispatch(this, 'civ-tab-select', { value: this.value });
    this.sendAnalytics('click');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-tab': CivTab;
  }
}
