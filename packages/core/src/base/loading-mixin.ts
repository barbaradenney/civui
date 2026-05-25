import type { LitElement, TemplateResult } from 'lit';
import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { announce } from '../a11y/live-region.js';
import { t } from '../i18n/locale.js';

type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Public + protected surface the mixin contributes. Subclasses read /
 * override `isLoading`, `effectiveLoadingLabel`, and `renderLoadingSpinner`,
 * so they appear on the returned constructor's instance type even though
 * they're declared `protected` on the implementation class.
 */
export interface LoadingMixinInterface {
  loading: boolean;
  loadingLabel: string;
  readonly effectiveLoadingLabel: string;
  readonly isLoading: boolean;
  renderLoadingSpinner(size?: 'sm' | 'md' | 'lg'): TemplateResult;
}

/**
 * Mixin that adds the standard `loading` / `loading-label` props plus
 * the announce() lifecycle hook to every button-shaped component:
 * `civ-button`, `civ-action-button`, `civ-text-button`.
 *
 * **Use during in-flight async work** — form submit, save, scan, network
 * action. The host gains `aria-busy="true"`, the visible label is
 * announced to AT once via the shared announce() queue, and the
 * consumer's render method swaps in `renderLoadingSpinner()` wherever
 * the spinner should live (typically the leading-icon slot).
 *
 * **Consumer responsibility**: import `@civui/feedback/spinner` so
 * `<civ-spinner>` is registered before the first render. The mixin
 * deliberately does not import it to avoid a `@civui/core` →
 * `@civui/feedback` dependency cycle.
 *
 * **What the mixin owns**:
 *   - `loading` (Boolean, reflected) and `loadingLabel` (String) props
 *   - `effectiveLoadingLabel` getter — explicit label or the i18n default
 *   - `isLoading` getter — overridable so subclasses can suppress
 *     loading in specific contexts (e.g. link mode for `civ-button`)
 *   - `renderLoadingSpinner(size)` helper returning a decorative
 *     `<civ-spinner>` template
 *   - `updated()` hook that fires the one-shot polite announcement on
 *     the loading transition
 *
 * **What the consumer owns**:
 *   - Where the spinner renders (the mixin does not dictate slot
 *     placement — leading icon, replace label, prefix, etc.)
 *   - `aria-busy` and `aria-label` on the rendered button (the mixin
 *     does not own the host template)
 *   - Forcing `disabled` while loading (the consumer composes their
 *     own effective-disabled state)
 *
 * @example
 * ```ts
 * \@customElement('civ-my-button')
 * class CivMyButton extends LoadingMixin(CivBaseElement) {
 *   override render() {
 *     return html`
 *       <button
 *         ?disabled="${this.disabled || this.isLoading}"
 *         aria-busy="${this.isLoading ? 'true' : nothing}"
 *         aria-label="${this.isLoading ? this.effectiveLoadingLabel : nothing}"
 *       >
 *         ${this.isLoading ? this.renderLoadingSpinner() : nothing}
 *         ${this.label}
 *       </button>
 *     `;
 *   }
 * }
 * ```
 */
export function LoadingMixin<T extends Constructor<LitElement>>(superClass: T) {
  class Loading extends superClass {
    /**
     * Async-in-flight state. Surfaces `aria-busy="true"` on the
     * rendered button, announces the loading label once via the
     * shared announce() queue, and lets the consumer swap a spinner
     * into the leading-icon slot. The consumer is responsible for
     * disabling click handling while loading is true.
     */
    @property({ type: Boolean, reflect: true }) loading = false;

    /**
     * Accessible name applied while `loading` is true. Empty default
     * falls back to the locale's `buttonLoadingLabel` ("Loading…").
     * Pass an action-specific present-participle verb ("Saving…",
     * "Submitting…") so AT users hear what's happening.
     */
    @property({ type: String, attribute: 'loading-label' }) loadingLabel = '';

    /** Tracks the last `isLoading` value to detect transitions. Seeded
     * in `firstUpdated()` so the initial render of a button mounted
     * with `loading=true` (e.g. SSR hydration of in-flight submissions)
     * does NOT enqueue an announcement — that would overflow the
     * polite queue when N hydrating buttons land at once. */
    private _wasLoading = false;
    private _seededWasLoading = false;

    /** Resolved label — explicit `loadingLabel` or the locale default. */
    get effectiveLoadingLabel(): string {
      return this.loadingLabel || t('buttonLoadingLabel');
    }

    /**
     * Whether the loading state should currently affect rendering /
     * announcements. Subclasses override to suppress loading in
     * contexts where it doesn't apply (e.g. `civ-button` in link
     * mode — navigation isn't a state we wait on). Public because the
     * mixin's interface contract exposes it — the override on each
     * subclass must use the same visibility.
     */
    get isLoading(): boolean {
      return this.loading;
    }

    /**
     * Render helper for the inline spinner. Returns a decorative
     * `<civ-spinner>` (no `role="status"`) because the host's
     * `aria-busy` is the AT signal — nesting a live region inside an
     * aria-busy subtree would be swallowed by NVDA/JAWS.
     *
     * Size matches `SpinnerSize` from `@civui/feedback/spinner` —
     * `'sm' | 'md' | 'lg'`. Consumers must import the spinner so the
     * element is registered.
     */
    renderLoadingSpinner(size: 'sm' | 'md' | 'lg' = 'sm'): TemplateResult {
      return html`<civ-spinner size="${size}" decorative></civ-spinner>`;
    }

    override updated(changed: Map<string, unknown>): void {
      super.updated(changed);
      // Seed `_wasLoading` from the initial `isLoading` value on the
      // first updated() pass so a component that mounts already in the
      // loading state (SSR-hydrated `<civ-button loading>`) does NOT
      // enqueue an initial announce — we treat the mount as the
      // "starting state", not a transition.
      if (!this._seededWasLoading) {
        this._wasLoading = this.isLoading;
        this._seededWasLoading = true;
        return;
      }
      // Re-evaluate `isLoading` on EVERY updated() pass — not just when
      // `loading`/`loadingLabel` change. Subclasses override `isLoading`
      // to depend on other props (e.g. `href` toggles link-mode
      // suppression on civ-button / civ-action-button); gating on only
      // `loading`/`loadingLabel` would miss transitions driven by those
      // other props and leave `_wasLoading` stale.
      const nowLoading = this.isLoading;
      if (nowLoading && !this._wasLoading) {
        announce(this.effectiveLoadingLabel, 'polite');
      }
      this._wasLoading = nowLoading;
    }
  }
  return Loading as unknown as Constructor<LoadingMixinInterface> & T;
}
