import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivBaseElement, LightDomContainerMixin } from '@civui/core';

/**
 * CivUI Conditional
 *
 * A declarative show/hide wrapper that shows its content only when a
 * named field has a specified value. Listens for `civ-input` events
 * bubbled from form fields.
 *
 * @element civ-conditional
 *
 * @prop {string} when - The name of the field to watch
 * @prop {string} equals - Show when the field value matches this
 * @prop {string} not-equals - Show when the field value does NOT match this
 */
@customElement('civ-conditional')
export class CivConditional extends LightDomContainerMixin(CivBaseElement) {
  @property({ type: String }) when = '';
  @property({ type: String }) equals = '';
  @property({ type: String, attribute: 'not-equals' }) notEquals = '';

  @state() private _visible = false;

  private _boundOnInput = this._onInput.bind(this);

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('civ-input', this._boundOnInput as EventListener);
    document.addEventListener('civ-change', this._boundOnInput as EventListener);
    // Check initial state by querying the document for the watched field
    this._checkInitialState();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('civ-input', this._boundOnInput as EventListener);
    document.removeEventListener('civ-change', this._boundOnInput as EventListener);
  }

  override firstUpdated(): void {
    this._relocateChildren('[data-civ-conditional-content]');
  }

  override render() {
    const displayStyle = this._visible ? '' : 'display: none;';

    return html`
      <div data-civ-conditional-content style="${displayStyle}"></div>
    `;
  }

  private _checkInitialState(): void {
    if (!this.when) return;
    const field = document.querySelector(`[name="${this.when}"]`) as HTMLElement | null;
    if (field) {
      const value = (field as any).value ?? '';
      this._evaluateVisibility(value);
    }
  }

  private _onInput(e: Event): void {
    const target = e.target as HTMLElement;
    const name = (target as any).name;
    if (name !== this.when) return;

    const detail = (e as CustomEvent).detail;
    const value = detail?.value ?? '';
    this._evaluateVisibility(value);
  }

  private _evaluateVisibility(value: string): void {
    if (this.equals) {
      this._visible = value === this.equals;
    } else if (this.notEquals) {
      this._visible = value !== this.notEquals;
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
