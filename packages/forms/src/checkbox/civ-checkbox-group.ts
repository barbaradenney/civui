import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivFormElement } from '@civui/core';

/**
 * CivUI Checkbox Group
 *
 * Groups multiple civ-checkbox elements with a shared legend,
 * hint, and error message using a native fieldset.
 * Uses ElementInternals for form participation.
 *
 * @element civ-checkbox-group
 *
 * @prop {string} legend - Group legend text
 * @prop {string} name - Shared form field name for all checkboxes
 * @prop {string} value - Comma-separated checked values
 * @prop {string} hint - Hint text displayed below legend
 * @prop {string} error - Error message for the group
 * @prop {boolean} tile - Apply tile variant to all child checkboxes
 * @prop {boolean} required - Whether at least one selection is required
 * @prop {boolean} disabled - Whether the group is disabled
 * @prop {'vertical' | 'horizontal'} orientation - Layout direction
 *
 * @fires civ-input - When the set of checked values changes (before civ-change), detail: { values }
 * @fires civ-change - When the set of checked values changes, detail: { values }
 */
@customElement('civ-checkbox-group')
export class CivCheckboxGroup extends CivFormElement {
  @property({ type: String }) legend = '';
  @property({ type: Boolean, reflect: true }) tile = false;
  @property({ type: String, reflect: true }) orientation: 'vertical' | 'horizontal' = 'vertical';

  protected override _defaultValue = '';
  private _boundOnChildChange = this._onChildChange.bind(this);

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('civ-change', this._boundOnChildChange as EventListener);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('civ-change', this._boundOnChildChange as EventListener);
  }

  override firstUpdated(): void {
    this._syncCheckboxNames();
    this._syncCheckboxDisabled();
    this._syncCheckboxTile();

    if (this.value) {
      this._syncCheckboxChecked();
    } else {
      this._readCheckedFromChildren();
    }

    this._defaultValue = this.value;
  }

  protected override willUpdate(changed: Map<string, unknown>): void {
    if (changed.has('legend')) {
      this.label = this.legend;
    }
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('name')) {
      this._syncCheckboxNames();
    }
    if (changed.has('disabled')) {
      this._syncCheckboxDisabled();
    }
    if (changed.has('tile')) {
      this._syncCheckboxTile();
    }
    if (changed.has('value') && changed.get('value') !== undefined) {
      this._syncCheckboxChecked();
    }
  }

  override formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
    this._syncCheckboxDisabled();
  }

  override render() {
    const describedBy = [
      this.hint ? this._hintId : '',
      this.error ? this._errorId : '',
    ]
      .filter(Boolean)
      .join(' ');

    const slotClasses =
      this.orientation === 'horizontal'
        ? 'civ-flex civ-flex-row civ-flex-wrap civ-gap-4'
        : 'civ-flex civ-flex-col civ-gap-1';

    return html`
      <fieldset
        class="civ-border-0 civ-p-0 civ-m-0 civ-mb-4"
        aria-describedby="${describedBy || nothing}"
        aria-invalid="${this.error ? 'true' : 'false'}"
        aria-required="${this.required}"
        ?disabled="${this.disabled}"
      >
        ${this.legend
          ? html`
              <legend class="civ-block civ-mb-1 civ-text-base-darkest civ-font-bold civ-text-base">
                ${this.legend}
                ${this.required
                  ? html`<abbr class="civ-text-error civ-no-underline" title="required">*</abbr>`
                  : nothing}
              </legend>
            `
          : nothing}
        ${this.hint
          ? html`<span class="civ-block civ-mb-2 civ-text-sm civ-text-base" id="${this._hintId}">${this.hint}</span>`
          : nothing}
        ${this.error
          ? html`<span class="civ-block civ-mb-2 civ-text-sm civ-text-error civ-font-bold" id="${this._errorId}" role="alert">${this.error}</span>`
          : nothing}
        <div class="${slotClasses}">
          <slot></slot>
        </div>
      </fieldset>
    `;
  }

  /**
   * Get the values of all checked checkboxes in this group.
   */
  getCheckedValues(): string[] {
    return this._parseValue(this.value);
  }

  private _getCheckboxes(): NodeListOf<Element> {
    return this.querySelectorAll('civ-checkbox');
  }

  /**
   * Parse comma-separated value string into array.
   * Note: individual checkbox values must not contain commas.
   */
  private _parseValue(val: string): string[] {
    return val
      ? val.split(',').map((v) => v.trim()).filter(Boolean)
      : [];
  }

  private _serializeValue(values: string[]): string {
    return values.join(',');
  }

  private _syncCheckboxNames(): void {
    if (!this.name) return;
    this._getCheckboxes().forEach((cb: any) => {
      cb.name = this.name;
      cb.disableAnalytics = true;
    });
  }

  private _syncCheckboxDisabled(): void {
    if (!this.disabled) return;
    this._getCheckboxes().forEach((cb: any) => {
      cb.disabled = true;
    });
  }

  private _syncCheckboxTile(): void {
    this._getCheckboxes().forEach((cb: any) => {
      cb.tile = this.tile;
    });
  }

  private _syncCheckboxChecked(): void {
    const selected = this._parseValue(this.value);
    this._getCheckboxes().forEach((cb: any) => {
      cb.checked = selected.includes(cb.value);
    });
  }

  private _readCheckedFromChildren(): void {
    const values: string[] = [];
    this._getCheckboxes().forEach((cb: any) => {
      if (cb.checked) values.push(cb.value);
    });
    this.value = this._serializeValue(values);
    this._updateGroupFormValue();
  }

  private _updateGroupFormValue(): void {
    const values = this._parseValue(this.value);
    if (values.length === 0) {
      this.updateFormValue(null);
      return;
    }
    const fd = new FormData();
    for (const v of values) {
      fd.append(this.name, v);
    }
    this.updateFormValue(fd);
  }

  private _onChildChange(e: Event): void {
    // Only handle events from child checkboxes, not re-dispatched group events
    if (e.target === this) return;

    e.stopPropagation();

    // Re-read checked state from children
    const values: string[] = [];
    this._getCheckboxes().forEach((cb: any) => {
      if (cb.checked) values.push(cb.value);
    });

    this.value = this._serializeValue(values);
    this._updateGroupFormValue();

    this.dispatchEvent(
      new CustomEvent('civ-input', {
        detail: { values: this.getCheckedValues() },
        bubbles: true,
        composed: true,
      }),
    );
    this.dispatchEvent(
      new CustomEvent('civ-change', {
        detail: { values: this.getCheckedValues() },
        bubbles: true,
        composed: true,
      }),
    );
    this.sendAnalytics('change');
  }

  override formResetCallback(): void {
    this.value = this._defaultValue;
    this.error = '';
    this._syncCheckboxChecked();
    this._updateGroupFormValue();
    this.dispatchEvent(new CustomEvent('civ-reset', { bubbles: true, composed: true }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-checkbox-group': CivCheckboxGroup;
  }
}
