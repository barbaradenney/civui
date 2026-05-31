import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/** Shared styles injected once per document to avoid duplication across instances. */
const CONDITIONAL_STYLE_ID = 'civ-conditional-styles';
function ensureConditionalStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(CONDITIONAL_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = CONDITIONAL_STYLE_ID;
  style.textContent = `
    .civ-conditional--visible {
      display: block;
      opacity: 1;
      transition: opacity var(--civ-motion-duration-fast) var(--civ-motion-easing-ease-in-out);
    }
    .civ-conditional--hidden {
      display: none;
      opacity: 0;
    }
  `;
  document.head.appendChild(style);
}

/**
 * CivUI Conditional
 *
 * A declarative show/hide wrapper that shows its content only when a
 * named field has a specified value. Listens for `civ-input` events
 * on the nearest form ancestor (or document as fallback) to avoid
 * performance issues with many conditionals on one page.
 *
 * @element civ-conditional
 *
 * @prop {string} when - The name of the field to watch
 * @prop {string} equals - Show when the field value matches this
 * @prop {string} not-equals - Show when the field value does NOT match this
 * @prop {string} includes - Show when the field value is in this comma-separated list
 * @prop {boolean} hasValue - Show when the field has any non-empty value
 * @prop {string} pattern - Show when the field value matches this regex pattern (attribute: `matches`)
 */
@customElement('civ-conditional')
export class CivConditional extends LightDomSlotMixin(CivBaseElement) {
  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-conditional-content]' };
  }

  @property({ type: String }) when = '';
  @property({ type: String }) equals = '';
  @property({ type: String, attribute: 'not-equals' }) notEquals = '';
  @property({ type: String }) includes = '';
  @property({ type: Boolean, attribute: 'has-value' }) hasValue = false;
  @property({ type: String, attribute: 'matches' }) pattern = '';

  @state() private _visible = false;

  private _boundOnInput = this._onInput.bind(this);
  private _listenTarget: HTMLElement | Document | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    ensureConditionalStyles();
    // Scope listener to nearest form/fieldset ancestor for performance.
    // Falls back to document if not inside a form.
    this._listenTarget =
      this.closest('civ-form') ??
      this.closest('form') ??
      this.closest('civ-fieldset') ??
      this.closest('fieldset') ??
      document;
    this._listenTarget.addEventListener('civ-input', this._boundOnInput as EventListener);
    this._listenTarget.addEventListener('civ-change', this._boundOnInput as EventListener);
    this._checkInitialState();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._listenTarget) {
      this._listenTarget.removeEventListener('civ-input', this._boundOnInput as EventListener);
      this._listenTarget.removeEventListener('civ-change', this._boundOnInput as EventListener);
      this._listenTarget = null;
    }
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  /**
   * The repeater row this conditional lives in, or null when it isn't
   * inside a repeater. Used to scope field matching so a select in row 0
   * doesn't toggle a conditional in row 1 — inside a repeater every row
   * shares the same `when` value but different indexed field names.
   */
  private _ownRow(): Element | null {
    return this.closest('[data-civ-repeater-row]');
  }

  /**
   * Whether a field's `name` should be watched by this conditional.
   * Matches when the name equals `when` exactly OR ends with the
   * `…<sep>when` segment, where `<sep>` is `.` or `]` followed by `.` —
   * i.e. the repeater's indexed `baseName[i].when` pattern. This lets a
   * `when="docType"` conditional inside a repeater track the row's
   * `documents[0].docType` select. Outside a repeater the exact match is
   * the only one that fires.
   */
  private _nameMatches(name: string | null | undefined): boolean {
    if (!name || !this.when) return false;
    if (name === this.when) return true;
    // Last dotted segment equals `when` (covers `base[0].docType` and
    // `group.docType`). Guard against partial-token matches like
    // `notDocType` by requiring a `.` boundary.
    const lastSeg = name.slice(name.lastIndexOf('.') + 1);
    return lastSeg === this.when && name.length > this.when.length;
  }

  /**
   * When inside a repeater row, a candidate field must be in the SAME
   * row as this conditional. Outside a repeater, any match in the scoped
   * listen target qualifies.
   */
  private _fieldInScope(field: Element | null): boolean {
    if (!field) return false;
    const myRow = this._ownRow();
    if (!myRow) return true;
    return field.closest('[data-civ-repeater-row]') === myRow;
  }

  override render() {
    const visibilityClass = this._visible ? 'civ-conditional--visible' : 'civ-conditional--hidden';

    return html`
      <div data-civ-conditional-content
        class="${visibilityClass}"
        aria-hidden="${this._visible ? 'false' : 'true'}"
      ></div>
    `;
  }

  private _checkInitialState(): void {
    if (!this.when) return;
    // Query within the scoped listen target rather than the whole document.
    // When inside a repeater row, prefer searching that row first so an
    // indexed field (`documents[0].docType`) resolves to THIS row's field;
    // fall back to the listen target for the non-repeater case.
    const root = this._listenTarget instanceof HTMLElement ? this._listenTarget : document;
    const searchRoot = this._ownRow() ?? root;
    // Match either the exact `when` name or the repeater-indexed
    // `…].when` / `….when` suffix. `[name$="..."]` covers the suffix; the
    // exact name is a suffix of itself, so one attribute selector handles
    // both, and `_nameMatches` re-validates the boundary.
    const candidates = Array.from(
      searchRoot.querySelectorAll<HTMLElement & { value?: string; checked?: boolean; values?: string[]; getCheckedValues?(): string[]; type?: string }>('[name]'),
    );
    const field = candidates.find(
      (el) => this._nameMatches(el.getAttribute('name')) && this._fieldInScope(el),
    ) ?? null;
    if (!field) return;

    // Checkbox group: prefer getCheckedValues() — the canonical multi-value
    // accessor (civ-checkbox-group), which mirrors the runtime civ-input
    // `detail.values` path. Without this the initial evaluation fell through
    // to the standard branch and compared the group's serialized "a,b" value
    // string against equals/includes, mis-hiding a prefilled group on load.
    // A bare `values` array is kept as a fallback for any future component
    // that exposes one directly.
    if (typeof field.getCheckedValues === 'function') {
      this._evaluateMultiValue(field.getCheckedValues());
    }
    else if (Array.isArray(field.values)) {
      this._evaluateMultiValue(field.values);
    }
    // Single native checkbox / radio. Plain `'checked' in field` matches
    // every <input> (text, email, etc. all expose .checked as a boolean),
    // so explicitly gate on the input type instead of duck-typing.
    else if (
      field instanceof HTMLInputElement &&
      (field.type === 'checkbox' || field.type === 'radio')
    ) {
      this._evaluateChecked(field.checked, field.value ?? '');
    }
    // Standard value
    else {
      this._evaluateVisibility(field.value ?? '');
    }
  }

  private _onInput(e: Event): void {
    const target = e.target as HTMLElement & { name?: string };
    // Match the field by exact name OR repeater-indexed suffix, and — when
    // we're inside a repeater row — only react to a field in the SAME row
    // (sibling rows share the same `when` but have different indexed names).
    if (!this._nameMatches(target.name)) return;
    if (!this._fieldInScope(target instanceof Element ? target : null)) return;

    const detail = (e as CustomEvent).detail;

    // Checkbox group: { values: string[] }
    if (Array.isArray(detail?.values)) {
      this._evaluateMultiValue(detail.values);
      return;
    }

    // Single checkbox/toggle: { checked: boolean, value: string }
    if (typeof detail?.checked === 'boolean') {
      this._evaluateChecked(detail.checked, detail.value ?? '');
      return;
    }

    // Standard: { value: string }
    const value = detail?.value ?? '';
    this._evaluateVisibility(value);
  }

  /** Evaluate for single string value (text input, select, radio group, yes-no). */
  private _evaluateVisibility(value: string): void {
    if (this.equals) {
      this._visible = value === this.equals;
    } else if (this.notEquals) {
      this._visible = value !== this.notEquals;
    } else if (this.includes) {
      const allowed = this.includes.split(',').map(s => s.trim());
      this._visible = allowed.includes(value);
    } else if (this.hasValue) {
      this._visible = value.trim() !== '';
    } else if (this.pattern) {
      try {
        this._visible = new RegExp(this.pattern).test(value);
      } catch {
        this._visible = false;
      }
    } else {
      this._visible = false;
    }
  }

  /** Evaluate for checkbox/toggle: show when checked (optionally matching a value). */
  private _evaluateChecked(checked: boolean, value: string): void {
    if (this.equals) {
      // equals="true" → show when checked; equals="false" → show when unchecked
      if (this.equals === 'true') this._visible = checked;
      else if (this.equals === 'false') this._visible = !checked;
      else this._visible = checked && value === this.equals;
    } else if (this.notEquals) {
      this._visible = !checked || value !== this.notEquals;
    } else if (this.hasValue) {
      this._visible = checked;
    } else {
      // Default: show when checked
      this._visible = checked;
    }
  }

  /** Evaluate for checkbox group: show when any value matches. */
  private _evaluateMultiValue(values: string[]): void {
    if (this.equals) {
      this._visible = values.includes(this.equals);
    } else if (this.notEquals) {
      this._visible = !values.includes(this.notEquals);
    } else if (this.includes) {
      const allowed = this.includes.split(',').map(s => s.trim());
      this._visible = values.some(v => allowed.includes(v));
    } else if (this.hasValue) {
      this._visible = values.length > 0;
    } else {
      this._visible = values.length > 0;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-conditional': CivConditional;
  }
}
