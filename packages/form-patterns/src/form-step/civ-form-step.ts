import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin, dispatch, announce, interpolate, t } from '@civui/core';
import type { SlotConfig } from '@civui/core';
import '@civui/inputs';
import '@civui/actions/button';
import '@civui/navigation/link';
import '../progress/civ-progress-steps.js';
import '../progress/civ-progress-percent.js';
import '../progress/civ-progress-header.js';

/**
 * CivUI Form Step
 *
 * Multi-step navigation within a form chapter. Shows one
 * step at a time, validates required fields before advancing, and
 * renders a progress indicator above the step content.
 *
 * Each direct child element with `data-step-label` is treated as a step.
 * Only the current step is visible.
 *
 * @element civ-form-step
 *
 * @prop {'minimal'|'steps'|'bar'} progress - Progress indicator style (default 'minimal')
 *   - 'minimal': compact "Step X of Y: Title" header (civ-progress-header)
 *   - 'steps': segmented step indicators (civ-progress-steps)
 *   - 'bar': percentage progress bar (civ-progress-percent)
 *   Back link is rendered above all three indicators on non-first steps.
 * @prop {string} persist - Storage key for civ-form persistence
 * @prop {string} continueLabel - Label for continue button
 * @prop {string} completeLabel - Label for final step button
 * @prop {boolean} validate - Enable built-in required field validation (default: true)
 * @prop {boolean} sensitive - Marks the step as emotionally sensitive. Softens screen reader
 *   announcements and makes pause/resume available by default.
 * @prop {boolean} showPause - Renders a "Save and come back later" secondary action
 * @prop {string} pauseLabel - Override the pause action label
 *
 * @fires civ-step-change - When the step changes, detail: { current, total, label }
 * @fires civ-step-back - When back is clicked, detail: { from, to }
 * @fires civ-step-continue - When continue is clicked, detail: { from, to }
 * @fires civ-step-complete - When the last step is completed and validated, detail: { total }
 * @fires civ-step-pause - When the user chooses to save and resume later, detail: { current, label }
 *
 * @example
 * ```html
 * <civ-form-step persist="form-21-526ez-personal">
 *   <div data-step-label="Your name">
 *     <civ-name legend="Your name" name="fullName" required></civ-name>
 *   </div>
 *   <div data-step-label="Date of birth">
 *     <civ-form-fieldset legend="Date of birth" required>
 *       <civ-memorable-date name="dob"></civ-memorable-date>
 *     </civ-form-fieldset>
 *   </div>
 * </civ-form-step>
 * ```
 */
@customElement('civ-form-step')
export class CivFormStep extends LightDomSlotMixin(CivBaseElement) {
  /** Storage key for civ-form persistence. */
  @property({ type: String }) persist = '';

  /** Label for the continue button. */
  @property({ type: String, attribute: 'continue-label' }) continueLabel = '';

  /** Label for the final step's button. */
  @property({ type: String, attribute: 'complete-label' }) completeLabel = '';

  /** Whether navigation buttons are disabled (e.g., during async validation). */
  @property({ type: Boolean, attribute: 'nav-disabled' }) navDisabled = false;

  /** Hide all navigation UI (back link, step counter, progress header). Use for simple flows. */
  @property({ type: Boolean, attribute: 'hide-nav' }) hideNav = false;

  /** Progress indicator style: 'minimal' (compact header), 'steps' (circle indicators), 'bar' (percentage bar). */
  @property({ type: String }) progress: 'minimal' | 'steps' | 'bar' = 'minimal';

  /**
   * Async validation callback. Called after built-in validation passes
   * and before advancing to the next step. Return `true` to allow,
   * `false` to block. The continue button shows a loading state while
   * the promise is pending.
   *
   * @example
   * ```ts
   * el.beforeContinue = async (step, index) => {
   *   const response = await fetch('/api/validate', { method: 'POST', body: formData });
   *   return response.ok;
   * };
   * ```
   */
  @property({ attribute: false })
  beforeContinue?: (stepEl: Element, stepIndex: number) => Promise<boolean> | boolean;

  /** Enable built-in required field validation before advancing. */
  @property({ type: Boolean }) validate = true;

  /**
   * Marks the step as emotionally sensitive. Softens screen-reader
   * announcements on entry and enables pause/resume by default.
   * Also sets `data-sensitive` on the host so consumers can style accordingly.
   */
  @property({ type: Boolean, reflect: true }) sensitive = false;

  /** Title for the current step, rendered below the step counter. */
  @property({ type: String, attribute: 'step-title' }) stepTitle = '';

  /** Header size: 'primary' (large with dividers), 'secondary' (medium, default), 'tertiary' (compact, pairs with progress bars). */
  @property({ type: String, attribute: 'header-size' }) headerSize: 'primary' | 'secondary' | 'tertiary' = 'secondary';

  /** Heading level for the step title (2–6). Defaults to 2. */
  @property({ type: Number, attribute: 'heading-level' }) headingLevel: number = 2;

  /** Render a "Save and come back later" secondary action. */
  @property({ type: Boolean, attribute: 'show-pause' }) showPause = false;

  /** Override the pause action label. */
  @property({ type: String, attribute: 'pause-label' }) pauseLabel = '';

  @state() private _current = 0;
  @state() private _loading = false;
  /** Tracks whether a sensitive-notice announcement has already been made. */
  private _sensitiveNoticeAnnounced = false;

  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-form-step-content]' };
  }

  /** Captured step elements (filtered from default slot children). */
  private get _steps(): Element[] {
    return this._getSlottedChildren('default').filter(
      n => n instanceof Element
    ) as Element[];
  }

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

  private _boundOnKeydown = this._onKeydown.bind(this);

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('keydown', this._boundOnKeydown);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this._boundOnKeydown);
  }

  override firstUpdated(): void {
    this._relocateSlots();
    this._showStep(0);
    this._maybeAnnounceSensitiveNotice();
  }

  /**
   * Capture Enter on inputs inside the step so the form-step advances instead
   * of letting the keystroke bubble to a parent `<civ-form>` and submit the
   * whole form mid-flow. Skips controls that have their own native Enter
   * behavior (button, textarea, anchor, select, option), respects
   * `defaultPrevented` from inner handlers (date-picker dialog, etc.), and
   * never traps Enter from elements inside a `[role="dialog"]`.
   */
  private _onKeydown(e: KeyboardEvent): void {
    if (e.key !== 'Enter') return;
    if (e.defaultPrevented) return;
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const skip = ['BUTTON', 'TEXTAREA', 'A', 'SELECT', 'OPTION'];
    if (skip.includes(target.tagName)) return;
    // If the focused element is inside a dialog (e.g., date-picker calendar),
    // its own keyboard handler owns Enter — don't double-advance.
    if (target.closest('[role="dialog"]')) return;

    e.preventDefault();
    e.stopPropagation();
    this._onContinue();
  }

  /**
   * Announce the sensitive-step notice at a polite priority the first time
   * a user enters the step. Designed not to interrupt — it queues behind
   * the default step-change announcement.
   */
  private _maybeAnnounceSensitiveNotice(): void {
    if (!this.sensitive || this._sensitiveNoticeAnnounced) return;
    this._sensitiveNoticeAnnounced = true;
    announce(t('formStepSensitiveNotice'), 'polite');
  }

  private _renderContent() {
    const isLast = this._current >= this._steps.length - 1;
    const total = this._steps.length;

    return html`
      <div class="civ-form-step">
        ${total > 1 && !this.hideNav ? this._renderProgress() : nothing}

        <section aria-label="${this.stepTitle || this._steps[this._current]?.getAttribute('data-step-label') || nothing}">
          <div data-civ-form-step-content></div>
        </section>

        <div class="civ-mt-6 civ-flex civ-flex-wrap civ-items-center civ-gap-4">
          <civ-button
            label="${this._loading ? t('formStepValidating') || 'Validating…' : isLast
              ? (this.completeLabel || t('formStepSave'))
              : (this.continueLabel || t('formStepContinue'))}"
            ?disabled="${this.navDisabled || this._loading}"
            icon-start="${this._loading ? 'loading' : ''}"
            @click="${this._onContinue}"
          ></civ-button>
          ${this._shouldShowPause
            ? html`
                <civ-link
                  variant="tertiary"
                  label="${this.pauseLabel || t('formStepPauseLabel')}"
                  data-civ-step-pause
                  @click="${this._onPause}"
                ></civ-link>
              `
            : nothing}
        </div>
      </div>
    `;
  }


  private _renderProgress() {
    const total = this._steps.length;
    const idx = this._current;
    const isFirst = idx === 0;

    const backLink = !isFirst ? html`
      <nav class="civ-wizard-nav" aria-label="Step navigation">
        <civ-link
          variant="back"
          label="${t('formStepBack')}"
          @click="${this._onBack}"
        ></civ-link>
      </nav>
    ` : nothing;

    const stepHeader = html`
      <civ-progress-header
        current="${idx}"
        total="${total}"
        step-title="${this.stepTitle || this._steps[idx]?.getAttribute('data-step-label') || ''}"
        size="${this.headerSize}"
        heading-level="${this.headingLevel}"
      ></civ-progress-header>
    `;

    switch (this.progress) {
      case 'steps':
        return html`
          ${backLink}
          ${stepHeader}
          <civ-progress-steps
            .steps="${JSON.stringify(this._steps.map(s => ({ label: s.getAttribute('data-step-label') || '' })))}"
            current="${idx}"
            clickable
            @civ-step-click="${(e: CustomEvent) => this.goToStep(e.detail.step)}"
          ></civ-progress-steps>
        `;

      case 'bar': {
        const pct = Math.round((idx / total) * 100);
        return html`
          ${backLink}
          <div class="civ-flex civ-justify-between civ-items-center civ-mb-1">
            ${stepHeader}
            <span class="civ-text-sm civ-font-bold">${pct}%</span>
          </div>
          <civ-progress-percent
            value="${pct}"
            label="${interpolate(t('progressStepsCounter'), { current: String(idx + 1), total: String(total) })}"
            .showPercent="${false}"
          ></civ-progress-percent>
        `;
      }

      case 'minimal':
      default:
        return html`
          ${backLink}
          ${stepHeader}
        `;
    }
  }

  /** Pause action shows when explicitly requested or on sensitive steps. */
  private get _shouldShowPause(): boolean {
    return this.showPause || this.sensitive;
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

    // Scroll into view and focus first field. Respect reduced-motion preferences.
    if (typeof this.scrollIntoView === 'function') {
      const reduceMotion =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      this.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
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
      step.classList.toggle('civ-hidden', i !== index);
      step.setAttribute('aria-hidden', i === index ? 'false' : 'true');
    }
  }

  /**
   * Tracks fields whose `error` attribute was set by this component's own
   * required-field validation, so we can reliably clear it on the next pass
   * without disturbing externally-set errors.
   */
  private _ownedRequiredErrors = new WeakSet<Element>();

  /** Validate required fields in the current step using CivUI component errors. */
  private _validateCurrentStep(): boolean {
    if (!this.validate) return true;

    const step = this._steps[this._current];
    if (!step) return true;

    let valid = true;

    // Find all CivUI form components and native required elements
    const formFields = step.querySelectorAll('[data-civ-form-field], [required]');
    const checked = new Set<Element>();

    formFields.forEach(field => {
      if (checked.has(field)) return;
      checked.add(field);

      const el = field as HTMLElement & { value?: string };

      // Skip native elements inside CivUI components (they're managed by the parent)
      if (!el.hasAttribute('data-civ-form-field') && el.closest('[data-civ-form-field]')) {
        return;
      }

      // Check required fields for empty values
      if (el.hasAttribute('required')) {
        const value = el.value || el.getAttribute('value') || '';
        if (!value.trim()) {
          const label =
            el.getAttribute('label') ||
            el.getAttribute('legend') ||
            t('fieldFallbackLabel');
          const requiredMsg = el.getAttribute('required-message');
          const message = interpolate(requiredMsg || t('fieldRequired'), { label });
          el.setAttribute('error', message);
          this._ownedRequiredErrors.add(el);
          valid = false;
        } else if (this._ownedRequiredErrors.has(el)) {
          // Clear only errors we set ourselves; leave externally-set errors alone.
          el.removeAttribute('error');
          this._ownedRequiredErrors.delete(el);
        }
      }

      // Check CivUI validate attribute (ssn, email, phone, etc.)
      // Sub-component blur validators set the error; if anything other than
      // our own required-error is showing, the step is invalid.
      const validateAttr = el.getAttribute('validate');
      if (validateAttr && el.value) {
        if (el.getAttribute('error') && !this._ownedRequiredErrors.has(el)) {
          valid = false;
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

  private _onPause(e: Event): void {
    e.preventDefault();
    dispatch(this, 'civ-step-pause', {
      current: this._current,
      label: this.currentLabel,
    });
  }

  private async _onContinue(): Promise<void> {
    if (this._loading) return;
    if (!this._validateCurrentStep()) return;

    const from = this._current;

    // Run async beforeContinue callback if provided
    if (this.beforeContinue) {
      this._loading = true;
      try {
        const allowed = await this.beforeContinue(this._steps[from], from);
        if (!allowed) {
          this._loading = false;
          return;
        }
      } catch {
        this._loading = false;
        return;
      }
      this._loading = false;
    }

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
