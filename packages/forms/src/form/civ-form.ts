import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivBaseElement } from '@civui/core';

export interface FormFieldError {
  name: string;
  message: string;
  element: Element;
}

/**
 * CivUI Form
 *
 * Validation coordinator with accessible error summary.
 * Queries child CivUI form elements, validates them, and renders
 * an error summary with anchor links to each invalid field.
 *
 * Because all CivUI components use Light DOM, the anchor links
 * in the error summary can directly reference input IDs — no
 * shadow boundary to cross.
 *
 * In Light DOM, `<slot>` does not project children into rendered
 * markup. This component renders the error summary alongside
 * the children (which remain as direct children of this element)
 * and handles submit/reset via event delegation.
 *
 * @element civ-form
 *
 * @prop {string} action - Form action URL (for reference)
 * @prop {string} method - Form method (for reference)
 *
 * @fires civ-submit - When validation passes
 * @fires civ-invalid - When validation fails, detail contains errors
 */
@customElement('civ-form')
export class CivForm extends CivBaseElement {
  @property({ type: String }) action = '';
  @property({ type: String }) method: 'get' | 'post' = 'post';

  @state() private _errors: FormFieldError[] = [];

  private _summaryId = this.generateId('summary');
  private _boundOnClick = this._onButtonClick.bind(this);

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', this._boundOnClick);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('click', this._boundOnClick);
  }

  override render() {
    if (this._errors.length === 0) return nothing;

    return html`
      <div
        id="${this._summaryId}"
        class="civ-border-l-4 civ-border-error civ-bg-error-lighter civ-p-4 civ-mb-4"
        role="alert"
        data-civ-error-summary
        tabindex="-1"
      >
        <h3 class="civ-text-error civ-font-bold civ-text-lg civ-mt-0 civ-mb-2">
          There ${this._errors.length === 1 ? 'is 1 error' : `are ${this._errors.length} errors`} in this form
        </h3>
        <ul class="civ-list-none civ-p-0 civ-m-0">
          ${this._errors.map(
            (err) => html`
              <li class="civ-mb-1">
                <a
                  href="#${this._getFieldInputId(err.element)}"
                  class="civ-text-error civ-underline"
                  @click="${(e: Event) => this._focusField(e, err.element)}"
                >
                  ${err.message}
                </a>
              </li>
            `,
          )}
        </ul>
      </div>
    `;
  }

  /**
   * Validate all CivUI form elements within this form.
   * Returns an array of errors (empty if valid).
   */
  validate(): FormFieldError[] {
    const errors: FormFieldError[] = [];
    const formElements = this.querySelectorAll<HTMLElement>(
      'civ-text-input, civ-textarea, civ-select, civ-combobox, civ-checkbox, civ-radio-group, civ-date-input, civ-memorable-date, civ-file-upload',
    );

    for (const el of formElements) {
      const formEl = el as any;
      if (formEl.required && !formEl.value) {
        const message = formEl.error || `${formEl.label || formEl.name || 'This field'} is required`;
        formEl.error = message;
        errors.push({ name: formEl.name || '', message, element: el });
      }
    }

    return errors;
  }

  /**
   * Clear all errors from the form and its fields.
   */
  clearErrors(): void {
    this._errors = [];
    const formElements = this.querySelectorAll<HTMLElement>(
      'civ-text-input, civ-textarea, civ-select, civ-combobox, civ-checkbox, civ-radio-group, civ-date-input, civ-memorable-date, civ-file-upload',
    );
    for (const el of formElements) {
      (el as any).error = '';
    }
  }

  /**
   * Collect form data from all CivUI form elements.
   */
  getFormData(): Record<string, string> {
    const data: Record<string, string> = {};
    const formElements = this.querySelectorAll<HTMLElement>(
      'civ-text-input, civ-textarea, civ-select, civ-combobox, civ-checkbox, civ-radio-group, civ-date-input, civ-memorable-date, civ-file-upload',
    );

    for (const el of formElements) {
      const formEl = el as any;
      if (formEl.name && formEl.value) {
        data[formEl.name] = formEl.value;
      }
    }

    return data;
  }

  private _onButtonClick(e: Event): void {
    const target = e.target as HTMLElement;
    if (target.matches('button[type="submit"], button:not([type])')) {
      e.preventDefault();
      this._onSubmit();
    } else if (target.matches('button[type="reset"]')) {
      e.preventDefault();
      this._onReset();
    }
  }

  private _onSubmit(): void {
    const errors = this.validate();
    this._errors = errors;

    if (errors.length > 0) {
      this.dispatchEvent(
        new CustomEvent('civ-invalid', {
          detail: { errors },
          bubbles: true,
          composed: true,
        }),
      );
      this.sendAnalytics('invalid', { errorCount: errors.length });

      // Focus the error summary after render
      this.updateComplete.then(() => {
        const summary = this.querySelector(`[data-civ-error-summary]`) as HTMLElement | null;
        if (summary) {
          summary.focus();
          this.announce(
            `${errors.length} ${errors.length === 1 ? 'error' : 'errors'} found. Review the error summary.`,
            'assertive',
          );
        }
      });
      return;
    }

    this.dispatchEvent(
      new CustomEvent('civ-submit', {
        detail: { formData: this.getFormData() },
        bubbles: true,
        composed: true,
      }),
    );
    this.sendAnalytics('submit');
  }

  private _onReset(): void {
    this.clearErrors();
    const formElements = this.querySelectorAll<HTMLElement>(
      'civ-text-input, civ-textarea, civ-select, civ-combobox, civ-checkbox, civ-radio-group, civ-date-input, civ-memorable-date, civ-file-upload',
    );
    for (const el of formElements) {
      (el as any).value = '';
    }
  }

  private _getFieldInputId(element: Element): string {
    const input = element.querySelector('input, select, textarea');
    return input?.id || element.id || '';
  }

  private _focusField(e: Event, element: Element): void {
    e.preventDefault();
    const input = element.querySelector('input, select, textarea') as HTMLElement | null;
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-form': CivForm;
  }
}
