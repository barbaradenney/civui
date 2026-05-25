import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { CivBaseElement, LightDomTextMixin, dispatch } from '@civui/core';
import '@civui/feedback/count';

export type FilterChipEmphasis = 'primary' | 'secondary';
export type FilterChipVariant = 'toggle' | 'radio';

/**
 * CivUI Filter Chip
 *
 * An interactive, button-like control for filter selection. Click to toggle
 * `selected` state. Use horizontal rows of chips to represent active or
 * available filters (search results, list views, faceted browse).
 *
 * For user-entered tokens with a remove handle (recipient lists, applied-
 * filter readouts) use `civ-input-chip` — its always-present × is the
 * canonical removable-chip affordance. For non-interactive categorization
 * labels use `civ-tag`. For status indicators use `civ-badge`. For primary
 * CTAs use `civ-button`.
 *
 * **Structure.** Renders a non-interactive `<span role="presentation">`
 * wrapper containing one real `<button>` element. The wrapper exists so
 * the chip's chrome (background, border, focus ring) sits at the same
 * DOM level as siblings in the chip family.
 *
 * **ARIA mode.** `variant="toggle"` (default) uses `aria-pressed`;
 * `variant="radio"` uses `role="radio"` + `aria-checked` for use inside
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
 * @prop {boolean} disabled - Disabled state
 * @prop {FilterChipEmphasis} emphasis - Selected-state emphasis
 * @prop {FilterChipVariant} variant - ARIA role: 'toggle' (default) or 'radio'
 * @prop {string} spacing - Padding size: 'default' or 'sm'
 * @prop {string} iconStart - Icon name to render before the label when not selected
 * @prop {string} iconEnd - Icon name to render after the label
 * @prop {number | null} count - Match count rendered as " (N)" after the label
 *
 * @fires civ-change - `{ value, selected }` when chip is toggled
 * @fires civ-analytics - Analytics tracking event on click
 */
@customElement('civ-filter-chip')
export class CivFilterChip extends LightDomTextMixin(CivBaseElement) {
  @property({ type: String }) label = '';
  @property({ type: String }) value = '';
  @property({ type: Boolean, reflect: true }) selected = false;
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Selected-state emphasis: 'primary' (filled) or 'secondary' (light tint, default). */
  @property({ type: String, attribute: 'emphasis' }) emphasis: FilterChipEmphasis = 'secondary';

  /** ARIA mode: 'toggle' (aria-pressed) or 'radio' (aria-checked). Set automatically by civ-filter-chip-group in single mode. */
  @property({ type: String }) variant: FilterChipVariant = 'toggle';

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
    // The shared `civ-chip` base + `civ-chip--filter` modifier picks
    // up the chrome rules every chip shares with civ-action-chip and
    // civ-input-chip; the filter-specific state classes
    // (`--selected`, `--style-{emphasis}`) compose on top.
    return [
      'civ-chip',
      'civ-chip--filter',
      `civ-chip--style-${this.emphasis}`,
      this.selected ? 'civ-chip--selected' : '',
      this.spacing === 'sm' ? 'civ-chip--sm' : '',
      this.disabled ? 'civ-chip--disabled' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  override render() {
    const showCount = this.count !== null && this.count !== undefined;
    const isRadio = this.variant === 'radio';
    const stateValue = this.selected ? 'true' : 'false';

    return html`
      <span class="${this._wrapperClasses}" role="presentation">
        <button
          type="button"
          class="civ-chip__action"
          role="${ifDefined(isRadio ? 'radio' : undefined)}"
          aria-checked="${ifDefined(isRadio ? stateValue : undefined)}"
          aria-pressed="${ifDefined(isRadio ? undefined : stateValue)}"
          ?disabled="${this.disabled}"
          @click="${this._onToggle}"
        >${this.selected
          ? html`<civ-icon name="check" class="civ-chip__check" aria-hidden="true"></civ-icon>`
          : this.iconStart
            ? html`<civ-icon name="${this.iconStart}" class="civ-chip__icon" aria-hidden="true"></civ-icon>`
            : nothing}<span class="civ-chip__label">${this._text}</span>${showCount
          ? html`<civ-count class="civ-chip__count" count="${this.count}" emphasis="tertiary"></civ-count>`
          : nothing}${this.iconEnd
          ? html`<civ-icon name="${this.iconEnd}" class="civ-chip__icon civ-chip__icon--end" aria-hidden="true"></civ-icon>`
          : nothing}</button>
      </span>
    `;
  }

  private _onToggle(): void {
    if (this.disabled) return;
    // In radio mode, clicking the already-selected chip is a no-op
    // (you can't deselect a radio by re-clicking it).
    if (this.variant === 'radio' && this.selected) return;

    this.selected = !this.selected;
    dispatch(this, 'civ-change', { value: this.value, selected: this.selected });
    this.sendAnalytics('change');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-filter-chip': CivFilterChip;
  }
}
