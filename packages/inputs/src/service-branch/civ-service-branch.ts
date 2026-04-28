import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { t } from '@civui/core';
import { PresetInputWrapper } from '../preset-input/preset-input-wrapper.js';
import '../select/civ-select.js';

const ACTIVE_BRANCHES = [
  { value: 'army', label: 'Army' },
  { value: 'navy', label: 'Navy' },
  { value: 'air-force', label: 'Air Force' },
  { value: 'marine-corps', label: 'Marine Corps' },
  { value: 'coast-guard', label: 'Coast Guard' },
  { value: 'space-force', label: 'Space Force' },
];

const RESERVE_GUARD = [
  { value: 'army-reserve', label: 'Army Reserve' },
  { value: 'navy-reserve', label: 'Navy Reserve' },
  { value: 'air-force-reserve', label: 'Air Force Reserve' },
  { value: 'marine-corps-reserve', label: 'Marine Corps Reserve' },
  { value: 'coast-guard-reserve', label: 'Coast Guard Reserve' },
  { value: 'army-national-guard', label: 'Army National Guard' },
  { value: 'air-national-guard', label: 'Air National Guard' },
];

const HISTORICAL = [
  { value: 'army-air-corps', label: 'Army Air Corps' },
  { value: 'army-air-forces', label: 'Army Air Forces' },
  { value: 'womens-army-corps', label: "Women's Army Corps (WAC)" },
  { value: 'noaa', label: 'NOAA Corps' },
  { value: 'usphs', label: 'US Public Health Service' },
];

/**
 * CivUI Service Branch
 *
 * Pre-populated select for US military branches of service.
 * Includes 6 active branches by default, with optional tiers
 * for reserve/guard components and historical branches.
 *
 * @element civ-service-branch
 *
 * @prop {boolean} show-reserve - Include reserve and National Guard components
 * @prop {boolean} show-historical - Include historical branches (Army Air Corps, WAC, NOAA, USPHS)
 *
 * @fires civ-input - On value change, detail: { value: string }
 * @fires civ-change - On committed change, detail: { value: string }
 *
 * @example
 * ```html
 * <civ-form-field label="Branch of service" required>
 *   <civ-service-branch name="branch" show-reserve required></civ-service-branch>
 * </civ-form-field>
 * ```
 */
@customElement('civ-service-branch')
export class CivServiceBranch extends PresetInputWrapper {
  /** Include reserve and National Guard components. */
  @property({ type: Boolean, attribute: 'show-reserve' }) showReserve = false;

  /** Include historical branches (Army Air Corps, WAC, NOAA, USPHS). */
  @property({ type: Boolean, attribute: 'show-historical' }) showHistorical = false;

  override firstUpdated(): void {
    super.firstUpdated();
    this._syncOptions();
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('showReserve') || changed.has('showHistorical')) {
      this._syncOptions();
    }
  }

  override render() {
    const label = this.label || t('serviceBranchLabel');

    return html`
      <civ-select
        label="${label}"
        name="${this.name}"
        value="${this.value}"
        error="${this.error}"
        hint="${this.hint}"
        ?required="${this.required}"
        required-message="${this.requiredMessage || ''}"
        ?disabled="${this.disabled}"
        data-service-branch-select
        @civ-input="${this._onInput}"
        @civ-change="${this._onChange}"
      ></civ-select>
    `;
  }

  private _syncOptions(): void {
    const select = this.querySelector('[data-service-branch-select]') as any;
    if (!select) return;
    select.options = [
      ...ACTIVE_BRANCHES,
      ...(this.showReserve ? RESERVE_GUARD : []),
      ...(this.showHistorical ? HISTORICAL : []),
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-service-branch': CivServiceBranch;
  }
}
