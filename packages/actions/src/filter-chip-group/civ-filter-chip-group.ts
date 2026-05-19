import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { CivBaseElement, LightDomSlotMixin, dispatch } from '@civui/core';
import type { SlotConfig } from '@civui/core';
import type { CivFilterChip } from '../filter-chip/civ-filter-chip.js';

export type FilterChipGroupMode = 'single' | 'multi';

/**
 * CivUI Filter Chip Group
 *
 * Container that coordinates a row of `civ-filter-chip` children:
 * - **Roving tabindex**: arrow keys move focus across chips so a row of
 *   20 filters costs one Tab stop, not 20.
 * - **Single-select mode**: when one chip turns on, siblings turn off.
 *   The wrapper becomes `role="radiogroup"` and chips switch to
 *   `role="radio"` + `aria-checked` so AT recognises the radio pattern.
 * - **Multi-select mode** (default): the wrapper is `role="toolbar"`
 *   and chips keep `aria-pressed`. Each chip toggles independently.
 * - **Aggregate event**: emits `civ-change` with `value` set to the
 *   single selected value (single mode) or array of values (multi mode).
 *
 * @element civ-filter-chip-group
 *
 * @prop {FilterChipGroupMode} mode - 'single' or 'multi' (default)
 * @prop {string} label - **Strongly recommended.** Accessible name for
 *   the wrapper (`aria-label`). The wrapper carries `role="toolbar"` in
 *   multi mode or `role="radiogroup"` in single mode; both roles require
 *   a name per WAI-ARIA. Without one, AT users navigating by landmark
 *   see an unnamed group. Omit only when the surrounding context already
 *   names the group.
 * @prop {string} name - Identifier used by composition parents to bind
 *   this group's selection to a filter column. `civ-filterable-list`
 *   reads it to map the group's `civ-change` event to `data-filter-{name}`
 *   on the items it filters. Not a form-field name — the group isn't
 *   form-associated.
 *
 * @fires civ-change - `{ value: string | string[] }` when selection changes
 *
 * @example
 * ```html
 * <civ-filter-chip-group mode="multi" label="Filter by category">
 *   <civ-filter-chip label="Healthcare" value="health"></civ-filter-chip>
 *   <civ-filter-chip label="Education" value="education"></civ-filter-chip>
 *   <civ-filter-chip label="Housing" value="housing"></civ-filter-chip>
 * </civ-filter-chip-group>
 * ```
 */
@customElement('civ-filter-chip-group')
export class CivFilterChipGroup extends LightDomSlotMixin(CivBaseElement) {
  @property({ type: String }) mode: FilterChipGroupMode = 'multi';
  @property({ type: String }) label = '';
  @property({ type: String }) name = '';

  private _mutationObserver: MutationObserver | null = null;

  /** Currently selected values. Single mode returns string; multi returns string[]. */
  get value(): string | string[] {
    const selected = this._chips.filter((c) => c.selected).map((c) => c.value);
    return this.mode === 'single' ? (selected[0] ?? '') : selected;
  }

  /** Setter that toggles chip `selected` to match the supplied value(s). */
  set value(next: string | string[]) {
    const wanted = new Set<string>(
      Array.isArray(next) ? next : next ? [next] : []
    );
    for (const chip of this._chips) {
      const shouldSelect = wanted.has(chip.value);
      if (chip.selected !== shouldSelect) chip.selected = shouldSelect;
    }
    this._syncTabindex();
  }

  /** Chips that are direct children of the toolbar wrapper (excludes nested groups). */
  private get _chips(): CivFilterChip[] {
    const wrapper = this.querySelector<HTMLElement>(':scope > [data-civ-filter-chip-group-content]');
    if (!wrapper) return [];
    return Array.from(wrapper.children).filter(
      (el): el is CivFilterChip => el.tagName.toLowerCase() === 'civ-filter-chip'
    );
  }

  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-filter-chip-group-content]' };
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('civ-change', this._onChipChange as EventListener);
    this.addEventListener('keydown', this._onKeydown as EventListener);
  }

  override disconnectedCallback(): void {
    this.removeEventListener('civ-change', this._onChipChange as EventListener);
    this.removeEventListener('keydown', this._onKeydown as EventListener);
    this._mutationObserver?.disconnect();
    this._mutationObserver = null;
    super.disconnectedCallback();
  }

  override firstUpdated(): void {
    this._relocateSlots();
    queueMicrotask(() => {
      this._applyChipRoles();
      this._syncTabindex();
      this._observeChildren();
    });
  }

  override updated(changed: Map<string, unknown>): void {
    if (changed.has('mode')) {
      this._applyChipRoles();
      // Going single → enforce single selection.
      if (this.mode === 'single') {
        const selected = this._chips.filter((c) => c.selected);
        if (selected.length > 1) {
          for (const chip of selected.slice(1)) chip.selected = false;
        }
      }
      this._syncTabindex();
    }
  }

  /** Tell each chip whether to use radio or toggle ARIA. */
  private _applyChipRoles(): void {
    const role = this.mode === 'single' ? 'radio' : 'toggle';
    for (const chip of this._chips) chip.chipRole = role;
  }

  /** tabindex=0 on the first selected chip (or first chip), -1 elsewhere. */
  private _syncTabindex(): void {
    const chips = this._chips;
    if (chips.length === 0) return;

    const focusIndex = Math.max(0, chips.findIndex((c) => c.selected));
    chips.forEach((chip, i) => {
      const button = chip.querySelector<HTMLButtonElement>('.civ-filter-chip__action');
      if (button) button.tabIndex = i === focusIndex ? 0 : -1;
    });
  }

  /** Watch for chip add/remove/reorder so tabindex + roles stay in sync. */
  private _observeChildren(): void {
    const wrapper = this.querySelector<HTMLElement>(':scope > [data-civ-filter-chip-group-content]');
    if (!wrapper) return;

    this._mutationObserver?.disconnect();
    this._mutationObserver = new MutationObserver(() => {
      this._applyChipRoles();
      // Defer one tick so newly-added chips have rendered their action button
      // before we read it for tabindex.
      queueMicrotask(() => this._syncTabindex());
    });
    this._mutationObserver.observe(wrapper, { childList: true });
  }

  private _onChipChange = (event: CustomEvent): void => {
    const target = event.target as Element | null;
    if (!target || target.tagName.toLowerCase() !== 'civ-filter-chip') return;

    // Don't re-emit our own bubbled event.
    if (event.detail && 'aggregated' in event.detail) return;

    const chip = target as CivFilterChip;
    if (this.mode === 'single' && chip.selected) {
      for (const sibling of this._chips) {
        if (sibling !== chip && sibling.selected) sibling.selected = false;
      }
    }

    this._syncTabindex();

    // Stop the per-chip event so listeners on the group only see the aggregate.
    event.stopImmediatePropagation();
    dispatch(this, 'civ-change', { value: this.value, aggregated: true });
  };

  private _onKeydown = (event: KeyboardEvent): void => {
    const navKeys = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (!navKeys.includes(event.key)) return;

    const chips = this._chips.filter((c) => !c.disabled);
    if (chips.length === 0) return;

    const active = document.activeElement as HTMLElement | null;
    const currentIndex = chips.findIndex((c) => c.contains(active));
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = (currentIndex + 1) % chips.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = (currentIndex - 1 + chips.length) % chips.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = chips.length - 1;
        break;
    }

    if (nextIndex === currentIndex) return;
    event.preventDefault();

    const next = chips[nextIndex].querySelector<HTMLButtonElement>('.civ-filter-chip__action');
    if (!next) return;

    for (const chip of this._chips) {
      const btn = chip.querySelector<HTMLButtonElement>('.civ-filter-chip__action');
      if (btn) btn.tabIndex = btn === next ? 0 : -1;
    }
    next.focus();
  };

  override render() {
    const isSingle = this.mode === 'single';
    return html`
      <div
        class="civ-filter-chip-group"
        role="${isSingle ? 'radiogroup' : 'toolbar'}"
        aria-label="${ifDefined(this.label || undefined)}"
        data-civ-filter-chip-group-content
      ></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-filter-chip-group': CivFilterChipGroup;
  }
}
