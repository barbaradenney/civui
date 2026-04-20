import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, dispatch, t, interpolate } from '@civui/core';

/**
 * CivUI Progress Steps
 *
 * A step indicator for multi-step forms. Displays current progress
 * with completed, current, and upcoming step states.
 *
 * Responsive: horizontal on desktop, auto-switches to vertical on
 * narrow screens via CSS. Labels truncate with ellipsis when space
 * is tight.
 *
 * @element civ-progress-steps
 *
 * @prop {string} steps - JSON string of step objects or labels
 *   Simple: '["Personal Info","Address","Review"]'
 *   Rich:   '[{"label":"Info","description":"Basic details"},{"label":"Address"}]'
 * @prop {number} current - Current step index (0-based)
 * @prop {string} orientation - Layout direction ('horizontal' | 'vertical', default 'horizontal')
 * @prop {boolean} clickable - When true, completed steps become clickable buttons
 * @prop {boolean} showCounter - Show "Step X of Y" text below the steps
 * @prop {number[]} errorSteps - Array of step indices with validation errors
 *
 * @fires civ-step-click - When a completed step is clicked, detail: { step: number }
 */
@customElement('civ-progress-steps')
export class CivProgressSteps extends CivBaseElement {
  @property({ type: String }) steps = '[]';
  @property({ type: Number }) current = 0;
  @property({ type: String, reflect: true }) orientation: 'horizontal' | 'vertical' = 'horizontal';
  @property({ type: Boolean }) clickable = false;
  @property({ type: Boolean, attribute: 'show-counter' }) showCounter = false;
  @property({ type: String, attribute: 'error-steps' }) errorSteps = '[]';

  private _getStepData(): Array<{ label: string; description?: string }> {
    try {
      const parsed = JSON.parse(this.steps);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((item: string | { label: string; description?: string }) =>
        typeof item === 'string' ? { label: item } : item
      );
    } catch {
      return [];
    }
  }

  private _getErrorSet(): Set<number> {
    try {
      const parsed = JSON.parse(this.errorSteps);
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
      return new Set();
    }
  }

  override render() {
    const stepData = this._getStepData();
    if (stepData.length === 0) return nothing;

    const isVertical = this.orientation === 'vertical';
    const errorSet = this._getErrorSet();

    return html`
      <style>
        .civ-steps-horizontal {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 0;
          padding: 0 !important;
          margin: 0;
        }
        .civ-steps-vertical {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .civ-step-label {
          font-size: var(--civ-typography-fontSize-sm, 14px);
          color: var(--civ-color-base-darkest);
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .civ-step-label--vertical {
          max-width: none;
          white-space: normal;
        }
        .civ-step-label--current {
          font-weight: bold;
        }
        .civ-step-label--error {
          color: var(--civ-color-error-DEFAULT);
        }
        .civ-step-desc {
          font-size: var(--civ-typography-fontSize-xs, 12px);
          color: var(--civ-color-base-DEFAULT);
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .civ-step-desc--vertical {
          max-width: none;
          white-space: normal;
        }
        /* Clickable button: reset browser defaults but keep colors from parent state class */
        button.civ-step-circle {
          appearance: none;
          -webkit-appearance: none;
          padding: 0;
          margin: 0;
          cursor: pointer;
        }
        button.civ-step-circle:hover {
          filter: brightness(0.9);
        }
        .civ-step-counter {
          font-size: var(--civ-typography-fontSize-sm, 14px);
          color: var(--civ-color-base-dark);
          margin-top: var(--civ-spacing-2, 8px);
        }
        /* Responsive: auto-switch to vertical on narrow screens */
        @media (max-width: 480px) {
          .civ-steps-horizontal {
            flex-direction: column;
            align-items: flex-start;
          }
          .civ-steps-horizontal .civ-step-connector--horizontal {
            display: none;
          }
          .civ-steps-horizontal .civ-step-connector--vertical-auto {
            display: block;
          }
          .civ-step-label {
            max-width: none;
          }
          .civ-step-desc {
            max-width: none;
          }
        }
      </style>
      <nav aria-label="${t('progressStepsLabel')}">
        <ol
          class="${isVertical ? 'civ-steps-vertical' : 'civ-steps-horizontal'} civ-list-none civ-p-0 civ-m-0"
          role="list"
        >
          ${stepData.map((step, i) => this._renderStep(step, i, stepData.length, isVertical, errorSet))}
        </ol>
        ${this.showCounter ? html`
          <div class="civ-step-counter" aria-live="polite">
            ${interpolate(t('progressStepsCounter'), { current: this.current + 1, total: stepData.length })}
          </div>
        ` : nothing}
      </nav>
    `;
  }

  private _renderStep(
    step: { label: string; description?: string },
    index: number,
    total: number,
    isVertical: boolean,
    errorSet: Set<number>,
  ) {
    const isCompleted = index < this.current;
    const isCurrent = index === this.current;
    const isLast = index === total - 1;
    const hasError = errorSet.has(index);

    const stepClass = [
      'civ-step',
      isCompleted && !hasError ? 'civ-step--completed' : '',
      isCurrent ? 'civ-step--current' : '',
      !isCompleted && !isCurrent ? 'civ-step--upcoming' : '',
      hasError ? 'civ-step--error' : '',
    ].filter(Boolean).join(' ');

    const connectorCompleted = isCompleted && index + 1 < this.current
      ? 'civ-step-connector--completed' : '';

    const stepAriaLabel = interpolate(t('progressStepLabel'), {
      step: index + 1,
      total,
      label: step.label,
    });

    const circleClasses = 'civ-step-circle civ-flex civ-items-center civ-justify-center civ-rounded-full civ-w-8 civ-h-8 civ-text-sm civ-font-bold civ-shrink-0';
    const circleContent = hasError
      ? html`<span class="civ-icon civ-icon--close" aria-hidden="true" style="font-size: 0.6em"></span>`
      : isCompleted
        ? html`<span class="civ-icon civ-icon--check" aria-hidden="true"></span>`
        : html`${index + 1}`;

    const circle = this.clickable && isCompleted && !hasError
      ? html`<button type="button"
          class="${circleClasses} focus-visible:civ-focus-ring"
          @click="${() => this._onStepClick(index)}"
          aria-label="${interpolate(t('progressStepGoTo'), { step: index + 1, label: step.label })}"
        >${circleContent}</button>`
      : html`<div class="${circleClasses}">${circleContent}</div>`;

    const labelClasses = [
      'civ-step-label',
      isVertical ? 'civ-step-label--vertical' : '',
      isCurrent ? 'civ-step-label--current' : '',
      hasError ? 'civ-step-label--error' : '',
    ].filter(Boolean).join(' ');

    const descClasses = [
      'civ-step-desc',
      isVertical ? 'civ-step-desc--vertical' : 'civ-block',
    ].filter(Boolean).join(' ');

    if (isVertical) {
      return html`
        <li class="${stepClass}" aria-label="${stepAriaLabel}" aria-current="${isCurrent ? 'step' : nothing}">
          <div class="civ-flex civ-items-start civ-gap-3">
            <div class="civ-flex civ-items-center civ-flex-col">
              ${circle}
              ${!isLast ? html`<div class="civ-step-connector ${connectorCompleted} civ-w-0.5 civ-h-8 civ-my-1"></div>` : nothing}
            </div>
            <div class="civ-h-8 civ-flex civ-flex-col civ-justify-center">
              <span class="${labelClasses}">${step.label}</span>
              ${step.description ? html`<span class="${descClasses}">${step.description}</span>` : nothing}
            </div>
          </div>
        </li>
      `;
    }

    return html`
      <li class="${stepClass}" aria-label="${stepAriaLabel}" aria-current="${isCurrent ? 'step' : nothing}">
        <div class="civ-flex civ-items-center">
          ${circle}
          <div class="civ-ms-2">
            <span class="${labelClasses}">${step.label}</span>
            ${step.description ? html`<span class="${descClasses}">${step.description}</span>` : nothing}
          </div>
        </div>
        <!-- Vertical connector for responsive auto-switch -->
        ${!isLast ? html`<div class="civ-step-connector--vertical-auto civ-step-connector ${connectorCompleted} civ-w-0.5 civ-h-6 civ-ms-4 civ-my-1" style="display:none;"></div>` : nothing}
        ${!isLast ? html`<div class="civ-step-connector--horizontal civ-step-connector ${connectorCompleted} civ-h-0.5 civ-flex-1 civ-mx-2 civ-min-w-4"></div>` : nothing}
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
