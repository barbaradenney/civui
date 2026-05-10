/**
 * CivUI validation utilities — pure functions for common government form
 * field validation. Every validator returns `{ valid, error? }`.
 * Error messages are sourced from the i18n system via `t()`.
 *
 * Empty strings always return `{ valid: false }` — use `validate.required()`
 * separately if you need to distinguish "empty" from "invalid format."
 */
import { t } from '../i18n/locale.js';
import { interpolate } from '../utils/interpolate.js';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

function valid(): ValidationResult {
  return { valid: true };
}

const US_STATES = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC','AS','GU','MP','PR','VI',
]);

const VALID_EIN_PREFIXES = new Set([
  '01','02','03','04','05','06',
  '10','11','12','13','14','15','16',
  '20','21','22','23','24','25','26','27',
  '30','31','32','33','34','35','36','37','38','39',
  '40','41','42','43','44','45','46','47','48',
  '50','51','52','53','54','55','56','57','58','59',
  '60','61','62','63','64','65','66','67','68',
  '71','72','73','74','75','76','77',
  '80','81','82','83','84','85','86','87','88',
  '90','91','92','93','94','95','96','97','98','99',
]);

function fail(key: Parameters<typeof t>[0]): ValidationResult {
  return { valid: false, error: t(key) };
}

export const validate = {
  /** Non-empty after trim. */
  required(value: string, fieldLabel?: string): ValidationResult {
    if (value.trim().length === 0) {
      return { valid: false, error: interpolate(t('validateRequired'), { label: fieldLabel ?? t('fieldFallbackLabel') }) };
    }
    return valid();
  },

  /** RFC 5322 simplified email. Rejects missing domain labels (e.g., `user@.com`). */
  email(value: string): ValidationResult {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      return fail('validateEmail');
    }
    return valid();
  },

  /**
   * US phone: 10 digits, area code not 0xx or 1xx.
   * Accepts raw (`5551234567`) or conventionally separated input (spaces,
   * dashes, dots, parens). Rejects letters or any other characters — passing
   * `'call 555-123-4567'` returns invalid even though the digits parse out.
   */
  phone(value: string): ValidationResult {
    if (!/^[\d\s\-().]+$/.test(value)) return fail('validatePhone');
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 10 || /^[01]/.test(digits)) {
      return fail('validatePhone');
    }
    return valid();
  },

  /**
   * International phone: E.164, 7–15 digits with `+` prefix. Accepts
   * spaces, dashes, dots, and parens as separators (`.` covered for the
   * common European dot-separated format `+33.1.42.34.56.78`).
   */
  phoneIntl(value: string): ValidationResult {
    if (!/^[\d\s\-+().]+$/.test(value)) return fail('validatePhoneIntl');
    const stripped = value.replace(/[\s\-().]/g, '');
    if (!/^\+\d{7,15}$/.test(stripped)) {
      return fail('validatePhoneIntl');
    }
    return valid();
  },

  /**
   * SSN: 9 digits, area not 000/666/9xx. Accepts raw (`123456789`) or
   * dash-separated (`123-45-6789`). Rejects letters, leading/trailing
   * whitespace, or any other characters.
   */
  ssn(value: string): ValidationResult {
    if (!/^\d{3}-?\d{2}-?\d{4}$/.test(value)) return fail('validateSsn');
    const digits = value.replace(/-/g, '');
    const area = digits.substring(0, 3);
    if (area === '000' || area === '666' || area[0] === '9') {
      return fail('validateSsn');
    }
    return valid();
  },

  /**
   * US bank routing number (ABA): 9 digits with a mod-10 checksum.
   * Reference: https://en.wikipedia.org/wiki/ABA_routing_transit_number#Check_digit
   * Sum = 3·d1 + 7·d2 + 1·d3 + 3·d4 + 7·d5 + 1·d6 + 3·d7 + 7·d8 + 1·d9
   * Valid when Sum % 10 === 0 and not all digits are zero. Accepts raw
   * digits or dash-separated triples (`121-000-248`); rejects other
   * characters.
   */
  routing(value: string): ValidationResult {
    if (!/^\d{3}-?\d{3}-?\d{3}$/.test(value)) return fail('validateRouting');
    const digits = value.replace(/-/g, '');
    if (/^0{9}$/.test(digits)) return fail('validateRouting');
    const weights = [3, 7, 1, 3, 7, 1, 3, 7, 1];
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += Number(digits[i]) * weights[i];
    }
    return sum % 10 === 0 ? valid() : fail('validateRouting');
  },

  /**
   * EIN: 9 digits, valid IRS campus prefix. Accepts raw (`123456789`) or
   * IRS-canonical (`12-3456789`); rejects other characters.
   */
  ein(value: string): ValidationResult {
    if (!/^\d{2}-?\d{7}$/.test(value)) return fail('validateEin');
    const digits = value.replace(/-/g, '');
    const prefix = digits.substring(0, 2);
    if (!VALID_EIN_PREFIXES.has(prefix)) {
      return fail('validateEin');
    }
    return valid();
  },

  /** ZIP: exactly 5 digits. */
  zip(value: string): ValidationResult {
    if (!/^\d{5}$/.test(value)) return fail('validateZip');
    return valid();
  },

  /** ZIP+4: 5 digits, optional dash, 4 digits. */
  zip4(value: string): ValidationResult {
    if (!/^\d{5}-?\d{4}$/.test(value)) return fail('validateZip4');
    return valid();
  },

  /** US state: valid 2-letter abbreviation. */
  usState(value: string): ValidationResult {
    if (!US_STATES.has(value.toUpperCase().trim())) {
      return fail('validateUsState');
    }
    return valid();
  },

  /** ISO date: YYYY-MM-DD with valid calendar date. */
  isoDate(value: string): ValidationResult {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return fail('validateIsoDate');
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    if (month < 1 || month > 12) return fail('validateIsoDate');
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return fail('validateIsoDate');
    }
    return valid();
  },

  /** URL: must have http/https protocol and valid domain. */
  url(value: string): ValidationResult {
    try {
      const parsed = new URL(value);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return fail('validateUrl');
      }
    } catch {
      return fail('validateUrl');
    }
    return valid();
  },

  /** Currency: positive number, max 2 decimal places, no leading zeros. */
  currency(value: string): ValidationResult {
    if (!/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(value)) {
      return fail('validateCurrency');
    }
    return valid();
  },

  /**
   * Numeric range: value between min and max. NaN, Infinity, and non-finite
   * inputs are rejected — JS comparison operators silently return `false`
   * for NaN, which would otherwise let it slip through as "valid."
   */
  range(value: number, opts: { min?: number; max?: number }): ValidationResult {
    if (!Number.isFinite(value)) {
      const { min, max } = opts;
      if (min != null && max != null) {
        return { valid: false, error: interpolate(t('validateRangeBetween'), { min, max }) };
      }
      if (min != null) return { valid: false, error: interpolate(t('validateRangeMin'), { min }) };
      if (max != null) return { valid: false, error: interpolate(t('validateRangeMax'), { max }) };
      return { valid: false };
    }
    const { min, max } = opts;
    if (min != null && max != null) {
      if (value < min || value > max) {
        return { valid: false, error: interpolate(t('validateRangeBetween'), { min, max }) };
      }
    } else if (min != null && value < min) {
      return { valid: false, error: interpolate(t('validateRangeMin'), { min }) };
    } else if (max != null && value > max) {
      return { valid: false, error: interpolate(t('validateRangeMax'), { max }) };
    }
    return valid();
  },

  /**
   * String length: between min and max characters. Counts UTF-16 code
   * units (`value.length`), not Unicode code points — emoji and surrogate
   * pairs count as 2. Adequate for English-language form fields; if you
   * need user-perceived character count, use `[...value].length`.
   */
  length(value: string, opts: { min?: number; max?: number }): ValidationResult {
    const len = value.length;
    const { min, max } = opts;
    if (min != null && max != null) {
      if (len < min || len > max) {
        return { valid: false, error: interpolate(t('validateLengthBetween'), { min, max }) };
      }
    } else if (min != null && len < min) {
      return { valid: false, error: interpolate(t('validateLengthMin'), { min }) };
    } else if (max != null && len > max) {
      return { valid: false, error: interpolate(t('validateLengthMax'), { max }) };
    }
    return valid();
  },

  /** Alphanumeric: only letters and digits, configurable length. */
  alphanumeric(value: string, opts?: { min?: number; max?: number }): ValidationResult {
    if (!/^[a-zA-Z0-9]+$/.test(value)) {
      return fail('validateAlphanumeric');
    }
    if (opts) {
      const lenResult = validate.length(value, opts);
      if (!lenResult.valid) return lenResult;
    }
    return valid();
  },
};
