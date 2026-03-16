import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivFormElement, dispatch, renderLegend, renderHint, renderError, resolveGroupNavIndex, isRtl } from '@civui/core';
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
export class CivSegmentedControl extends CivFormElement {
  @property({ type: String }) legend = '';

  protected override _defaultValue = '';
  private _boundOnChildChange = this._onChildChange.bind(this);
  private _boundStopChildInput = this._stopChildInput.bind(this);
  private _boundOnKeydown = this._onKeydown.bind(this);

  private _userChildren: Node[] = [];

  override connectedCallback(): void {
    this._userChildren = Array.from(this.childNodes);
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
    if (changed.has('legend')) {
      this.label = this.legend;
    }
  }

  override firstUpdated(): void {
    const container = this.querySelector('.civ-inline-flex');
    if (container) {
      for (const child of this._userChildren) {
        container.appendChild(child);
      }
    }

    this._syncSegmentSelected();
    this._syncSegmentPositions();
    this._defaultValue = this.value;
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('value')) {
      this._syncSegmentSelected();
      this._syncSegmentPositions();
    }
    if (changed.has('disabled')) {
      this._syncSegmentDisabled();
    }
  }

  override formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
    this._syncSegmentDisabled();
  }

  override render() {
    return html`
      <fieldset
        class="civ-fieldset"
        role="radiogroup"
        aria-orientation="horizontal"
        aria-describedby="${this._ariaDescribedBy || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        aria-required="${this.required || nothing}"
        ?disabled="${this.disabled}"
      >
        ${renderLegend({ legend: this.legend, required: this.required, srOnly: true })}
        ${renderHint(this._hintId, this.hint, true)}
        ${renderError(this._errorId, this.error, true)}
        <div class="civ-inline-flex"></div>
      </fieldset>
    `;
  }

  private _getSegments(): CivSegment[] {
    return Array.from(this.querySelectorAll('civ-segment')) as CivSegment[];
  }

  private _getEnabledSegments(): CivSegment[] {
    return this._getSegments().filter((s) => !s.disabled);
  }

  private _syncSegmentSelected(): void {
    this._getSegments().forEach((segment) => {
      segment.selected = segment.value === this.value;
    });
  }

  private _groupDisabledSet = new WeakSet<Element>();

  private _syncSegmentDisabled(): void {
    const segments = this._getSegments();
    if (this.disabled) {
      segments.forEach((segment) => {
        if (!segment.disabled) this._groupDisabledSet.add(segment);
        segment.disabled = true;
      });
    } else {
      segments.forEach((segment) => {
        if (this._groupDisabledSet.has(segment)) {
          segment.disabled = false;
        }
      });
      this._groupDisabledSet = new WeakSet();
    }
  }

  private _syncSegmentPositions(): void {
    const segments = this._getSegments();
    segments.forEach((segment, i) => {
      let position: string;
      if (segments.length === 1) {
        position = 'only';
      } else if (i === 0) {
        position = 'first';
      } else if (i === segments.length - 1) {
        position = 'last';
      } else {
        position = 'middle';
      }
      segment.setAttribute('data-civ-segment-position', position);
    });
  }

  private _stopChildInput(e: Event): void {
    if (e.target !== this) e.stopPropagation();
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
    this._syncSegmentSelected();

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
      this._syncSegmentSelected();

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
