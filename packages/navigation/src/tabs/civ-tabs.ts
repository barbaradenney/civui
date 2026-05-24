import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { CivBaseElement, dispatch, isRtl, resolveGroupNavIndex } from '@civui/core';
import type { CivTab } from './civ-tab.js';
import type { CivTabPanel } from './civ-tab-panel.js';

/**
 * CivUI Tabs
 *
 * ARIA tab pattern — a tablist with associated panels. Children are
 * `<civ-tab>` (selectable headers) and `<civ-tab-panel>` (content
 * regions). Tabs and panels are paired by `value` — set the same
 * `value` on each pair to associate them.
 *
 * **Keyboard:** Roving tabindex (one Tab stop for the whole tablist).
 * `ArrowLeft`/`ArrowRight` move between tabs; `Home`/`End` jump to
 * first/last. Disabled tabs are skipped.
 *
 * **Activation:** Manual — pressing a tab selects it. (Automatic
 * follow-focus selection is intentionally not implemented; manual
 * activation is the safer default per ARIA APG for any tab that
 * triggers expensive content loads.)
 *
 * @element civ-tabs
 *
 * @prop {string} label - Accessible name for the tablist (`aria-label`).
 *   Strongly recommended — the tablist needs a name per WAI-ARIA. Omit
 *   only when the surrounding context already names the tab group.
 * @prop {string} value - The currently selected tab's `value`. Defaults
 *   to the first tab when unset on mount
 *
 * @fires civ-change - `{ value: string }` when the selected tab changes
 *
 * @example
 * ```html
 * <civ-tabs label="Account settings" value="profile">
 *   <civ-tab value="profile" label="Profile"></civ-tab>
 *   <civ-tab value="security" label="Security"></civ-tab>
 *   <civ-tab value="notifications" label="Notifications"></civ-tab>
 *
 *   <civ-tab-panel value="profile">Profile content</civ-tab-panel>
 *   <civ-tab-panel value="security">Security content</civ-tab-panel>
 *   <civ-tab-panel value="notifications">Notifications content</civ-tab-panel>
 * </civ-tabs>
 * ```
 */
@customElement('civ-tabs')
export class CivTabs extends CivBaseElement {
  @property({ type: String }) label = '';
  @property({ type: String }) value = '';

  private _tabs: CivTab[] = [];
  private _panels: CivTabPanel[] = [];
  private _captured = false;

  override connectedCallback(): void {
    if (!this._captured) {
      this._captureChildren();
      this._captured = true;
    }
    super.connectedCallback();
    this.addEventListener('civ-tab-select', this._onTabSelect as EventListener);
    this.addEventListener('keydown', this._onKeydown);
  }

  override disconnectedCallback(): void {
    this.removeEventListener('civ-tab-select', this._onTabSelect as EventListener);
    this.removeEventListener('keydown', this._onKeydown);
    super.disconnectedCallback();
  }

  /** Walk children, partition by tagName, and detach so Lit doesn't wipe them on render. */
  private _captureChildren(): void {
    for (const child of Array.from(this.childNodes)) {
      if (child instanceof Element) {
        const tag = child.tagName.toLowerCase();
        if (tag === 'civ-tab') {
          this._tabs.push(child as CivTab);
          child.remove();
          continue;
        }
        if (tag === 'civ-tab-panel') {
          this._panels.push(child as CivTabPanel);
          child.remove();
          continue;
        }
        child.remove();
      } else if (child.parentNode) {
        child.parentNode.removeChild(child);
      }
    }
    if (!this.value && this._tabs.length > 0) {
      this.value = this._tabs[0].value;
    }
  }

  override firstUpdated(): void {
    this._relocate();
    queueMicrotask(() => this._sync());
  }

  override updated(changed: Map<string, unknown>): void {
    if (changed.has('value')) this._sync();
  }

  private _relocate(): void {
    const list = this.querySelector<HTMLElement>('[data-civ-tabs-list]');
    const panels = this.querySelector<HTMLElement>('[data-civ-tabs-panels]');
    if (list) for (const tab of this._tabs) list.appendChild(tab);
    if (panels) for (const panel of this._panels) panels.appendChild(panel);
  }

  /** Sync selected state + ARIA wiring across all tabs / panels. */
  private _sync(): void {
    for (const tab of this._tabs) {
      const isActive = tab.value === this.value;
      if (tab.selected !== isActive) tab.selected = isActive;
      if (!tab.id) tab.id = this.generateId(`tab-${tab.value}`);
    }
    for (const panel of this._panels) {
      const isActive = panel.value === this.value;
      panel.hidden = !isActive;
      if (!panel.id) panel.id = this.generateId(`panel-${panel.value}`);
    }
    // Wire aria-controls / aria-labelledby pairs.
    for (const tab of this._tabs) {
      const match = this._panels.find((p) => p.value === tab.value);
      if (!match) continue;
      const btn = tab.querySelector<HTMLButtonElement>('button[role="tab"]');
      if (btn) btn.setAttribute('aria-controls', match.id);
      match.setAttribute('aria-labelledby', tab.id);
    }
  }

  private _onTabSelect = (event: Event): void => {
    const ev = event as CustomEvent<{ value: string }>;
    const target = ev.target as Element | null;
    if (!target || target.tagName.toLowerCase() !== 'civ-tab') return;
    event.stopPropagation();
    const next = ev.detail.value;
    if (next === this.value) return;
    this.value = next;
    dispatch(this, 'civ-change', { value: this.value });
  };

  private _onKeydown = (event: KeyboardEvent): void => {
    const enabled = this._tabs.filter((t) => !t.disabled);
    if (enabled.length === 0) return;

    const active = document.activeElement as HTMLElement | null;
    const currentIndex = enabled.findIndex((t) => t.contains(active));
    if (currentIndex === -1) return;

    const nextIndex = resolveGroupNavIndex(event.key, currentIndex, enabled.length, isRtl(this));
    if (nextIndex === undefined || nextIndex === currentIndex) return;
    event.preventDefault();

    const nextTab = enabled[nextIndex];
    this.value = nextTab.value;
    dispatch(this, 'civ-change', { value: this.value });
    queueMicrotask(() => nextTab.focus());
  };

  override render() {
    return html`
      <div class="civ-tabs">
        <div
          role="tablist"
          aria-label="${ifDefined(this.label || undefined)}"
          class="civ-tabs__list"
          data-civ-tabs-list
        ></div>
        <div class="civ-tabs__panels" data-civ-tabs-panels></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-tabs': CivTabs;
  }
}
