import { describe, it, expect } from 'vitest';
import { validate } from './validators.js';

describe('validate.required', () => {
  it('passes for non-empty string', () => {
    expect(validate.required('hello')).toEqual({ valid: true });
  });

  it('fails for empty string', () => {
    const result = validate.required('');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('is required');
  });

  it('fails for whitespace-only string', () => {
    expect(validate.required('   ').valid).toBe(false);
  });

  it('includes field label in error', () => {
    const result = validate.required('', 'Email');
    expect(result.error).toBe('Email is required');
  });

  it('uses fallback label when none provided', () => {
    const result = validate.required('');
    expect(result.error).toBe('This field is required');
  });
});

describe('validate.email', () => {
  it('accepts valid email', () => {
    expect(validate.email('user@example.com')).toEqual({ valid: true });
  });

  it('accepts email with subdomain', () => {
    expect(validate.email('user@mail.example.com')).toEqual({ valid: true });
  });

  it('rejects missing @', () => {
    expect(validate.email('userexample.com').valid).toBe(false);
  });

  it('rejects missing domain', () => {
    expect(validate.email('user@').valid).toBe(false);
  });

  it('rejects missing TLD', () => {
    expect(validate.email('user@example').valid).toBe(false);
  });

  it('rejects spaces', () => {
    expect(validate.email('user @example.com').valid).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validate.email('').valid).toBe(false);
  });
});

describe('validate.phone', () => {
  it('accepts 10-digit number', () => {
    expect(validate.phone('2025551234')).toEqual({ valid: true });
  });

  it('accepts formatted number', () => {
    expect(validate.phone('(202) 555-1234')).toEqual({ valid: true });
  });

  it('rejects too few digits', () => {
    expect(validate.phone('55512345').valid).toBe(false);
  });

  it('rejects too many digits', () => {
    expect(validate.phone('12025551234').valid).toBe(false);
  });

  it('rejects area code starting with 0', () => {
    expect(validate.phone('0125551234').valid).toBe(false);
  });

  it('rejects area code starting with 1', () => {
    expect(validate.phone('1125551234').valid).toBe(false);
  });
});

describe('validate.phoneIntl', () => {
  it('accepts E.164 number', () => {
    expect(validate.phoneIntl('+12025551234')).toEqual({ valid: true });
  });

  it('accepts number with spaces and dashes', () => {
    expect(validate.phoneIntl('+1 (202) 555-1234')).toEqual({ valid: true });
  });

  it('accepts short international number', () => {
    expect(validate.phoneIntl('+4412345678')).toEqual({ valid: true });
  });

  it('accepts dot-separated format (+33.1.42.34.56.78)', () => {
    // Common European format. The character class includes '.', the strip
    // must include it too — earlier audit caught a mismatch where '.' was
    // accepted at the front door but not stripped.
    expect(validate.phoneIntl('+33.1.42.34.56.78')).toEqual({ valid: true });
    expect(validate.phoneIntl('+1.202.555.1234')).toEqual({ valid: true });
  });

  it('accepts number without an explicit "+" prefix', () => {
    // Permissive client-side — server libphonenumber resolves the
    // country. Users on iOS/Android often copy from their call log
    // which shows the number without the +.
    expect(validate.phoneIntl('12025551234')).toEqual({ valid: true });
    expect(validate.phoneIntl('7700 900123')).toEqual({ valid: true });
  });

  it('accepts the "00" international prefix (alternative to +)', () => {
    expect(validate.phoneIntl('0044 7700 900123')).toEqual({ valid: true });
  });

  it('rejects too short (<7 digits)', () => {
    expect(validate.phoneIntl('+123456').valid).toBe(false);
  });

  it('rejects too long (>15 digits)', () => {
    expect(validate.phoneIntl('+1234567890123456').valid).toBe(false);
  });
});

describe('validate.ssn', () => {
  it('accepts valid SSN', () => {
    expect(validate.ssn('123-45-6789')).toEqual({ valid: true });
  });

  it('accepts SSN without dashes', () => {
    expect(validate.ssn('123456789')).toEqual({ valid: true });
  });

  it('rejects area 000', () => {
    expect(validate.ssn('000-45-6789').valid).toBe(false);
  });

  it('rejects area 666', () => {
    expect(validate.ssn('666-45-6789').valid).toBe(false);
  });

  it('rejects area starting with 9', () => {
    expect(validate.ssn('900-45-6789').valid).toBe(false);
    expect(validate.ssn('999-45-6789').valid).toBe(false);
  });

  it('rejects wrong length', () => {
    expect(validate.ssn('12345678').valid).toBe(false);
    expect(validate.ssn('1234567890').valid).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validate.ssn('').valid).toBe(false);
  });
});

describe('validate.ein', () => {
  it('accepts valid EIN with prefix 01', () => {
    expect(validate.ein('01-1234567')).toEqual({ valid: true });
  });

  it('accepts valid EIN with prefix 20', () => {
    expect(validate.ein('201234567')).toEqual({ valid: true });
  });

  it('accepts valid EIN with prefix 99', () => {
    expect(validate.ein('99-1234567')).toEqual({ valid: true });
  });

  it('rejects invalid prefix 00', () => {
    expect(validate.ein('00-1234567').valid).toBe(false);
  });

  it('rejects invalid prefix 07', () => {
    expect(validate.ein('07-1234567').valid).toBe(false);
  });

  it('rejects invalid prefix 69', () => {
    expect(validate.ein('69-1234567').valid).toBe(false);
  });

  it('rejects invalid prefix 70', () => {
    expect(validate.ein('70-1234567').valid).toBe(false);
  });

  it('rejects invalid prefix 78', () => {
    expect(validate.ein('78-1234567').valid).toBe(false);
  });

  it('rejects invalid prefix 89', () => {
    expect(validate.ein('89-1234567').valid).toBe(false);
  });

  it('rejects wrong length', () => {
    expect(validate.ein('12345678').valid).toBe(false);
  });
});

describe('validate.zip', () => {
  it('accepts valid ZIP', () => {
    expect(validate.zip('12345')).toEqual({ valid: true });
  });

  it('rejects too short', () => {
    expect(validate.zip('1234').valid).toBe(false);
  });

  it('rejects too long', () => {
    expect(validate.zip('123456').valid).toBe(false);
  });

  it('rejects letters', () => {
    expect(validate.zip('1234a').valid).toBe(false);
  });

  it('rejects ZIP+4 format', () => {
    expect(validate.zip('12345-6789').valid).toBe(false);
  });
});

describe('validate.zip4', () => {
  it('accepts ZIP+4 with dash', () => {
    expect(validate.zip4('12345-6789')).toEqual({ valid: true });
  });

  it('accepts ZIP+4 without dash', () => {
    expect(validate.zip4('123456789')).toEqual({ valid: true });
  });

  it('rejects plain ZIP', () => {
    expect(validate.zip4('12345').valid).toBe(false);
  });

  it('rejects letters', () => {
    expect(validate.zip4('12345-678a').valid).toBe(false);
  });
});

describe('validate.usState', () => {
  const allCodes = [
    'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
    'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
    'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
    'VA','WA','WV','WI','WY','DC','AS','GU','MP','PR','VI',
  ];

  it('accepts all 50 states + DC + territories', () => {
    for (const code of allCodes) {
      expect(validate.usState(code)).toEqual({ valid: true });
    }
  });

  it('accepts lowercase', () => {
    expect(validate.usState('ca')).toEqual({ valid: true });
  });

  it('rejects invalid codes', () => {
    expect(validate.usState('XX').valid).toBe(false);
    expect(validate.usState('ZZ').valid).toBe(false);
    expect(validate.usState('').valid).toBe(false);
  });
});

describe('validate.isoDate', () => {
  it('accepts valid date', () => {
    expect(validate.isoDate('2024-01-15')).toEqual({ valid: true });
  });

  it('accepts leap year Feb 29', () => {
    expect(validate.isoDate('2024-02-29')).toEqual({ valid: true });
  });

  it('rejects Feb 29 on non-leap year', () => {
    expect(validate.isoDate('2023-02-29').valid).toBe(false);
  });

  it('rejects invalid month', () => {
    expect(validate.isoDate('2024-13-01').valid).toBe(false);
    expect(validate.isoDate('2024-00-01').valid).toBe(false);
  });

  it('rejects invalid day', () => {
    expect(validate.isoDate('2024-01-32').valid).toBe(false);
    expect(validate.isoDate('2024-04-31').valid).toBe(false);
  });

  it('rejects wrong format', () => {
    expect(validate.isoDate('01/15/2024').valid).toBe(false);
    expect(validate.isoDate('2024-1-5').valid).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validate.isoDate('').valid).toBe(false);
  });
});

describe('validate.url', () => {
  it('accepts http URL', () => {
    expect(validate.url('http://example.com')).toEqual({ valid: true });
  });

  it('accepts https URL', () => {
    expect(validate.url('https://example.com/path?q=1')).toEqual({ valid: true });
  });

  it('rejects ftp protocol', () => {
    expect(validate.url('ftp://example.com').valid).toBe(false);
  });

  it('rejects no protocol', () => {
    expect(validate.url('example.com').valid).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validate.url('').valid).toBe(false);
  });
});

describe('validate.currency', () => {
  it('accepts integer', () => {
    expect(validate.currency('100')).toEqual({ valid: true });
  });

  it('accepts 2 decimal places', () => {
    expect(validate.currency('99.99')).toEqual({ valid: true });
  });

  it('accepts 1 decimal place', () => {
    expect(validate.currency('10.5')).toEqual({ valid: true });
  });

  it('accepts zero', () => {
    expect(validate.currency('0')).toEqual({ valid: true });
  });

  it('rejects 3 decimal places', () => {
    expect(validate.currency('10.123').valid).toBe(false);
  });

  it('rejects negative', () => {
    expect(validate.currency('-5').valid).toBe(false);
  });

  it('rejects letters', () => {
    expect(validate.currency('abc').valid).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validate.currency('').valid).toBe(false);
  });

  it('rejects leading zeros', () => {
    expect(validate.currency('0123.45').valid).toBe(false);
  });

  it('allows zero', () => {
    expect(validate.currency('0').valid).toBe(true);
  });

  it('allows zero with decimals', () => {
    expect(validate.currency('0.50').valid).toBe(true);
  });
});

describe('validate.range', () => {
  it('passes within range', () => {
    expect(validate.range(5, { min: 1, max: 10 })).toEqual({ valid: true });
  });

  it('passes at min boundary', () => {
    expect(validate.range(1, { min: 1, max: 10 })).toEqual({ valid: true });
  });

  it('passes at max boundary', () => {
    expect(validate.range(10, { min: 1, max: 10 })).toEqual({ valid: true });
  });

  it('fails below min', () => {
    const result = validate.range(0, { min: 1 });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Must be at least 1');
  });

  it('fails above max', () => {
    const result = validate.range(11, { max: 10 });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Must be no more than 10');
  });

  it('fails outside range with both min and max', () => {
    const result = validate.range(0, { min: 1, max: 10 });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Must be between 1 and 10');
  });

  it('passes with no constraints', () => {
    expect(validate.range(999, {})).toEqual({ valid: true });
  });
});

describe('validate.length', () => {
  it('passes within range', () => {
    expect(validate.length('hello', { min: 1, max: 10 })).toEqual({ valid: true });
  });

  it('fails below min', () => {
    const result = validate.length('ab', { min: 3 });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Must be at least 3 characters');
  });

  it('fails above max', () => {
    const result = validate.length('abcdef', { max: 5 });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Must be no more than 5 characters');
  });

  it('fails outside range with both min and max', () => {
    const result = validate.length('a', { min: 2, max: 5 });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Must be between 2 and 5 characters');
  });

  it('passes with no constraints', () => {
    expect(validate.length('anything', {})).toEqual({ valid: true });
  });
});

describe('validate.alphanumeric', () => {
  it('accepts letters and digits', () => {
    expect(validate.alphanumeric('abc123')).toEqual({ valid: true });
  });

  it('rejects spaces', () => {
    expect(validate.alphanumeric('abc 123').valid).toBe(false);
  });

  it('rejects special characters', () => {
    expect(validate.alphanumeric('abc-123').valid).toBe(false);
    expect(validate.alphanumeric('abc@123').valid).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validate.alphanumeric('').valid).toBe(false);
  });

  it('enforces min length', () => {
    const result = validate.alphanumeric('ab', { min: 3 });
    expect(result.valid).toBe(false);
  });

  it('enforces max length', () => {
    const result = validate.alphanumeric('abcdef', { max: 5 });
    expect(result.valid).toBe(false);
  });

  it('passes with length constraints met', () => {
    expect(validate.alphanumeric('abc', { min: 2, max: 5 })).toEqual({ valid: true });
  });
});

describe('validate.routing', () => {
  // Real, in-circulation routing numbers (publicly published examples).
  // The checksum is a property of the digits — these all satisfy
  // 3·d1 + 7·d2 + d3 + 3·d4 + 7·d5 + d6 + 3·d7 + 7·d8 + d9 ≡ 0 (mod 10).

  it('accepts a valid routing number', () => {
    // Wells Fargo (San Francisco): 121000248
    expect(validate.routing('121000248')).toEqual({ valid: true });
  });

  it('accepts another valid routing number', () => {
    // Chase NY: 021000021
    expect(validate.routing('021000021')).toEqual({ valid: true });
  });

  it('accepts hyphenated input by stripping non-digits', () => {
    expect(validate.routing('121-000-248')).toEqual({ valid: true });
  });

  it('rejects a number that fails the checksum', () => {
    // 121000247 is one digit off from a real number — checksum no longer matches.
    expect(validate.routing('121000247').valid).toBe(false);
  });

  it('rejects fewer than 9 digits', () => {
    expect(validate.routing('12100024').valid).toBe(false);
  });

  it('rejects more than 9 digits', () => {
    expect(validate.routing('1210002480').valid).toBe(false);
  });

  it('rejects all-zero routing number', () => {
    expect(validate.routing('000000000').valid).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validate.routing('').valid).toBe(false);
  });

  it('returns the locale-keyed error message on failure', () => {
    expect(validate.routing('121000247').error).toBe(
      'Enter a valid 9-digit bank routing number',
    );
  });
});

describe('validate strictness — embedded-garbage rejection', () => {
  // Pre-strictening, the strip-then-test approach accepted any input whose
  // digits matched the pattern, even when the input contained letters or
  // arbitrary other characters (`'<script>123-45-6789'` validated as SSN).
  // These tests lock in the current stricter behavior.
  it('ssn rejects letters before the digit run', () => {
    expect(validate.ssn('abc-123-45-6789').valid).toBe(false);
    expect(validate.ssn('<script>123-45-6789').valid).toBe(false);
  });

  it('ssn rejects leading/trailing whitespace', () => {
    expect(validate.ssn('  123-45-6789').valid).toBe(false);
    expect(validate.ssn('123-45-6789\t').valid).toBe(false);
  });

  it('phone rejects letters', () => {
    expect(validate.phone('call 555-1234567').valid).toBe(false);
    expect(validate.phone('555-1234567abc').valid).toBe(false);
  });

  it('routing rejects letters', () => {
    expect(validate.routing('021000021abc').valid).toBe(false);
  });

  it('ein rejects letters', () => {
    expect(validate.ein('01-3456789x').valid).toBe(false);
  });

  it('phoneIntl rejects letters', () => {
    expect(validate.phoneIntl('+12025551234x').valid).toBe(false);
  });
});

describe('validate.range numeric edge cases', () => {
  it('rejects NaN even when within nominal range bounds', () => {
    // JS comparison operators silently return false for NaN, which would
    // otherwise let NaN slip through as "valid" against `value < min`.
    expect(validate.range(NaN, { min: 0, max: 10 }).valid).toBe(false);
    expect(validate.range(NaN, { min: 0 }).valid).toBe(false);
    expect(validate.range(NaN, { max: 10 }).valid).toBe(false);
  });

  it('rejects Infinity', () => {
    expect(validate.range(Infinity, { min: 0, max: 10 }).valid).toBe(false);
    expect(validate.range(-Infinity, { min: 0 }).valid).toBe(false);
  });
});
