// Note: complex validation/summary logic layered on top of generated scaffold

import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin, dispatch, generateId, t, interpolate, warnInvalidProp } from '@civui/core';
import type { SlotConfig } from '@civui/core';
import type { PrefillData, PrefillMeta } from '../prefill/types.js';
// Side-effect imports for the support-resources rendering — the
// component composes <civ-support-resources> (which itself composes
// <civ-callout>) instead of hand-rolling an inline <aside>.
import '../support-resources/civ-support-resources.js';
// civ-link is used both inside support-resources rendering and by
// other in-form affordances; one side-effect import covers both.
import '@civui/actions/link';

export interface FormFieldError {
  name: string;
  message: string;
  element: Element;
}

/**
 * A persistent support resource displayed in the form footer for
 * trauma-informed / sensitive flows (crisis lines, caregiver support,
 * benefit help desks, etc.). Rendered as a non-modal region that
 * stays visible across form steps.
 */
export interface SupportResource {
  label: string;
  href: string;
  /** Short descriptor shown after the link (e.g., "24/7"). */
  description?: string;
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
  readonly?: boolean;
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
 * **Error heading level:** The error summary heading renders at
 * `error-heading-level` (default 3). Set to one level below the form's
 * nearest parent heading.
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
 * @fires civ-submit-confirm - When validation passes and `confirm-before-submit` is set; detail carries `proceed()` and `cancel()` callbacks
 * @fires civ-submit-cancelled - When the consumer calls `cancel()` on a `civ-submit-confirm` event
 * @fires civ-analytics - Analytics tracking event on submit
 */
@customElement('civ-form')
export class CivForm extends LightDomSlotMixin(CivBaseElement) {
  override _getSlotConfig(): SlotConfig {
    return {
      'data-civ-form-disclosures': '[data-civ-form-disclosures-slot]',
      default: '[data-civ-form-content]',
    };
  }

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

  /**
   * Prefill data from a user profile or API. Set via JS property.
   * Keys are field names, values describe the prefill value and metadata.
   */
  @property({ type: Object, attribute: false }) prefillData: PrefillData = {};

  /**
   * URL to fetch prefill data from. Response must be JSON matching PrefillData shape.
   * Fetched once in connectedCallback. Use `prefillData` property for non-URL sources.
   */
  @property({ type: String, attribute: 'prefill-src' }) prefillSrc = '';

  /** Custom headers for prefill-src fetch (e.g., auth tokens). Set via JS. */
  @property({ type: Object, attribute: false }) prefillHeaders: Record<string, string> = {};

  /**
   * Persistent support resources rendered as a non-modal footer region.
   * Used for trauma-informed flows where crisis lines, caregiver support,
   * or benefit help desks should remain visible across every step.
   *
   * Can be supplied as either:
   * - a JSON-string attribute: `support-resources='[{"label":"988 Suicide & Crisis Lifeline","href":"tel:988"}]'`
   * - a JS property containing a `SupportResource[]`
   */
  @property({
    attribute: 'support-resources',
    converter: {
      fromAttribute: (val: string | null): SupportResource[] => {
        if (!val) return [];
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed;
          warnInvalidProp('civ-form', 'support-resources', 'a JSON array of {label, href, description?} objects', val);
          return [];
        } catch {
          warnInvalidProp('civ-form', 'support-resources', 'a valid JSON-string array of {label, href, description?} objects', val);
          return [];
        }
      },
    },
  })
  supportResources: SupportResource[] = [];

  /** Override the support resources heading. Defaults to `t('supportResourcesHeading')`. */
  @property({ type: String, attribute: 'support-resources-heading' }) supportResourcesHeading = '';

  /**
   * Render "* indicates a required field" footer text beneath the form
   * content. Use on any federal form that includes a required-mark
   * disclosure ("Required fields are marked with an asterisk").
   *
   * Defaults to false — every form decides whether the legend adds value
   * over the per-field `(required)` marker.
   */
  @property({ type: Boolean, attribute: 'required-legend' }) requiredLegend = false;

  /**
   * When true, intercept validated submits and dispatch a
   * `civ-submit-confirm` event before actually submitting. The detail
   * object carries `proceed()` and `cancel()` callbacks; the actual
   * `civ-submit` event fires only when the consumer calls `proceed()`.
   *
   * Use for irreversible submissions (filing a benefit claim, signing
   * a tax return) where the user should see a "Submit your
   * application?" confirmation. Compose with `civ-modal` and
   * `civ-summary` in the consumer.
   */
  @property({ type: Boolean, attribute: 'confirm-before-submit' }) confirmBeforeSubmit = false;

  @state() private _errors: FormFieldError[] = [];

  /**
   * Guard against repeated submits while a `civ-submit-confirm` is
   * pending. The consumer holds the resume on a per-event closure;
   * tracking the same flag on the instance prevents a second click
   * from spawning a second {proceed,cancel} pair (each closure has its
   * own `resolved` guard, but proceeding on either still fires
   * `civ-submit` once).
   */
  private _confirmPending = false;
  @state() private _dirty = false;
  @state() private _prefillLoading = false;
  @state() private _prefillError = '';
  private _initialValues = new Map<string, string>();

  /** Cached query for form field elements. Avoids repeated querySelectorAll. */
  private _getFields(): NodeListOf<Element> {
    return this.querySelectorAll('[data-civ-form-field]');
  }

  /**
   * True when `el` is inside the slot of a `civ-conditional` whose condition
   * isn't currently met. civ-conditional renders its slotted children into
   * a `[data-civ-conditional-content]` wrapper that flips
   * `aria-hidden="true"` (and `display: none`) when hidden — so a field
   * inside that wrapper should be excluded from validation and form-data
   * collection. The error summary would otherwise list fields the user
   * can't see, and submit payloads would carry stale values left over
   * from a previously-visible branch.
   */
  private _isInHiddenConditional(el: Element): boolean {
    return !!el.closest('[data-civ-conditional-content][aria-hidden="true"]');
  }

  /**
   * True when `el` is inside a collapsed `civ-accordion-item`. Walks
   * every accordion-item ancestor (not just the nearest) — a field
   * inside an open inner accordion that's itself inside a collapsed
   * outer accordion is still hidden from the user, so it's excluded.
   *
   * Why this lives in civ-form, not on the accordion: accordion-item
   * renders a native `<details>` element which keeps children in the
   * DOM even when collapsed. Without this check, `validate()` would
   * complain about required fields the user can't see, and submit
   * payloads would carry stale collapsed-accordion data.
   */
  private _isInCollapsedAccordion(el: Element): boolean {
    let current: Element | null = el.parentElement;
    while (current && current !== this) {
      if (current.tagName.toLowerCase() === 'civ-accordion-item') {
        const item = current as unknown as { open?: boolean };
        if (!item.open) return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  /** Combined: a field is excluded if it's in a hidden conditional OR a collapsed accordion. */
  private _isHidden(el: Element): boolean {
    return this._isInHiddenConditional(el) || this._isInCollapsedAccordion(el);
  }

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
    if (this.prefillSrc) this._fetchPrefillData();
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
    // Abort any in-flight prefill fetch
    this._prefillAbort?.abort();
    this._prefillAbort = undefined;
  }

  override firstUpdated(): void {
    this._relocateSlots();
    if (this.persist) this._restorePersistedData();
    this._prefillFromUrl();
    this._applyPrefillData();
    if (this.trackDirty) {
      // Capture initial values after restoration/prefill completes
      requestAnimationFrame(() => this._captureInitialValues());
    }
  }

  override updated(changed: Map<string, unknown>): void {
    // Forward to LightDomSlotMixin so captured children (form content,
    // disclosures slot) get re-relocated if Lit's render replaces the
    // destination containers on subsequent renders.
    super.updated(changed);
    if (changed.has('formLabel')) {
      if (this.formLabel) {
        this.setAttribute('aria-label', this.formLabel);
      } else {
        this.removeAttribute('aria-label');
      }
    }
    if (changed.has('prefillData') && Object.keys(this.prefillData).length > 0) {
      this._applyPrefillData();
    }
  }

  override render() {
    return html`
      ${this._prefillLoading
        ? html`<div class="civ-mb-4" role="status"><p>${t('prefillLoading')}</p></div>`
        : nothing}
      ${this._prefillError
        ? html`<div class="civ-mb-4 civ-text-error" role="alert">
            <p>${t('prefillError')}
              <civ-link as="button" @click="${this._fetchPrefillData}">${t('prefillRetry')}</civ-link>
            </p>
          </div>`
        : nothing}
      ${this._errors.length > 0
        ? html`
            <!-- No role="alert" here. The summary is announced by moving
                 focus to this labelled, focusable (tabindex="-1") container
                 after render — the screen reader reads the heading via
                 aria-labelledby. Adding role="alert" on top of the focus
                 move causes a double announcement (assertive auto-read on
                 insertion AND the focus read), which is why GOV.UK Frontend
                 dropped role="alert" from its error summary. Focus is moved
                 on every path that populates _errors (_onSubmit,
                 setServerErrors), so the announcement is reliable. -->
            <div
              id="${this._summaryId}"
              class="civ-form-error-summary"
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
      ${this.requiredLegend
        ? html`
            <p class="civ-form-required-legend civ-text-sm civ-mt-2">
              <span class="civ-required-mark" aria-hidden="true">*</span>
              ${t('formRequiredLegend')}
            </p>
          `
        : nothing}
      <div data-civ-form-disclosures-slot></div>
      <!-- Rendered unconditionally and toggled via the hidden
           attribute rather than conditionally mounted.
           civ-support-resources extends LightDomSlotMixin, and
           round-tripping a mixin element through unmount/mount/
           unmount can crash lit-html's _$clear walk against
           detached ChildPart markers — see
           .claude/rules/common-traps.md "LightDomSlotMixin
           composition with dynamic Lit children" for the full
           rationale. The hidden attribute removes the panel from
           the accessibility tree and hides it visually while
           keeping the element's structural identity stable across
           re-renders. -->
      <civ-support-resources
        heading="${this.supportResourcesHeading || nothing}"
        data-civ-support-resources
        ?hidden=${this.supportResources.length === 0}
      >
        <ul class="civ-list-none civ-p-0 civ-m-0">
          ${this.supportResources
            .filter((r) => r && r.label && this._isSafeHref(r.href))
            .map(
              (r) => html`
                <li class="civ-mb-1">
                  <civ-link href="${r.href}" label="${r.label}"></civ-link>
                  ${r.description
                    ? html`<span class="civ-text-sm civ-ms-2">${r.description}</span>`
                    : nothing}
                </li>
              `,
            )}
        </ul>
      </civ-support-resources>
    `;
  }

  /** Only allow safe URL schemes for support-resource links. */
  private _isSafeHref(href: string): boolean {
    if (!href) return false;
    const trimmed = href.trim().toLowerCase();
    // Reject protocol-relative URLs (//evil.com) — they resolve to external origins
    // despite starting with a forward slash.
    if (trimmed.startsWith('//')) return false;
    return (
      trimmed.startsWith('http:') ||
      trimmed.startsWith('https:') ||
      trimmed.startsWith('tel:') ||
      trimmed.startsWith('mailto:') ||
      trimmed.startsWith('sms:') ||
      trimmed.startsWith('/') ||
      trimmed.startsWith('#')
    );
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
      if (this._isHidden(el)) continue;
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
   * Inject server-side errors into the form and re-render the error
   * summary. Use this from your async submit handler when the server
   * responds with field-level errors:
   *
   * ```ts
   * form.addEventListener('civ-submit', async (e) => {
   *   const res = await fetch('/api/submit', { method: 'POST', body: e.detail.formData });
   *   if (!res.ok) {
   *     const { errors } = await res.json();
   *     form.setServerErrors(errors); // { email: "Already in use", phone: "Invalid" }
   *   }
   * });
   * ```
   *
   * Behavior matches the client-side validation flow: each named field
   * gets `error` set, the error summary re-renders with anchor links,
   * the summary is focused, and a screen-reader announcement fires.
   * Unknown field names are silently skipped.
   *
   * Pass an empty object (or call `clearErrors()`) to clear.
   */
  setServerErrors(errors: Record<string, string>): void {
    if (!errors || Object.keys(errors).length === 0) {
      this.clearErrors();
      return;
    }

    const formElements = this.querySelectorAll<HTMLElement>(
      '[data-civ-form-field]',
    );
    const collected: FormFieldError[] = [];

    // Clear all field errors first so a re-call replaces, not appends.
    for (const el of formElements) {
      (el as unknown as CivFormFieldLike).error = '';
    }

    for (const el of formElements) {
      const formEl = el as unknown as CivFormFieldLike;
      const name = formEl.name;
      if (!name) continue;
      const message = errors[name];
      if (!message) continue;
      formEl.error = message;
      collected.push({ name, message, element: el });
    }

    this._errors = collected;
    dispatch(this, 'civ-server-errors', { errors: collected });

    if (collected.length === 0) return;

    // Focus the error summary, mirroring the validation-fail flow.
    void this._focusErrorSummary();
  }

  /**
   * Move focus to the rendered error summary. Awaits one render cycle so
   * the summary is in the DOM before focusing. The summary is a focusable
   * (tabindex="-1") container labelled by its heading, so moving focus
   * here is what announces the error count to assistive tech — there is
   * deliberately no separate `announce()` call or `role="alert"` (either
   * would double up with the focus read). Errors are logged rather than
   * swallowed silently.
   */
  private async _focusErrorSummary(): Promise<void> {
    try {
      await this.updateComplete;
      const summary = this.querySelector(`[data-civ-error-summary]`) as HTMLElement | null;
      if (!summary) return;
      summary.focus();
    } catch (err) {
      console.error('civ-form: failed to focus error summary', err);
    }
  }

  /**
   * Collect form data as a simple key-value record.
   * For file-upload fields, the value is a comma-joined string of file names.
   * For checkbox-group, the value is a comma-joined string of checked values.
   * Use `toFormData()` when you need actual File objects or multi-value fields.
   *
   * @param opts.excludePii - Skip fields flagged `data-civ-pii` (SSN, EIN,
   *   etc.) and `data-persist-exclude`. Default false for the existing
   *   submit/preview use cases; pass `true` when serializing for storage
   *   adapters that don't encrypt (civ-form-autosave does this).
   */
  getFormData(opts: { excludePii?: boolean } = {}): Record<string, string> {
    const data: Record<string, string> = {};
    const formElements = this.querySelectorAll<HTMLElement>(
      '[data-civ-form-field]',
    );

    for (const el of formElements) {
      const formEl = el as unknown as CivFormFieldLike;
      if (formEl.disabled) continue;
      // Preset wrappers (civ-ssn, civ-ein) host an inner civ-text-input
      // that carries the data-civ-pii flag. Check the descendant tree
      // too so the filter catches the wrapper as well as the inner control.
      if (opts.excludePii && (
        el.hasAttribute('data-civ-pii') ||
        el.hasAttribute('data-persist-exclude') ||
        el.querySelector('[data-civ-pii]') ||
        el.querySelector('[data-persist-exclude]')
      )) continue;
      if (this._isHidden(el)) continue;
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
      if (this._isHidden(el)) continue;

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
    const fields = this._getFields() as NodeListOf<CivFormFieldLike>;
    fields.forEach((f) => {
      if (f.name) this._initialValues.set(f.name, f.value ?? '');
    });
  }

  private _checkDirty(): void {
    if (!this.trackDirty) return;
    const fields = this._getFields() as NodeListOf<CivFormFieldLike>;
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

  /** Field names that were restored from sessionStorage (not URL prefill). */
  private _persistedFieldNames = new Set<string>();

  private _restorePersistedData(): void {
    try {
      const saved = sessionStorage.getItem(`civ-form:${this.persist}`);
      if (!saved) return;
      const data = JSON.parse(saved) as Record<string, string>;
      requestAnimationFrame(() => {
        const fields = this._getFields() as NodeListOf<CivFormFieldLike>;
        fields.forEach((field) => {
          if (field.name && data[field.name] !== undefined) {
            field.value = data[field.name];
            this._persistedFieldNames.add(field.name);
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
        const fields = this._getFields() as NodeListOf<CivFormFieldLike>;
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

  /** Strip HTML tags and dangerous URI schemes from a string. */
  private _sanitize(value: string): string {
    // Remove HTML tags
    let sanitized = value.replace(/<[^>]*>/g, '');
    // Remove dangerous URI schemes (with possible whitespace obfuscation)
    sanitized = sanitized.replace(/j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/gi, '');
    sanitized = sanitized.replace(/d\s*a\s*t\s*a\s*:/gi, '');
    sanitized = sanitized.replace(/v\s*b\s*s\s*c\s*r\s*i\s*p\s*t\s*:/gi, '');
    return sanitized;
  }

  private _prefillFromUrl(): void {
    if (!this.prefill) return;
    if (typeof window === 'undefined' || !window.location) return;
    const params = new URLSearchParams(window.location.search);
    requestAnimationFrame(() => {
      const fields = this._getFields() as NodeListOf<CivFormFieldLike>;
      // Allowlist: only prefill fields that exist in the form, matching by name
      fields.forEach((field) => {
        if (field.name && params.has(field.name)) {
          // Skip PII-flagged fields — URL prefill should never set SSN/EIN
          if (field.hasAttribute('data-civ-pii')) return;
          field.value = this._sanitize(params.get(field.name)!);
        }
      });
    });
  }

  /** Fetch prefill data from a URL and apply it. Aborts after 15s. */
  private _prefillAbort?: AbortController;

  private async _fetchPrefillData(): Promise<void> {
    if (!this.prefillSrc) return;
    // Validate before fetching — rejects javascript:/data:/protocol-relative
    // URLs the same way support-resource links are gated. Without this guard
    // an attacker-controlled prefillSrc could exfiltrate the request headers
    // (auth tokens, session cookies) to an arbitrary origin.
    if (!this._isSafeHref(this.prefillSrc)) {
      this._prefillError = t('prefillUnsafeUrl');
      dispatch(this, 'civ-prefill-error', { error: this._prefillError });
      return;
    }
    this._prefillAbort?.abort();
    this._prefillAbort = new AbortController();
    const timeoutId = setTimeout(() => this._prefillAbort?.abort(), 15000);
    this._prefillLoading = true;
    this._prefillError = '';
    try {
      const headers = Object.keys(this.prefillHeaders).length > 0
        ? this.prefillHeaders
        : undefined;
      const res = await fetch(this.prefillSrc, {
        headers,
        signal: this._prefillAbort.signal,
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      this.prefillData = await res.json();
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        this._prefillError = t('prefillTimeout');
      } else {
        this._prefillError = err instanceof Error ? err.message : t('prefillFailed');
      }
      dispatch(this, 'civ-prefill-error', { error: this._prefillError });
    } finally {
      clearTimeout(timeoutId);
      this._prefillLoading = false;
    }
  }

  /**
   * Apply prefill data to form fields. Sets values and data attributes
   * for prefill source, locked state, and conflict availability.
   * Persisted user edits take priority over prefill data.
   */
  private _applyPrefillData(): void {
    if (!this.prefillData || Object.keys(this.prefillData).length === 0) return;

    requestAnimationFrame(() => {
      const fields = this._getFields() as NodeListOf<CivFormFieldLike>;
      const appliedFields: string[] = [];

      fields.forEach((field) => {
        if (!field.name) return;
        const prefill = this.prefillData[field.name];
        if (!prefill) return;

        // Don't overwrite user edits restored from sessionStorage
        if (this._persistedFieldNames.has(field.name)) return;

        // For 'saved' source (autosave restore), never overwrite a field
        // the user has already typed into. Restore runs after
        // connectedCallback + a microtask, so a fast typer can land
        // input before the snapshot lands. Cold load → field is empty
        // → restore wins. Warm reload after typing → user wins.
        if (prefill.source === 'saved' && field.value) return;

        field.value = prefill.value;
        field.setAttribute('data-civ-prefill-source', prefill.source);

        if (prefill.locked) {
          field.setAttribute('data-civ-prefill-locked', '');
          // Lock with `readonly`, not `disabled`. A locked prefill value is
          // authoritative profile data: the user must still be able to read it
          // at full contrast, and it MUST be included in the submitted payload.
          // `disabled` fields are skipped by getFormData()/toFormData() and
          // render at reduced (disabled) contrast — so locking with `disabled`
          // silently drops the value from submission and dims the text. The
          // documented intent (PrefillField.locked → "read-only, editable only
          // in profile") is exactly `readonly` semantics.
          //
          // Selection-only controls (radio/checkbox/segmented) don't honor
          // `readonly`; those should be locked upstream with `disabled` since
          // HTML defines no readonly behavior for them.
          field.readonly = true;
        }
        appliedFields.push(field.name);
      });

      if (appliedFields.length > 0) {
        dispatch(this, 'civ-prefill-applied', {
          fields: appliedFields,
          meta: this.getPrefillMeta(),
        });
      }
    });
  }

  /**
   * Get metadata about which fields are prefilled or locked.
   * Used by application code to set task list statuses.
   */
  getPrefillMeta(): PrefillMeta {
    const prefilled: string[] = [];
    const locked: string[] = [];
    const needsReview: string[] = [];

    for (const [name, field] of Object.entries(this.prefillData)) {
      prefilled.push(name);
      if (field.locked) {
        locked.push(name);
      } else {
        needsReview.push(name);
      }
    }

    return { prefilled, locked, needsReview };
  }

  private _onButtonClick(e: Event): void {
    const target = e.target as HTMLElement;
    const button = target.closest('button') as HTMLButtonElement | null;
    if (!button || !this.contains(button)) return;

    // Require explicit type="submit". civ-form is a custom element, not a
    // <form>, so HTML's "default button type is submit inside a form" rule
    // doesn't apply — and a typeless <button> usually means "just a button".
    if (button.getAttribute('type') === 'submit') {
      e.preventDefault();
      this._onSubmit();
    }
  }

  private _onKeydown(e: KeyboardEvent): void {
    if (e.key !== 'Enter') return;
    // An inner control already consumed this Enter (combobox option
    // select, date-picker dialog, etc. call preventDefault without
    // stopPropagation, so the keydown still bubbles here). Don't treat
    // it as an implicit form submit. Mirrors civ-form-step._onKeydown.
    if (e.defaultPrevented) return;
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

      // Focus the error summary after render.
      void this._focusErrorSummary();
      return;
    }

    if (this.confirmBeforeSubmit) {
      // Ignore re-submits while a confirm is already in flight — the
      // first proceed() is the authoritative one.
      if (this._confirmPending) return;
      this._confirmPending = true;
      let resolved = false;
      const proceed = (): void => {
        if (resolved) return;
        resolved = true;
        this._confirmPending = false;
        this._finalizeSubmit();
      };
      const cancel = (): void => {
        if (resolved) return;
        resolved = true;
        this._confirmPending = false;
        dispatch(this, 'civ-submit-cancelled');
      };
      dispatch(this, 'civ-submit-confirm', {
        formData: this.toFormData(),
        data: this.getFormData(),
        proceed,
        cancel,
      });
      return;
    }

    this._finalizeSubmit();
  }

  private _finalizeSubmit(): void {
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
      const reduceMotion =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      focusTarget.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'center',
      });
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-form': CivForm;
  }
}
