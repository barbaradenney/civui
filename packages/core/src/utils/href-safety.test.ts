import { describe, it, expect } from 'vitest';
import { isSafeHref, sanitizeHref } from './href-safety.js';

describe('isSafeHref', () => {
  it('accepts http and https URLs', () => {
    expect(isSafeHref('https://example.gov/page')).toBe(true);
    expect(isSafeHref('http://example.gov/page')).toBe(true);
  });

  it('accepts relative paths and fragment anchors', () => {
    expect(isSafeHref('/about')).toBe(true);
    expect(isSafeHref('./detail')).toBe(true);
    expect(isSafeHref('#main-content')).toBe(true);
  });

  it('accepts protocol-action URLs (tel, mailto, sms)', () => {
    expect(isSafeHref('tel:+18005551234')).toBe(true);
    expect(isSafeHref('mailto:help@va.gov')).toBe(true);
    expect(isSafeHref('sms:+18005551234')).toBe(true);
  });

  it('rejects javascript: URLs in all forms', () => {
    expect(isSafeHref('javascript:alert(1)')).toBe(false);
    expect(isSafeHref('JavaScript:void(0)')).toBe(false);
    expect(isSafeHref('  javascript:alert(1)')).toBe(false);
    expect(isSafeHref('JAVASCRIPT:alert(1)')).toBe(false);
  });

  it('treats empty / null / undefined as safe (no href rendered)', () => {
    expect(isSafeHref('')).toBe(true);
    expect(isSafeHref(null)).toBe(true);
    expect(isSafeHref(undefined)).toBe(true);
  });
});

describe('sanitizeHref', () => {
  it('returns the original href when safe', () => {
    expect(sanitizeHref('/about')).toBe('/about');
    expect(sanitizeHref('https://example.gov')).toBe('https://example.gov');
  });

  it('returns empty string for unsafe protocols', () => {
    expect(sanitizeHref('javascript:alert(1)')).toBe('');
    expect(sanitizeHref('  javascript:alert(1)')).toBe('');
  });

  it('returns empty string for null / undefined / empty input', () => {
    expect(sanitizeHref(null)).toBe('');
    expect(sanitizeHref(undefined)).toBe('');
    expect(sanitizeHref('')).toBe('');
  });
});
