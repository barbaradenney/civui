import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivFormElement } from '@civui/core';

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
 * @fires civ-change - When the selected value changes
 */
@customElement('civ-segmented-control')
export class CivSegmentedControl extends CivFormElement {
  @property({ type: String }) legend = '';

  private _defaultValue = '';
  private _boundOnChildChange = this._onChildChange.bind(this);
  private _boundOnKeydown = this._onKeydown.bind(this);

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('civ-change', this._boundOnChildChange as EventListener);
    this.addEventListener('keydown', this._boundOnKeydown as EventListener);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('civ-change', this._boundOnChildChange as EventListener);
    this.removeEventListener('keydown', this._boundOnKeydown as EventListener);
  }

  override willUpdate(changed: Map<string, unknown>): void {
    super.willUpdate(changed);
    if (changed.has('legend')) {
      this.label = this.legend;
    }
  }

  override firstUpdated(): void {
    this._syncSegmentSelected();
    this._syncSegmentPositions();
    this._defaultValue = this.value;
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('value')) {
      this._syncSegmentSelected();
    }
  }

  override render() {
    const describedBy = [
      this.hint ? this._hintId : '',
      this.error ? this._errorId : '',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <fieldset
        class="civ-border-0 civ-p-0 civ-m-0 civ-mb-4"
        role="radiogroup"
        aria-describedby="${describedBy || nothing}"
        aria-invalid="${this.error ? 'true' : 'false'}"
        aria-required="${this.required}"
        ?disabled="${this.disabled}"
      >
        <legend class="civ-sr-only">${this.legend}</legend>
        ${this.hint
          ? html`<span class="civ-block civ-mb-2 civ-text-sm civ-text-base" id="${this._hintId}">${this.hint}</span>`
          : nothing}
        ${this.error
          ? html`<span class="civ-block civ-mb-2 civ-text-sm civ-text-error civ-font-bold" id="${this._errorId}" role="alert">${this.error}</span>`
          : nothing}
        <div class="civ-inline-flex">
          <slot></slot>
        </div>
      </fieldset>
    `;
  }

  private _getSegments(): Element[] {
    return Array.from(this.querySelectorAll('civ-segment'));
  }

  private _getEnabledSegments(): Element[] {
    return this._getSegments().filter((s: any) => !s.disabled);
  }

  private _syncSegmentSelected(): void {
    this._getSegments().forEach((segment: any) => {
      segment.selected = segment.value === this.value;
    });
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

  private _onChildChange(e: Event): void {
    const detail = (e as CustomEvent).detail;
    if (!detail?.value) return;

    // Prevent re-dispatch loop — only handle events from child segments
    if (e.target === this) return;

    this.value = detail.value;
    this.updateFormValue(this.value);
    this._syncSegmentSelected();

    // Stop the child event and re-dispatch from the group
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('civ-change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
    this.sendAnalytics('change');
  }

  private _onKeydown(e: KeyboardEvent): void {
    const segments = this._getEnabledSegments();
    if (segments.length === 0) return;

    const currentIndex = segments.findIndex((s: any) => s.selected);

    let nextIndex: number | undefined;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = currentIndex < segments.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : segments.length - 1;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = segments.length - 1;
        break;
    }

    if (nextIndex !== undefined) {
      const segment = segments[nextIndex] as any;
      segment.selected = true;
      this.value = segment.value;
      this.updateFormValue(this.value);
      this._syncSegmentSelected();

      // Focus the button inside the segment
      const btn = segment.querySelector('button');
      if (btn) btn.focus();

      this.dispatchEvent(
        new CustomEvent('civ-change', {
          detail: { value: this.value },
          bubbles: true,
          composed: true,
        }),
      );
      this.sendAnalytics('change');
    }
  }

  override formResetCallback(): void {
    this.value = this._defaultValue;
    this.error = '';
    this._syncSegmentSelected();
    this.updateFormValue(this._defaultValue || '');
    this.dispatchEvent(new CustomEvent('civ-reset', { bubbles: true, composed: true }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-segmented-control': CivSegmentedControl;
  }
}
