import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { CivBaseElement, LightDomTextMixin, dispatch, interpolate, t } from '@civui/core';
import '@civui/feedback/count';

export type FilterChipStyle = 'primary' | 'secondary';
export type FilterChipRole = 'toggle' | 'radio';

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
 * **Structure.** Renders a non-interactive `<span role="presentation">`
 * wrapper containing one or two real `<button>` elements (toggle, plus
 * an optional dismiss button when `removable`). This avoids nested
 * interactive content.
 *
 * **ARIA mode.** `chip-role="toggle"` (default) uses `aria-pressed`;
 * `chip-role="radio"` uses `role="radio"` + `aria-checked` for use inside
 * a single-select `civ-filter-chip-group`.
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
 * @prop {FilterChipStyle} chipStyle - Selected-state emphasis
 * @prop {FilterChipRole} chipRole - ARIA role: 'toggle' (default) or 'radio'
 * @prop {string} spacing - Padding size: 'default' or 'sm'
 * @prop {string} iconStart - Icon name to render before the label when not selected
 * @prop {string} iconEnd - Icon name to render after the label
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

  /** ARIA mode: 'toggle' (aria-pressed) or 'radio' (aria-checked). Set automatically by civ-filter-chip-group in single mode. */
  @property({ type: String, attribute: 'chip-role' }) chipRole: FilterChipRole = 'toggle';

  /** Padding size: 'default' or 'sm' for compact layouts. */
  @property({ type: String }) spacing: 'default' | 'sm' = 'default';

  /** Icon name to render before the label when not selected. */
  @property({ type: String, attribute: 'icon-start' }) iconStart = '';

  /** Icon name to render after the label (and count). */
  @property({ type: String, attribute: 'icon-end' }) iconEnd = '';

  /** Optional count suffix, rendered as " (N)" after the label. */
  @property({ type: Number }) count: number | null = null;

  private get _text(): string {
    return this.label || this._initialText;
  }

  private get _wrapperClasses(): string {
    return [
      'civ-filter-chip',
      `civ-filter-chip--style-${this.chipStyle}`,
      this.selected ? 'civ-filter-chip--selected' : '',
      this.spacing === 'sm' ? 'civ-filter-chip--sm' : '',
      this.disabled ? 'civ-filter-chip--disabled' : '',
      this.removable ? 'civ-filter-chip--removable' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  override render() {
    const showCount = this.count !== null && this.count !== undefined;
    const isRadio = this.chipRole === 'radio';
    const stateValue = this.selected ? 'true' : 'false';

    return html`
      <span class="${this._wrapperClasses}" role="presentation">
        <button
          type="button"
          class="civ-filter-chip__action focus-visible:civ-focus-ring"
          role="${ifDefined(isRadio ? 'radio' : undefined)}"
          aria-checked="${ifDefined(isRadio ? stateValue : undefined)}"
          aria-pressed="${ifDefined(isRadio ? undefined : stateValue)}"
          ?disabled="${this.disabled}"
          @click="${this._onToggle}"
        >${this.selected
          ? html`<civ-icon name="check" class="civ-filter-chip__check" aria-hidden="true"></civ-icon>`
          : this.iconStart
            ? html`<civ-icon name="${this.iconStart}" class="civ-filter-chip__icon" aria-hidden="true"></civ-icon>`
            : nothing}<span class="civ-filter-chip__label">${this._text}</span>${showCount
          ? html`<civ-count class="civ-filter-chip__count" count="${this.count}"></civ-count>`
          : nothing}${this.iconEnd
          ? html`<civ-icon name="${this.iconEnd}" class="civ-filter-chip__icon civ-filter-chip__icon--end" aria-hidden="true"></civ-icon>`
          : nothing}</button>${this.removable
        ? html`<button
            type="button"
            class="civ-filter-chip__remove focus-visible:civ-focus-ring"
            aria-label="${interpolate(t('filterChipRemoveLabel'), { label: this._text })}"
            ?disabled="${this.disabled}"
            @click="${this._onRemove}"
          ><civ-icon name="close" aria-hidden="true"></civ-icon></button>`
        : nothing}
      </span>
    `;
  }

  private _onToggle(): void {
    if (this.disabled) return;
    // In radio mode, clicking the already-selected chip is a no-op
    // (you can't deselect a radio by re-clicking it).
    if (this.chipRole === 'radio' && this.selected) return;

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
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-filter-chip': CivFilterChip;
  }
}
