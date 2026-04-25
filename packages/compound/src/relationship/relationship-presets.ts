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
  labelKey: keyof CivLocaleStrings;
  category: RelationshipCategory;
}

export type RelationshipPreset =
  | 'general'
  | 'va-dependent'
  | 'va-survivor'
  | 'ssa-survivor'
  | 'immigration'
  | 'tax';

export const RELATIONSHIP_PRESETS: Record<RelationshipPreset, RelationshipTypeConfig[]> = {
  'general': [
    { value: 'spouse', labelKey: 'relationshipSpouse', category: 'spousal' },
    { value: 'child', labelKey: 'relationshipChild', category: 'child' },
    { value: 'parent', labelKey: 'relationshipParent', category: 'none' },
    { value: 'sibling', labelKey: 'relationshipSibling', category: 'none' },
    { value: 'other', labelKey: 'relationshipOther', category: 'other' },
  ],

  'va-dependent': [
    { value: 'spouse', labelKey: 'relationshipSpouse', category: 'spousal' },
    { value: 'biological-child', labelKey: 'relationshipBiologicalChild', category: 'child' },
    { value: 'adopted-child', labelKey: 'relationshipAdoptedChild', category: 'child' },
    { value: 'stepchild', labelKey: 'relationshipStepchild', category: 'child' },
    { value: 'parent', labelKey: 'relationshipParent', category: 'none' },
  ],

  'va-survivor': [
    { value: 'spouse', labelKey: 'relationshipSpouse', category: 'spousal' },
    { value: 'child', labelKey: 'relationshipChild', category: 'child' },
    { value: 'parent', labelKey: 'relationshipParent', category: 'none' },
    { value: 'executor', labelKey: 'relationshipExecutor', category: 'none' },
    { value: 'funeral-director', labelKey: 'relationshipFuneralDirector', category: 'none' },
    { value: 'other', labelKey: 'relationshipOther', category: 'other' },
  ],

  'ssa-survivor': [
    { value: 'spouse', labelKey: 'relationshipSpouse', category: 'spousal' },
    { value: 'ex-spouse', labelKey: 'relationshipExSpouse', category: 'spousal' },
    { value: 'child', labelKey: 'relationshipChild', category: 'child' },
    { value: 'grandchild', labelKey: 'relationshipGrandchild', category: 'child' },
    { value: 'parent', labelKey: 'relationshipParent', category: 'none' },
  ],

  'immigration': [
    { value: 'spouse', labelKey: 'relationshipSpouse', category: 'spousal' },
    { value: 'biological-child', labelKey: 'relationshipBiologicalChild', category: 'child' },
    { value: 'adopted-child', labelKey: 'relationshipAdoptedChild', category: 'child' },
    { value: 'stepchild', labelKey: 'relationshipStepchild', category: 'child' },
    { value: 'parent', labelKey: 'relationshipParent', category: 'none' },
    { value: 'sibling', labelKey: 'relationshipSibling', category: 'none' },
  ],

  'tax': [
    { value: 'spouse', labelKey: 'relationshipSpouse', category: 'spousal' },
    { value: 'biological-child', labelKey: 'relationshipBiologicalChild', category: 'child' },
    { value: 'adopted-child', labelKey: 'relationshipAdoptedChild', category: 'child' },
    { value: 'stepchild', labelKey: 'relationshipStepchild', category: 'child' },
    { value: 'foster-child', labelKey: 'relationshipFosterChild', category: 'child' },
    { value: 'sibling', labelKey: 'relationshipSibling', category: 'none' },
    { value: 'parent', labelKey: 'relationshipParent', category: 'none' },
  ],
};
