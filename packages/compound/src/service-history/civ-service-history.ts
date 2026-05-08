import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivFormElement, dispatch, renderLegend, renderFormHeader, buildDescribedBy, t } from '@civui/core';
import type { HeadingLevel, LabelSize } from '@civui/core';
import { resolvePresetOptions } from '@civui/core';
import '@civui/inputs';

export interface ServicePeriodValue {
  branch: string;
  startDate: string;
  endDate: string;
  dischargeType: string;
  serviceNumber: string;
}

const EMPTY_SERVICE: ServicePeriodValue = {
  branch: '', startDate: '', endDate: '', dischargeType: '', serviceNumber: '',
};

const BRANCH_OPTIONS = resolvePresetOptions('service-branch', 'all');
const DISCHARGE_OPTIONS = resolvePresetOptions('discharge-type');

/**
 * CivUI Service History
 *
 * Compound component for a single military service period. Captures
 * branch, dates, discharge type, and optional service number.
 * Designed to be used inside a `civ-repeater` for multiple service periods.
 *
 * @element civ-service-history
 *
 * @fires civ-input - On every field change, detail: { value: ServicePeriodValue }
 * @fires civ-change - On committed field change, detail: { value: ServicePeriodValue }
 */
@customElement('civ-service-history')
export class CivServiceHistory extends CivFormElement {
  @property({ type: String }) legend = '';

  /**
   * Promote the legend to a heading via `role="heading"` + `aria-level=N`.
   * Use sparingly — typically only when this field is the primary question
   * on a single-question page (level 1) or the top legend inside a
   * form-step (level 2 or 3).
   */
  @property({ type: Number, attribute: 'heading-level' }) headingLevel?: HeadingLevel;

  /**
   * Visual size of the legend. Default and `sm` render at body size;
   * `md`/`lg`/`xl` increase the size for use as a section/page heading.
   * At `[data-civ-scale="fluid"]`, `xl` renders very large.
   */
  @property({ type: String }) size?: LabelSize;
  @property({ type: Boolean, attribute: 'show-service-number' }) showServiceNumber = false;

  @property({ type: String, attribute: 'branch-error' }) branchError = '';
  @property({ type: String, attribute: 'start-date-error' }) startDateError = '';
  @property({ type: String, attribute: 'end-date-error' }) endDateError = '';
  @property({ type: String, attribute: 'discharge-error' }) dischargeError = '';
  @property({ type: String, attribute: 'service-number-error' }) serviceNumberError = '';

  @state() private _service: ServicePeriodValue = { ...EMPTY_SERVICE };

  get serviceValue(): ServicePeriodValue {
    return { ...this._service };
  }

  set serviceValue(val: ServicePeriodValue) {
    this._service = { ...EMPTY_SERVICE, ...val };
    this.value = JSON.stringify(this._service);
  }

  override firstUpdated(): void {
    super.firstUpdated();
    this._service = this.parseStructuredValue(this.value, EMPTY_SERVICE);
    this.updateComplete.then(() => this._syncSelectOptions());
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('_service')) {
      this.updateComplete.then(() => this._syncSelectOptions());
    }
  }

  override render() {
    const describedBy = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);
    const prefix = this.name || 'service';
    const legend = this.legend || t('serviceLegend');

    return html`
      <fieldset
        class="civ-fieldset"
        aria-describedby="${describedBy || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        aria-required="${this.required || nothing}"
        ?disabled="${this.disabled}"
      >
        ${renderFormHeader({ label: renderLegend({ legend, required: this.required, headingLevel: this.headingLevel, size: this.size }), hintId: this._hintId, hint: this.hint, errorId: this._errorId, error: this.error, fieldset: true })}

        <civ-form-field label="${t('serviceBranchLabel')}" error="${this.branchError}">
          <civ-select
            name="${prefix}.branch"
            value="${this._service.branch}"
            error="${this.branchError}"
            ?disabled="${this.disabled}"
            data-service-branch
            @civ-change="${this._onBranchChange}"
          ></civ-select>
        </civ-form-field>

        <civ-memorable-date
          legend="${t('serviceStartDateLegend')}"
          hint="${t('serviceStartDateHint')}"
          name="${prefix}.startDate"
          value="${this._service.startDate}"
          error="${this.startDateError}"
          ?disabled="${this.disabled}"
          @civ-input="${(e: CustomEvent) => this._onFieldInput('startDate', e)}"
          @civ-change="${(e: CustomEvent) => this._onFieldChange('startDate', e)}"
        ></civ-memorable-date>

        <civ-memorable-date
          legend="${t('serviceEndDateLegend')}"
          hint="${t('serviceEndDateHint')}"
          name="${prefix}.endDate"
          value="${this._service.endDate}"
          error="${this.endDateError}"
          ?disabled="${this.disabled}"
          @civ-input="${(e: CustomEvent) => this._onFieldInput('endDate', e)}"
          @civ-change="${(e: CustomEvent) => this._onFieldChange('endDate', e)}"
        ></civ-memorable-date>

        <civ-form-field label="${t('serviceDischargeLabel')}" error="${this.dischargeError}">
          <civ-select
            name="${prefix}.dischargeType"
            value="${this._service.dischargeType}"
            error="${this.dischargeError}"
            ?disabled="${this.disabled}"
            data-service-discharge
            @civ-change="${this._onDischargeChange}"
          ></civ-select>
        </civ-form-field>

        ${this.showServiceNumber ? html`
          <civ-form-field label="${t('serviceNumberLabel')}" hint="${t('serviceNumberHint')}" error="${this.serviceNumberError}">
            <civ-text-input
              name="${prefix}.serviceNumber"
              value="${this._service.serviceNumber}"
              hint="${t('serviceNumberHint')}"
              error="${this.serviceNumberError}"
              ?disabled="${this.disabled}"
              ?readonly="${this.readonly}"
              @civ-input="${(e: CustomEvent) => this._onFieldInput('serviceNumber', e)}"
              @civ-change="${(e: CustomEvent) => this._onFieldChange('serviceNumber', e)}"
            ></civ-text-input>
          </civ-form-field>
        ` : nothing}
      </fieldset>
    `;
  }

  private _syncSelectOptions(): void {
    const branchSelect = this.querySelector('[data-service-branch]') as any;
    if (branchSelect) branchSelect.options = BRANCH_OPTIONS;

    const dischargeSelect = this.querySelector('[data-service-discharge]') as any;
    if (dischargeSelect) dischargeSelect.options = DISCHARGE_OPTIONS;
  }

  private _onBranchChange(e: CustomEvent): void {
    e.stopPropagation();
    this._service = { ...this._service, branch: e.detail.value };
    this.value = JSON.stringify(this._service);
    dispatch(this, 'civ-input', { value: { ...this._service } });
    dispatch(this, 'civ-change', { value: { ...this._service } });
  }

  private _onDischargeChange(e: CustomEvent): void {
    e.stopPropagation();
    this._service = { ...this._service, dischargeType: e.detail.value };
    this.value = JSON.stringify(this._service);
    dispatch(this, 'civ-input', { value: { ...this._service } });
    dispatch(this, 'civ-change', { value: { ...this._service } });
  }

  private _onFieldInput(field: keyof ServicePeriodValue, e: CustomEvent): void {
    e.stopPropagation();
    this._service = { ...this._service, [field]: e.detail.value };
    this.value = JSON.stringify(this._service);
    dispatch(this, 'civ-input', { value: { ...this._service } });
  }

  private _onFieldChange(field: keyof ServicePeriodValue, e: CustomEvent): void {
    e.stopPropagation();
    this._service = { ...this._service, [field]: e.detail.value };
    this.value = JSON.stringify(this._service);
    dispatch(this, 'civ-change', { value: { ...this._service } });
  }

  protected override _syncFormValue(): void {
    this.syncFormDataFromState(this._service, this.name || 'service');
  }

  override formResetCallback(): void {
    this._service = { ...EMPTY_SERVICE };
    this.value = '';
    this.branchError = '';
    this.startDateError = '';
    this.endDateError = '';
    this.dischargeError = '';
    this.serviceNumberError = '';
    this.updateFormValue(null);
    dispatch(this, 'civ-reset');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-service-history': CivServiceHistory;
  }
}
