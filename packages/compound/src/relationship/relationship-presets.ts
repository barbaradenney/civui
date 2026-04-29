import type { CivLocaleStrings } from '@civui/core';

/**
 * Category determines which conditional fields appear when a
 * relationship type is selected.
 *
 * - `spousal` — shows marriage date (and divorce date if enabled)
 * - `child` — shows date of birth (and adoption date if enabled)
 * - `other` — shows free-text description input
 * - `none` — no conditional fields
 */
export type RelationshipCategory = 'spousal' | 'child' | 'other' | 'none';

export interface RelationshipTypeConfig {
  value: string;
  /** i18n key for the label — used by presets. */
  labelKey?: keyof CivLocaleStrings;
  /** Plain text label — used for custom one-off options. Takes priority over labelKey. */
  label?: string;
  category: RelationshipCategory;
}

export type RelationshipPreset =
  | 'general'
  | 'detailed'
  | 'dependent'
  | 'survivor'
  | 'benefits-survivor'
  | 'immigration'
  | 'tax';

export const RELATIONSHIP_PRESETS: Record<RelationshipPreset, RelationshipTypeConfig[]> = {
  /** Common relationships — covers most government forms. */
  'general': [
    { value: 'spouse', labelKey: 'relationshipSpouse', category: 'spousal' },
    { value: 'domestic-partner', labelKey: 'relationshipDomesticPartner', category: 'spousal' },
    { value: 'child', labelKey: 'relationshipChild', category: 'child' },
    { value: 'stepchild', labelKey: 'relationshipStepchild', category: 'child' },
    { value: 'parent', labelKey: 'relationshipParent', category: 'none' },
    { value: 'sibling', labelKey: 'relationshipSibling', category: 'none' },
    { value: 'grandchild', labelKey: 'relationshipGrandchild', category: 'child' },
    { value: 'grandparent', labelKey: 'relationshipGrandparent', category: 'none' },
    { value: 'legal-guardian', labelKey: 'relationshipLegalGuardian', category: 'none' },
    { value: 'other', labelKey: 'relationshipOther', category: 'other' },
  ],

  /** Full list — all family, legal, financial, and care relationships. */
  'detailed': [
    // Family — spousal
    { value: 'spouse', labelKey: 'relationshipSpouse', category: 'spousal' },
    { value: 'ex-spouse', labelKey: 'relationshipExSpouse', category: 'spousal' },
    { value: 'domestic-partner', labelKey: 'relationshipDomesticPartner', category: 'spousal' },
    // Family — children
    { value: 'biological-child', labelKey: 'relationshipBiologicalChild', category: 'child' },
    { value: 'adopted-child', labelKey: 'relationshipAdoptedChild', category: 'child' },
    { value: 'stepchild', labelKey: 'relationshipStepchild', category: 'child' },
    { value: 'foster-child', labelKey: 'relationshipFosterChild', category: 'child' },
    { value: 'grandchild', labelKey: 'relationshipGrandchild', category: 'child' },
    // Family — parents/elders
    { value: 'parent', labelKey: 'relationshipParent', category: 'none' },
    { value: 'stepparent', labelKey: 'relationshipStepparent', category: 'none' },
    { value: 'grandparent', labelKey: 'relationshipGrandparent', category: 'none' },
    // Family — siblings
    { value: 'sibling', labelKey: 'relationshipSibling', category: 'none' },
    { value: 'half-sibling', labelKey: 'relationshipHalfSibling', category: 'none' },
    // Legal/financial
    { value: 'legal-guardian', labelKey: 'relationshipLegalGuardian', category: 'none' },
    { value: 'ward', labelKey: 'relationshipWard', category: 'none' },
    { value: 'power-of-attorney', labelKey: 'relationshipPowerOfAttorney', category: 'none' },
    { value: 'executor', labelKey: 'relationshipExecutor', category: 'none' },
    { value: 'trustee', labelKey: 'relationshipTrustee', category: 'none' },
    { value: 'beneficiary', labelKey: 'relationshipBeneficiary', category: 'none' },
    // Care/dependency
    { value: 'caretaker', labelKey: 'relationshipCaretaker', category: 'none' },
    { value: 'dependent', labelKey: 'relationshipDependent', category: 'none' },
    // Other
    { value: 'funeral-director', labelKey: 'relationshipFuneralDirector', category: 'none' },
    { value: 'self', labelKey: 'relationshipSelf', category: 'none' },
    { value: 'other-relative', labelKey: 'relationshipOtherRelative', category: 'other' },
    { value: 'non-relative', labelKey: 'relationshipNonRelative', category: 'other' },
    { value: 'other', labelKey: 'relationshipOther', category: 'other' },
  ],

  /** Dependency claims — specific child types matter. */
  'dependent': [
    { value: 'spouse', labelKey: 'relationshipSpouse', category: 'spousal' },
    { value: 'biological-child', labelKey: 'relationshipBiologicalChild', category: 'child' },
    { value: 'adopted-child', labelKey: 'relationshipAdoptedChild', category: 'child' },
    { value: 'stepchild', labelKey: 'relationshipStepchild', category: 'child' },
    { value: 'foster-child', labelKey: 'relationshipFosterChild', category: 'child' },
    { value: 'parent', labelKey: 'relationshipParent', category: 'none' },
    { value: 'ward', labelKey: 'relationshipWard', category: 'none' },
  ],

  /** Survivor/estate claims. */
  'survivor': [
    { value: 'spouse', labelKey: 'relationshipSpouse', category: 'spousal' },
    { value: 'child', labelKey: 'relationshipChild', category: 'child' },
    { value: 'parent', labelKey: 'relationshipParent', category: 'none' },
    { value: 'executor', labelKey: 'relationshipExecutor', category: 'none' },
    { value: 'power-of-attorney', labelKey: 'relationshipPowerOfAttorney', category: 'none' },
    { value: 'funeral-director', labelKey: 'relationshipFuneralDirector', category: 'none' },
    { value: 'other', labelKey: 'relationshipOther', category: 'other' },
  ],

  /** Benefits survivor — broader family for benefits claims. */
  'benefits-survivor': [
    { value: 'spouse', labelKey: 'relationshipSpouse', category: 'spousal' },
    { value: 'ex-spouse', labelKey: 'relationshipExSpouse', category: 'spousal' },
    { value: 'child', labelKey: 'relationshipChild', category: 'child' },
    { value: 'grandchild', labelKey: 'relationshipGrandchild', category: 'child' },
    { value: 'parent', labelKey: 'relationshipParent', category: 'none' },
    { value: 'beneficiary', labelKey: 'relationshipBeneficiary', category: 'none' },
  ],

  /** Immigration — petitioner/beneficiary family relationships. */
  'immigration': [
    { value: 'spouse', labelKey: 'relationshipSpouse', category: 'spousal' },
    { value: 'biological-child', labelKey: 'relationshipBiologicalChild', category: 'child' },
    { value: 'adopted-child', labelKey: 'relationshipAdoptedChild', category: 'child' },
    { value: 'stepchild', labelKey: 'relationshipStepchild', category: 'child' },
    { value: 'parent', labelKey: 'relationshipParent', category: 'none' },
    { value: 'sibling', labelKey: 'relationshipSibling', category: 'none' },
  ],

  /** Tax filing — dependency and household member relationships. */
  'tax': [
    { value: 'spouse', labelKey: 'relationshipSpouse', category: 'spousal' },
    { value: 'biological-child', labelKey: 'relationshipBiologicalChild', category: 'child' },
    { value: 'adopted-child', labelKey: 'relationshipAdoptedChild', category: 'child' },
    { value: 'stepchild', labelKey: 'relationshipStepchild', category: 'child' },
    { value: 'foster-child', labelKey: 'relationshipFosterChild', category: 'child' },
    { value: 'grandchild', labelKey: 'relationshipGrandchild', category: 'child' },
    { value: 'sibling', labelKey: 'relationshipSibling', category: 'none' },
    { value: 'parent', labelKey: 'relationshipParent', category: 'none' },
    { value: 'other-relative', labelKey: 'relationshipOtherRelative', category: 'other' },
    { value: 'non-relative', labelKey: 'relationshipNonRelative', category: 'other' },
  ],
};
