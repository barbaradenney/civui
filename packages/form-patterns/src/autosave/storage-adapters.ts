/**
 * Storage adapters for `civ-form-autosave`.
 *
 * An adapter is `{ load, save, clear }`. Three are built-in (localStorage,
 * sessionStorage, in-memory for testing); consumers can pass their own
 * via the `.adapter` property to persist to a server endpoint or an
 * encrypted store.
 */

import type { PrefillData } from '../prefill/types.js';

/**
 * Serializable shape stored under a single key. Includes a timestamp
 * so we can show "last saved a few minutes ago" later and a schema
 * version so a future migration can detect old saves.
 */
export interface AutosaveSnapshot {
  v: 1;
  /** Epoch ms when the snapshot was saved. */
  savedAt: number;
  /** Raw key-value form data (the shape returned by civ-form's getFormData). */
  data: Record<string, string>;
}

/**
 * Validate a deserialized snapshot before handing it back to the
 * autosave element. Returns true only for `{ v: 1, savedAt: number,
 * data: plain object }`. Rejects arrays / strings / null in `data` so
 * a malicious or corrupt storage entry can't make `Object.entries`
 * yield surprising shapes downstream.
 */
function isValidSnapshot(parsed: unknown): parsed is AutosaveSnapshot {
  if (!parsed || typeof parsed !== 'object') return false;
  const s = parsed as Partial<AutosaveSnapshot>;
  if (s.v !== 1) return false;
  if (typeof s.savedAt !== 'number') return false;
  if (!s.data || typeof s.data !== 'object' || Array.isArray(s.data)) return false;
  return true;
}

export interface AutosaveAdapter {
  /** Return the saved snapshot, or null when nothing is saved. */
  load(key: string): Promise<AutosaveSnapshot | null> | AutosaveSnapshot | null;
  /** Persist the snapshot under the given key. */
  save(key: string, snapshot: AutosaveSnapshot): Promise<void> | void;
  /** Remove the saved snapshot (called on civ-form submit success). */
  clear(key: string): Promise<void> | void;
}

/**
 * Persists snapshots to the browser's `localStorage`. Safe to use across
 * tabs and survives reloads, but is cleared when the user opts to clear
 * site data and is visible to anyone with access to the device. Do NOT
 * use for fields the consumer flagged as PII unless your threat model
 * permits it.
 */
export const localStorageAdapter: AutosaveAdapter = {
  load(key) {
    try {
      const raw = globalThis.localStorage?.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as AutosaveSnapshot;
      if (!isValidSnapshot(parsed)) return null;
      return parsed;
    } catch {
      return null;
    }
  },
  save(key, snapshot) {
    try {
      globalThis.localStorage?.setItem(key, JSON.stringify(snapshot));
    } catch {
      // Storage full or denied — fail silently. The form still works.
    }
  },
  clear(key) {
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      /* swallow */
    }
  },
};

/**
 * Per-tab session storage — survives reloads of the same tab but not
 * cross-tab. Useful when the consumer wants resume-on-refresh without
 * polluting the device's persistent storage with sensitive draft state.
 */
export const sessionStorageAdapter: AutosaveAdapter = {
  load(key) {
    try {
      const raw = globalThis.sessionStorage?.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as AutosaveSnapshot;
      if (!isValidSnapshot(parsed)) return null;
      return parsed;
    } catch {
      return null;
    }
  },
  save(key, snapshot) {
    try {
      globalThis.sessionStorage?.setItem(key, JSON.stringify(snapshot));
    } catch { /* swallow */ }
  },
  clear(key) {
    try {
      globalThis.sessionStorage?.removeItem(key);
    } catch { /* swallow */ }
  },
};

/**
 * Convert a raw form-data record into the `PrefillData` shape that
 * `civ-form` understands. Marks every entry as `source: 'saved'` so the
 * consuming form can highlight resumed fields in the UI.
 */
export function toPrefillData(data: Record<string, string>): PrefillData {
  const out: PrefillData = {};
  for (const [name, value] of Object.entries(data)) {
    if (value == null) continue;
    out[name] = { value: String(value), source: 'saved' };
  }
  return out;
}
