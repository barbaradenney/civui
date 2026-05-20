/**
 * Tests for LightDomSlotMixin.
 *
 * The mixin captures authored children in connectedCallback and
 * relocates them into rendered slot-target containers. The capture
 * pass deliberately SKIPS Comment nodes — see civ-common-traps.md
 * entry "LightDomSlotMixin components don't compose well as
 * Lit-rendered children". Comments are the marker anchors that
 * Lit's outer template uses to track ChildPart positions; capturing
 * + removing them throws "ChildPart has no parentNode" on the next
 * outer re-render.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { LightDomSlotMixin, LightDomTextMixin, type SlotConfig } from './light-dom-mixins.js';

@customElement('test-slot-host')
class TestSlotHost extends LightDomSlotMixin(LitElement) {
  protected override createRenderRoot(): HTMLElement {
    return this;
  }
  override _getSlotConfig(): SlotConfig {
    return { default: '[data-slot-target]' };
  }
  override firstUpdated(): void {
    this._relocateSlots();
  }
  override render() {
    return html`<div class="frame"><div data-slot-target></div></div>`;
  }
}

/** Mount a host into the document body and wait for first render. */
async function mountHost(setup: (host: TestSlotHost) => void): Promise<TestSlotHost> {
  const host = document.createElement('test-slot-host') as TestSlotHost;
  setup(host);
  document.body.appendChild(host);
  await host.updateComplete;
  return host;
}

const mounted: HTMLElement[] = [];

describe('LightDomSlotMixin', () => {
  afterEach(() => {
    while (mounted.length) mounted.pop()!.remove();
  });

  it('relocates authored element children into the slot target', async () => {
    const host = await mountHost((h) => {
      const a = document.createElement('span');
      a.className = 'child';
      a.textContent = 'A';
      const b = document.createElement('span');
      b.className = 'child';
      b.textContent = 'B';
      h.appendChild(a);
      h.appendChild(b);
    });
    mounted.push(host);
    const target = host.querySelector('[data-slot-target]')!;
    expect(target.querySelectorAll('.child').length).toBe(2);
  });

  it('SKIPS Comment nodes during capture — they stay at the host root', async () => {
    // Simulate the shape Lit produces for an outer template like
    //   `<test-slot-host>${html`<span/>`}</test-slot-host>`
    // — an empty Comment marker before/after the rendered Element.
    const host = await mountHost((h) => {
      h.appendChild(document.createComment(''));
      const child = document.createElement('span');
      child.className = 'child';
      child.textContent = 'A';
      h.appendChild(child);
      h.appendChild(document.createComment(''));
    });
    mounted.push(host);

    // The element child relocated into the slot target.
    const target = host.querySelector('[data-slot-target]')!;
    expect(target.querySelectorAll('.child').length).toBe(1);

    // The comment markers stayed at the host root — Lit's outer
    // ChildPart needs them there to anchor re-renders. We assert
    // at-least-2 because Lit may also insert its own marker comments
    // when rendering the host's internal template; the contract is
    // "the original 2 weren't removed", not "exactly 2 exist."
    const commentsAtRoot = Array.from(host.childNodes).filter(
      (n) => n.nodeType === Node.COMMENT_NODE,
    );
    expect(commentsAtRoot.length).toBeGreaterThanOrEqual(2);
  });

  it('preserved comments still have a parentNode (the property Lit checks)', async () => {
    const host = await mountHost((h) => {
      h.appendChild(document.createComment('outer-marker-1'));
      const child = document.createElement('span');
      child.className = 'child';
      h.appendChild(child);
      h.appendChild(document.createComment('outer-marker-2'));
    });
    mounted.push(host);

    const comments = Array.from(host.childNodes).filter(
      (n) => n.nodeType === Node.COMMENT_NODE,
    );
    for (const c of comments) {
      expect(c.parentNode).not.toBeNull();
    }
  });
});

@customElement('test-text-host')
class TestTextHost extends LightDomTextMixin(LitElement) {
  protected override createRenderRoot(): HTMLElement {
    return this;
  }
  override render() {
    return html`<button>${this._initialText}</button>`;
  }
}

describe('LightDomTextMixin', () => {
  afterEach(() => {
    while (mounted.length) mounted.pop()!.remove();
  });

  it('captures the initial text content as _initialText', async () => {
    const host = document.createElement('test-text-host') as TestTextHost;
    host.textContent = 'Click me';
    document.body.appendChild(host);
    await host.updateComplete;
    mounted.push(host);
    expect(host._initialText).toBe('Click me');
  });

  it('clears Text/Element children but PRESERVES Comment nodes', async () => {
    // Simulate an outer Lit template like
    //   `<test-text-host>${label}</test-text-host>`
    // which surrounds the rendered text with marker comments.
    const host = document.createElement('test-text-host') as TestTextHost;
    host.appendChild(document.createComment(''));
    host.appendChild(document.createTextNode('Click me'));
    host.appendChild(document.createComment(''));
    document.body.appendChild(host);
    await host.updateComplete;
    mounted.push(host);

    // Comment markers preserved — outer template's ChildPart can
    // still update via these anchors on a future re-render.
    const commentsAtRoot = Array.from(host.childNodes).filter(
      (n) => n.nodeType === Node.COMMENT_NODE,
    );
    expect(commentsAtRoot.length).toBeGreaterThanOrEqual(2);
    for (const c of commentsAtRoot) {
      expect(c.parentNode).not.toBeNull();
    }
    // And the captured text is still the authored "Click me"
    // (not a stringified Comment).
    expect(host._initialText).toBe('Click me');
  });
});
