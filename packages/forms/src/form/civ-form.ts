import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivBaseElement, dispatch } from '@civui/core';

export interface FormFieldError {
  name: string;
  message: string;
  element: Element;
}

/**
 * Duck-typed interface for CivUI form fields discovered via
 * `[data-civ-form-field]`. Avoids importing concrete component
 * classes while providing type safety for form operations.
 */
export interface CivFormFieldLike extends HTMLElement {
  name: string;
  value: string;
  label: string;
  error: string;
  required: boolean;
  disabled: boolean;
  files?: File[];
  checkValidity?(): boolean;
  validationMessage?: string;
  formResetCallback?(): void;
  getCheckedValues?(): string[];
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
 * @fires civ-analytics - Analytics tracking event on submit
 */
@customElement('civ-form')
export class CivForm extends CivBaseElement {
  @property({ type: String }) action = '';
  @property({ type: String }) method: 'get' | 'post' = 'post';
  @property({ type: String, attribute: 'form-label' }) formLabel = '';

  @state() private _errors: FormFieldError[] = [];

  private _summaryId = this.generateId('summary');
  private _summaryHeadingId = this.generateId('summary-heading');
  private _boundOnClick = this._onButtonClick.bind(this);
  private _boundOnKeydown = this._onKeydown.bind(this);

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'form');
    if (this.formLabel) this.setAttribute('aria-label', this.formLabel);
    this.addEventListener('click', this._boundOnClick);
    this.addEventListener('keydown', this._boundOnKeydown);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('click', this._boundOnClick);
    this.removeEventListener('keydown', this._boundOnKeydown);
  }

  override updated(changed: Map<string, unknown>): void {
    if (changed.has('formLabel')) {
      if (this.formLabel) {
        this.setAttribute('aria-label', this.formLabel);
      } else {
        this.removeAttribute('aria-label');
      }
    }
  }

  override render() {
    if (this._errors.length === 0) return nothing;

    return html`
      <div
        id="${this._summaryId}"
        class="civ-form-error-summary"
        role="alert"
        aria-labelledby="${this._summaryHeadingId}"
        data-civ-error-summary
        tabindex="-1"
      >
        <h3 id="${this._summaryHeadingId}" class="civ-form-error-heading">
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
      '[data-civ-form-field]',
    );

    // Clear all field errors for a fresh validation pass
    for (const el of formElements) {
      const formEl = el as unknown as CivFormFieldLike;
      if (!formEl.disabled) formEl.error = '';
    }

    for (const el of formElements) {
      const formEl = el as unknown as CivFormFieldLike;
      if (formEl.disabled) continue;
      if (formEl.required && !formEl.value) {
        const message = `${formEl.label || formEl.name || 'This field'} is required`;
        formEl.error = message;
        errors.push({ name: formEl.name || '', message, element: el });
      } else {
        try {
          if (typeof formEl.checkValidity === 'function' && !formEl.checkValidity()) {
            const message = formEl.validationMessage || `${formEl.label || formEl.name || 'This field'} is invalid`;
            formEl.error = message;
            errors.push({ name: formEl.name || '', message, element: el });
          }
        } catch {
          // ElementInternals.checkValidity may not be available in all environments
        }
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
      '[data-civ-form-field]',
    );
    for (const el of formElements) {
      (el as unknown as CivFormFieldLike).error = '';
    }
  }

  /**
   * Collect form data as a simple key-value record.
   * For file-upload fields, the value is a comma-joined string of file names.
   * For checkbox-group, the value is a comma-joined string of checked values.
   * Use `toFormData()` when you need actual File objects or multi-value fields.
   */
  getFormData(): Record<string, string> {
    const data: Record<string, string> = {};
    const formElements = this.querySelectorAll<HTMLElement>(
      '[data-civ-form-field]',
    );

    for (const el of formElements) {
      const formEl = el as unknown as CivFormFieldLike;
      if (formEl.disabled) continue;
      if (formEl.name) {
        data[formEl.name] = formEl.value ?? '';
      }
    }

    return data;
  }

  /**
   * Collect form data as a FormData object, preserving File objects
   * from file-upload fields and multi-values from checkbox-group.
   */
  toFormData(): FormData {
    const fd = new FormData();
    const formElements = this.querySelectorAll<HTMLElement>(
      '[data-civ-form-field]',
    );

    for (const el of formElements) {
      const formEl = el as unknown as CivFormFieldLike;
      if (!formEl.name || formEl.disabled) continue;

      // file-upload: append actual File objects
      if (Array.isArray(formEl.files) && formEl.files.length > 0) {
        for (const file of formEl.files) {
          fd.append(formEl.name, file);
        }
      }
      // checkbox-group: append each checked value separately
      else if (typeof formEl.getCheckedValues === 'function') {
        for (const v of formEl.getCheckedValues()) {
          fd.append(formEl.name, v);
        }
      }
      // standard single-value field
      else if (formEl.value != null && formEl.value !== '') {
        fd.append(formEl.name, formEl.value);
      }
    }

    return fd;
  }

  private _onButtonClick(e: Event): void {
    const target = e.target as HTMLElement;
    const button = target.closest('button') as HTMLButtonElement | null;
    if (!button || !this.contains(button)) return;

    const type = button.getAttribute('type');
    if (type === 'submit' || type === null) {
      e.preventDefault();
      this._onSubmit();
    } else if (type === 'reset') {
      e.preventDefault();
      this._onReset();
    }
  }

  private _onKeydown(e: KeyboardEvent): void {
    if (e.key !== 'Enter') return;
    const target = e.target as HTMLElement;
    // Don't submit if user is in a textarea or a button
    if (target.tagName === 'TEXTAREA') return;
    if (target.tagName === 'BUTTON') return;
    // Only submit if Enter is pressed inside a form field
    if (!target.closest('[data-civ-form-field]') && target.tagName !== 'INPUT') return;
    e.preventDefault();
    this._onSubmit();
  }

  private _onSubmit(): void {
    const errors = this.validate();
    this._errors = errors;

    if (errors.length > 0) {
      dispatch(this, 'civ-invalid', { errors });
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

    dispatch(this, 'civ-submit', { formData: this.getFormData() });
    this.sendAnalytics('submit');
  }

  private _onReset(): void {
    this.clearErrors();
    const formElements = this.querySelectorAll<HTMLElement>(
      '[data-civ-form-field]',
    );
    for (const el of formElements) {
      const formEl = el as unknown as CivFormFieldLike;
      if (typeof formEl.formResetCallback === 'function') {
        formEl.formResetCallback();
      }
    }
  }

  private _getFieldInputId(element: Element): string {
    const input = element.querySelector('input, select, textarea, button, [role="button"], [tabindex]');
    if (input?.id) return input.id;
    if (element.id) return element.id;
    // Generate an ID so error summary links always work
    const id = `civ-field-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    (input || element).id = id;
    return id;
  }

  private _focusField(e: Event, element: Element): void {
    e.preventDefault();
    // Prefer visible interactive elements over hidden file inputs
    const focusTarget =
      element.querySelector('[role="button"], [role="switch"], button') as HTMLElement | null
      ?? element.querySelector('input:not([aria-hidden="true"]), select, textarea') as HTMLElement | null;
    if (focusTarget) {
      focusTarget.focus();
      focusTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-form': CivForm;
  }
}
