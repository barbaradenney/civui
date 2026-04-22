/**
 * CivUI Prefill Types
 *
 * Data model for form prefill from user profiles, APIs, or saved state.
 */

/** Metadata for a single prefilled field. */
export interface PrefillField {
  /** The value to fill. For compound fields (address, name), a JSON string. */
  value: string;
  /** Where the value came from. */
  source: 'profile' | 'api' | 'saved';
  /** When true, value cannot be edited in the form — user must go to profile settings. */
  locked?: boolean;
}

/** Prefill data keyed by field name. */
export type PrefillData = Record<string, PrefillField>;

/** Result of getPrefillMeta() on civ-form. */
export interface PrefillMeta {
  /** All field names that received prefill data. */
  prefilled: string[];
  /** Fields that are locked (read-only, editable only in profile). */
  locked: string[];
  /** Fields that need user review (editable prefilled fields). */
  needsReview: string[];
}
