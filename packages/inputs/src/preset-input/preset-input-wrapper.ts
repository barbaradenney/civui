import { CivFormElement, dispatch, ANALYTICS_EVENT_NAME } from '@civui/core';
import { property } from 'lit/decorators.js';
import type { AnalyticsEventDetail, InputWidth } from '@civui/core';

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

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener(ANALYTICS_EVENT_NAME, this._interceptAnalytics);
  }

  override disconnectedCallback(): void {
    this.removeEventListener(ANALYTICS_EVENT_NAME, this._interceptAnalytics);
    super.disconnectedCallback();
  }

  // Inner controls (civ-text-input, civ-combobox) dispatch civ-analytics with
  // their own tagName as componentName. Re-stamp with the wrapper's tagName so
  // analytics consumers see the preset (civ-ssn, civ-phone, etc.) rather than
  // the generic inner control.
  private _interceptAnalytics = (e: Event): void => {
    if (!(e instanceof CustomEvent)) return;
    const detail = e.detail as AnalyticsEventDetail;
    const ownName = this.tagName.toLowerCase();
    if (detail.componentName === ownName) return;
    // stopImmediatePropagation so other listeners on the wrapper itself
    // see only the re-stamped event, not the original from the inner control.
    e.stopImmediatePropagation();
    dispatch<AnalyticsEventDetail>(this, ANALYTICS_EVENT_NAME, {
      ...detail,
      componentName: ownName,
    });
  };
}
