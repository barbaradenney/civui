import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement } from '../base/civ-base-element.js';
import { LightDomSlotMixin } from '../base/light-dom-mixins.js';
import type { SlotConfig } from '../base/light-dom-mixins.js';
import { renderLabel, renderFormHeader, buildDescribedBy } from '../templates/form-templates.js';
import type { HeadingLevel, LabelSize } from '../templates/form-templates.js';
import type { FormControlLike } from '../types/sub-components.js';

const NATIVE_INPUT_SELECTOR = 'input, select, textarea, button[role="switch"]';
const CIV_CONTROL_SELECTOR = '[data-civ-form-field]';

/**
 * CivUI FormField
 *
 * Wrapper that provides label, hint, and error rendering for a single
 * form control. Automatically wires ARIA attributes to the child input
 * and cascades `required` / `disabled` to the child CivUI component.
 *
 * Every form control should be wrapped in a `<civ-form-field>`:
 *
 * ```html
 * <civ-form-field label="Email address" hint="We'll never share this" required>
 *   <civ-text-input type="email" name="email"></civ-text-input>
 * </civ-form-field>
 * ```
 *
 * @element civ-form-field
 */
@customElement('civ-form-field')
export class CivFormField extends LightDomSlotMixin(CivBaseElement) {
  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-form-field-content]' };
  }

  @property({ type: String }) label = '';
  @property({ type: String }) hint = '';
  @property({ type: String }) error = '';
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: String, attribute: 'required-message' }) requiredMessage = '';

  /**
   * Promote the label to a heading via `role="heading"` + `aria-level=N` so
   * screen-reader users can navigate to it by heading. Use sparingly —
   * typically only for the primary question on a single-question page
   * (level 1) or the top label inside a form-step (level 2 or 3). Leave
   * unset for inline labels.
   */
  @property({ type: Number, attribute: 'heading-level' }) headingLevel?: HeadingLevel;

  /**
   * Visual size of the label. Default (omitted) and `sm` render at body
   * size; `md`/`lg`/`xl` step up through the typography scale for use as a
   * section/page heading. Heads up: at `[data-civ-scale="fluid"]`, `xl`
   * renders very large (clamp up to ~2.6rem) — only use it when the label
   * is the page's primary heading.
   */
  @property({ type: String }) size?: LabelSize;

  private _hintId = this.generateId('hint');
  private _errorId = this.generateId('error');
  private _boundOnChildErrorChange = this._onChildErrorChange.bind(this);

  override connectedCallback(): void {
    super.connectedCallback();
    // Mirror child-internal error state (e.g. date-picker rejecting an
    // unparseable typed value) up onto our own `error` property so the
    // visible error text re-renders. CivFormElement bubbles a
    // `civ-error-change` event whenever the child's error changes.
    this.addEventListener('civ-error-change', this._boundOnChildErrorChange as EventListener);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('civ-error-change', this._boundOnChildErrorChange as EventListener);
  }

  private _onChildErrorChange(e: CustomEvent<{ error: string }>): void {
    // Loop-safe: only update when the child's error actually differs from
    // ours. When we cascade error → child via _wireChild, the child fires
    // back the same value and we no-op.
    if (e.target === this) return;
    if (e.detail.error === this.error) return;
    this.error = e.detail.error;
  }

  override firstUpdated(): void {
    this._relocateSlots();
    // Re-render so the label's `for` attribute picks up the child input's
    // ID. This intentionally schedules a second render and emits Lit's
    // "scheduled an update after an update completed" warning — we accept
    // it here because deferring the update (via queueMicrotask) would
    // resolve after `await el.updateComplete` settles, leaving tests and
    // sync consumers reading a half-bound DOM. Patching `for` imperatively
    // races with deeply-nested children (civ-country → civ-combobox →
    // input) whose own render hasn't committed yet.
    this.requestUpdate();
  }

  override updated(_changed: Map<string, unknown>): void {
    super.updated(_changed);
    // Wire ARIA and cascade props after every render — the child may not be
    // available until after slot relocation completes in the second render.
    this._wireChild();
  }

  /**
   * Wire ARIA attributes to the child's native input and cascade
   * props to the child CivUI component.
   */
  private _wireChild(): void {
    // Cascade props + our hint/error IDs onto the child. The child's own
    // template handles aria-describedby / aria-invalid / aria-required via
    // its bindings, so we don't set those imperatively — that survives
    // child re-renders cleanly. `describedByExtra` carries our IDs through
    // to the child's `_ariaDescribedBy` getter.
    const control = this.querySelector(CIV_CONTROL_SELECTOR) as FormControlLike | null;
    if (control) {
      control.label = this.label;
      control.hint = this.hint;
      control.error = this.error;
      control.required = this.required;
      control.disabled = this.disabled;
      control.describedByExtra = buildDescribedBy(
        this._hintId, this.hint, this._errorId, this.error,
      );
      if (this.requiredMessage) {
        control.requiredMessage = this.requiredMessage;
      }
    }
  }

  /** Get the native input's ID for the label `for` attribute. */
  private get _inputId(): string {
    const input = this.querySelector(NATIVE_INPUT_SELECTOR) as HTMLElement | null;
    return input?.id || '';
  }

  override render() {
    return html`
      <div class="civ-mb-4">
        ${renderFormHeader({
          label: renderLabel({
            label: this.label,
            inputId: this._inputId,
            required: this.required,
            headingLevel: this.headingLevel,
            size: this.size,
          }),
          hintId: this._hintId,
          hint: this.hint,
          errorId: this._errorId,
          error: this.error,
        })}
        <div data-civ-form-field-content></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-form-field': CivFormField;
  }
}
