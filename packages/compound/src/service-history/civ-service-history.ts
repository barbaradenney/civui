import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivCompoundElement, LegendHeadingMixin, dispatch, renderLegend, renderFormHeader, buildDescribedBy, t } from '@civui/core';
import { resolvePresetOptions } from '@civui/core';
import type { SelectLike } from '@civui/core';
import '@civui/inputs/text-input';
import '@civui/inputs/select';
import '@civui/inputs/memorable-date';

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
export class CivServiceHistory extends LegendHeadingMixin(CivCompoundElement) {
  protected override _empty: ServicePeriodValue = { ...EMPTY_SERVICE };

  @property({ type: String }) legend = '';
  @property({ type: Boolean, attribute: 'show-service-number' }) showServiceNumber = false;

  @property({ type: String, attribute: 'branch-error' }) branchError = '';
  @property({ type: String, attribute: 'start-date-error' }) startDateError = '';
  @property({ type: String, attribute: 'end-date-error' }) endDateError = '';
  @property({ type: String, attribute: 'discharge-error' }) dischargeError = '';
  @property({ type: String, attribute: 'service-number-error' }) serviceNumberError = '';

  @state() protected override _data: ServicePeriodValue = { ...EMPTY_SERVICE };

  get serviceValue(): ServicePeriodValue {
    return { ...this._data };
  }

  set serviceValue(val: ServicePeriodValue) {
    this._data = { ...EMPTY_SERVICE, ...val };
    this.value = JSON.stringify(this._data);
  }

  override async firstUpdated(): Promise<void> {
    super.firstUpdated();
    try {
      await this.updateComplete;
      this._syncSelectOptions();
    } catch (err) {
      console.error('civ-service-history: failed to sync select options on first render', err);
    }
  }

  override async updated(changed: Map<string, unknown>): Promise<void> {
    super.updated(changed);
    if (changed.has('_data')) {
      try {
        await this.updateComplete;
        this._syncSelectOptions();
      } catch (err) {
        console.error('civ-service-history: failed to re-sync select options after data change', err);
      }
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
        ?disabled="${this.disabled}"
      >
        ${renderFormHeader({ label: renderLegend({ legend, required: this.required, showRequired: false, headingLevel: this.headingLevel, size: this.size }), hintId: this._hintId, hint: this.hint, errorId: this._errorId, error: this.error, fieldset: true })}

        <civ-select
          label="${t('serviceBranchLabel')}"
          name="${prefix}.branch"
          value="${this._data.branch}"
          error="${this.branchError}"
          ?disabled="${this.disabled}"
          data-service-branch
          @civ-change="${this._onBranchChange}"
        ></civ-select>

        <civ-memorable-date
          legend="${t('serviceStartDateLegend')}"
          hint="${t('serviceStartDateHint')}"
          name="${prefix}.startDate"
          value="${this._data.startDate}"
          error="${this.startDateError}"
          ?disabled="${this.disabled}"
          @civ-input="${(e: CustomEvent) => this._onFieldInput('startDate', e)}"
          @civ-change="${(e: CustomEvent) => this._onFieldChange('startDate', e)}"
        ></civ-memorable-date>

        <civ-memorable-date
          legend="${t('serviceEndDateLegend')}"
          hint="${t('serviceEndDateHint')}"
          name="${prefix}.endDate"
          value="${this._data.endDate}"
          error="${this.endDateError}"
          ?disabled="${this.disabled}"
          @civ-input="${(e: CustomEvent) => this._onFieldInput('endDate', e)}"
          @civ-change="${(e: CustomEvent) => this._onFieldChange('endDate', e)}"
        ></civ-memorable-date>

        <civ-select
          label="${t('serviceDischargeLabel')}"
          name="${prefix}.dischargeType"
          value="${this._data.dischargeType}"
          error="${this.dischargeError}"
          ?disabled="${this.disabled}"
          data-service-discharge
          @civ-change="${this._onDischargeChange}"
        ></civ-select>

        ${this.showServiceNumber ? html`
          <civ-text-input
            label="${t('serviceNumberLabel')}"
            name="${prefix}.serviceNumber"
            value="${this._data.serviceNumber}"
            hint="${t('serviceNumberHint')}"
            error="${this.serviceNumberError}"
            ?disabled="${this.disabled}"
            ?readonly="${this.readonly}"
            @civ-input="${(e: CustomEvent) => this._onFieldInput('serviceNumber', e)}"
            @civ-change="${(e: CustomEvent) => this._onFieldChange('serviceNumber', e)}"
          ></civ-text-input>
        ` : nothing}
      </fieldset>
    `;
  }

  private _syncSelectOptions(): void {
    const branchSelect = this.querySelector('[data-service-branch]') as SelectLike | null;
    if (branchSelect) branchSelect.options = BRANCH_OPTIONS;

    const dischargeSelect = this.querySelector('[data-service-discharge]') as SelectLike | null;
    if (dischargeSelect) dischargeSelect.options = DISCHARGE_OPTIONS;
  }

  private _onBranchChange(e: CustomEvent): void {
    e.stopPropagation();
    this._data = { ...this._data, branch: e.detail.value };
    this.value = JSON.stringify(this._data);
    dispatch(this, 'civ-input', { value: { ...this._data } });
    dispatch(this, 'civ-change', { value: { ...this._data } });
  }

  private _onDischargeChange(e: CustomEvent): void {
    e.stopPropagation();
    this._data = { ...this._data, dischargeType: e.detail.value };
    this.value = JSON.stringify(this._data);
    dispatch(this, 'civ-input', { value: { ...this._data } });
    dispatch(this, 'civ-change', { value: { ...this._data } });
  }

  private _onFieldInput(field: keyof ServicePeriodValue, e: CustomEvent): void {
    e.stopPropagation();

    this._data = this._patchStructured(this._data, { [field]: e.detail.value } as Partial<ServicePeriodValue>);
  }

  private _onFieldChange(field: keyof ServicePeriodValue, e: CustomEvent): void {
    e.stopPropagation();

    this._data = this._patchStructured(this._data, { [field]: e.detail.value } as Partial<ServicePeriodValue>, ['change']);
  }

  protected override _syncFormValue(): void {
    this.syncFormDataFromState(this._data, this.name || 'service');
  }

  override formResetCallback(): void {
    this._data = { ...EMPTY_SERVICE };
    this._resetCompound([
      'branchError', 'startDateError', 'endDateError', 'dischargeError',
      'serviceNumberError',
    ]);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-service-history': CivServiceHistory;
  }
}
