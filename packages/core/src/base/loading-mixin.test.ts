import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { LoadingMixin } from './loading-mixin.js';
import { cleanupLiveRegions } from '../a11y/live-region.js';
import * as liveRegion from '../a11y/live-region.js';

@customElement('civ-loading-test-host')
class CivLoadingTestHost extends LoadingMixin(LitElement) {
  @property({ type: String }) label = 'Action';

  createRenderRoot() {
    return this;
  }

  override render() {
    return html`
      <button
        ?disabled="${this.isLoading}"
        aria-busy="${this.isLoading ? 'true' : 'false'}"
      >
        ${this.isLoading ? this.renderLoadingSpinner() : ''}${this.label}
      </button>
    `;
  }
}

@customElement('civ-loading-test-suppressed')
class CivLoadingTestSuppressed extends LoadingMixin(LitElement) {
  @property({ type: Boolean }) link = false;

  createRenderRoot() {
    return this;
  }

  override get isLoading(): boolean {
    // Suppress loading when in "link mode"
    return this.loading && !this.link;
  }

  override render() {
    return html`<button aria-busy="${this.isLoading ? 'true' : 'false'}"></button>`;
  }
}

async function makeHost<T extends LitElement>(tag: string, attrs: Record<string, string> = {}): Promise<T> {
  const el = document.createElement(tag) as T;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

afterEach(() => {
  document.body.innerHTML = '';
  // Reset the live-region module state (politeQueue / politeTimer /
  // politeRegion ref) so a queued announcement from one test doesn't
  // leak into the next.
  cleanupLiveRegions();
});

describe('LoadingMixin', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('declares `loading` and `loadingLabel` properties', async () => {
    const el = await makeHost<CivLoadingTestHost>('civ-loading-test-host');
    expect(el.loading).toBe(false);
    expect(el.loadingLabel).toBe('');
  });

  it('reflects `loading` to the host attribute', async () => {
    const el = await makeHost<CivLoadingTestHost>('civ-loading-test-host');
    expect(el.hasAttribute('loading')).toBe(false);
    el.loading = true;
    await el.updateComplete;
    expect(el.hasAttribute('loading')).toBe(true);
  });

  it('reads `loading-label` from the kebab-case attribute', async () => {
    const el = await makeHost<CivLoadingTestHost>('civ-loading-test-host', {
      'loading-label': 'Saving…',
    });
    expect(el.loadingLabel).toBe('Saving…');
  });

  it('falls back to the locale `buttonLoadingLabel` when `loadingLabel` is empty', async () => {
    const el = await makeHost<CivLoadingTestHost>('civ-loading-test-host');
    expect(el.effectiveLoadingLabel).toBe('Loading…');
  });

  it('returns the explicit label when set', async () => {
    const el = await makeHost<CivLoadingTestHost>('civ-loading-test-host', {
      'loading-label': 'Saving…',
    });
    expect(el.effectiveLoadingLabel).toBe('Saving…');
  });

  it('renderLoadingSpinner returns a decorative civ-spinner template', async () => {
    const el = await makeHost<CivLoadingTestHost>('civ-loading-test-host', { loading: '' });
    const spinner = el.querySelector('civ-spinner');
    expect(spinner).not.toBeNull();
    expect(spinner!.getAttribute('size')).toBe('sm');
    expect(spinner!.hasAttribute('decorative')).toBe(true);
  });

  it('announces the loading label once on the loading transition (polite)', async () => {
    const spy = vi.spyOn(liveRegion, 'announce');
    const el = await makeHost<CivLoadingTestHost>('civ-loading-test-host', {
      'loading-label': 'Saving…',
    });
    expect(spy).not.toHaveBeenCalled();

    el.loading = true;
    await el.updateComplete;
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('Saving…', 'polite');
  });

  it('does NOT announce on initial mount when the component is already loading (prevents polite-queue overrun on hydration of N in-flight buttons)', async () => {
    const spy = vi.spyOn(liveRegion, 'announce');
    await makeHost<CivLoadingTestHost>('civ-loading-test-host', {
      'loading-label': 'Saving…',
      loading: '',
    });
    expect(spy).not.toHaveBeenCalled();
  });

  it('does not re-announce when other props change while still loading', async () => {
    const spy = vi.spyOn(liveRegion, 'announce');
    const el = await makeHost<CivLoadingTestHost>('civ-loading-test-host', {
      'loading-label': 'Saving…',
    });
    // Trigger an idle→loading transition first so we have an established announce.
    el.loading = true;
    await el.updateComplete;
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockClear();

    el.label = 'New label';
    await el.updateComplete;
    expect(spy).not.toHaveBeenCalled();
  });

  it('re-announces if the loading state flips off and back on', async () => {
    const spy = vi.spyOn(liveRegion, 'announce');
    const el = await makeHost<CivLoadingTestHost>('civ-loading-test-host', {
      'loading-label': 'Saving…',
    });

    el.loading = true;
    await el.updateComplete;
    expect(spy).toHaveBeenCalledTimes(1);

    el.loading = false;
    await el.updateComplete;
    expect(spy).toHaveBeenCalledTimes(1);

    el.loading = true;
    await el.updateComplete;
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('subclasses can override `isLoading` to suppress loading in certain contexts', async () => {
    const spy = vi.spyOn(liveRegion, 'announce');
    const el = await makeHost<CivLoadingTestSuppressed>('civ-loading-test-suppressed', {
      link: '',
    });
    el.loading = true;
    await el.updateComplete;
    expect(spy).not.toHaveBeenCalled();
    expect(el.querySelector('button')!.getAttribute('aria-busy')).toBe('false');
  });

  it('detects transitions driven by subclass-overridden `isLoading` even when `loading` itself did not change (e.g. href-toggled link mode)', async () => {
    const spy = vi.spyOn(liveRegion, 'announce');
    // Start: loading=true + link=true → isLoading is suppressed (false).
    const el = await makeHost<CivLoadingTestSuppressed>('civ-loading-test-suppressed', {
      link: '',
      'loading-label': 'Saving…',
    });
    el.loading = true;
    await el.updateComplete;
    expect(spy).not.toHaveBeenCalled();

    // Clear link mode — isLoading flips false→true even though `loading`
    // didn't change. The mixin must detect this and announce.
    el.link = false;
    await el.updateComplete;
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('Saving…', 'polite');
  });
});
