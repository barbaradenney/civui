import { CivFormElement, dispatch } from '@civui/core';
import { property } from 'lit/decorators.js';
import type { InputWidth } from '@civui/core';

/**
 * Base class for preset input wrappers (SSN, EIN, ZIP, Phone, etc.).
 *
 * These components delegate to a child `<civ-text-input>` (or similar)
 * and need identical event-forwarding and form-reset logic. Extending
 * this class eliminates the duplicated `_onInput`, `_onChange`, and
 * `formResetCallback` methods that were previously copy-pasted across
 * every preset component.
 *
 * Each preset overrides `render()` and is responsible for forwarding
 * `width` and `placeholder` to the inner text-input / combobox if
 * those make sense for the field. Presets that DON'T forward them
 * (because a fixed width is part of the preset's identity, e.g.
 * `civ-ssn` is always `width="sm"`) can leave them off the inner
 * template.
 */
export abstract class PresetInputWrapper extends CivFormElement {
  /**
   * Width variant forwarded to the inner text-input / combobox.
   * Most presets accept this so consumers can adjust the field width
   * to fit their layout (e.g., narrower currency field next to a
   * frequency dropdown). Presets with a fixed width by design (e.g.,
   * `civ-ssn` is always narrow) ignore this prop.
   */
  @property({ type: String }) width: InputWidth = 'default';

  /**
   * Placeholder forwarded to the inner text-input / combobox. Most
   * presets default to no placeholder (the hint text shows the
   * expected format); this prop lets consumers override.
   */
  @property({ type: String }) placeholder = '';
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
