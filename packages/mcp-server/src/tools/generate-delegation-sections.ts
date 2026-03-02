/**
 * generate_delegation_sections tool — generate representative information,
 * attestation, and consent sections for delegation/representative forms.
 */
import type { FormSchema, FormSection, CrossFieldRule } from '../schema/index.js';
import { escapeHtml } from './html-utils.js';

export interface DelegationSectionsResult {
  sections: FormSection[];
  attestationHtml: string;
  crossFieldRules: CrossFieldRule[];
  features: string[];
}

export function generateDelegationSections(
  schema: FormSchema,
  delegationType?: string,
): DelegationSectionsResult {
  if (!schema.delegation) {
    throw new Error('Schema must have a `delegation` configuration to generate delegation sections');
  }

  const { delegation } = schema;
  const features: string[] = ['delegation'];
  const sections: FormSection[] = [];
  const crossFieldRules: CrossFieldRule[] = [];

  const repLabel = delegation.representativeLabel ?? 'Representative';

  // Filter delegation types if a specific type is requested
  const types = delegationType
    ? delegation.types.filter((t) => t.id === delegationType)
    : delegation.types;

  // --- Representative Information Section ---
  const repFields: FormSection['fields'] = [];

  // Delegation type selector (only if multiple types)
  if (types.length > 1) {
    repFields.push({
      type: 'select',
      name: 'delegation-type',
      label: 'Type of representation',
      required: true,
      options: types.map((t) => ({ value: t.id, label: t.label })),
    });
  } else if (types.length === 1) {
    repFields.push({
      type: 'select',
      name: 'delegation-type',
      label: 'Type of representation',
      required: true,
      value: types[0].id,
      options: types.map((t) => ({ value: t.id, label: t.label })),
    });
  }

  repFields.push(
    {
      type: 'text',
      name: 'rep-full-name',
      label: `${repLabel} full name`,
      required: true,
      autocomplete: 'name',
    },
    {
      type: 'text',
      name: 'rep-organization',
      label: 'Organization or firm name',
    },
    {
      type: 'email',
      name: 'rep-email',
      label: `${repLabel} email address`,
      required: true,
      autocomplete: 'email',
    },
    {
      type: 'tel',
      name: 'rep-phone',
      label: `${repLabel} phone number`,
      autocomplete: 'tel',
      inputmode: 'tel',
    },
  );

  // Bar number (conditionally visible for attorney types)
  const hasAttorneyType = types.some((t) => t.id === 'power-of-attorney');
  if (hasAttorneyType) {
    features.push('bar-number');
    repFields.push({
      type: 'text',
      name: 'rep-bar-number',
      label: 'Bar number',
      visibleWhen: {
        field: 'delegation-type',
        operator: 'eq',
        value: 'power-of-attorney',
      },
    });

    crossFieldRules.push({
      id: 'bar-number-visible',
      description: 'Show bar number field only for power-of-attorney delegation type',
      when: {
        field: 'delegation-type',
        operator: 'eq',
        value: 'power-of-attorney',
      },
      then: {
        action: 'show',
        targets: ['rep-bar-number'],
      },
    });
  }

  // Authorization number
  if (delegation.requiresAuthorizationNumber) {
    features.push('authorization-number');
    repFields.push({
      type: 'text',
      name: 'rep-authorization-number',
      label: 'Authorization number',
      required: true,
    });
  }

  sections.push({
    heading: `${repLabel} information`,
    fields: repFields,
  });

  // --- Attestation Section ---
  let attestationHtml = '';
  if (delegation.attestation) {
    features.push('attestation');
    const attestation = delegation.attestation;
    const attestFields: FormSection['fields'] = [];
    const sigType = attestation.signatureType ?? 'checkbox';

    if (sigType === 'checkbox') {
      features.push('checkbox-attestation');
      attestFields.push({
        type: 'checkbox',
        name: 'attestation-agreement',
        label: attestation.text,
        required: attestation.required !== false,
      });
    } else if (sigType === 'typed-signature') {
      features.push('typed-signature');
      attestFields.push({
        type: 'checkbox',
        name: 'attestation-agreement',
        label: attestation.text,
        required: attestation.required !== false,
      });
      attestFields.push({
        type: 'text',
        name: 'attestation-signature',
        label: 'Type your full legal name as signature',
        required: attestation.required !== false,
      });
    } else if (sigType === 'wet-signature') {
      features.push('wet-signature');
      attestFields.push({
        type: 'checkbox',
        name: 'attestation-agreement',
        label: attestation.text,
        required: attestation.required !== false,
      });
      attestFields.push({
        type: 'file',
        name: 'attestation-signature-upload',
        label: 'Upload signed document',
        accept: '.pdf,.jpg,.png',
        required: attestation.required !== false,
      });
    }

    sections.push({
      heading: 'Attestation',
      fields: attestFields,
    });

    attestationHtml =
      `<section class="civ-mt-6 civ-p-4 civ-border civ-rounded">\n` +
      `  <h2 class="civ-text-lg civ-font-bold civ-mb-2">Attestation</h2>\n` +
      `  <p class="civ-mb-4">${escapeHtml(attestation.text)}</p>\n` +
      `</section>`;
  }

  // --- Consent Upload Section ---
  if (delegation.requiresConsentUpload) {
    features.push('consent-upload');
    sections.push({
      heading: 'Consent documentation',
      fields: [
        {
          type: 'file',
          name: 'consent-document',
          label: 'Upload authorization or consent document',
          required: true,
          accept: '.pdf,.jpg,.png',
          hint: 'Upload a signed authorization form (PDF, JPG, or PNG).',
        },
      ],
    });

    crossFieldRules.push({
      id: 'consent-required',
      description: 'Consent document required when delegation type is selected',
      when: {
        field: 'delegation-type',
        operator: 'exists',
      },
      then: {
        action: 'require',
        targets: ['consent-document'],
      },
    });
  }

  return {
    sections,
    attestationHtml,
    crossFieldRules,
    features,
  };
}
