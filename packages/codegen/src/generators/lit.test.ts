import { describe, it, expect } from 'vitest';
import { generateLit } from './lit.js';
import type { ComponentSchema } from '@civui/schema/types';

// Minimal schemas for testing each pattern

const textInputSchema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-text-input',
  description: 'Test text input',
  category: 'form-control',
  extends: 'CivFormElement',
  isGroup: false,
  props: {
    type: { type: 'enum', description: 'Input type', default: 'text', values: ['text', 'email', 'password'] },
    placeholder: { type: 'string', description: 'Placeholder', default: '' },
  },
  events: {
    'civ-input': { description: 'Input event', detail: { value: { type: 'string' } } },
    'civ-change': { description: 'Change event', detail: { value: { type: 'string' } } },
  },
  a11y: { role: 'textbox', requiredIndicator: 'asterisk', errorAnnouncement: 'assertive', describedBy: ['hint', 'error'] },
  renderOrder: [
    { type: 'label', bindings: { text: 'label', required: 'required' } },
    { type: 'hint', condition: 'hint', bindings: { text: 'hint' } },
    { type: 'error', condition: 'error', bindings: { text: 'error' } },
    { type: 'input', bindings: { type: 'type', value: 'value', placeholder: 'placeholder', disabled: 'disabled', required: 'required' } },
  ],
  form: { valueMode: 'string', formAssociated: true, resetBehavior: 'restore-default-value' },
};

const checkboxSchema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-checkbox',
  description: 'Test checkbox',
  category: 'form-control',
  extends: 'CivFormElement',
  isGroup: false,
  props: {
    checked: { type: 'boolean', description: 'Checked state', default: false, reflect: true },
    indeterminate: { type: 'boolean', description: 'Indeterminate', default: false, reflect: true },
    description: { type: 'string', description: 'Description text', default: '' },
    tile: { type: 'boolean', description: 'Tile variant', default: false, reflect: true },
  },
  events: {
    'civ-input': { description: 'Input', detail: { checked: { type: 'boolean' }, value: { type: 'string' } } },
    'civ-change': { description: 'Change', detail: { checked: { type: 'boolean' }, value: { type: 'string' } } },
  },
  a11y: { role: 'checkbox', requiredIndicator: 'asterisk', errorAnnouncement: 'assertive', describedBy: ['description', 'hint', 'error'] },
  renderOrder: [
    { type: 'hint', condition: 'hint', bindings: { text: 'hint' } },
    { type: 'error', condition: 'error', bindings: { text: 'error' } },
    { type: 'container', children: [
      { type: 'checkbox', bindings: { checked: 'checked', disabled: 'disabled', required: 'required' } },
      { type: 'label', bindings: { text: 'label', required: 'required' } },
    ] },
  ],
  form: { valueMode: 'boolean', formAssociated: true, resetBehavior: 'restore-default-checked' },
};

const selectSchema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-select',
  description: 'Test select',
  category: 'form-control',
  extends: 'CivFormElement',
  isGroup: false,
  props: {
    options: {
      type: 'array', description: 'Options', default: [],
      items: {
        value: { type: 'string', description: 'Value', required: true },
        label: { type: 'string', description: 'Label', required: true },
      },
    },
    emptyLabel: { type: 'string', description: 'Empty label', default: '- Select -', attribute: 'empty-label' },
  },
  events: {
    'civ-input': { description: 'Input', detail: { value: { type: 'string' } } },
    'civ-change': { description: 'Change', detail: { value: { type: 'string' } } },
  },
  a11y: { role: 'listbox', requiredIndicator: 'asterisk', errorAnnouncement: 'assertive', describedBy: ['hint', 'error'] },
  renderOrder: [
    { type: 'label', bindings: { text: 'label', required: 'required' } },
    { type: 'hint', condition: 'hint', bindings: { text: 'hint' } },
    { type: 'error', condition: 'error', bindings: { text: 'error' } },
    { type: 'select', bindings: { value: 'value', options: 'options', emptyLabel: 'emptyLabel', disabled: 'disabled', required: 'required' } },
  ],
  form: { valueMode: 'string', formAssociated: true, resetBehavior: 'restore-default-value' },
};

const radioGroupSchema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-radio-group',
  description: 'Test radio group',
  category: 'form-group',
  extends: 'CivFormElement',
  isGroup: true,
  props: {
    legend: { type: 'string', description: 'Legend text', default: '' },
    orientation: { type: 'enum', description: 'Orientation', default: 'vertical', values: ['vertical', 'horizontal'], reflect: true },
  },
  events: {
    'civ-input': { description: 'Input', detail: { value: { type: 'string' } } },
  },
  a11y: { role: 'radiogroup', requiredIndicator: 'asterisk', errorAnnouncement: 'assertive', describedBy: ['hint', 'error'], ariaAttributes: { 'aria-orientation': 'orientation' } },
  renderOrder: [
    { type: 'container', bindings: { tag: 'fieldset' }, children: [
      { type: 'label', bindings: { text: 'legend', required: 'required' } },
      { type: 'hint', condition: 'hint', bindings: { text: 'hint' } },
      { type: 'error', condition: 'error', bindings: { text: 'error' } },
      { type: 'slot', bindings: { orientation: 'orientation' } },
    ] },
  ],
  form: { valueMode: 'string', formAssociated: true, resetBehavior: 'restore-default-value' },
};

const toggleSchema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-toggle',
  description: 'Test toggle',
  category: 'form-control',
  extends: 'CivFormElement',
  isGroup: false,
  props: {
    checked: { type: 'boolean', description: 'Checked', default: false, reflect: true },
    description: { type: 'string', description: 'Description', default: '' },
  },
  events: {
    'civ-input': { description: 'Input', detail: { checked: { type: 'boolean' }, value: { type: 'string' } } },
  },
  a11y: { role: 'switch', requiredIndicator: 'asterisk', errorAnnouncement: 'assertive', describedBy: ['description', 'hint', 'error'] },
  renderOrder: [
    { type: 'container', children: [
      { type: 'switch', bindings: { checked: 'checked', disabled: 'disabled' } },
      { type: 'label', bindings: { text: 'label' } },
    ] },
    { type: 'hint', condition: 'hint', bindings: { text: 'hint' } },
    { type: 'error', condition: 'error', bindings: { text: 'error' } },
  ],
  form: { valueMode: 'boolean', formAssociated: true, resetBehavior: 'restore-default-checked' },
};

describe('Lit generator', () => {
  describe('text input pattern', () => {
    const output = generateLit(textInputSchema);

    it('generates auto-generated header', () => {
      expect(output).toContain('// Auto-generated by @civui/codegen');
    });

    it('uses customElement decorator', () => {
      expect(output).toContain("@customElement('civ-text-input')");
    });

    it('extends CivFormElement', () => {
      expect(output).toContain('extends CivFormElement');
    });

    it('generates enum type', () => {
      expect(output).toContain("export type TextInputType = 'text' | 'email' | 'password'");
    });

    it('generates property decorators', () => {
      expect(output).toContain("@property({ type: String })");
    });

    it('imports renderLabel from core', () => {
      expect(output).toContain('renderLabel');
    });

    it('includes input element in template', () => {
      expect(output).toContain('<input');
      expect(output).toContain('@input="${this._handleInput}"');
      expect(output).toContain('@change="${this._handleChange}"');
    });

    it('includes aria attributes', () => {
      expect(output).toContain('aria-describedby');
      expect(output).toContain('aria-invalid');
      expect(output).toContain('aria-required');
    });

    it('declares global HTMLElementTagNameMap', () => {
      expect(output).toContain("'civ-text-input': CivTextInput");
    });
  });

  describe('checkbox pattern (boolean control)', () => {
    const output = generateLit(checkboxSchema);

    it('generates _onCheckboxChange handler', () => {
      expect(output).toContain('_onCheckboxChange');
    });

    it('generates _syncFormValue for boolean', () => {
      expect(output).toContain('_syncFormValue');
      expect(output).toContain('this.checked ? this.value : null');
    });

    it('generates formResetCallback', () => {
      expect(output).toContain('formResetCallback');
      expect(output).toContain('this._defaultChecked');
    });

    it('imports dispatch and interpolate', () => {
      expect(output).toContain('dispatch');
      expect(output).toContain('interpolate');
    });

    it('renders inline label (not renderLabel)', () => {
      expect(output).toContain('civ-check-label');
      expect(output).toContain('civ-flex civ-items-center');
    });

    it('generates _ariaDescribedBy override for description', () => {
      expect(output).toContain('_ariaDescribedBy');
      expect(output).toContain('this._descriptionId');
    });
  });

  describe('select pattern', () => {
    const output = generateLit(selectSchema);

    it('generates option interface', () => {
      expect(output).toContain('export interface SelectOption');
    });

    it('renders <select> element', () => {
      expect(output).toContain('<select');
      expect(output).toContain('</select>');
    });

    it('generates _onSelectChange handler', () => {
      expect(output).toContain('_onSelectChange');
    });

    it('renders option mapping', () => {
      expect(output).toContain('this.options.map');
      expect(output).toContain('opt.value');
    });

    it('generates updated() override for option sync', () => {
      expect(output).toContain('override updated');
    });
  });

  describe('radio group pattern (fieldset)', () => {
    const output = generateLit(radioGroupSchema);

    it('uses renderLegend instead of renderLabel', () => {
      expect(output).toContain('renderLegend');
      expect(output).not.toContain('renderLabel');
    });

    it('renders <fieldset> element', () => {
      expect(output).toContain('<fieldset');
      expect(output).toContain('</fieldset>');
    });

    it('sets role="radiogroup"', () => {
      expect(output).toContain('role="radiogroup"');
    });

    it('includes aria-orientation', () => {
      expect(output).toContain('aria-orientation');
    });

    it('generates orientation enum type', () => {
      expect(output).toContain("export type RadioGroupOrientation = 'vertical' | 'horizontal'");
    });

    it('renders layout div with orientation classes', () => {
      expect(output).toContain('civ-group-layout--horizontal');
      expect(output).toContain('civ-group-layout--vertical');
    });

    it('imports child type and has sync methods', () => {
      expect(output).toContain("import type { CivRadio } from './civ-radio.js'");
      expect(output).toContain('_syncRadioChecked');
      expect(output).toContain('_syncTabindex');
      expect(output).toContain('_onKeydown');
      expect(output).toContain('resolveGroupNavIndex');
    });
  });

  describe('toggle pattern (switch)', () => {
    const output = generateLit(toggleSchema);

    it('renders button with role="switch"', () => {
      expect(output).toContain('role="switch"');
      expect(output).toContain('<button');
    });

    it('generates _onToggle handler', () => {
      expect(output).toContain('_onToggle');
    });

    it('includes thumb span', () => {
      expect(output).toContain('civ-toggle-thumb');
    });

    it('generates _thumbStyle', () => {
      expect(output).toContain('_thumbStyle');
    });
  });
});
