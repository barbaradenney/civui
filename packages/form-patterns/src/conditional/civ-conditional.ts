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
      transition: opacity 0.15s ease;
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

  override render() {
    const visibilityClass = this._visible ? 'civ-conditional--visible' : 'civ-conditional--hidden';

    return html`
      <div data-civ-conditional-content
        class="${visibilityClass}"
        aria-hidden="${this._visible ? 'false' : 'true'}"
        aria-live="polite"
      ></div>
    `;
  }

  private _checkInitialState(): void {
    if (!this.when) return;
    // Query within the scoped listen target rather than the whole document
    const root = this._listenTarget instanceof HTMLElement ? this._listenTarget : document;
    const escapedName = typeof CSS !== 'undefined' && CSS.escape
      ? CSS.escape(this.when)
      : this.when.replace(/["\\]/g, '\\$&');
    const field = root.querySelector(`[name="${escapedName}"]`) as HTMLElement & { value?: string } | null;
    if (field) {
      const value = field.value ?? '';
      this._evaluateVisibility(value);
    }
  }

  private _onInput(e: Event): void {
    const target = e.target as HTMLElement & { name?: string };
    if (target.name !== this.when) return;

    const detail = (e as CustomEvent).detail;
    const value = detail?.value ?? '';
    this._evaluateVisibility(value);
  }

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
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-conditional': CivConditional;
  }
}
