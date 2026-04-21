import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivFormElement, dispatch, t, interpolate } from '@civui/core';

export type ContactFieldType = 'phone' | 'email' | 'address';

/**
 * CivUI Contact Card
 *
 * An editable contact information card with view/edit toggle.
 * Shows the current value in read-only mode with an "Edit" button.
 * When editing, reveals the appropriate form field and optionally
 * warns the user that changes will update their profile globally.
 *
 * @element civ-contact-card
 *
 * @prop {string} label - Field label
 * @prop {string} name - Form field name
 * @prop {string} value - Current value
 * @prop {ContactFieldType} fieldType - Type of contact field
 * @prop {boolean} profileUpdate - Show profile update warning
 * @prop {string} profileHref - Link to profile settings
 * @prop {string} serviceName - Service name for warning text (default: "VA.gov")
 *
 * @fires civ-contact-update - When user confirms edit, detail: { name, value, updateProfile }
 * @fires civ-input - On every value change
 * @fires civ-change - On committed value change
 *
 * @example
 * ```html
 * <civ-contact-card
 *   label="Mobile phone number"
 *   name="phone"
 *   value="555-123-4567"
 *   field-type="phone"
 *   profile-update
 *   profile-href="/profile"
 * ></civ-contact-card>
 * ```
 */
@customElement('civ-contact-card')
export class CivContactCard extends CivFormElement {
  /** Type of contact field determines which inner form component renders. */
  @property({ type: String, attribute: 'field-type' }) fieldType: ContactFieldType = 'phone';

  /** When true, show warning that changes update the user's profile. */
  @property({ type: Boolean, attribute: 'profile-update' }) profileUpdate = false;

  /** Link to profile settings (shown in warning). */
  @property({ type: String, attribute: 'profile-href' }) profileHref = '';

  /** Service name for the profile update warning. */
  @property({ type: String, attribute: 'service-name' }) serviceName = 'VA.gov';

  @state() private _mode: 'view' | 'edit' = 'view';
  @state() private _editValue = '';

  override firstUpdated(): void {
    this._editValue = this.value;
  }

  override render() {
    return this._mode === 'view' ? this._renderView() : this._renderEdit();
  }

  private _renderView() {
    return html`
      <div class="civ-contact-card civ-border civ-border-base-lighter civ-p-4 civ-mb-4">
        <div class="civ-flex civ-justify-between civ-items-start">
          <dl class="civ-m-0">
            <dt class="civ-label civ-text-muted">${this.label}</dt>
            <dd class="civ-text-base civ-font-medium civ-m-0 civ-mt-0_5">
              ${this.value || html`<span class="civ-text-muted civ-italic">Not provided</span>`}
            </dd>
          </dl>
          <civ-button
            variant="tertiary"
            label="${t('contactCardEdit')}"
            ?disabled="${this.disabled}"
            @click="${this._onEdit}"
          ></civ-button>
        </div>
        ${this.error ? html`
          <p class="civ-text-error civ-text-sm civ-mt-1" role="alert">${this.error}</p>
        ` : nothing}
      </div>
    `;
  }

  private _renderEdit() {
    return html`
      <div class="civ-contact-card civ-contact-card--editing civ-border civ-border-primary civ-border-l-4 civ-p-4 civ-mb-4">
        ${this.profileUpdate ? html`
          <civ-alert variant="info" style-variant="secondary">
            ${interpolate(t('contactCardProfileWarning'), { service: this.serviceName })}
          </civ-alert>
        ` : nothing}

        <div class="civ-mt-3">
          ${this._renderField()}
        </div>

        <div class="civ-flex civ-gap-2 civ-mt-4">
          <civ-button
            label="${t('contactCardUpdate')}"
            @click="${this._onUpdate}"
          ></civ-button>
          <civ-button
            variant="tertiary"
            label="${t('contactCardCancel')}"
            @click="${this._onCancel}"
          ></civ-button>
        </div>
      </div>
    `;
  }

  private _renderField() {
    switch (this.fieldType) {
      case 'phone':
        return html`
          <civ-text-input
            label="${this.label}"
            name="${this.name}"
            value="${this._editValue}"
            mask="phone-us"
            ?required="${this.required}"
            autocomplete="tel"
            @civ-input="${this._onFieldInput}"
          ></civ-text-input>
        `;
      case 'email':
        return html`
          <civ-text-input
            label="${this.label}"
            name="${this.name}"
            value="${this._editValue}"
            validate="email"
            ?required="${this.required}"
            autocomplete="email"
            @civ-input="${this._onFieldInput}"
          ></civ-text-input>
        `;
      case 'address':
        return html`
          <civ-address
            legend="${this.label}"
            name="${this.name}"
            value="${this._editValue}"
            ?required="${this.required}"
            @civ-input="${this._onFieldInput}"
          ></civ-address>
        `;
    }
  }

  private _onEdit(): void {
    this._editValue = this.value;
    this._mode = 'edit';
  }

  private _onCancel(): void {
    this._editValue = this.value;
    this._mode = 'view';
  }

  private _onUpdate(): void {
    this.value = this._editValue;
    this._mode = 'view';
    dispatch(this, 'civ-contact-update', {
      name: this.name,
      value: this.value,
      updateProfile: this.profileUpdate,
    });
    dispatch(this, 'civ-input', { value: this.value });
    dispatch(this, 'civ-change', { value: this.value });
    this.sendAnalytics('change');
  }

  private _onFieldInput(e: CustomEvent<{ value: string }>): void {
    e.stopPropagation();
    this._editValue = e.detail.value;
  }

  protected override _syncFormValue(): void {
    this.updateFormValue(this.value || '');
  }

  override formResetCallback(): void {
    this.value = this._defaultValue;
    this._editValue = this._defaultValue;
    this._mode = 'view';
    this.error = '';
    this.updateFormValue(this._defaultValue || '');
    dispatch(this, 'civ-reset');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-contact-card': CivContactCard;
  }
}
