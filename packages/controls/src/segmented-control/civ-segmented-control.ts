import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivFormElement, LightDomSlotMixin, dispatch, resolveGroupNavIndex, isRtl, syncGroupDisabled, stopChildEvent, syncLegendToLabel } from '@civui/core';
import type { SlotConfig } from '@civui/core';
import type { CivSegment } from './civ-segment.js';

/**
 * CivUI Segmented Control
 *
 * A segmented control (button-style radio group) that groups multiple
 * civ-segment elements with mutual exclusivity.
 * Uses ElementInternals for form participation.
 *
 * @element civ-segmented-control
 *
 * @prop {string} legend - Accessible label for the control
 * @prop {string} name - Form field name
 * @prop {string} value - Currently selected segment value
 * @prop {string} hint - Hint text
 * @prop {string} error - Error message
 * @prop {boolean} required - Whether a selection is required
 * @prop {boolean} disabled - Whether the control is disabled
 *
 * @fires civ-input - When the selected value changes (input event), detail: { value }
 * @fires civ-change - When the selected value changes, detail: { value }
 * @fires civ-reset - When the form is reset
 * @fires civ-analytics - Analytics tracking event on change
 */
@customElement('civ-segmented-control')
export class CivSegmentedControl extends LightDomSlotMixin(CivFormElement) {
  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-segment-content]' };
  }

  @property({ type: String }) legend = '';

  protected override _defaultValue = '';
  private _boundOnChildChange = this._onChildChange.bind(this);
  private _boundStopChildInput = stopChildEvent(this);
  private _boundOnKeydown = this._onKeydown.bind(this);

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('civ-change', this._boundOnChildChange as EventListener);
    this.addEventListener('civ-input', this._boundStopChildInput as EventListener);
    this.addEventListener('keydown', this._boundOnKeydown as EventListener);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('civ-change', this._boundOnChildChange as EventListener);
    this.removeEventListener('civ-input', this._boundStopChildInput as EventListener);
    this.removeEventListener('keydown', this._boundOnKeydown as EventListener);
  }

  override willUpdate(changed: Map<string, unknown>): void {
    super.willUpdate(changed);
    syncLegendToLabel(this, changed);
  }

  override firstUpdated(): void {
    this._relocateSlots();

    const segments = this._getSegments();
    this._syncSegmentSelected(segments);
    this._syncSegmentPositions(segments);
    this._defaultValue = this.value;
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    const needsSegments = changed.has('value') || changed.has('disabled');
    const segments = needsSegments ? this._getSegments() : undefined;

    if (changed.has('value')) {
      this._syncSegmentSelected(segments);
      this._syncSegmentPositions(segments);
    }
    if (changed.has('disabled')) {
      this._syncSegmentDisabled(segments);
    }
  }

  override formDisabledCallback(disabled: boolean): void {
    super.formDisabledCallback(disabled);
    this._syncSegmentDisabled();
  }

  override render() {
    return html`
        <div
          class="civ-inline-flex"
          data-civ-segment-content
          role="radiogroup"
          aria-orientation="horizontal"
          aria-describedby="${this._ariaDescribedBy || nothing}"
          aria-invalid="${this.error ? 'true' : nothing}"
          aria-required="${this.required || nothing}"
        ></div>
    `;
  }

  private _getSegments(): CivSegment[] {
    return Array.from(this.querySelectorAll('civ-segment')) as CivSegment[];
  }

  private _getEnabledSegments(segments?: CivSegment[]): CivSegment[] {
    return (segments ?? this._getSegments()).filter((s) => !s.disabled);
  }

  private _syncSegmentSelected(segments?: CivSegment[]): void {
    const segs = segments ?? this._getSegments();
    segs.forEach((segment) => {
      segment.selected = segment.value === this.value;
    });

    // Roving tabindex: focus target is the selected segment, or the first
    // enabled segment when none is selected. Drives the segment's
    // managedTabIndex property so the value survives subsequent renders.
    const checked = segs.find((s) => s.selected && !s.disabled);
    const enabled = segs.filter((s) => !s.disabled);
    const focusTarget = checked ?? enabled[0];
    segs.forEach((segment) => {
      segment.managedTabIndex = segment === focusTarget ? 0 : -1;
    });
  }

  private _groupDisabledSet = new WeakSet<Element>();

  private _syncSegmentDisabled(segments?: CivSegment[]): void {
    this._groupDisabledSet = syncGroupDisabled(segments ?? this._getSegments(), this.disabled, this._groupDisabledSet);
  }

  private _syncSegmentPositions(segments?: CivSegment[]): void {
    const segs = segments ?? this._getSegments();
    segs.forEach((segment, i) => {
      let position: string;
      if (segs.length === 1) {
        position = 'only';
      } else if (i === 0) {
        position = 'first';
      } else if (i === segs.length - 1) {
        position = 'last';
      } else {
        position = 'middle';
      }
      segment.setAttribute('data-civ-segment-position', position);
    });
  }

  private _onChildChange(e: Event): void {
    const detail = (e as CustomEvent).detail;
    if (detail?.value == null) return;

    // Prevent re-dispatch loop — only handle events from child segments
    if (e.target === this) return;

    // Skip if same value already selected
    if (this.value === detail.value) { e.stopPropagation(); return; }

    this.value = detail.value;
    this.updateFormValue(this.value);

    // Stop the child event and re-dispatch from the group
    e.stopPropagation();
    dispatch(this, 'civ-input', { value: this.value });
    dispatch(this, 'civ-change', { value: this.value });
    this.sendAnalytics('change');
  }

  private _onKeydown(e: KeyboardEvent): void {
    const segments = this._getEnabledSegments();
    if (segments.length === 0) return;

    const currentIndex = segments.findIndex((s) => s.selected);
    const nextIndex = resolveGroupNavIndex(e.key, currentIndex, segments.length, isRtl(this));

    if (nextIndex !== undefined) {
      e.preventDefault();
      const segment = segments[nextIndex];
      if (segment.value === this.value) return;
      segment.selected = true;
      this.value = segment.value;
      this.updateFormValue(this.value);

      // Focus the button inside the segment
      const btn = segment.querySelector('button');
      if (btn) btn.focus();
      this.announce(segment.label);

      dispatch(this, 'civ-input', { value: this.value });
      dispatch(this, 'civ-change', { value: this.value });
      this.sendAnalytics('change');
    }
  }

  override formResetCallback(): void {
    this.value = this._defaultValue;
    this.error = '';
    this._syncSegmentSelected();
    this.updateFormValue(this._defaultValue || '');
    dispatch(this, 'civ-reset');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-segmented-control': CivSegmentedControl;
  }
}
