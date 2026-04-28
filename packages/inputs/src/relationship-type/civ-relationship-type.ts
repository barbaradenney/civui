import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { t } from '@civui/core';
import { PresetInputWrapper } from '../preset-input/preset-input-wrapper.js';
import '../select/civ-select.js';

export type RelationshipPreset = 'general' | 'va-dependent' | 'va-survivor';

const RELATIONSHIP_TYPES = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'other', label: 'Other' },
];

const VA_DEPENDENT = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'biological-child', label: 'Biological child' },
  { value: 'adopted-child', label: 'Adopted child' },
  { value: 'stepchild', label: 'Stepchild' },
  { value: 'parent', label: 'Parent' },
];

const VA_SURVIVOR = [
  { value: 'spouse', label: 'Surviving spouse' },
  { value: 'child', label: 'Surviving child' },
  { value: 'parent', label: 'Surviving parent' },
  { value: 'executor', label: 'Executor of estate' },
  { value: 'funeral-director', label: 'Funeral director' },
];

/**
 * CivUI Relationship Type
 *
 * Pre-populated select for relationship types with support for
 * context-specific presets: general, VA dependent, and VA survivor.
 *
 * @element civ-relationship-type
 *
 * @prop {'general' | 'va-dependent' | 'va-survivor'} preset - Which option set to display (default: 'general')
 *
 * @fires civ-input - On value change, detail: { value: string }
 * @fires civ-change - On committed change, detail: { value: string }
 *
 * @example
 * ```html
 * <civ-form-field label="Relationship" required>
 *   <civ-relationship-type name="relationship" preset="va-dependent" required></civ-relationship-type>
 * </civ-form-field>
 * ```
 */
@customElement('civ-relationship-type')
export class CivRelationshipType extends PresetInputWrapper {
  /** Which option set to display. */
  @property({ type: String }) preset: RelationshipPreset = 'general';

  override firstUpdated(): void {
    super.firstUpdated();
    this._syncOptions();
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('preset')) {
      this._syncOptions();
    }
  }

  override render() {
    const label = this.label || t('relationshipTypeLabel');

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
        data-relationship-type-select
        @civ-input="${this._onInput}"
        @civ-change="${this._onChange}"
      ></civ-select>
    `;
  }

  private _syncOptions(): void {
    const select = this.querySelector('[data-relationship-type-select]') as any;
    if (!select) return;

    switch (this.preset) {
      case 'va-dependent':
        select.options = [...VA_DEPENDENT];
        break;
      case 'va-survivor':
        select.options = [...VA_SURVIVOR];
        break;
      default:
        select.options = [...RELATIONSHIP_TYPES];
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-relationship-type': CivRelationshipType;
  }
}
