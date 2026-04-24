import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, dispatch, t, interpolate } from '@civui/core';
import '@civui/ui';

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
  /** Show a "Go back" link before the step counter. Only visible when current > 0. */
  @property({ type: Boolean, attribute: 'show-back' }) showBack = false;
  /** Label for the back link. */
  @property({ type: String, attribute: 'back-label' }) backLabel = '';

  private _cachedSteps: string | null = null;
  private _cachedStepData: Array<{ label: string; description?: string }> = [];
  private _cachedErrorSteps: string | null = null;
  private _cachedErrorSet: Set<number> = new Set();

  private _getStepData(): Array<{ label: string; description?: string }> {
    if (this._cachedSteps === this.steps) return this._cachedStepData;
    this._cachedSteps = this.steps;
    try {
      const parsed = JSON.parse(this.steps);
      if (!Array.isArray(parsed)) {
        this._cachedStepData = [];
        return this._cachedStepData;
      }
      this._cachedStepData = parsed.map((item: string | { label: string; description?: string }) =>
        typeof item === 'string' ? { label: item } : item
      );
    } catch {
      this._cachedStepData = [];
    }
    return this._cachedStepData;
  }

  private _getErrorSet(): Set<number> {
    if (this._cachedErrorSteps === this.errorSteps) return this._cachedErrorSet;
    this._cachedErrorSteps = this.errorSteps;
    try {
      const parsed = JSON.parse(this.errorSteps);
      this._cachedErrorSet = new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
      this._cachedErrorSet = new Set();
    }
    return this._cachedErrorSet;
  }

  override render() {
    const stepData = this._getStepData();
    if (stepData.length === 0) return nothing;

    const isVertical = this.orientation === 'vertical';
    const errorSet = this._getErrorSet();

    return html`
      <nav aria-label="${t('progressStepsLabel')}">
        <ol
          class="${isVertical ? 'civ-steps-vertical' : 'civ-steps-horizontal'} civ-list-none civ-p-0 civ-m-0"
          role="list"
        >
          ${stepData.map((step, i) => this._renderStep(step, i, stepData.length, isVertical, errorSet))}
        </ol>
        ${this.showCounter || (this.showBack && this.current > 0) ? html`
          <div class="civ-wizard-nav">
            ${this.showBack && this.current > 0 ? html`
              <civ-link
                variant="back"
                label="${this.backLabel || t('formStepBack')}"
                @click="${this._onBack}"
              ></civ-link>
              <span class="civ-wizard-nav__divider"></span>
            ` : nothing}
            ${this.showCounter ? html`
              <span class="civ-wizard-nav__counter" aria-live="polite">
                ${interpolate(t('progressStepsCounter'), { current: this.current + 1, total: stepData.length })}
              </span>
            ` : nothing}
          </div>
        ` : nothing}
      </nav>
    `;
  }

  private _onBack(): void {
    dispatch(this, 'civ-step-back', { from: this.current, to: this.current - 1 });
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
