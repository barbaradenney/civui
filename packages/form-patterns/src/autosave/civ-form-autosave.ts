// Schema: packages/schema/src/components/civ-form-autosave.schema.ts

import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivBaseElement, debounce, dispatch, interpolate, t } from '@civui/core';
import type { PrefillData } from '../prefill/types.js';
import {
  localStorageAdapter,
  sessionStorageAdapter,
  toPrefillData,
  type AutosaveAdapter,
  type AutosaveSnapshot,
} from './storage-adapters.js';

export type AutosaveStorage = 'local' | 'session' | 'custom';

/**
 * Minimal contract that `civ-form-autosave` needs from its host form.
 * Avoids a hard import of `CivForm` so this file stays in the
 * form-patterns layer without a circular dependency with itself.
 */
interface FormHostLike extends HTMLElement {
  getFormData(): Record<string, string>;
  prefillData: PrefillData;
}

/**
 * CivUI Form Autosave
 *
 * Drops inside a `<civ-form>` to persist in-progress answers so the user
 * can return later and resume where they left off. Long government
 * applications (benefits, immigration, tax) often span multiple sessions —
 * losing typed input to a page refresh, tab close, or network drop is
 * one of the highest-impact paper cuts the design system can close.
 *
 * On connect, the adapter loads the saved snapshot (if any) and the
 * autosave element calls the host form's `prefillData` setter — civ-form
 * applies that to every matching field and announces "Resumed from your
 * saved progress" politely.
 *
 * On every `civ-input` inside the form, the autosave element debounces
 * (default 1s) and writes `civ-form.getFormData()` to the storage
 * adapter. On `civ-submit` (success), the saved snapshot is cleared so
 * the user doesn't see stale draft data the next time they start a new
 * application.
 *
 * @element civ-form-autosave
 *
 * @prop {string} storageKey - Unique key for this form (e.g., 'va-21-526ez-draft'). Required.
 * @prop {string} storage - Built-in storage: 'local' (default), 'session', or 'custom' (set `.adapter`).
 * @prop {number} debounceMs - Save debounce in ms. Defaults to 1000.
 * @prop {boolean} silentResume - Suppress the "Resumed" screen-reader announcement.
 *
 * @fires civ-autosave-loaded - Fired after a snapshot is restored, detail: { savedAt: number, data: Record<string, string> }
 * @fires civ-autosave-saved - Fired after each successful save, detail: { savedAt: number }
 * @fires civ-autosave-cleared - Fired when the snapshot is cleared (form submit success or manual `.clear()`)
 *
 * @example
 * ```html
 * <civ-form on-submit="...">
 *   <civ-form-autosave storage-key="ssa-disability-draft" debounce-ms="500"></civ-form-autosave>
 *   <civ-form-step ...>...</civ-form-step>
 * </civ-form>
 * ```
 */
@customElement('civ-form-autosave')
export class CivFormAutosave extends CivBaseElement {
  /** Unique key identifying this form's saved snapshot. */
  @property({ type: String, attribute: 'storage-key' }) storageKey = '';

  /** Built-in storage type. Use 'custom' and set `.adapter` for server-side. */
  @property({ type: String }) storage: AutosaveStorage = 'local';

  /** Save debounce in ms. */
  @property({ type: Number, attribute: 'debounce-ms' }) debounceMs = 1000;

  /**
   * Suppress the "Resumed from your saved progress" screen reader
   * announcement when a snapshot is restored. Defaults to false (the
   * announcement IS made). Set true for forms where the consumer wants
   * to control the messaging themselves via the `civ-autosave-loaded`
   * event.
   */
  @property({ type: Boolean, attribute: 'silent-resume' }) silentResume = false;

  /**
   * Custom storage adapter — required when `storage === 'custom'`,
   * ignored otherwise. Plain JS field (not a Lit reactive `@property`)
   * because it's never set from HTML and never triggers a re-render —
   * keeping it off the reactive surface also keeps it off the platform
   * parity check, where an interface object has no honest type token.
   *
   *   `document.querySelector('civ-form-autosave').adapter = myAdapter`
   */
  adapter?: AutosaveAdapter;

  /** Epoch ms of the most recent save (for "Last saved …" UI). */
  @state() lastSavedAt: number | null = null;

  private _hostForm: FormHostLike | null = null;
  private _boundOnInput = this._onInput.bind(this);
  private _boundOnSubmit = this._onSubmit.bind(this);
  private _debouncedSave = debounce(() => this._save(), 0); // re-created in connectedCallback

  override connectedCallback(): void {
    super.connectedCallback();
    this._debouncedSave = debounce(() => this._save(), this.debounceMs);
    this._hostForm = this.closest('civ-form') as FormHostLike | null;
    if (!this._hostForm) return;
    this._hostForm.addEventListener('civ-input', this._boundOnInput as EventListener);
    this._hostForm.addEventListener('civ-submit', this._boundOnSubmit as EventListener);
    // Restore on next tick so the host form's own connectedCallback has
    // finished wiring up its fields.
    queueMicrotask(() => this._restore());
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._debouncedSave.cancel();
    if (this._hostForm) {
      this._hostForm.removeEventListener('civ-input', this._boundOnInput as EventListener);
      this._hostForm.removeEventListener('civ-submit', this._boundOnSubmit as EventListener);
    }
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('debounceMs')) {
      this._debouncedSave.cancel();
      this._debouncedSave = debounce(() => this._save(), this.debounceMs);
    }
  }

  /** Resolve the active adapter for the current `storage` mode. */
  private get _adapter(): AutosaveAdapter {
    if (this.storage === 'session') return sessionStorageAdapter;
    if (this.storage === 'custom' && this.adapter) return this.adapter;
    return localStorageAdapter;
  }

  /** Visually inert — the element is a controller, not a UI surface. */
  override render() {
    return html``;
  }

  private async _restore(): Promise<void> {
    if (!this._hostForm || !this.storageKey) return;
    const snapshot = await Promise.resolve(this._adapter.load(this.storageKey));
    if (!snapshot || !snapshot.data) return;
    this._hostForm.prefillData = toPrefillData(snapshot.data);
    this.lastSavedAt = snapshot.savedAt;
    if (!this.silentResume) {
      this.announce(t('formAutosaveResumed'), 'polite');
    }
    dispatch(this, 'civ-autosave-loaded', { savedAt: snapshot.savedAt, data: snapshot.data });
  }

  private _onInput(): void {
    this._debouncedSave();
  }

  private async _save(): Promise<void> {
    if (!this._hostForm || !this.storageKey) return;
    const data = this._hostForm.getFormData();
    const snapshot: AutosaveSnapshot = { v: 1, savedAt: Date.now(), data };
    await Promise.resolve(this._adapter.save(this.storageKey, snapshot));
    this.lastSavedAt = snapshot.savedAt;
    dispatch(this, 'civ-autosave-saved', { savedAt: snapshot.savedAt });
  }

  /**
   * Force an immediate save, skipping the debounce. Useful for "Save now"
   * buttons or before the user navigates away from the page.
   */
  async saveNow(): Promise<void> {
    this._debouncedSave.cancel();
    await this._save();
  }

  /** Remove the saved snapshot. Called automatically on civ-submit. */
  async clear(): Promise<void> {
    if (!this.storageKey) return;
    await Promise.resolve(this._adapter.clear(this.storageKey));
    this.lastSavedAt = null;
    dispatch(this, 'civ-autosave-cleared');
  }

  private async _onSubmit(): Promise<void> {
    await this.clear();
  }

  /** Localized "Last saved {minutes} minute(s) ago" string for status UI. */
  describeLastSave(now: number = Date.now()): string {
    if (this.lastSavedAt == null) return '';
    const diffSec = Math.max(0, Math.floor((now - this.lastSavedAt) / 1000));
    if (diffSec < 5) return t('formAutosaveJustNow');
    if (diffSec < 60) return interpolate(t('formAutosaveSecondsAgo'), { count: diffSec });
    const min = Math.floor(diffSec / 60);
    return interpolate(t('formAutosaveMinutesAgo'), { count: min });
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'civ-form-autosave': CivFormAutosave;
  }
}
