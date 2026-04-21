/**
 * CivUI Prefill Types
 *
 * Data model for form prefill from user profiles, APIs, or saved state.
 */

/** A single prefill option when multiple values exist (e.g., 3 phone numbers). */
export interface PrefillOption {
  /** The value to fill. */
  value: string;
  /** Human-readable label (e.g., "Mobile", "Home", "Work"). */
  label: string;
}

/** Metadata for a single prefilled field. */
export interface PrefillField {
  /** The value to fill. For compound fields (address, name), a JSON string. */
  value: string;
  /** Where the value came from. */
  source: 'profile' | 'api' | 'saved';
  /** When true, value cannot be edited in the form — user must go to profile settings. */
  locked?: boolean;
  /** When multiple values exist (e.g., 3 phone numbers), list all options. */
  options?: PrefillOption[];
}

/** Prefill data keyed by field name. */
export type PrefillData = Record<string, PrefillField>;

/** Result of getPrefillMeta() on civ-form. */
export interface PrefillMeta {
  /** All field names that received prefill data. */
  prefilled: string[];
  /** Fields that are locked (read-only, editable only in profile). */
  locked: string[];
  /** Fields that have multiple options to choose from. */
  conflicts: string[];
  /** Fields that need user review (editable prefilled + conflicts). */
  needsReview: string[];
}
