import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivFormElement, dispatch, renderLegend, renderHint, renderError } from '@civui/core';
import type { CivCheckbox } from './civ-checkbox.js';

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
 * @fires civ-reset - When the form is reset
 */
@customElement('civ-checkbox-group')
export class CivCheckboxGroup extends CivFormElement {
  @property({ type: String }) legend = '';
  @property({ type: Boolean, reflect: true }) tile = false;
  @property({ type: String, reflect: true }) orientation: 'vertical' | 'horizontal' = 'vertical';

  protected override _defaultValue = '';
  private _boundOnChildChange = this._onChildChange.bind(this);
  private _boundStopChildInput = this._stopChildInput.bind(this);

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('civ-change', this._boundOnChildChange as EventListener);
    this.addEventListener('civ-input', this._boundStopChildInput as EventListener);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('civ-change', this._boundOnChildChange as EventListener);
    this.removeEventListener('civ-input', this._boundStopChildInput as EventListener);
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
    super.willUpdate(changed);
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

  protected override _syncFormValue(): void {
    this._updateGroupFormValue();
  }

  override formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
    this._syncCheckboxDisabled();
  }

  override render() {
    const slotClasses =
      this.orientation === 'horizontal'
        ? 'civ-flex civ-flex-row civ-flex-wrap civ-gap-4'
        : 'civ-flex civ-flex-col civ-gap-1';

    return html`
      <fieldset
        class="civ-border-0 civ-p-0 civ-m-0 civ-mb-4"
        aria-describedby="${this._ariaDescribedBy || nothing}"
        aria-invalid="${this.error ? 'true' : 'false'}"
        aria-required="${this.required}"
        ?disabled="${this.disabled}"
      >
        ${renderLegend({ legend: this.legend, required: this.required })}
        ${renderHint(this._hintId, this.hint, true)}
        ${renderError(this._errorId, this.error, true)}
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

  private _getCheckboxes(): CivCheckbox[] {
    return Array.from(this.querySelectorAll('civ-checkbox')) as CivCheckbox[];
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
    this._getCheckboxes().forEach((cb) => {
      cb.name = this.name;
      cb.disableAnalytics = true;
    });
  }

  private _syncCheckboxDisabled(): void {
    if (!this.disabled) return;
    this._getCheckboxes().forEach((cb) => {
      cb.disabled = true;
    });
  }

  private _syncCheckboxTile(): void {
    this._getCheckboxes().forEach((cb) => {
      cb.tile = this.tile;
    });
  }

  private _syncCheckboxChecked(): void {
    const selected = this._parseValue(this.value);
    this._getCheckboxes().forEach((cb) => {
      cb.checked = selected.includes(cb.value);
    });
  }

  private _readCheckedFromChildren(): void {
    const values: string[] = [];
    this._getCheckboxes().forEach((cb) => {
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

  private _stopChildInput(e: Event): void {
    if (e.target !== this) e.stopPropagation();
  }

  private _onChildChange(e: Event): void {
    // Only handle events from child checkboxes, not re-dispatched group events
    if (e.target === this) return;

    e.stopPropagation();

    // Re-read checked state from children
    const values: string[] = [];
    this._getCheckboxes().forEach((cb) => {
      if (cb.checked) values.push(cb.value);
    });

    this.value = this._serializeValue(values);
    this._updateGroupFormValue();

    dispatch(this, 'civ-input', { values: this.getCheckedValues() });
    dispatch(this, 'civ-change', { values: this.getCheckedValues() });
    this.sendAnalytics('change');
  }

  override formResetCallback(): void {
    this.value = this._defaultValue;
    this.error = '';
    this._syncCheckboxChecked();
    this._updateGroupFormValue();
    dispatch(this, 'civ-reset');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-checkbox-group': CivCheckboxGroup;
  }
}
