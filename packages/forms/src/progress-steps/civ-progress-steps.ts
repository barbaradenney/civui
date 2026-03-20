import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, dispatch } from '@civui/core';

const clickableStyles = html`
  <style>
    .civ-step-circle--clickable {
      cursor: pointer;
      background: inherit;
      border: inherit;
      font: inherit;
      color: inherit;
      padding: 0;
    }
    .civ-step-circle--clickable:hover {
      opacity: 0.8;
    }
  </style>
`;

/**
 * CivUI Progress Steps
 *
 * A step indicator for multi-step forms. Displays current progress
 * with completed, current, and upcoming step states.
 *
 * @element civ-progress-steps
 *
 * @prop {string} steps - JSON string of step labels, e.g., '["Personal Info","Address","Review"]'
 * @prop {number} current - Current step index (0-based)
 * @prop {string} orientation - Layout direction ('horizontal' | 'vertical', default 'horizontal')
 * @prop {boolean} clickable - When true, completed steps become clickable buttons
 *
 * @fires civ-step-click - When a completed step is clicked, detail: { step: number }
 */
@customElement('civ-progress-steps')
export class CivProgressSteps extends CivBaseElement {
  @property({ type: String }) steps = '[]';
  @property({ type: Number }) current = 0;
  @property({ type: String, reflect: true }) orientation: 'horizontal' | 'vertical' = 'horizontal';
  @property({ type: Boolean }) clickable = false;

  private _getStepLabels(): string[] {
    try {
      const parsed = JSON.parse(this.steps);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  override render() {
    const labels = this._getStepLabels();
    if (labels.length === 0) return nothing;

    const isVertical = this.orientation === 'vertical';
    const listClass = isVertical
      ? 'civ-flex civ-flex-col civ-gap-0'
      : 'civ-flex civ-flex-row civ-items-center civ-gap-0';

    return html`
      ${this.clickable ? clickableStyles : nothing}
      <ol
        class="${listClass} civ-list-none civ-p-0 civ-m-0"
        role="list"
        aria-label="Progress"
      >
        ${labels.map((label, i) => this._renderStep(label, i, labels.length, isVertical))}
      </ol>
    `;
  }

  private _renderStep(label: string, index: number, total: number, isVertical: boolean) {
    const isCompleted = index < this.current;
    const isCurrent = index === this.current;
    const isLast = index === total - 1;

    const stepClass = [
      'civ-step',
      isCompleted ? 'civ-step--completed' : '',
      isCurrent ? 'civ-step--current' : '',
      !isCompleted && !isCurrent ? 'civ-step--upcoming' : '',
    ].filter(Boolean).join(' ');

    const containerClass = isVertical
      ? 'civ-flex civ-items-start civ-gap-3'
      : 'civ-flex civ-items-center';

    const stepAriaLabel = `Step ${index + 1} of ${total}: ${label}`;

    return html`
      <li
        class="${stepClass}"
        aria-label="${stepAriaLabel}"
        aria-current="${isCurrent ? 'step' : nothing}"
      >
        <div class="${containerClass}">
          <div class="civ-flex civ-items-center ${isVertical ? 'civ-flex-col' : ''}">
            ${this.clickable && isCompleted
              ? html`<button type="button"
                  class="civ-step-circle civ-step-circle--clickable civ-flex civ-items-center civ-justify-center civ-rounded-full civ-w-8 civ-h-8 civ-text-sm civ-font-bold civ-shrink-0 focus-visible:civ-focus-ring"
                  @click="${() => this._onStepClick(index)}"
                  aria-label="Go to step ${index + 1}: ${label}"
                ><span class="civ-icon civ-icon--check" aria-hidden="true"></span></button>`
              : html`<div class="civ-step-circle civ-flex civ-items-center civ-justify-center civ-rounded-full civ-w-8 civ-h-8 civ-text-sm civ-font-bold civ-shrink-0">
                ${isCompleted
                  ? html`<span class="civ-icon civ-icon--check" aria-hidden="true"></span>`
                  : html`${index + 1}`}
              </div>`}
            ${!isLast && isVertical
              ? html`<div class="civ-step-connector civ-w-0.5 civ-h-8 civ-my-1"></div>`
              : nothing}
          </div>
          <span class="civ-text-sm ${isCurrent ? 'civ-font-bold' : ''} ${isVertical ? 'civ-h-8 civ-flex civ-items-center' : 'civ-ms-2'}">${label}</span>
        </div>
        ${!isLast && !isVertical
          ? html`<div class="civ-step-connector civ-h-0.5 civ-flex-1 civ-mx-2 civ-min-w-4"></div>`
          : nothing}
      </li>
    `;
  }
  private _onStepClick(step: number): void {
    dispatch(this, 'civ-step-click', { step });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-progress-steps': CivProgressSteps;
  }
}
