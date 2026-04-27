import type { FieldType } from '../schema/index.js';

export interface ComponentMapping {
  tag: string;
  labelProp: 'label' | 'legend';
  isGroup: boolean;
  childTag?: string;
  defaultHint?: string;
  inputType?: string;
  defaultAutocomplete?: string;
  defaultInputmode?: string;
}

const COMPONENT_MAP: Record<FieldType, ComponentMapping> = {
  text: { tag: 'civ-text-input', labelProp: 'label', isGroup: false },
  email: {
    tag: 'civ-text-input',
    labelProp: 'label',
    isGroup: false,
    inputType: 'email',
    defaultAutocomplete: 'email',
  },
  tel: {
    tag: 'civ-text-input',
    labelProp: 'label',
    isGroup: false,
    inputType: 'tel',
    defaultAutocomplete: 'tel',
    defaultInputmode: 'tel',
  },
  number: {
    tag: 'civ-text-input',
    labelProp: 'label',
    isGroup: false,
    inputType: 'number',
  },
  password: {
    tag: 'civ-text-input',
    labelProp: 'label',
    isGroup: false,
    inputType: 'password',
  },
  search: {
    tag: 'civ-text-input',
    labelProp: 'label',
    isGroup: false,
    inputType: 'search',
  },
  url: {
    tag: 'civ-text-input',
    labelProp: 'label',
    isGroup: false,
    inputType: 'url',
    defaultAutocomplete: 'url',
  },
  ssn: {
    tag: 'civ-text-input',
    labelProp: 'label',
    isGroup: false,
    inputType: 'text',
    defaultHint: 'For example: 123 45 6789',
    defaultInputmode: 'numeric',
  },
  zip: {
    tag: 'civ-text-input',
    labelProp: 'label',
    isGroup: false,
    inputType: 'text',
    defaultHint: 'For example: 12345 or 12345-6789',
    defaultAutocomplete: 'postal-code',
    defaultInputmode: 'numeric',
  },
  textarea: { tag: 'civ-textarea', labelProp: 'label', isGroup: false },
  select: { tag: 'civ-select', labelProp: 'label', isGroup: false },
  combobox: { tag: 'civ-combobox', labelProp: 'label', isGroup: false },
  radio: {
    tag: 'civ-radio-group',
    labelProp: 'legend',
    isGroup: true,
    childTag: 'civ-radio',
  },
  checkbox: { tag: 'civ-checkbox', labelProp: 'label', isGroup: false },
  'checkbox-group': {
    tag: 'civ-checkbox-group',
    labelProp: 'legend',
    isGroup: true,
    childTag: 'civ-checkbox',
  },
  date: {
    tag: 'civ-date-picker',
    labelProp: 'label',
    isGroup: false,
    defaultHint: 'For example: 01/15/2024',
  },
  'memorable-date': {
    tag: 'civ-memorable-date',
    labelProp: 'label',
    isGroup: false,
    defaultHint: 'For example: January 15 1990',
  },
  file: { tag: 'civ-file-upload', labelProp: 'label', isGroup: false },
  toggle: { tag: 'civ-toggle', labelProp: 'label', isGroup: false },
  'segmented-control': {
    tag: 'civ-segmented-control',
    labelProp: 'legend',
    isGroup: true,
    childTag: 'civ-segment',
  },
};

export function getComponentMapping(fieldType: FieldType): ComponentMapping {
  return COMPONENT_MAP[fieldType];
}

export function getAllMappings(): Record<FieldType, ComponentMapping> {
  return { ...COMPONENT_MAP };
}
