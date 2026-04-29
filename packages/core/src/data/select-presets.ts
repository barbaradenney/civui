import { t } from '../i18n/locale.js';
import type { CivLocaleStrings } from '../i18n/locale.js';

/** Option shape shared by select, radio, and checkbox presets. */
export interface PresetOption {
  value: string;
  label: string;
}

/** Internal shape: static value + locale key, resolved at call time. */
interface PresetDef {
  value: string;
  labelKey: keyof CivLocaleStrings;
}

/** Map an array of PresetDef to PresetOption using the current locale. */
function resolve(defs: PresetDef[]): PresetOption[] {
  return defs.map(d => ({ value: d.value, label: t(d.labelKey) }));
}

// ── Service Branch ─────────────────────────────────────────────
/** Source: 10 USC § 101 — Armed Forces definitions. NOAA/USPHS per 42 USC § 204, 33 USC § 3001. */

const SERVICE_BRANCH_ACTIVE: PresetDef[] = [
  { value: 'army', labelKey: 'presetServiceBranchArmy' },
  { value: 'navy', labelKey: 'presetServiceBranchNavy' },
  { value: 'air-force', labelKey: 'presetServiceBranchAirForce' },
  { value: 'marine-corps', labelKey: 'presetServiceBranchMarineCorps' },
  { value: 'coast-guard', labelKey: 'presetServiceBranchCoastGuard' },
  { value: 'space-force', labelKey: 'presetServiceBranchSpaceForce' },
];

const SERVICE_BRANCH_RESERVE: PresetDef[] = [
  { value: 'army-reserve', labelKey: 'presetServiceBranchArmyReserve' },
  { value: 'navy-reserve', labelKey: 'presetServiceBranchNavyReserve' },
  { value: 'air-force-reserve', labelKey: 'presetServiceBranchAirForceReserve' },
  { value: 'marine-corps-reserve', labelKey: 'presetServiceBranchMarineCorpsReserve' },
  { value: 'coast-guard-reserve', labelKey: 'presetServiceBranchCoastGuardReserve' },
  { value: 'army-national-guard', labelKey: 'presetServiceBranchArmyNationalGuard' },
  { value: 'air-national-guard', labelKey: 'presetServiceBranchAirNationalGuard' },
];

const SERVICE_BRANCH_HISTORICAL: PresetDef[] = [
  { value: 'army-air-corps', labelKey: 'presetServiceBranchArmyAirCorps' },
  { value: 'army-air-forces', labelKey: 'presetServiceBranchArmyAirForces' },
  { value: 'womens-army-corps', labelKey: 'presetServiceBranchWomensArmyCorps' },
  { value: 'noaa', labelKey: 'presetServiceBranchNoaa' },
  { value: 'usphs', labelKey: 'presetServiceBranchUsphs' },
];

// ── Discharge Type ─────────────────────────────────────────────
/** Source: DoD Directive 1332.14 — Enlisted Administrative Separations. */

const DISCHARGE_TYPES: PresetDef[] = [
  { value: 'honorable', labelKey: 'presetDischargeHonorable' },
  { value: 'general', labelKey: 'presetDischargeGeneral' },
  { value: 'other-than-honorable', labelKey: 'presetDischargeOtherThanHonorable' },
  { value: 'bad-conduct', labelKey: 'presetDischargeBadConduct' },
  { value: 'dishonorable', labelKey: 'presetDischargeDishonorable' },
  { value: 'uncharacterized', labelKey: 'presetDischargeUncharacterized' },
];

// ── Suffix ─────────────────────────────────────────────────────
/** Source: Common generational suffixes used on government forms (SF-171, DS-11). */

const SUFFIXES: PresetDef[] = [
  { value: 'Jr.', labelKey: 'presetSuffixJr' },
  { value: 'Sr.', labelKey: 'presetSuffixSr' },
  { value: 'II', labelKey: 'presetSuffixII' },
  { value: 'III', labelKey: 'presetSuffixIII' },
  { value: 'IV', labelKey: 'presetSuffixIV' },
  { value: 'V', labelKey: 'presetSuffixV' },
];

// ── Relationship Type ──────────────────────────────────────────
/** Source: Composite of OPM SF-171, IRS 1040, USCIS I-130, SSA SSA-2. */

const RELATIONSHIP_GENERAL: PresetDef[] = [
  { value: 'spouse', labelKey: 'presetRelationshipSpouse' },
  { value: 'domestic-partner', labelKey: 'presetRelationshipDomesticPartner' },
  { value: 'child', labelKey: 'presetRelationshipChild' },
  { value: 'stepchild', labelKey: 'presetRelationshipStepchild' },
  { value: 'parent', labelKey: 'presetRelationshipParent' },
  { value: 'sibling', labelKey: 'presetRelationshipSibling' },
  { value: 'grandchild', labelKey: 'presetRelationshipGrandchild' },
  { value: 'grandparent', labelKey: 'presetRelationshipGrandparent' },
  { value: 'legal-guardian', labelKey: 'presetRelationshipLegalGuardian' },
  { value: 'other', labelKey: 'presetRelationshipOther' },
];

const RELATIONSHIP_DETAILED: PresetDef[] = [
  { value: 'spouse', labelKey: 'presetRelationshipSpouse' },
  { value: 'ex-spouse', labelKey: 'presetRelationshipFormerSpouse' },
  { value: 'domestic-partner', labelKey: 'presetRelationshipDomesticPartner' },
  { value: 'biological-child', labelKey: 'presetRelationshipBiologicalChild' },
  { value: 'adopted-child', labelKey: 'presetRelationshipAdoptedChild' },
  { value: 'stepchild', labelKey: 'presetRelationshipStepchild' },
  { value: 'foster-child', labelKey: 'presetRelationshipFosterChild' },
  { value: 'grandchild', labelKey: 'presetRelationshipGrandchild' },
  { value: 'parent', labelKey: 'presetRelationshipParent' },
  { value: 'stepparent', labelKey: 'presetRelationshipStepparent' },
  { value: 'grandparent', labelKey: 'presetRelationshipGrandparent' },
  { value: 'sibling', labelKey: 'presetRelationshipSibling' },
  { value: 'half-sibling', labelKey: 'presetRelationshipHalfSibling' },
  { value: 'legal-guardian', labelKey: 'presetRelationshipLegalGuardian' },
  { value: 'ward', labelKey: 'presetRelationshipWard' },
  { value: 'power-of-attorney', labelKey: 'presetRelationshipPowerOfAttorney' },
  { value: 'executor', labelKey: 'presetRelationshipExecutor' },
  { value: 'trustee', labelKey: 'presetRelationshipTrustee' },
  { value: 'beneficiary', labelKey: 'presetRelationshipBeneficiary' },
  { value: 'caretaker', labelKey: 'presetRelationshipCaretaker' },
  { value: 'dependent', labelKey: 'presetRelationshipDependent' },
  { value: 'funeral-director', labelKey: 'presetRelationshipFuneralDirector' },
  { value: 'self', labelKey: 'presetRelationshipSelf' },
  { value: 'other-relative', labelKey: 'presetRelationshipOtherRelative' },
  { value: 'non-relative', labelKey: 'presetRelationshipNonRelative' },
  { value: 'other', labelKey: 'presetRelationshipOther' },
];

const RELATIONSHIP_DEPENDENT: PresetDef[] = [
  { value: 'spouse', labelKey: 'presetRelationshipSpouse' },
  { value: 'biological-child', labelKey: 'presetRelationshipBiologicalChild' },
  { value: 'adopted-child', labelKey: 'presetRelationshipAdoptedChild' },
  { value: 'stepchild', labelKey: 'presetRelationshipStepchild' },
  { value: 'foster-child', labelKey: 'presetRelationshipFosterChild' },
  { value: 'parent', labelKey: 'presetRelationshipParent' },
  { value: 'ward', labelKey: 'presetRelationshipWard' },
];

const RELATIONSHIP_SURVIVOR: PresetDef[] = [
  { value: 'spouse', labelKey: 'presetRelationshipSurvivingSpouse' },
  { value: 'child', labelKey: 'presetRelationshipSurvivingChild' },
  { value: 'parent', labelKey: 'presetRelationshipSurvivingParent' },
  { value: 'executor', labelKey: 'presetRelationshipExecutor' },
  { value: 'power-of-attorney', labelKey: 'presetRelationshipPowerOfAttorney' },
  { value: 'funeral-director', labelKey: 'presetRelationshipFuneralDirector' },
  { value: 'other', labelKey: 'presetRelationshipOther' },
];

// ── Marital Status ─────────────────────────────────────────────
/** Source: Census Bureau / ACS — marital status categories. */

const MARITAL_STATUSES: PresetDef[] = [
  { value: 'never-married', labelKey: 'presetMaritalNeverMarried' },
  { value: 'married', labelKey: 'presetMaritalMarried' },
  { value: 'separated', labelKey: 'presetMaritalSeparated' },
  { value: 'divorced', labelKey: 'presetMaritalDivorced' },
  { value: 'widowed', labelKey: 'presetMaritalWidowed' },
];

// ── Ethnicity ──────────────────────────────────────────────────
/** Source: OMB Directive 15 — Standards for Race and Ethnicity (1997, revised 2024). */

const ETHNICITIES: PresetDef[] = [
  { value: 'hispanic-latino', labelKey: 'presetEthnicityHispanicLatino' },
  { value: 'not-hispanic-latino', labelKey: 'presetEthnicityNotHispanicLatino' },
  { value: 'prefer-not-to-answer', labelKey: 'presetEthnicityPreferNotToAnswer' },
];

// ── Gender ─────────────────────────────────────────────────────
/** Source: Common federal form pattern. No single OMB standard; categories vary by agency. */

const GENDERS_STANDARD: PresetDef[] = [
  { value: 'male', labelKey: 'presetGenderMale' },
  { value: 'female', labelKey: 'presetGenderFemale' },
  { value: 'non-binary', labelKey: 'presetGenderNonBinary' },
  { value: 'prefer-not-to-answer', labelKey: 'presetGenderPreferNotToAnswer' },
  { value: 'other', labelKey: 'presetGenderOther' },
];

const GENDERS_BINARY: PresetDef[] = [
  { value: 'male', labelKey: 'presetGenderMale' },
  { value: 'female', labelKey: 'presetGenderFemale' },
];

// ── Language ───────────────────────────────────────────────────
/** Source: Census Bureau — languages most frequently spoken at home in the US. */

const LANGUAGES: PresetDef[] = [
  { value: 'en', labelKey: 'presetLanguageEnglish' },
  { value: 'es', labelKey: 'presetLanguageSpanish' },
  { value: 'zh', labelKey: 'presetLanguageChinese' },
  { value: 'tl', labelKey: 'presetLanguageTagalog' },
  { value: 'vi', labelKey: 'presetLanguageVietnamese' },
  { value: 'ar', labelKey: 'presetLanguageArabic' },
  { value: 'fr', labelKey: 'presetLanguageFrench' },
  { value: 'ko', labelKey: 'presetLanguageKorean' },
  { value: 'ru', labelKey: 'presetLanguageRussian' },
  { value: 'pt', labelKey: 'presetLanguagePortuguese' },
  { value: 'ht', labelKey: 'presetLanguageHaitianCreole' },
  { value: 'de', labelKey: 'presetLanguageGerman' },
  { value: 'ja', labelKey: 'presetLanguageJapanese' },
  { value: 'hi', labelKey: 'presetLanguageHindi' },
  { value: 'other', labelKey: 'presetLanguageOther' },
];

// ── Housing Status ─────────────────────────────────────────────
/** Source: HUD PIT Count categories and Census Bureau AHS definitions. */

const HOUSING_STATUSES: PresetDef[] = [
  { value: 'own', labelKey: 'presetHousingOwn' },
  { value: 'rent', labelKey: 'presetHousingRent' },
  { value: 'living-with-family', labelKey: 'presetHousingLivingWithFamily' },
  { value: 'temporary-shelter', labelKey: 'presetHousingTemporaryShelter' },
  { value: 'transitional-housing', labelKey: 'presetHousingTransitionalHousing' },
  { value: 'military-housing', labelKey: 'presetHousingMilitaryHousing' },
  { value: 'homeless', labelKey: 'presetHousingHomeless' },
  { value: 'other', labelKey: 'presetHousingOther' },
];

// ── Education Level ───────────────────────────────────────────
/** Source: Census Bureau / ACS educational attainment categories. Aligned with ISCED. */

const EDUCATION_LEVELS: PresetDef[] = [
  { value: 'less-than-high-school', labelKey: 'presetEducationLessThanHighSchool' },
  { value: 'high-school', labelKey: 'presetEducationHighSchool' },
  { value: 'some-college', labelKey: 'presetEducationSomeCollege' },
  { value: 'associate', labelKey: 'presetEducationAssociate' },
  { value: 'bachelor', labelKey: 'presetEducationBachelor' },
  { value: 'master', labelKey: 'presetEducationMaster' },
  { value: 'doctoral', labelKey: 'presetEducationDoctoral' },
];

// ── Employment Status ─────────────────────────────────────────
/** Source: Bureau of Labor Statistics (BLS) Current Population Survey categories. */

const EMPLOYMENT_STATUSES: PresetDef[] = [
  { value: 'employed-full-time', labelKey: 'presetEmploymentFullTime' },
  { value: 'employed-part-time', labelKey: 'presetEmploymentPartTime' },
  { value: 'self-employed', labelKey: 'presetEmploymentSelfEmployed' },
  { value: 'unemployed', labelKey: 'presetEmploymentUnemployed' },
  { value: 'retired', labelKey: 'presetEmploymentRetired' },
  { value: 'student', labelKey: 'presetEmploymentStudent' },
  { value: 'unable-to-work', labelKey: 'presetEmploymentUnableToWork' },
  { value: 'not-in-labor-force', labelKey: 'presetEmploymentNotInLaborForce' },
];

// ── Income Source ──────────────────────────────────────────────
/** Source: Common across SSA, HUD, and means-tested benefit applications. */

const INCOME_SOURCES: PresetDef[] = [
  { value: 'employment', labelKey: 'presetIncomeEmployment' },
  { value: 'self-employment', labelKey: 'presetIncomeSelfEmployment' },
  { value: 'social-security', labelKey: 'presetIncomeSocialSecurity' },
  { value: 'pension', labelKey: 'presetIncomePension' },
  { value: 'disability', labelKey: 'presetIncomeDisability' },
  { value: 'unemployment', labelKey: 'presetIncomeUnemployment' },
  { value: 'child-support', labelKey: 'presetIncomeChildSupport' },
  { value: 'investment', labelKey: 'presetIncomeInvestment' },
  { value: 'rental-income', labelKey: 'presetIncomeRentalIncome' },
  { value: 'other', labelKey: 'presetIncomeOther' },
];

// ── Veteran Status ─────────────────────────────────────────────
/** Source: OPM veteran preference categories (5 USC § 2108). */

const VETERAN_STATUSES: PresetDef[] = [
  { value: 'non-veteran', labelKey: 'presetVeteranNonVeteran' },
  { value: 'veteran', labelKey: 'presetVeteranVeteran' },
  { value: 'active-duty', labelKey: 'presetVeteranActiveDuty' },
  { value: 'reserve-guard', labelKey: 'presetVeteranReserveGuard' },
  { value: 'retired-military', labelKey: 'presetVeteranRetiredMilitary' },
  { value: 'veteran-spouse', labelKey: 'presetVeteranSpouse' },
  { value: 'veteran-surviving-spouse', labelKey: 'presetVeteranSurvivingSpouse' },
];

// ── Disability Type ───────────────────────────────────────────
/** Source: ADA Amendments Act (2008) broad categories. Section 503 (DOL/OFCCP) self-ID form CC-305. */

const DISABILITY_TYPES: PresetDef[] = [
  { value: 'physical', labelKey: 'presetDisabilityPhysical' },
  { value: 'cognitive', labelKey: 'presetDisabilityCognitive' },
  { value: 'mental-health', labelKey: 'presetDisabilityMentalHealth' },
  { value: 'vision', labelKey: 'presetDisabilityVision' },
  { value: 'hearing', labelKey: 'presetDisabilityHearing' },
  { value: 'speech', labelKey: 'presetDisabilitySpeech' },
  { value: 'chronic-illness', labelKey: 'presetDisabilityChronicIllness' },
  { value: 'developmental', labelKey: 'presetDisabilityDevelopmental' },
  { value: 'multiple', labelKey: 'presetDisabilityMultiple' },
  { value: 'prefer-not-to-answer', labelKey: 'presetDisabilityPreferNotToAnswer' },
];

// ── Citizenship Status ────────────────────────────────────────
/** Source: USCIS I-9 Employment Eligibility Verification categories. */

const CITIZENSHIP_STATUSES: PresetDef[] = [
  { value: 'us-citizen-birth', labelKey: 'presetCitizenshipUsCitizenBirth' },
  { value: 'us-citizen-naturalized', labelKey: 'presetCitizenshipUsCitizenNaturalized' },
  { value: 'us-national', labelKey: 'presetCitizenshipUsNational' },
  { value: 'permanent-resident', labelKey: 'presetCitizenshipPermanentResident' },
  { value: 'authorized-alien', labelKey: 'presetCitizenshipAuthorizedAlien' },
  { value: 'prefer-not-to-answer', labelKey: 'presetCitizenshipPreferNotToAnswer' },
];

// ── Pay Frequency ─────────────────────────────────────────────
/** Source: Common payroll categories per DOL FLSA regulations and IRS Publication 15. */

const PAY_FREQUENCIES: PresetDef[] = [
  { value: 'weekly', labelKey: 'presetPayWeekly' },
  { value: 'bi-weekly', labelKey: 'presetPayBiWeekly' },
  { value: 'semi-monthly', labelKey: 'presetPaySemiMonthly' },
  { value: 'monthly', labelKey: 'presetPayMonthly' },
  { value: 'annually', labelKey: 'presetPayAnnually' },
  { value: 'one-time', labelKey: 'presetPayOneTime' },
];

// ── Contact Preference ───────────────────────────────────────
/** Source: Common across government digital services (USDS, 18F design patterns). */

const CONTACT_PREFERENCES: PresetDef[] = [
  { value: 'email', labelKey: 'presetContactEmail' },
  { value: 'phone', labelKey: 'presetContactPhone' },
  { value: 'text', labelKey: 'presetContactText' },
  { value: 'mail', labelKey: 'presetContactMail' },
  { value: 'no-preference', labelKey: 'presetContactNoPreference' },
];

// ── US States ──────────────────────────────────────────────────
/** Source: USPS state abbreviations (Publication 28). Territories per FIPS 5-2. */
// US states and territories use proper nouns — no locale keys needed.

const US_STATES: PresetOption[] = [
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

const US_TERRITORIES: PresetOption[] = [
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
  | 'veteran-status'
  | 'disability-type'
  | 'citizenship-status'
  | 'pay-frequency'
  | 'contact-preference';

/**
 * Resolve preset options based on preset name and variant.
 *
 * Labels are resolved via `t()` at call time so locale changes
 * are picked up without reloading the module.
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
): PresetOption[] {
  switch (preset) {
    case 'us-state':
      return variant === 'territories' ? [...US_STATES, ...US_TERRITORIES] : [...US_STATES];

    case 'service-branch': {
      const base = [...SERVICE_BRANCH_ACTIVE];
      if (variant === 'reserve' || variant === 'all') base.push(...SERVICE_BRANCH_RESERVE);
      if (variant === 'historical' || variant === 'all') base.push(...SERVICE_BRANCH_HISTORICAL);
      return resolve(base);
    }

    case 'discharge-type':
      return resolve(DISCHARGE_TYPES);

    case 'suffix':
      return resolve(SUFFIXES);

    case 'relationship-type':
      if (variant === 'detailed') return resolve(RELATIONSHIP_DETAILED);
      if (variant === 'dependent') return resolve(RELATIONSHIP_DEPENDENT);
      if (variant === 'survivor') return resolve(RELATIONSHIP_SURVIVOR);
      return resolve(RELATIONSHIP_GENERAL);

    case 'marital-status':
      return resolve(MARITAL_STATUSES);

    case 'ethnicity':
      return resolve(ETHNICITIES);

    case 'gender':
      return variant === 'binary' ? resolve(GENDERS_BINARY) : resolve(GENDERS_STANDARD);

    case 'language':
      return resolve(LANGUAGES);

    case 'housing-status':
      return resolve(HOUSING_STATUSES);

    case 'education-level':
      return resolve(EDUCATION_LEVELS);

    case 'employment-status':
      return resolve(EMPLOYMENT_STATUSES);

    case 'income-source':
      return resolve(INCOME_SOURCES);

    case 'veteran-status':
      return resolve(VETERAN_STATUSES);

    case 'disability-type':
      return resolve(DISABILITY_TYPES);

    case 'citizenship-status':
      return resolve(CITIZENSHIP_STATUSES);

    case 'pay-frequency':
      return resolve(PAY_FREQUENCIES);

    case 'contact-preference':
      return resolve(CONTACT_PREFERENCES);

    default:
      return [];
  }
}
