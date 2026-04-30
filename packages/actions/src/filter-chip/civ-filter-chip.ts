import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomTextMixin, dispatch, interpolate, t } from '@civui/core';

export type FilterChipStyle = 'primary' | 'secondary';

/**
 * CivUI Filter Chip
 *
 * An interactive, button-like control for filter selection. Click to toggle
 * `selected` state; in `removable` mode, click the trailing `×` to dismiss
 * without toggling. Use horizontal rows of chips to represent active or
 * available filters (search results, list views, faceted browse).
 *
 * For non-interactive categorization labels use `civ-tag`. For status
 * indicators use `civ-badge`. For primary CTAs use `civ-button`.
 *
 * **Emphasis levels** (apply when selected; unselected always renders the
 * neutral outlined chip):
 * - `secondary` (default) — light primary tint when selected
 * - `primary` — filled primary surface when selected
 *
 * @element civ-filter-chip
 *
 * @prop {string} label - Chip text (preferred over child text)
 * @prop {string} value - Filter identifier; passed in event detail
 * @prop {boolean} selected - Active/inactive state (reflected attribute)
 * @prop {boolean} removable - When true, renders a trailing `×` dismiss button
 * @prop {boolean} disabled - Disabled state
 * @prop {FilterChipStyle} chipStyle - Selected-state emphasis: 'primary' or 'secondary' (default)
 * @prop {string} spacing - Padding size: 'default' or 'sm'
 * @prop {string} iconStart - Icon name to render before the label when not selected
 * @prop {number | null} count - Match count rendered as " (N)" after the label
 *
 * @fires civ-change - `{ value, selected }` when chip is toggled
 * @fires civ-remove - `{ value }` when the dismiss button is clicked (removable only)
 * @fires civ-analytics - Analytics tracking event on click
 */
@customElement('civ-filter-chip')
export class CivFilterChip extends LightDomTextMixin(CivBaseElement) {
  @property({ type: String }) label = '';
  @property({ type: String }) value = '';
  @property({ type: Boolean, reflect: true }) selected = false;
  @property({ type: Boolean, reflect: true }) removable = false;
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Selected-state emphasis: 'primary' (filled) or 'secondary' (light tint, default). */
  @property({ type: String, attribute: 'chip-style' }) chipStyle: FilterChipStyle = 'secondary';

  /** Padding size: 'default' or 'sm' for compact layouts. */
  @property({ type: String }) spacing: 'default' | 'sm' = 'default';

  /** Icon name to render before the label (distinct from the selection check). */
  @property({ type: String, attribute: 'icon-start' }) iconStart = '';

  /** Optional count suffix, rendered as " (N)" after the label. */
  @property({ type: Number }) count: number | null = null;

  private get _text(): string {
    return this.label || this._initialText;
  }

  private get _classes(): string {
    return [
      'civ-filter-chip',
      `civ-filter-chip--style-${this.chipStyle}`,
      this.selected ? 'civ-filter-chip--selected' : '',
      this.spacing === 'sm' ? 'civ-filter-chip--sm' : '',
      this.disabled ? 'civ-opacity-50 civ-cursor-not-allowed' : '',
      'focus-visible:civ-focus-ring',
    ]
      .filter(Boolean)
      .join(' ');
  }

  override render() {
    const showCount = this.count !== null && this.count !== undefined;

    return html`
      <button
        type="button"
        class="${this._classes}"
        aria-pressed="${this.selected ? 'true' : 'false'}"
        ?disabled="${this.disabled}"
        @click="${this._onToggle}"
      >${this.selected
        ? html`<civ-icon name="check" size="sm" class="civ-filter-chip__check" aria-hidden="true"></civ-icon>`
        : this.iconStart
          ? html`<civ-icon name="${this.iconStart}" size="sm" class="civ-filter-chip__icon" aria-hidden="true"></civ-icon>`
          : nothing}<span class="civ-filter-chip__label">${this._text}</span>${showCount
        ? html`<span class="civ-filter-chip__count">(${this.count})</span>`
        : nothing}${this.removable
        ? html`<span
            class="civ-filter-chip__remove"
            role="button"
            tabindex="0"
            aria-label="${interpolate(t('filterChipRemoveLabel'), { label: this._text })}"
            @click="${this._onRemove}"
            @keydown="${this._onRemoveKey}"
          ><civ-icon name="close" size="sm" aria-hidden="true"></civ-icon></span>`
        : nothing}</button>
    `;
  }

  private _onToggle(event: MouseEvent): void {
    if (this.disabled) return;
    // Don't toggle if the click bubbled from the remove affordance.
    const target = event.target as HTMLElement;
    if (target.closest('.civ-filter-chip__remove')) return;

    this.selected = !this.selected;
    dispatch(this, 'civ-change', { value: this.value, selected: this.selected });
    this.sendAnalytics('change');
  }

  private _onRemove(event: Event): void {
    if (this.disabled) return;
    event.stopPropagation();
    dispatch(this, 'civ-remove', { value: this.value });
    this.sendAnalytics('remove');
  }

  private _onRemoveKey(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.stopPropagation();
    this._onRemove(event);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-filter-chip': CivFilterChip;
  }
}
