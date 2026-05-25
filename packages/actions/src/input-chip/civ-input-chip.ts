import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomTextMixin, dispatch, interpolate, renderCloseButton, t } from '@civui/core';

/**
 * CivUI Input Chip
 *
 * Display chip representing **user-entered content** — a recipient on
 * an email, a tag on a post, an applied-filter readout, a typed
 * keyword in a search bar. The chip itself is not interactive; the
 * trailing `×` button removes the entry. Distinct from
 * `civ-filter-chip` because the chip doesn't represent a
 * selectable option from a known list — it represents data the
 * user has already put in.
 *
 * Always renders a remove handle (otherwise the user has no way to
 * undo their input).
 *
 * **When to use which chip:**
 * - `civ-input-chip` — user-entered token with a remove handle. This component.
 * - `civ-filter-chip` — toggleable on/off selection from a known list of options.
 * - `civ-action-chip` — fire-and-forget rounded button, no state.
 *
 * For non-interactive categorization labels use `civ-tag`. The
 * `civ-input-chip` is structurally an `input` affordance and is
 * almost always rendered next to or inside an `<input>` /
 * `<civ-text-input>` that produces new chips.
 *
 * **Structure.** Renders a non-interactive `<span>` wrapper
 * containing a `<span class="civ-chip__label">` for the text plus a
 * `<button class="civ-chip__remove">` for the dismiss handle. The
 * wrapper holds the chrome (radius, border, padding via the label).
 * Only the remove button is focusable; its native focus ring renders
 * after the wrapper's `overflow: hidden` is dropped via `:has()`.
 *
 * @element civ-input-chip
 *
 * @prop {string} label - Chip text (preferred over child text)
 * @prop {string} value - Identifier passed in the remove event detail (consumer correlates removals)
 * @prop {boolean} disabled - Disabled state — visually muted; remove handle is inert
 * @prop {string} spacing - Padding size. `default` (AA target 24px), `sm` (also clamps to 24px floor), or `lg` (44px — WCAG 2.5.5 AAA Enhanced target)
 *
 * @fires civ-remove - `{ value }` when the user clicks the × button
 * @fires civ-analytics - Analytics tracking event on remove
 */
@customElement('civ-input-chip')
export class CivInputChip extends LightDomTextMixin(CivBaseElement) {
  @property({ type: String }) label = '';
  @property({ type: String }) value = '';
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Padding size: 'default' or 'sm' for compact layouts. */
  @property({ type: String }) spacing: 'default' | 'sm' | 'lg' = 'default';

  private get _text(): string {
    return this.label || this._initialText;
  }

  private get _wrapperClasses(): string {
    return [
      'civ-chip',
      'civ-chip--input',
      this.spacing === 'sm' ? 'civ-chip--sm' : '',
      this.spacing === 'lg' ? 'civ-chip--lg' : '',
      this.disabled ? 'civ-chip--disabled' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  override render() {
    // When the chip has no label and no slotted text, fall back to
    // the generic "Close" label rather than rendering "Remove "
    // (with a trailing space and no target name) — screen readers
    // would otherwise announce just "Remove, button" with no
    // identifier for what's being removed.
    const removeLabel = this._text
      ? interpolate(t('inputChipRemoveLabel'), { label: this._text })
      : t('closeLabel');

    return html`
      <span class="${this._wrapperClasses}">
        <span class="civ-chip__label">${this._text}</span>${renderCloseButton({
          label: removeLabel,
          onClick: this._onRemove,
          extraClass: 'civ-chip__remove',
          disabled: this.disabled,
        })}
      </span>
    `;
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
    'civ-input-chip': CivInputChip;
  }
}
