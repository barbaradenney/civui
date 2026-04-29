import type { SelectOption } from './civ-select.js';

// ── Service Branch ─────────────────────────────────────────────

const SERVICE_BRANCH_ACTIVE: SelectOption[] = [
  { value: 'army', label: 'Army' },
  { value: 'navy', label: 'Navy' },
  { value: 'air-force', label: 'Air Force' },
  { value: 'marine-corps', label: 'Marine Corps' },
  { value: 'coast-guard', label: 'Coast Guard' },
  { value: 'space-force', label: 'Space Force' },
];

const SERVICE_BRANCH_RESERVE: SelectOption[] = [
  { value: 'army-reserve', label: 'Army Reserve' },
  { value: 'navy-reserve', label: 'Navy Reserve' },
  { value: 'air-force-reserve', label: 'Air Force Reserve' },
  { value: 'marine-corps-reserve', label: 'Marine Corps Reserve' },
  { value: 'coast-guard-reserve', label: 'Coast Guard Reserve' },
  { value: 'army-national-guard', label: 'Army National Guard' },
  { value: 'air-national-guard', label: 'Air National Guard' },
];

const SERVICE_BRANCH_HISTORICAL: SelectOption[] = [
  { value: 'army-air-corps', label: 'Army Air Corps' },
  { value: 'army-air-forces', label: 'Army Air Forces' },
  { value: 'womens-army-corps', label: "Women's Army Corps (WAC)" },
  { value: 'noaa', label: 'NOAA Corps' },
  { value: 'usphs', label: 'US Public Health Service' },
];

// ── Discharge Type ─────────────────────────────────────────────

const DISCHARGE_TYPES: SelectOption[] = [
  { value: 'honorable', label: 'Honorable' },
  { value: 'general', label: 'General (under honorable conditions)' },
  { value: 'other-than-honorable', label: 'Other than honorable' },
  { value: 'bad-conduct', label: 'Bad conduct' },
  { value: 'dishonorable', label: 'Dishonorable' },
  { value: 'uncharacterized', label: 'Uncharacterized' },
];

// ── Suffix ─────────────────────────────────────────────────────

const SUFFIXES: SelectOption[] = [
  { value: 'Jr.', label: 'Jr.' },
  { value: 'Sr.', label: 'Sr.' },
  { value: 'II', label: 'II' },
  { value: 'III', label: 'III' },
  { value: 'IV', label: 'IV' },
  { value: 'V', label: 'V' },
];

// ── Relationship Type ──────────────────────────────────────────

const RELATIONSHIP_GENERAL: SelectOption[] = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'domestic-partner', label: 'Domestic partner' },
  { value: 'child', label: 'Child' },
  { value: 'stepchild', label: 'Stepchild' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'grandchild', label: 'Grandchild' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'legal-guardian', label: 'Legal guardian' },
  { value: 'other', label: 'Other' },
];

const RELATIONSHIP_DETAILED: SelectOption[] = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'ex-spouse', label: 'Former spouse' },
  { value: 'domestic-partner', label: 'Domestic partner' },
  { value: 'biological-child', label: 'Biological child' },
  { value: 'adopted-child', label: 'Adopted child' },
  { value: 'stepchild', label: 'Stepchild' },
  { value: 'foster-child', label: 'Foster child' },
  { value: 'grandchild', label: 'Grandchild' },
  { value: 'parent', label: 'Parent' },
  { value: 'stepparent', label: 'Stepparent' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'half-sibling', label: 'Half-sibling' },
  { value: 'legal-guardian', label: 'Legal guardian' },
  { value: 'ward', label: 'Ward' },
  { value: 'power-of-attorney', label: 'Power of attorney' },
  { value: 'executor', label: 'Executor or personal representative' },
  { value: 'trustee', label: 'Trustee' },
  { value: 'beneficiary', label: 'Beneficiary' },
  { value: 'caretaker', label: 'Caretaker or custodian' },
  { value: 'dependent', label: 'Dependent' },
  { value: 'funeral-director', label: 'Funeral director' },
  { value: 'self', label: 'Self' },
  { value: 'other-relative', label: 'Other relative' },
  { value: 'non-relative', label: 'Non-relative' },
  { value: 'other', label: 'Other' },
];

const RELATIONSHIP_DEPENDENT: SelectOption[] = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'biological-child', label: 'Biological child' },
  { value: 'adopted-child', label: 'Adopted child' },
  { value: 'stepchild', label: 'Stepchild' },
  { value: 'foster-child', label: 'Foster child' },
  { value: 'parent', label: 'Parent' },
  { value: 'ward', label: 'Ward' },
];

const RELATIONSHIP_SURVIVOR: SelectOption[] = [
  { value: 'spouse', label: 'Surviving spouse' },
  { value: 'child', label: 'Surviving child' },
  { value: 'parent', label: 'Surviving parent' },
  { value: 'executor', label: 'Executor or personal representative' },
  { value: 'power-of-attorney', label: 'Power of attorney' },
  { value: 'funeral-director', label: 'Funeral director' },
  { value: 'other', label: 'Other' },
];

// ── Marital Status ─────────────────────────────────────────────

const MARITAL_STATUSES: SelectOption[] = [
  { value: 'never-married', label: 'Never married' },
  { value: 'married', label: 'Married' },
  { value: 'separated', label: 'Separated' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
];

// ── Ethnicity ──────────────────────────────────────────────────

const ETHNICITIES: SelectOption[] = [
  { value: 'hispanic-latino', label: 'Hispanic or Latino' },
  { value: 'not-hispanic-latino', label: 'Not Hispanic or Latino' },
  { value: 'prefer-not-to-answer', label: 'Prefer not to answer' },
];

// ── Gender ─────────────────────────────────────────────────────

const GENDERS_STANDARD: SelectOption[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not-to-answer', label: 'Prefer not to answer' },
  { value: 'other', label: 'Other' },
];

const GENDERS_BINARY: SelectOption[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

// ── Language ───────────────────────────────────────────────────

const LANGUAGES: SelectOption[] = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'zh', label: 'Chinese' },
  { value: 'tl', label: 'Tagalog' },
  { value: 'vi', label: 'Vietnamese' },
  { value: 'ar', label: 'Arabic' },
  { value: 'fr', label: 'French' },
  { value: 'ko', label: 'Korean' },
  { value: 'ru', label: 'Russian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ht', label: 'Haitian Creole' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
  { value: 'hi', label: 'Hindi' },
  { value: 'other', label: 'Other' },
];

// ── Housing Status ─────────────────────────────────────────────

const HOUSING_STATUSES: SelectOption[] = [
  { value: 'own', label: 'Own' },
  { value: 'rent', label: 'Rent' },
  { value: 'living-with-family', label: 'Living with family or friends' },
  { value: 'temporary-shelter', label: 'Temporary shelter' },
  { value: 'transitional-housing', label: 'Transitional housing' },
  { value: 'military-housing', label: 'Military housing' },
  { value: 'homeless', label: 'Homeless or unsheltered' },
  { value: 'other', label: 'Other' },
];

// ── Education Level ───────────────────────────────────────────

const EDUCATION_LEVELS: SelectOption[] = [
  { value: 'less-than-high-school', label: 'Less than high school' },
  { value: 'high-school', label: 'High school diploma or GED' },
  { value: 'some-college', label: 'Some college (no degree)' },
  { value: 'associate', label: 'Associate\'s degree' },
  { value: 'bachelor', label: 'Bachelor\'s degree' },
  { value: 'master', label: 'Master\'s degree' },
  { value: 'doctoral', label: 'Doctoral or professional degree' },
];

// ── Employment Status ─────────────────────────────────────────

const EMPLOYMENT_STATUSES: SelectOption[] = [
  { value: 'employed-full-time', label: 'Employed full-time' },
  { value: 'employed-part-time', label: 'Employed part-time' },
  { value: 'self-employed', label: 'Self-employed' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'retired', label: 'Retired' },
  { value: 'student', label: 'Student' },
  { value: 'unable-to-work', label: 'Unable to work' },
  { value: 'not-in-labor-force', label: 'Not in labor force' },
];

// ── Income Source ──────────────────────────────────────────────

const INCOME_SOURCES: SelectOption[] = [
  { value: 'employment', label: 'Employment or wages' },
  { value: 'self-employment', label: 'Self-employment' },
  { value: 'social-security', label: 'Social Security' },
  { value: 'pension', label: 'Pension or retirement' },
  { value: 'disability', label: 'Disability benefits' },
  { value: 'unemployment', label: 'Unemployment benefits' },
  { value: 'child-support', label: 'Child support or alimony' },
  { value: 'investment', label: 'Investment income' },
  { value: 'rental-income', label: 'Rental income' },
  { value: 'other', label: 'Other' },
];

// ── Veteran Status ─────────────────────────────────────────────
// Based on OPM veteran preference categories (5 USC § 2108) and
// standard federal form questions (SF-171, OF-612).

const VETERAN_STATUSES: SelectOption[] = [
  { value: 'non-veteran', label: 'Not a veteran' },
  { value: 'veteran', label: 'Veteran' },
  { value: 'active-duty', label: 'Active duty service member' },
  { value: 'reserve-guard', label: 'Reserve or National Guard' },
  { value: 'retired-military', label: 'Retired military' },
  { value: 'veteran-spouse', label: 'Spouse of veteran' },
  { value: 'veteran-surviving-spouse', label: 'Surviving spouse of veteran' },
];

// ── US States ──────────────────────────────────────────────────
// (imported from the existing us-state component data)

const US_STATES: SelectOption[] = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' },
  { value: 'DC', label: 'District of Columbia' }, { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' }, { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' }, { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' }, { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' }, { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' }, { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' }, { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' }, { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' }, { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' }, { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' }, { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' }, { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' }, { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' }, { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' }, { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' }, { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' }, { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' }, { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' }, { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' }, { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' }, { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

const US_TERRITORIES: SelectOption[] = [
  { value: 'AS', label: 'American Samoa' },
  { value: 'GU', label: 'Guam' },
  { value: 'MP', label: 'Northern Mariana Islands' },
  { value: 'PR', label: 'Puerto Rico' },
  { value: 'VI', label: 'US Virgin Islands' },
];

// ── Preset Registry ────────────────────────────────────────────

export type SelectPresetName =
  | 'us-state'
  | 'service-branch'
  | 'discharge-type'
  | 'suffix'
  | 'relationship-type'
  | 'marital-status'
  | 'ethnicity'
  | 'gender'
  | 'language'
  | 'housing-status'
  | 'education-level'
  | 'employment-status'
  | 'income-source'
  | 'veteran-status';

/**
 * Resolve preset options based on preset name and variant.
 *
 * @param preset - The preset name
 * @param variant - Optional variant string for presets with multiple tiers.
 *   - service-branch: "reserve", "historical", "all"
 *   - relationship-type: "detailed", "dependent", "survivor"
 *   - gender: "binary"
 *   - us-state: "territories"
 */
export function resolvePresetOptions(
  preset: SelectPresetName,
  variant?: string,
): SelectOption[] {
  switch (preset) {
    case 'us-state':
      return variant === 'territories' ? [...US_STATES, ...US_TERRITORIES] : [...US_STATES];

    case 'service-branch': {
      const base = [...SERVICE_BRANCH_ACTIVE];
      if (variant === 'reserve' || variant === 'all') base.push(...SERVICE_BRANCH_RESERVE);
      if (variant === 'historical' || variant === 'all') base.push(...SERVICE_BRANCH_HISTORICAL);
      return base;
    }

    case 'discharge-type':
      return [...DISCHARGE_TYPES];

    case 'suffix':
      return [...SUFFIXES];

    case 'relationship-type':
      if (variant === 'detailed') return [...RELATIONSHIP_DETAILED];
      if (variant === 'dependent') return [...RELATIONSHIP_DEPENDENT];
      if (variant === 'survivor') return [...RELATIONSHIP_SURVIVOR];
      return [...RELATIONSHIP_GENERAL];

    case 'marital-status':
      return [...MARITAL_STATUSES];

    case 'ethnicity':
      return [...ETHNICITIES];

    case 'gender':
      return variant === 'binary' ? [...GENDERS_BINARY] : [...GENDERS_STANDARD];

    case 'language':
      return [...LANGUAGES];

    case 'housing-status':
      return [...HOUSING_STATUSES];

    case 'education-level':
      return [...EDUCATION_LEVELS];

    case 'employment-status':
      return [...EMPLOYMENT_STATUSES];

    case 'income-source':
      return [...INCOME_SOURCES];

    case 'veteran-status':
      return [...VETERAN_STATUSES];

    default:
      return [];
  }
}
