import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivBaseElement, LightDomContainerMixin, dispatch, announce, interpolate, t } from '@civui/core';

/**
 * CivUI Form Step
 *
 * Multi-step wizard for navigating within a form chapter. Shows one
 * step at a time with back/continue buttons and progress tracking.
 *
 * Each direct child element is treated as a step. Only the current
 * step is visible. Navigation fires events so the parent can
 * validate before allowing progression.
 *
 * @element civ-form-step
 *
 * @example
 * ```html
 * <civ-form-step>
 *   <div data-step-label="Personal info">
 *     <civ-name legend="Your name" name="name" required></civ-name>
 *   </div>
 *   <div data-step-label="Contact info">
 *     <civ-address legend="Address" name="address" required></civ-address>
 *   </div>
 * </civ-form-step>
 * ```
 *
 * @fires civ-step-change - When the step changes, detail: { current, total, label }
 * @fires civ-step-back - When back is clicked, detail: { from, to }
 * @fires civ-step-continue - When continue is clicked, detail: { from, to }
 * @fires civ-step-complete - When the last step's continue is clicked, detail: { total }
 */
@customElement('civ-form-step')
export class CivFormStep extends LightDomContainerMixin(CivBaseElement) {
  /** Whether to show a progress indicator above the steps. */
  @property({ type: Boolean, attribute: 'show-progress' }) showProgress = true;

  /** Label for the back button. */
  @property({ type: String, attribute: 'back-label' }) backLabel = '';

  /** Label for the continue button. */
  @property({ type: String, attribute: 'continue-label' }) continueLabel = '';

  /** Label for the final step's button. */
  @property({ type: String, attribute: 'complete-label' }) completeLabel = '';

  /** Whether navigation buttons are disabled (e.g., during async validation). */
  @property({ type: Boolean, attribute: 'nav-disabled' }) navDisabled = false;

  @state() private _current = 0;

  private _steps: Element[] = [];
  private _captured = false;

  /** Current step index (0-based). */
  get current(): number {
    return this._current;
  }

  /** Total number of steps. */
  get total(): number {
    return this._steps.length;
  }

  /** Label of the current step (from data-step-label attribute). */
  get currentLabel(): string {
    return this._steps[this._current]?.getAttribute('data-step-label') || '';
  }

  override connectedCallback(): void {
    if (!this._captured) {
      this._steps = Array.from(this.children).filter(
        el => el.nodeType === Node.ELEMENT_NODE
      );
      this._captured = true;
    }
    super.connectedCallback();
  }

  override firstUpdated(): void {
    this._relocateChildren('[data-civ-form-step-content]');
    this._showStep(0);
  }

  override render() {
    const isFirst = this._current === 0;
    const isLast = this._current >= this._steps.length - 1;
    const stepLabel = interpolate(t('formStepOf'), {
      current: String(this._current + 1),
      total: String(this._steps.length),
    });

    return html`
      <div class="civ-form-step">
        ${this.showProgress && this._steps.length > 1 ? html`
          <div class="civ-text-sm civ-text-muted civ-mb-3" aria-live="polite">
            ${stepLabel}
          </div>
        ` : nothing}

        <div data-civ-form-step-content></div>

        <div class="civ-flex civ-justify-between civ-mt-6">
          ${!isFirst ? html`
            <button
              type="button"
              class="civ-btn civ-btn--secondary focus-visible:civ-focus-ring"
              ?disabled="${this.navDisabled}"
              @click="${this._onBack}"
            >${this.backLabel || t('formStepBack')}</button>
          ` : html`<span></span>`}

          <button
            type="button"
            class="civ-btn civ-btn--primary focus-visible:civ-focus-ring"
            ?disabled="${this.navDisabled}"
            @click="${this._onContinue}"
          >${isLast
            ? (this.completeLabel || t('formStepSave'))
            : (this.continueLabel || t('formStepContinue'))}</button>
        </div>
      </div>
    `;
  }

  /** Navigate to a specific step by index. */
  goToStep(index: number): void {
    if (index < 0 || index >= this._steps.length) return;
    this._current = index;
    this._showStep(index);
    this.requestUpdate();
    dispatch(this, 'civ-step-change', {
      current: index,
      total: this._steps.length,
      label: this.currentLabel,
    });
    announce(interpolate(t('formStepOf'), {
      current: String(index + 1),
      total: String(this._steps.length),
    }));
  }

  private _showStep(index: number): void {
    for (let i = 0; i < this._steps.length; i++) {
      const step = this._steps[i] as HTMLElement;
      step.style.display = i === index ? '' : 'none';
      step.setAttribute('aria-hidden', i === index ? 'false' : 'true');
    }
  }

  private _onBack(): void {
    if (this._current <= 0) return;
    const to = this._current - 1;
    dispatch(this, 'civ-step-back', { from: this._current, to });
    this.goToStep(to);
  }

  private _onContinue(): void {
    const from = this._current;

    if (from >= this._steps.length - 1) {
      dispatch(this, 'civ-step-complete', { total: this._steps.length });
      return;
    }

    const to = from + 1;
    dispatch(this, 'civ-step-continue', { from, to });
    this.goToStep(to);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-form-step': CivFormStep;
  }
}
