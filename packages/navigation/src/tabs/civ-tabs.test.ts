import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-tabs.js';
import './civ-tab.js';
import './civ-tab-panel.js';
import type { CivTabs } from './civ-tabs.js';

afterEach(cleanupFixtures);

const tabsHtml = (selected = 'profile') => `
  <civ-tabs label="Account settings" value="${selected}">
    <civ-tab value="profile" label="Profile"></civ-tab>
    <civ-tab value="security" label="Security"></civ-tab>
    <civ-tab value="notifications" label="Notifications"></civ-tab>
    <civ-tab-panel value="profile">Profile content</civ-tab-panel>
    <civ-tab-panel value="security">Security content</civ-tab-panel>
    <civ-tab-panel value="notifications">Notifications content</civ-tab-panel>
  </civ-tabs>
`;

const settle = () => new Promise<void>((r) => queueMicrotask(() => r()));

describe('civ-tabs', () => {
  describe('structure', () => {
    it('renders a role="tablist" with the supplied aria-label', async () => {
      const el = await fixture<CivTabs>(tabsHtml());
      const tablist = el.querySelector('[role="tablist"]')!;
      expect(tablist).not.toBeNull();
      expect(tablist.getAttribute('aria-label')).toBe('Account settings');
    });

    it('relocates tabs into the tablist and panels into the panel container', async () => {
      const el = await fixture<CivTabs>(tabsHtml());
      const tablist = el.querySelector('[role="tablist"]')!;
      const panels = el.querySelector('[data-civ-tabs-panels]')!;
      expect(tablist.querySelectorAll('civ-tab').length).toBe(3);
      expect(panels.querySelectorAll('civ-tab-panel').length).toBe(3);
    });

    it('inner button carries role="tab" and aria-selected', async () => {
      const el = await fixture<CivTabs>(tabsHtml());
      await settle();
      const tabButtons = el.querySelectorAll('button[role="tab"]');
      expect(tabButtons.length).toBe(3);
      expect(tabButtons[0].getAttribute('aria-selected')).toBe('true');
      expect(tabButtons[1].getAttribute('aria-selected')).toBe('false');
    });

    it('wires aria-controls (tab → panel) and aria-labelledby (panel → tab)', async () => {
      const el = await fixture<CivTabs>(tabsHtml());
      await settle();
      const firstTab = el.querySelectorAll('civ-tab')[0];
      const firstPanel = el.querySelectorAll('civ-tab-panel')[0];
      const btn = firstTab.querySelector('button[role="tab"]')!;
      expect(btn.getAttribute('aria-controls')).toBe(firstPanel.id);
      expect(firstPanel.getAttribute('aria-labelledby')).toBe(firstTab.id);
    });
  });

  describe('selection', () => {
    it('defaults the value to the first tab when unset', async () => {
      const el = await fixture<CivTabs>(`
        <civ-tabs label="x">
          <civ-tab value="a" label="A"></civ-tab>
          <civ-tab value="b" label="B"></civ-tab>
          <civ-tab-panel value="a">A content</civ-tab-panel>
          <civ-tab-panel value="b">B content</civ-tab-panel>
        </civ-tabs>
      `);
      await settle();
      expect(el.value).toBe('a');
    });

    it('hides non-selected panels and shows the selected one', async () => {
      const el = await fixture<CivTabs>(tabsHtml('security'));
      await settle();
      const panels = el.querySelectorAll('civ-tab-panel');
      expect((panels[0] as HTMLElement).hidden).toBe(true);
      expect((panels[1] as HTMLElement).hidden).toBe(false);
      expect((panels[2] as HTMLElement).hidden).toBe(true);
    });

    it('clicking a tab updates value and fires civ-change', async () => {
      const el = await fixture<CivTabs>(tabsHtml());
      await settle();
      const handler = vi.fn();
      el.addEventListener('civ-change', handler as EventListener);
      const securityBtn = el.querySelectorAll('button[role="tab"]')[1] as HTMLButtonElement;
      securityBtn.click();
      await elementUpdated(el);
      expect(el.value).toBe('security');
      expect(handler).toHaveBeenCalledOnce();
      expect(handler.mock.calls[0][0].detail).toEqual({ value: 'security' });
    });

    it('does not re-emit civ-change when clicking the already-selected tab', async () => {
      const el = await fixture<CivTabs>(tabsHtml('profile'));
      await settle();
      const handler = vi.fn();
      el.addEventListener('civ-change', handler as EventListener);
      const profileBtn = el.querySelectorAll('button[role="tab"]')[0] as HTMLButtonElement;
      profileBtn.click();
      await elementUpdated(el);
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('keyboard', () => {
    it('only the selected tab is tab-stop (roving tabindex)', async () => {
      const el = await fixture<CivTabs>(tabsHtml('security'));
      await settle();
      const btns = el.querySelectorAll('button[role="tab"]');
      expect(btns[0].getAttribute('tabindex')).toBe('-1');
      expect(btns[1].getAttribute('tabindex')).toBe('0');
      expect(btns[2].getAttribute('tabindex')).toBe('-1');
    });

    it('ArrowRight moves to the next tab and updates the selection', async () => {
      const el = await fixture<CivTabs>(tabsHtml('profile'));
      await settle();
      const btns = el.querySelectorAll('button[role="tab"]') as NodeListOf<HTMLButtonElement>;
      btns[0].focus();
      btns[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      await elementUpdated(el);
      expect(el.value).toBe('security');
    });

    it('ArrowLeft wraps around to the last tab', async () => {
      const el = await fixture<CivTabs>(tabsHtml('profile'));
      await settle();
      const btns = el.querySelectorAll('button[role="tab"]') as NodeListOf<HTMLButtonElement>;
      btns[0].focus();
      btns[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      await elementUpdated(el);
      expect(el.value).toBe('notifications');
    });

    it('Home selects the first tab, End selects the last tab', async () => {
      const el = await fixture<CivTabs>(tabsHtml('security'));
      await settle();
      const btns = el.querySelectorAll('button[role="tab"]') as NodeListOf<HTMLButtonElement>;
      btns[1].focus();
      btns[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
      await elementUpdated(el);
      expect(el.value).toBe('notifications');

      btns[2].focus();
      btns[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
      await elementUpdated(el);
      expect(el.value).toBe('profile');
    });

    it('ignores ArrowDown / ArrowUp on the horizontal tablist (lets the page scroll)', async () => {
      // WAI-ARIA APG: a horizontal tablist responds only to Left/Right
      // (+ Home/End). Up/Down must fall through so the page can scroll
      // while a tab has focus — and must not be preventDefault()'d.
      const el = await fixture<CivTabs>(tabsHtml('profile'));
      await settle();
      const btns = el.querySelectorAll('button[role="tab"]') as NodeListOf<HTMLButtonElement>;
      btns[0].focus();
      for (const key of ['ArrowDown', 'ArrowUp']) {
        const ev = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
        btns[0].dispatchEvent(ev);
        await elementUpdated(el);
        expect(el.value).toBe('profile');
        expect(ev.defaultPrevented).toBe(false);
      }
    });

    it('skips disabled tabs during keyboard navigation', async () => {
      const el = await fixture<CivTabs>(`
        <civ-tabs label="x" value="a">
          <civ-tab value="a" label="A"></civ-tab>
          <civ-tab value="b" label="B" disabled></civ-tab>
          <civ-tab value="c" label="C"></civ-tab>
          <civ-tab-panel value="a">A</civ-tab-panel>
          <civ-tab-panel value="b">B</civ-tab-panel>
          <civ-tab-panel value="c">C</civ-tab-panel>
        </civ-tabs>
      `);
      await settle();
      const btns = el.querySelectorAll('button[role="tab"]') as NodeListOf<HTMLButtonElement>;
      btns[0].focus();
      btns[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      await elementUpdated(el);
      expect(el.value).toBe('c');
    });
  });
});

describe('civ-tab-panel', () => {
  it('sets role="tabpanel" on the host', async () => {
    const el = await fixture<CivTabs>(tabsHtml());
    await settle();
    const panel = el.querySelector('civ-tab-panel')!;
    expect(panel.getAttribute('role')).toBe('tabpanel');
  });

  it('sets tabindex="0" when the panel has no focusable content (keyboard scroll target)', async () => {
    const el = await fixture<CivTabs>(tabsHtml());
    await settle();
    const panel = el.querySelector('civ-tab-panel')!;
    expect(panel.getAttribute('tabindex')).toBe('0');
  });

  it('does not set tabindex when the panel has its own focusable content (avoid double tab stop)', async () => {
    const el = await fixture<CivTabs>(`
      <civ-tabs label="x" value="a">
        <civ-tab value="a" label="A"></civ-tab>
        <civ-tab-panel value="a">
          <button>Inside button</button>
        </civ-tab-panel>
      </civ-tabs>
    `);
    await settle();
    const panel = el.querySelector('civ-tab-panel')!;
    expect(panel.hasAttribute('tabindex')).toBe(false);
  });

  it('respects an explicit author-set tabindex', async () => {
    const el = await fixture<CivTabs>(`
      <civ-tabs label="x" value="a">
        <civ-tab value="a" label="A"></civ-tab>
        <civ-tab-panel value="a" tabindex="-1">no auto override</civ-tab-panel>
      </civ-tabs>
    `);
    await settle();
    const panel = el.querySelector('civ-tab-panel')!;
    expect(panel.getAttribute('tabindex')).toBe('-1');
  });

  it('preserves slotted content after relocation', async () => {
    const el = await fixture<CivTabs>(tabsHtml());
    await settle();
    const panels = el.querySelectorAll('civ-tab-panel');
    expect(panels[0].textContent?.trim()).toBe('Profile content');
    expect(panels[1].textContent?.trim()).toBe('Security content');
  });
});
