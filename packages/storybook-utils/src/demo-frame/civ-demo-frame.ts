import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin, type SlotConfig } from '@civui/core';
import './civ-demo-page.js';
import type { CivDemoPage } from './civ-demo-page.js';

/**
 * Match a path pattern against an actual URL path. Patterns may include
 * `:name` segments which capture into the returned params object.
 *
 * Returns null if the pattern doesn't match, otherwise an object of the
 * captured params (empty when the pattern has no `:` segments).
 *
 * @example
 *   matchPath('/dependents/:id/edit', '/dependents/42/edit')
 *   // -> { id: '42' }
 *
 *   matchPath('/dependents/new', '/dependents/new')
 *   // -> {}
 *
 *   matchPath('/dependents/:id', '/other/42')
 *   // -> null
 */
export function matchPath(
  pattern: string,
  actual: string,
): Record<string, string> | null {
  const patternParts = pattern.split('/').filter(Boolean);
  const actualParts = actual.split('?')[0].split('/').filter(Boolean);
  if (patternParts.length !== actualParts.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    const p = patternParts[i];
    const a = actualParts[i];
    if (p.startsWith(':')) {
      params[p.slice(1)] = decodeURIComponent(a);
    } else if (p !== a) {
      return null;
    }
  }
  return params;
}

/**
 * CivUI Demo Frame
 *
 * Storybook-only utility that renders a fake browser chrome (URL bar +
 * back button) around a set of slotted `<civ-demo-page>` children. Used
 * to demo patterns that span multiple pages (e.g. the `route` mode on
 * `civ-repeater` — list page → form page → back to list page).
 *
 * Children are `<civ-demo-page path="/some/path">` elements. The frame
 * intercepts clicks on `<a href="/...">` anchors anywhere inside it; if
 * the href matches one of the page paths, navigation is internal — no
 * real browser navigation, no `history.pushState`. The frame maintains
 * its own history stack so its fake back button can pop one step.
 *
 * Path patterns support `:name` segments that capture into params and
 * are surfaced on the active page's `params` getter (and on its
 * `data-path-params` attribute for non-JS readers).
 *
 * Modifier-key clicks (cmd/ctrl/shift/alt or middle-click) are passed
 * through to the browser, mirroring real anchor behavior — useful so
 * "open in new tab" still works.
 *
 * Not intended for production. Lives in `@civui/storybook-utils`.
 *
 * @element civ-demo-frame
 *
 * @example
 * ```html
 * <civ-demo-frame initial-path="/dependents">
 *   <civ-demo-page path="/dependents">
 *     <h1>Your dependents</h1>
 *     <a href="/dependents/new">Add dependent</a>
 *   </civ-demo-page>
 *   <civ-demo-page path="/dependents/new">
 *     <h1>Add a dependent</h1>
 *     <a href="/dependents">Cancel</a>
 *   </civ-demo-page>
 *   <civ-demo-page path="/dependents/:id/edit">
 *     <h1>Edit dependent</h1>
 *   </civ-demo-page>
 * </civ-demo-frame>
 * ```
 *
 * @fires civ-demo-navigate - When the frame navigates internally, detail: { path: string, params: Record<string,string> }
 */
@customElement('civ-demo-frame')
export class CivDemoFrame extends LightDomSlotMixin(CivBaseElement) {
  override _getSlotConfig(): SlotConfig {
    // Relocate slotted <civ-demo-page> children into the body container so
    // they sit *inside* the chrome (URL bar above, padding around). Without
    // this, Light-DOM rendering leaves the pages as siblings of the rendered
    // chrome and the body div is empty — visually broken.
    return { default: '[data-civ-demo-body]' };
  }

  /**
   * Path the frame opens on. Must match one of the slotted
   * `<civ-demo-page>` patterns or the frame renders an empty body.
   */
  @property({ type: String, attribute: 'initial-path' }) initialPath = '/';

  /** Hide the fake browser chrome (URL bar + back button). Useful when embedding inside docs where the chrome would be visual noise. */
  @property({ type: Boolean, attribute: 'hide-chrome', reflect: true }) hideChrome = false;

  /** Stack of paths visited so far. Top = current path. Always has length ≥ 1. */
  @state() private _stack: string[] = [];

  override connectedCallback(): void {
    super.connectedCallback();
    // Seed stack from `initial-path` before first render so the right
    // page is visible on mount. Captured here (not in firstUpdated) so
    // children rendered in the same tick see the active state.
    this._stack = [this.initialPath];
    this.addEventListener('click', this._onClick);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('click', this._onClick);
  }

  override firstUpdated(): void {
    // Move captured children into the body container, THEN sync visibility.
    // Order matters: visibility lookup queries `<civ-demo-page>` children
    // and they only exist after relocation.
    this._relocateSlots();
    this._syncPagesVisibility();
  }

  override updated(changed: Map<string, unknown>): void {
    if (changed.has('_stack')) {
      this._syncPagesVisibility();
    }
  }

  /** Current path (top of the history stack). */
  get currentPath(): string {
    return this._stack[this._stack.length - 1] ?? this.initialPath;
  }

  /** Programmatically navigate to `path`. Pushes onto the history stack. */
  navigate(path: string): void {
    // Avoid pushing duplicate consecutive entries — clicking the same link
    // twice shouldn't grow the stack indefinitely.
    if (path === this.currentPath) return;
    this._stack = [...this._stack, path];
    this._emitNavigate();
  }

  /**
   * Pop the most recent entry off the history stack and navigate to the
   * previous one. No-op if the stack only has the initial entry.
   */
  back(): boolean {
    if (this._stack.length <= 1) return false;
    this._stack = this._stack.slice(0, -1);
    this._emitNavigate();
    return true;
  }

  private _emitNavigate(): void {
    const path = this.currentPath;
    const match = this._findMatchingPage(path);
    this.dispatchEvent(new CustomEvent('civ-demo-navigate', {
      detail: { path, params: match?.params ?? {} },
      bubbles: true,
      composed: false,
    }));
  }

  private _onClick = (e: MouseEvent): void => {
    if (e.defaultPrevented) return;
    // Honor modifier keys and middle/right-click — let the browser handle
    // "open in new tab" exactly as it would for a real link.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    const target = e.target as Element | null;
    if (!target) return;
    const anchor = target.closest('a[href]') as HTMLAnchorElement | null;
    if (!anchor) return;

    // Honor `target="_blank"` and explicit external links.
    if (anchor.target && anchor.target !== '_self') return;

    const href = anchor.getAttribute('href') || '';
    // Only intercept relative paths starting with `/`. External URLs,
    // hash links, mailto:, tel: etc. pass through to the browser.
    if (!href.startsWith('/')) return;

    if (!this._findMatchingPage(href)) {
      // Anchor points somewhere outside this frame's known pages —
      // dev convenience: warn, but let the click pass through so the
      // story author notices.
      if (typeof console !== 'undefined') {
        console.warn(`[civ-demo-frame] No <civ-demo-page> matches "${href}" — passing click through to the browser.`);
      }
      return;
    }

    e.preventDefault();
    this.navigate(href);
  };

  private _onBack = (): void => {
    this.back();
  };

  /** Find the first matching `<civ-demo-page>` child for the given path. */
  private _findMatchingPage(path: string): { page: CivDemoPage; params: Record<string, string> } | null {
    const pages = this.querySelectorAll<CivDemoPage>('civ-demo-page');
    for (const page of pages) {
      const pattern = page.path;
      if (!pattern) continue;
      const params = matchPath(pattern, path);
      if (params) return { page, params };
    }
    return null;
  }

  /**
   * Show the matching page, hide every other one, and sync `params` onto
   * the active page. Runs after every render so the visible page tracks
   * the current path.
   */
  private _syncPagesVisibility(): void {
    const pages = Array.from(this.querySelectorAll<CivDemoPage>('civ-demo-page'));
    const match = this._findMatchingPage(this.currentPath);
    for (const page of pages) {
      const isActive = match?.page === page;
      page.hidden = !isActive;
      if (isActive) {
        page.params = match.params;
        page.setAttribute('data-path-params', JSON.stringify(match.params));
      }
    }
  }

  override render() {
    const canGoBack = this._stack.length > 1;
    return html`
      <div class="civ-demo-frame">
        ${this.hideChrome ? nothing : html`
          <div class="civ-demo-frame__chrome" role="presentation">
            <button
              type="button"
              class="civ-demo-frame__back"
              aria-label="Back"
              ?disabled="${!canGoBack}"
              @click="${this._onBack}"
            >←</button>
            <div class="civ-demo-frame__url" aria-label="Current demo path (fake URL)">
              <span class="civ-demo-frame__badge" aria-label="This is a demo, not a real URL">demo only</span>
              <code>${this.currentPath}</code>
            </div>
          </div>
        `}
        <div class="civ-demo-frame__body" data-civ-demo-body></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-demo-frame': CivDemoFrame;
  }
}
