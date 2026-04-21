import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivBaseElement, dispatch, announce, interpolate, t } from '@civui/core';

/**
 * CivUI Form Step
 *
 * Multi-step wizard for navigating within a form chapter. Shows one
 * step at a time, validates required fields before advancing, and
 * renders a compact nav bar with back link and step counter.
 *
 * Each direct child element with `data-step-label` is treated as a step.
 * Only the current step is visible.
 *
 * @element civ-form-step
 *
 * @prop {string} persist - Storage key for civ-form persistence
 * @prop {string} continueLabel - Label for continue button
 * @prop {string} completeLabel - Label for final step button
 * @prop {boolean} validate - Enable built-in required field validation (default: true)
 *
 * @fires civ-step-change - When the step changes, detail: { current, total, label }
 * @fires civ-step-back - When back is clicked, detail: { from, to }
 * @fires civ-step-continue - When continue is clicked, detail: { from, to }
 * @fires civ-step-complete - When the last step is completed and validated, detail: { total }
 *
 * @example
 * ```html
 * <civ-form-step persist="form-21-526ez-personal">
 *   <div data-step-label="Your name">
 *     <civ-name legend="Your name" name="fullName" required></civ-name>
 *   </div>
 *   <div data-step-label="Date of birth">
 *     <civ-memorable-date legend="Date of birth" name="dob" required></civ-memorable-date>
 *   </div>
 * </civ-form-step>
 * ```
 */
@customElement('civ-form-step')
export class CivFormStep extends CivBaseElement {
  /** Storage key for civ-form persistence. */
  @property({ type: String }) persist = '';

  /** Label for the continue button. */
  @property({ type: String, attribute: 'continue-label' }) continueLabel = '';

  /** Label for the final step's button. */
  @property({ type: String, attribute: 'complete-label' }) completeLabel = '';

  /** Whether navigation buttons are disabled (e.g., during async validation). */
  @property({ type: Boolean, attribute: 'nav-disabled' }) navDisabled = false;

  /** Enable built-in required field validation before advancing. */
  @property({ type: Boolean }) validate = true;

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
    const container = this.querySelector('[data-civ-form-step-content]');
    if (container) {
      for (const step of this._steps) {
        container.appendChild(step);
      }
    }
    this._showStep(0);
  }

  private _renderContent() {
    const isLast = this._current >= this._steps.length - 1;
    const total = this._steps.length;

    const isFirst = this._current === 0;

    return html`
      <div class="civ-form-step">
        ${total > 1 ? html`
          <div class="civ-wizard-nav">
            ${!isFirst ? html`
              <civ-link
                variant="back"
                label="${t('formStepBack')}"
                @click="${this._onBack}"
              ></civ-link>
              <span class="civ-wizard-nav__divider"></span>
            ` : nothing}
            <span class="civ-wizard-nav__counter" aria-live="polite">
              ${interpolate(t('formStepOf'), {
                current: String(this._current + 1),
                total: String(total),
              })}
            </span>
          </div>
        ` : nothing}

        <div data-civ-form-step-content></div>

        <div class="civ-mt-6">
          <civ-button
            label="${isLast
              ? (this.completeLabel || t('formStepSave'))
              : (this.continueLabel || t('formStepContinue'))}"
            ?disabled="${this.navDisabled}"
            @click="${this._onContinue}"
          ></civ-button>
        </div>
      </div>
    `;
  }

  override render() {
    return this._renderContent();
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

    // Scroll into view and focus first field
    if (typeof this.scrollIntoView === 'function') {
      this.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    requestAnimationFrame(() => {
      const step = this._steps[index];
      if (!step) return;
      const focusable = step.querySelector<HTMLElement>(
        'input, select, textarea, [tabindex]:not([tabindex="-1"]), civ-text-input, civ-select, civ-textarea, civ-combobox, civ-checkbox, civ-toggle, civ-memorable-date, civ-date-picker, civ-file-upload, civ-name, civ-address'
      );
      focusable?.focus();
    });
  }

  private _showStep(index: number): void {
    for (let i = 0; i < this._steps.length; i++) {
      const step = this._steps[i] as HTMLElement;
      step.style.display = i === index ? '' : 'none';
      step.setAttribute('aria-hidden', i === index ? 'false' : 'true');
    }
  }

  /** Validate required fields in the current step. */
  private _validateCurrentStep(): boolean {
    if (!this.validate) return true;

    const step = this._steps[this._current];
    if (!step) return true;

    let valid = true;

    // Check all form fields (CivUI components and native)
    const formFields = step.querySelectorAll('[data-civ-form-field], [required]');
    const checked = new Set<Element>();

    formFields.forEach(field => {
      if (checked.has(field)) return;
      checked.add(field);

      const el = field as HTMLElement & {
        value?: string;
        required?: boolean;
        reportValidity?: () => boolean;
      };

      // Use component's built-in validation (triggers validate="ssn", etc.)
      if (typeof el.reportValidity === 'function') {
        if (!el.reportValidity()) {
          valid = false;
          return;
        }
      }

      // Fallback: check required fields with empty values
      if (el.hasAttribute('required')) {
        const value = el.value || el.getAttribute('value') || '';
        if (!value.trim()) {
          const label = el.getAttribute('label') || el.getAttribute('legend') || 'This field';
          el.setAttribute('error', `${label} is required`);
          valid = false;
        } else if (!el.getAttribute('error')) {
          el.removeAttribute('error');
        }
      }
    });

    return valid;
  }

  private _onBack(): void {
    if (this._current <= 0) return;
    const to = this._current - 1;
    dispatch(this, 'civ-step-back', { from: this._current, to });
    this.goToStep(to);
  }

  private _onContinue(): void {
    if (!this._validateCurrentStep()) return;

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
