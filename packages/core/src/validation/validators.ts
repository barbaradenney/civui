/**
 * CivUI validation utilities — pure functions for common government form
 * field validation. Every validator returns `{ valid, error? }`.
 * Error messages are sourced from the i18n system via `t()`.
 */
import { t } from '../i18n/locale.js';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const VALID: ValidationResult = { valid: true };

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
      const msg = t('validateRequired').replace('{label}', fieldLabel ?? t('fieldFallbackLabel'));
      return { valid: false, error: msg };
    }
    return VALID;
  },

  /** RFC 5322 simplified email. */
  email(value: string): ValidationResult {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return fail('validateEmail');
    }
    return VALID;
  },

  /** US phone: 10 digits, area code not 0xx or 1xx. */
  phone(value: string): ValidationResult {
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 10 || /^[01]/.test(digits)) {
      return fail('validatePhone');
    }
    return VALID;
  },

  /** International phone: E.164, 7–15 digits with + prefix. */
  phoneIntl(value: string): ValidationResult {
    const stripped = value.replace(/[\s\-()]/g, '');
    if (!/^\+\d{7,15}$/.test(stripped)) {
      return fail('validatePhoneIntl');
    }
    return VALID;
  },

  /** SSN: 9 digits, area not 000/666/9xx. */
  ssn(value: string): ValidationResult {
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 9) return fail('validateSsn');
    const area = digits.substring(0, 3);
    if (area === '000' || area === '666' || area[0] === '9') {
      return fail('validateSsn');
    }
    return VALID;
  },

  /** EIN: 9 digits, valid IRS campus prefix. */
  ein(value: string): ValidationResult {
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 9) return fail('validateEin');
    const prefix = digits.substring(0, 2);
    if (!VALID_EIN_PREFIXES.has(prefix)) {
      return fail('validateEin');
    }
    return VALID;
  },

  /** ZIP: exactly 5 digits. */
  zip(value: string): ValidationResult {
    if (!/^\d{5}$/.test(value)) return fail('validateZip');
    return VALID;
  },

  /** ZIP+4: 5 digits, optional dash, 4 digits. */
  zip4(value: string): ValidationResult {
    if (!/^\d{5}-?\d{4}$/.test(value)) return fail('validateZip4');
    return VALID;
  },

  /** US state: valid 2-letter abbreviation. */
  usState(value: string): ValidationResult {
    if (!US_STATES.has(value.toUpperCase().trim())) {
      return fail('validateUsState');
    }
    return VALID;
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
    return VALID;
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
    return VALID;
  },

  /** Currency: positive number, max 2 decimal places. */
  currency(value: string): ValidationResult {
    if (!/^\d+(\.\d{1,2})?$/.test(value) || parseFloat(value) < 0) {
      return fail('validateCurrency');
    }
    return VALID;
  },

  /** Numeric range: value between min and max. */
  range(value: number, opts: { min?: number; max?: number }): ValidationResult {
    const { min, max } = opts;
    if (min != null && max != null) {
      if (value < min || value > max) {
        const msg = t('validateRangeBetween')
          .replace('{min}', String(min))
          .replace('{max}', String(max));
        return { valid: false, error: msg };
      }
    } else if (min != null && value < min) {
      const msg = t('validateRangeMin').replace('{min}', String(min));
      return { valid: false, error: msg };
    } else if (max != null && value > max) {
      const msg = t('validateRangeMax').replace('{max}', String(max));
      return { valid: false, error: msg };
    }
    return VALID;
  },

  /** String length: between min and max characters. */
  length(value: string, opts: { min?: number; max?: number }): ValidationResult {
    const len = value.length;
    const { min, max } = opts;
    if (min != null && max != null) {
      if (len < min || len > max) {
        const msg = t('validateLengthBetween')
          .replace('{min}', String(min))
          .replace('{max}', String(max));
        return { valid: false, error: msg };
      }
    } else if (min != null && len < min) {
      const msg = t('validateLengthMin').replace('{min}', String(min));
      return { valid: false, error: msg };
    } else if (max != null && len > max) {
      const msg = t('validateLengthMax').replace('{max}', String(max));
      return { valid: false, error: msg };
    }
    return VALID;
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
    return VALID;
  },
};
