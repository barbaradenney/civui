import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomTextMixin, dispatch } from '@civui/core';
import '@civui/feedback/count';

/**
 * CivUI Action Chip
 *
 * Fire-and-forget rounded button shaped like a chip — same outlined
 * pill chrome as `civ-filter-chip` but with no toggle state and no
 * check icon. Click it; it dispatches `civ-click`; nothing changes
 * about the chip itself. Use for suggestion chips ("Last 30 days",
 * "Try a new search"), quick filters that immediately re-fetch a
 * dataset rather than accumulating a selection, and secondary CTAs
 * that need a less prominent shape than `civ-button`.
 *
 * **When to use which chip:**
 * - `civ-action-chip` — fire-and-forget, no state. This component.
 * - `civ-filter-chip` — toggleable on/off selection (check icon when on).
 * - `civ-input-chip` — user-entered token with a remove handle.
 *
 * For non-interactive labels use `civ-tag`. For primary CTAs use
 * `civ-button`. For text-only "Show more / Hide" disclosure toggles
 * use `<button class="civ-text-btn civ-text-btn--chip">`.
 *
 * **Structure.** Renders a single `<button type="button">` with the
 * shared `.civ-chip` chrome plus a `.civ-chip--action` modifier (so
 * padding goes on the button itself rather than an inner element).
 * No wrapper, no nested interactives — the native focus ring renders
 * correctly with no `:has()` workaround.
 *
 * @element civ-action-chip
 *
 * @prop {string} label - Chip text (preferred over child text)
 * @prop {string} value - Identifier passed in event detail (consumer correlates clicks)
 * @prop {boolean} disabled - Disabled state
 * @prop {string} spacing - Padding size: 'default' or 'sm'
 * @prop {string} iconStart - Icon name to render before the label
 * @prop {string} iconEnd - Icon name to render after the label
 * @prop {number | null} count - Optional count rendered as " (N)" after the label
 *
 * @fires civ-click - `{ value }` when the chip is clicked
 * @fires civ-analytics - Analytics tracking event on click
 */
@customElement('civ-action-chip')
export class CivActionChip extends LightDomTextMixin(CivBaseElement) {
  @property({ type: String }) label = '';
  @property({ type: String }) value = '';
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Padding size: 'default' or 'sm' for compact layouts. */
  @property({ type: String }) spacing: 'default' | 'sm' = 'default';

  /** Icon name to render before the label. */
  @property({ type: String, attribute: 'icon-start' }) iconStart = '';

  /** Icon name to render after the label (and count). */
  @property({ type: String, attribute: 'icon-end' }) iconEnd = '';

  /** Optional count suffix, rendered as " (N)" after the label. */
  @property({ type: Number }) count: number | null = null;

  private get _text(): string {
    return this.label || this._initialText;
  }

  private get _buttonClasses(): string {
    return [
      'civ-chip',
      'civ-chip--action',
      this.spacing === 'sm' ? 'civ-chip--sm' : '',
      this.disabled ? 'civ-chip--disabled' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  override render() {
    const showCount = this.count !== null && this.count !== undefined;

    return html`
      <button
        type="button"
        class="${this._buttonClasses}"
        ?disabled="${this.disabled}"
        @click="${this._onClick}"
      >${this.iconStart
        ? html`<civ-icon name="${this.iconStart}" class="civ-chip__icon" aria-hidden="true"></civ-icon>`
        : nothing}<span class="civ-chip__label">${this._text}</span>${showCount
        ? html`<civ-count class="civ-chip__count" count="${this.count}" emphasis="tertiary"></civ-count>`
        : nothing}${this.iconEnd
        ? html`<civ-icon name="${this.iconEnd}" class="civ-chip__icon civ-chip__icon--end" aria-hidden="true"></civ-icon>`
        : nothing}</button>
    `;
  }

  private _onClick(): void {
    if (this.disabled) return;
    dispatch(this, 'civ-click', { value: this.value });
    this.sendAnalytics('click');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-action-chip': CivActionChip;
  }
}
