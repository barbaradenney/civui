import { CivFormElement, dispatch } from '@civui/core';

/**
 * Base class for preset input wrappers (SSN, EIN, ZIP, Phone, etc.).
 *
 * These components delegate to a child `<civ-text-input>` (or similar)
 * and need identical event-forwarding and form-reset logic. Extending
 * this class eliminates the duplicated `_onInput`, `_onChange`, and
 * `formResetCallback` methods that were previously copy-pasted across
 * every preset component.
 */
export abstract class PresetInputWrapper extends CivFormElement {
  /** Stop propagation of the child's civ-input and re-dispatch from this element. */
  protected _onInput(e: CustomEvent<{ value: string }>): void {
    e.stopPropagation();
    this.value = e.detail.value;
    dispatch(this, 'civ-input', { value: this.value });
  }

  /** Stop propagation of the child's civ-change and re-dispatch from this element. */
  protected _onChange(e: CustomEvent<{ value: string }>): void {
    e.stopPropagation();
    this.value = e.detail.value;
    dispatch(this, 'civ-change', { value: this.value });
  }

  override formResetCallback(): void {
    this.value = '';
    this.error = '';
    this.updateFormValue(null);
    dispatch(this, 'civ-reset');
  }
}
