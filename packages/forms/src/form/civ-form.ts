// Schema: packages/schema/src/components/civ-form.schema.ts
// Note: complex validation/summary logic layered on top of generated scaffold

import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivBaseElement, LightDomContainerMixin, dispatch, generateId, t, interpolate } from '@civui/core';

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
 * @prop {boolean} trackDirty - Track whether any field has been modified
 *
 * @fires civ-submit - When validation passes
 * @fires civ-invalid - When validation fails, detail contains errors
 * @fires civ-dirty - When dirty state changes, detail: { dirty: boolean }
 * @fires civ-analytics - Analytics tracking event on submit
 */
@customElement('civ-form')
export class CivForm extends LightDomContainerMixin(CivBaseElement) {
  @property({ type: String }) action = '';
  @property({ type: String }) method: 'get' | 'post' = 'post';
  @property({ type: String, attribute: 'form-label' }) formLabel = '';
  @property({ type: Number, attribute: 'error-heading-level' }) errorHeadingLevel: 3 | 4 | 5 | 6 = 3;
  /**
   * Auto-save form data to sessionStorage under this key.
   * Data is restored on page reload and cleared on submit.
   *
   * **Security notes:**
   * - Fields with `data-civ-pii` attribute (SSN, EIN masks) are automatically excluded
   * - Data is stored as plain JSON in sessionStorage — it is NOT encrypted
   * - sessionStorage is scoped to the browser tab and cleared when the tab closes
   * - Do not use `persist` for forms containing classified or highly sensitive data
   *   beyond what PII exclusion covers
   * - For additional security, implement server-side draft saving instead
   */
  @property({ type: String }) persist = '';
  @property({ type: Boolean }) prefill = false;
  @property({ type: Boolean, attribute: 'track-dirty' }) trackDirty = false;

  @state() private _errors: FormFieldError[] = [];
  @state() private _dirty = false;
  private _initialValues = new Map<string, string>();

  private _summaryId = this.generateId('summary');
  private _summaryHeadingId = this.generateId('summary-heading');
  private _boundOnClick = this._onButtonClick.bind(this);
  private _boundOnKeydown = this._onKeydown.bind(this);
  private _boundOnCivInput = this._persistFormData.bind(this);
  private _boundOnCivInputDirty = this._checkDirty.bind(this);
  private _boundBeforeUnload = this._onBeforeUnload.bind(this);
  private _persistTimer: ReturnType<typeof setTimeout> | undefined;
  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'form');
    if (this.formLabel) this.setAttribute('aria-label', this.formLabel);
    this.addEventListener('click', this._boundOnClick);
    this.addEventListener('keydown', this._boundOnKeydown);
    if (this.persist) {
      this.addEventListener('civ-input', this._boundOnCivInput);
    }
    if (this.trackDirty) {
      this.addEventListener('civ-input', this._boundOnCivInputDirty);
      window.addEventListener('beforeunload', this._boundBeforeUnload);
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('click', this._boundOnClick);
    this.removeEventListener('keydown', this._boundOnKeydown);
    if (this.persist) {
      this.removeEventListener('civ-input', this._boundOnCivInput);
      clearTimeout(this._persistTimer);
    }
    if (this.trackDirty) {
      this.removeEventListener('civ-input', this._boundOnCivInputDirty);
      window.removeEventListener('beforeunload', this._boundBeforeUnload);
    }
  }

  override firstUpdated(): void {
    this._relocateChildren('[data-civ-form-content]');
    if (this.persist) this._restorePersistedData();
    this._prefillFromUrl();
    if (this.trackDirty) {
      // Capture initial values after restoration/prefill completes
      requestAnimationFrame(() => this._captureInitialValues());
    }
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
    return html`
      ${this._errors.length > 0
        ? html`
            <div
              id="${this._summaryId}"
              class="civ-form-error-summary"
              role="alert"
              aria-labelledby="${this._summaryHeadingId}"
              data-civ-error-summary
              tabindex="-1"
            >
              <p id="${this._summaryHeadingId}" class="civ-form-error-heading"
                 role="heading" aria-level="${this.errorHeadingLevel}">
                ${this._errors.length === 1 ? t('formErrorSingular') : interpolate(t('formErrorPlural'), { count: this._errors.length })}
              </p>
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
          `
        : nothing}
      <div data-civ-form-content></div>
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
        const label = formEl.label || formEl.name || t('fieldFallbackLabel');
        const message = interpolate(t('fieldRequired'), { label });
        formEl.error = message;
        errors.push({ name: formEl.name || '', message, element: el });
      } else {
        try {
          if (typeof formEl.checkValidity === 'function' && !formEl.checkValidity()) {
            const label = formEl.label || formEl.name || t('fieldFallbackLabel');
            const message = formEl.validationMessage || interpolate(t('fieldInvalid'), { label });
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
   * Reset the form: clear all field values, errors, and persisted data.
   */
  reset(): void {
    const formElements = this.querySelectorAll<HTMLElement>(
      '[data-civ-form-field]',
    );
    for (const el of formElements) {
      const formEl = el as unknown as CivFormFieldLike;
      if (typeof formEl.formResetCallback === 'function') {
        formEl.formResetCallback();
      }
    }
    this._errors = [];
    this._clearPersistedData();
    if (this.trackDirty) {
      this._dirty = false;
      dispatch(this, 'civ-dirty', { dirty: false });
      requestAnimationFrame(() => this._captureInitialValues());
    }
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

  get dirty(): boolean {
    return this._dirty;
  }

  private _captureInitialValues(): void {
    this._initialValues.clear();
    const fields = this.querySelectorAll('[data-civ-form-field]') as NodeListOf<CivFormFieldLike>;
    fields.forEach((f) => {
      if (f.name) this._initialValues.set(f.name, f.value ?? '');
    });
  }

  private _checkDirty(): void {
    if (!this.trackDirty) return;
    const fields = this.querySelectorAll('[data-civ-form-field]') as NodeListOf<CivFormFieldLike>;
    let dirty = false;
    fields.forEach((f) => {
      if (f.name && this._initialValues.get(f.name) !== (f.value ?? '')) dirty = true;
    });
    if (dirty !== this._dirty) {
      this._dirty = dirty;
      dispatch(this, 'civ-dirty', { dirty });
    }
  }

  private _onBeforeUnload(e: BeforeUnloadEvent): void {
    if (this._dirty) {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes';
    }
  }

  private _restorePersistedData(): void {
    try {
      const saved = sessionStorage.getItem(`civ-form:${this.persist}`);
      if (!saved) return;
      const data = JSON.parse(saved) as Record<string, string>;
      requestAnimationFrame(() => {
        const fields = this.querySelectorAll('[data-civ-form-field]') as NodeListOf<CivFormFieldLike>;
        fields.forEach((field) => {
          if (field.name && data[field.name] !== undefined) {
            field.value = data[field.name];
          }
        });
      });
    } catch { /* ignore corrupt data or blocked sessionStorage */ }
  }

  private _persistFormData(): void {
    if (!this.persist) return;
    clearTimeout(this._persistTimer);
    this._persistTimer = setTimeout(() => {
      try {
        const data: Record<string, string> = {};
        const fields = this.querySelectorAll('[data-civ-form-field]') as NodeListOf<CivFormFieldLike>;
        fields.forEach((field) => {
          // Skip PII-flagged fields (SSN, EIN masks)
          if (field.hasAttribute('data-civ-pii')) return;
          // Skip fields manually excluded via data-persist-exclude
          if (field.hasAttribute('data-persist-exclude')) return;
          if (field.name && !field.disabled) {
            data[field.name] = field.value ?? '';
          }
        });
        sessionStorage.setItem(`civ-form:${this.persist}`, JSON.stringify(data));
      } catch { /* sessionStorage may be blocked */ }
    }, 500);
  }

  private _clearPersistedData(): void {
    if (this.persist) {
      try {
        sessionStorage.removeItem(`civ-form:${this.persist}`);
      } catch { /* sessionStorage may be blocked */ }
    }
  }

  private _prefillFromUrl(): void {
    if (!this.prefill) return;
    if (typeof window === 'undefined' || !window.location) return;
    const params = new URLSearchParams(window.location.search);
    requestAnimationFrame(() => {
      const fields = this.querySelectorAll('[data-civ-form-field]') as NodeListOf<CivFormFieldLike>;
      fields.forEach((field) => {
        if (field.name && params.has(field.name)) {
          field.value = params.get(field.name)!;
        }
      });
    });
  }

  private _onButtonClick(e: Event): void {
    const target = e.target as HTMLElement;
    const button = target.closest('button') as HTMLButtonElement | null;
    if (!button || !this.contains(button)) return;

    const type = button.getAttribute('type');
    if (type === 'submit' || type === null) {
      e.preventDefault();
      this._onSubmit();
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
            interpolate(t('formErrorAnnouncement'), { count: errors.length }),
            'assertive',
          );
        }
      });
      return;
    }

    this._clearPersistedData();
    if (this.trackDirty) {
      this._dirty = false;
      dispatch(this, 'civ-dirty', { dirty: false });
      requestAnimationFrame(() => this._captureInitialValues());
    }
    dispatch(this, 'civ-submit', { formData: this.toFormData() });
    this.sendAnalytics('submit');
  }

  private _getFieldInputId(element: Element): string {
    const input = element.querySelector('input, select, textarea, button, [role="button"], [tabindex]');
    if (input?.id) return input.id;
    if (element.id) return element.id;
    // Generate a deterministic ID so error summary links always work
    const id = generateId('civ-field');
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
