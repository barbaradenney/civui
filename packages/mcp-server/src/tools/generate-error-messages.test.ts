import { describe, it, expect } from 'vitest';
import { generateErrorMessages } from './generate-error-messages.js';
import type { FormSchema } from '../schema/index.js';

describe('generateErrorMessages', () => {
  it('generates required message for text field', () => {
    const schema: FormSchema = {
      sections: [{ fields: [{ type: 'text', name: 'full-name', label: 'Full name', required: true }] }],
    };
    const result = generateErrorMessages(schema);
    expect(result.messages['full-name'].required).toBe('Enter your Full name');
  });

  it('generates required message for select field with "Select"', () => {
    const schema: FormSchema = {
      sections: [{ fields: [{ type: 'select', name: 'state', label: 'State', required: true }] }],
    };
    const result = generateErrorMessages(schema);
    expect(result.messages['state'].required).toBe('Select your State');
  });

  it('generates required message for checkbox with "Select"', () => {
    const schema: FormSchema = {
      sections: [{ fields: [{ type: 'checkbox', name: 'agree', label: 'I agree', required: true }] }],
    };
    const result = generateErrorMessages(schema);
    expect(result.messages['agree'].required).toBe('Select I agree');
  });

  it('generates required message for file with "Upload"', () => {
    const schema: FormSchema = {
      sections: [{ fields: [{ type: 'file', name: 'docs', label: 'Documents', required: true }] }],
    };
    const result = generateErrorMessages(schema);
    expect(result.messages['docs'].required).toBe('Upload your Documents');
  });

  it('detects email pattern', () => {
    const schema: FormSchema = {
      sections: [{ fields: [{ type: 'text', name: 'email', label: 'Email', pattern: '^[^@]+@[^@]+$' }] }],
    };
    const result = generateErrorMessages(schema);
    expect(result.messages['email'].pattern).toBe('Enter a valid email address');
  });

  it('detects SSN pattern', () => {
    const schema: FormSchema = {
      sections: [{ fields: [{ type: 'text', name: 'ssn', label: 'SSN', pattern: '^\\d{3}-\\d{2}-\\d{4}$' }] }],
    };
    const result = generateErrorMessages(schema);
    expect(result.messages['ssn'].pattern).toBe('Enter a valid Social Security number (XXX-XX-XXXX)');
  });

  it('detects ZIP pattern', () => {
    const schema: FormSchema = {
      sections: [{ fields: [{ type: 'text', name: 'zip', label: 'ZIP code', pattern: '^\\d{5}(-\\d{4})?$' }] }],
    };
    const result = generateErrorMessages(schema);
    expect(result.messages['zip'].pattern).toBe('Enter a 5-digit ZIP code');
  });

  it('handles unknown pattern', () => {
    const schema: FormSchema = {
      sections: [{ fields: [{ type: 'text', name: 'code', label: 'Code', pattern: '^[A-Z]{3}$' }] }],
    };
    const result = generateErrorMessages(schema);
    expect(result.messages['code'].pattern).toBe('Code must match the required format');
  });

  it('generates minlength + maxlength combined message', () => {
    const schema: FormSchema = {
      sections: [{ fields: [{ type: 'text', name: 'bio', label: 'Bio', minlength: 10, maxlength: 200 }] }],
    };
    const result = generateErrorMessages(schema);
    expect(result.messages['bio'].length).toBe('Bio must be between 10 and 200 characters');
  });

  it('generates maxlength only message', () => {
    const schema: FormSchema = {
      sections: [{ fields: [{ type: 'text', name: 'name', label: 'Name', maxlength: 50 }] }],
    };
    const result = generateErrorMessages(schema);
    expect(result.messages['name'].maxlength).toBe('Name must be 50 characters or fewer');
  });

  it('generates min + max number range message', () => {
    const schema: FormSchema = {
      sections: [{ fields: [{ type: 'number', name: 'age', label: 'Age', min: '18', max: '120' }] }],
    };
    const result = generateErrorMessages(schema);
    expect(result.messages['age'].range).toBe('Age must be between 18 and 120');
  });

  it('generates file accept, maxFiles, maxSize messages', () => {
    const schema: FormSchema = {
      sections: [{
        fields: [{
          type: 'file', name: 'upload', label: 'Upload',
          accept: '.pdf,.doc', maxFiles: 3, maxSize: 5242880,
        }],
      }],
    };
    const result = generateErrorMessages(schema);
    expect(result.messages['upload'].accept).toBe('Upload a PDF, DOC file');
    expect(result.messages['upload'].maxFiles).toBe('You can upload up to 3 files');
    expect(result.messages['upload'].maxSize).toBe('Each file must be smaller than 5 MB');
  });

  it('handles cross-field rules with message', () => {
    const schema: FormSchema = {
      sections: [{ fields: [{ type: 'text', name: 'spouse-name', label: 'Spouse name' }] }],
      crossFieldRules: [{
        id: 'spouse-required',
        description: 'Spouse name is required when married',
        when: { field: 'status', operator: 'eq', value: 'married' },
        then: { action: 'setError', targets: ['spouse-name'], message: 'Enter your spouse name when married' },
      }],
    };
    const result = generateErrorMessages(schema);
    expect(result.messages['spouse-name']['rule:spouse-required']).toBe('Enter your spouse name when married');
  });

  it('handles cross-field rules without message (uses description)', () => {
    const schema: FormSchema = {
      sections: [{ fields: [{ type: 'text', name: 'end-date', label: 'End date' }] }],
      crossFieldRules: [{
        id: 'date-range',
        description: 'End date must be after start date',
        when: { field: 'start-date', operator: 'exists' },
        then: { action: 'setError', targets: ['end-date'] },
      }],
    };
    const result = generateErrorMessages(schema);
    expect(result.messages['end-date']['rule:date-range']).toBe('End date must be after start date');
  });

  it('returns correct fieldCount and messageCount', () => {
    const schema: FormSchema = {
      sections: [{
        fields: [
          { type: 'text', name: 'a', label: 'A', required: true },
          { type: 'email', name: 'b', label: 'B', required: true },
          { type: 'text', name: 'c', label: 'C' },
        ],
      }],
    };
    const result = generateErrorMessages(schema);
    expect(result.fieldCount).toBe(2);
    expect(result.messageCount).toBeGreaterThanOrEqual(2);
  });

  it('generates type-based pattern for email type without explicit pattern', () => {
    const schema: FormSchema = {
      sections: [{ fields: [{ type: 'email', name: 'email', label: 'Email address' }] }],
    };
    const result = generateErrorMessages(schema);
    expect(result.messages['email'].pattern).toBe('Enter a valid email address');
  });
});
