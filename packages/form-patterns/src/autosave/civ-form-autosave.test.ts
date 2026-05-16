import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-form-autosave.js';
import '../form/civ-form.js';
import '@civui/inputs';
import type { CivFormAutosave } from './civ-form-autosave.js';
import type { AutosaveAdapter, AutosaveSnapshot } from './storage-adapters.js';

afterEach(cleanupFixtures);

beforeEach(() => {
  globalThis.localStorage?.clear();
  globalThis.sessionStorage?.clear();
});

function createMemoryAdapter(initial?: AutosaveSnapshot): AutosaveAdapter & { saves: AutosaveSnapshot[]; cleared: number } {
  let store: AutosaveSnapshot | null = initial ?? null;
  const adapter = {
    saves: [] as AutosaveSnapshot[],
    cleared: 0,
    load() { return store; },
    save(_key: string, snap: AutosaveSnapshot) { store = snap; adapter.saves.push(snap); },
    clear() { store = null; adapter.cleared += 1; },
  };
  return adapter;
}

describe('civ-form-autosave', () => {
  it('renders nothing visible', async () => {
    const el = await fixture<CivFormAutosave>('<civ-form-autosave storage-key="x"></civ-form-autosave>');
    expect(el.textContent?.trim()).toBe('');
  });

  it('restores values from a saved snapshot in localStorage', async () => {
    const snapshot: AutosaveSnapshot = {
      v: 1,
      savedAt: 1000,
      data: { 'first-name': 'Jane', email: 'jane@example.gov' },
    };
    globalThis.localStorage.setItem('restore-key', JSON.stringify(snapshot));

    const form = await fixture(`
      <civ-form>
        <civ-form-autosave storage-key="restore-key"></civ-form-autosave>
        <civ-text-input label="First name" name="first-name"></civ-text-input>
        <civ-text-input label="Email" name="email"></civ-text-input>
      </civ-form>
    `);
    const autosave = form.querySelector('civ-form-autosave') as CivFormAutosave;
    // queueMicrotask → prefillData setter on civ-form → rAF inside
    // _applyPrefillData → child field value assignment. Wait for both.
    await new Promise<void>((r) => queueMicrotask(r));
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    await elementUpdated(form);
    const firstName = form.querySelector('civ-text-input[name="first-name"]') as any;
    await elementUpdated(firstName);

    expect(firstName.value).toBe('Jane');
    expect(autosave.lastSavedAt).toBe(1000);
  });

  it('saves to the adapter on civ-input, debounced', async () => {
    vi.useFakeTimers();
    try {
      const adapter = createMemoryAdapter();
      const form = await fixture(`
        <civ-form>
          <civ-form-autosave storage-key="test" storage="custom" debounce-ms="100"></civ-form-autosave>
          <civ-text-input label="Name" name="name"></civ-text-input>
        </civ-form>
      `);
      const autosave = form.querySelector('civ-form-autosave') as CivFormAutosave;
      autosave.adapter = adapter;
      await vi.advanceTimersByTimeAsync(0);

      const input = form.querySelector('input') as HTMLInputElement;
      input.value = 'A';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.value = 'AB';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      // Before debounce window, no save yet.
      expect(adapter.saves.length).toBe(0);

      await vi.advanceTimersByTimeAsync(150);
      expect(adapter.saves.length).toBe(1);
      expect(adapter.saves[0].data.name).toBe('AB');
    } finally {
      vi.useRealTimers();
    }
  });

  it('saveNow() bypasses the debounce', async () => {
    const adapter = createMemoryAdapter();
    const form = await fixture(`
      <civ-form>
        <civ-form-autosave storage-key="test" storage="custom" debounce-ms="5000"></civ-form-autosave>
        <civ-text-input label="Name" name="name" value="Hi"></civ-text-input>
      </civ-form>
    `);
    const autosave = form.querySelector('civ-form-autosave') as CivFormAutosave;
    autosave.adapter = adapter;
    await autosave.saveNow();
    expect(adapter.saves.length).toBe(1);
    expect(adapter.saves[0].data.name).toBe('Hi');
  });

  it('clears the snapshot on form submit', async () => {
    const adapter = createMemoryAdapter({ v: 1, savedAt: 0, data: { name: 'x' } });
    const form = await fixture(`
      <civ-form>
        <civ-form-autosave storage-key="test" storage="custom"></civ-form-autosave>
        <civ-text-input label="Name" name="name"></civ-text-input>
      </civ-form>
    `);
    const autosave = form.querySelector('civ-form-autosave') as CivFormAutosave;
    autosave.adapter = adapter;
    form.dispatchEvent(new CustomEvent('civ-submit', { bubbles: true }));
    await new Promise<void>((r) => queueMicrotask(r));
    expect(adapter.cleared).toBe(1);
    expect(autosave.lastSavedAt).toBeNull();
  });

  it('dispatches civ-autosave-saved after a save', async () => {
    const adapter = createMemoryAdapter();
    const form = await fixture(`
      <civ-form>
        <civ-form-autosave storage-key="test" storage="custom" debounce-ms="0"></civ-form-autosave>
        <civ-text-input label="Name" name="name" value="x"></civ-text-input>
      </civ-form>
    `);
    const autosave = form.querySelector('civ-form-autosave') as CivFormAutosave;
    autosave.adapter = adapter;

    const handler = vi.fn();
    autosave.addEventListener('civ-autosave-saved', handler as EventListener);
    await autosave.saveNow();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('persists to localStorage by default', async () => {
    const form = await fixture(`
      <civ-form>
        <civ-form-autosave storage-key="real-key" debounce-ms="0"></civ-form-autosave>
        <civ-text-input label="N" name="n" value="hi"></civ-text-input>
      </civ-form>
    `);
    const autosave = form.querySelector('civ-form-autosave') as CivFormAutosave;
    await autosave.saveNow();
    const raw = globalThis.localStorage.getItem('real-key');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.data.n).toBe('hi');
  });

  it('persists to sessionStorage when storage=session', async () => {
    const form = await fixture(`
      <civ-form>
        <civ-form-autosave storage-key="sess-key" storage="session" debounce-ms="0"></civ-form-autosave>
        <civ-text-input label="N" name="n" value="hi"></civ-text-input>
      </civ-form>
    `);
    const autosave = form.querySelector('civ-form-autosave') as CivFormAutosave;
    await autosave.saveNow();
    expect(globalThis.sessionStorage.getItem('sess-key')).not.toBeNull();
    expect(globalThis.localStorage.getItem('sess-key')).toBeNull();
  });

  it('describeLastSave returns localized strings', async () => {
    const el = await fixture<CivFormAutosave>('<civ-form-autosave storage-key="x"></civ-form-autosave>');
    expect(el.describeLastSave()).toBe('');

    el.lastSavedAt = Date.now();
    expect(el.describeLastSave()).toMatch(/just now/);

    el.lastSavedAt = Date.now() - 1000 * 30;
    expect(el.describeLastSave()).toMatch(/30 seconds/);

    el.lastSavedAt = Date.now() - 1000 * 60 * 5;
    expect(el.describeLastSave()).toMatch(/5 minutes/);
  });

  it('ignores corrupted snapshots in localStorage', async () => {
    globalThis.localStorage.setItem('corrupt-key', 'not json');
    const form = await fixture(`
      <civ-form>
        <civ-form-autosave storage-key="corrupt-key"></civ-form-autosave>
        <civ-text-input label="N" name="n"></civ-text-input>
      </civ-form>
    `);
    const autosave = form.querySelector('civ-form-autosave') as CivFormAutosave;
    await new Promise<void>((r) => queueMicrotask(r));
    expect(autosave.lastSavedAt).toBeNull();
  });

  it('clear() removes the snapshot and resets lastSavedAt', async () => {
    const adapter = createMemoryAdapter({ v: 1, savedAt: 100, data: {} });
    const form = await fixture(`
      <civ-form>
        <civ-form-autosave storage-key="x" storage="custom"></civ-form-autosave>
      </civ-form>
    `);
    const autosave = form.querySelector('civ-form-autosave') as CivFormAutosave;
    autosave.adapter = adapter;
    autosave.lastSavedAt = 100;
    await autosave.clear();
    expect(adapter.cleared).toBe(1);
    expect(autosave.lastSavedAt).toBeNull();
  });
});
