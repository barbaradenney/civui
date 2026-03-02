/**
 * generate_react_native_form tool — generate a full React Native screen (TSX)
 * from a FormSchema, mapping each FieldType to the corresponding @civui/react-native component.
 */
import type { FormSchema, FormField, FieldType } from '../schema/index.js';
import { collectFields, toCamelCase } from './shared-utils.js';

export interface ReactNativeFormResult {
  tsx: string;
  imports: string[];
  fieldCount: number;
  features: string[];
  warnings: string[];
}

/** Group components use legend instead of label. */
const LEGEND_TYPES: Set<FieldType> = new Set([
  'radio',
  'checkbox-group',
  'memorable-date',
  'segmented-control',
]);

/** FieldType → RN component name mapping. */
const COMPONENT_MAP: Partial<Record<FieldType, string>> = {
  text: 'TextInput',
  email: 'TextInput',
  tel: 'TextInput',
  number: 'TextInput',
  password: 'TextInput',
  search: 'TextInput',
  url: 'TextInput',
  ssn: 'TextInput',
  zip: 'TextInput',
  textarea: 'Textarea',
  select: 'Select',
  combobox: 'Combobox',
  radio: 'RadioGroup',
  checkbox: 'Checkbox',
  'checkbox-group': 'CheckboxGroup',
  toggle: 'Toggle',
  date: 'DatePicker',
  'memorable-date': 'MemorableDate',
  'segmented-control': 'SegmentedControl',
};

/** Build JSX props string for a field. */
function buildProps(field: FormField): string {
  const props: string[] = [];
  const type = field.type;

  // name is always required
  props.push(`name="${field.name}"`);

  // label vs legend
  if (LEGEND_TYPES.has(type)) {
    props.push(`legend="${escapeJsx(field.label)}"`);
  } else {
    props.push(`label="${escapeJsx(field.label)}"`);
  }

  // hint
  if (field.hint) {
    props.push(`hint="${escapeJsx(field.hint)}"`);
  }

  // required
  if (field.required) {
    props.push('required');
  }

  // disabled
  if (field.disabled) {
    props.push('disabled');
  }

  // type-specific props
  switch (type) {
    case 'email':
      props.push('type="email"');
      break;
    case 'tel':
      props.push('type="tel"');
      break;
    case 'number':
      props.push('type="number"');
      break;
    case 'password':
      props.push('type="password"');
      break;
    case 'search':
      props.push('type="search"');
      break;
    case 'url':
      props.push('type="url"');
      break;
    case 'ssn':
      props.push('type="text"');
      props.push('maxLength={11}');
      props.push('placeholder="XXX-XX-XXXX"');
      break;
    case 'zip':
      props.push('type="number"');
      props.push('maxLength={10}');
      break;
    default:
      break;
  }

  // placeholder (if not already set by type-specific logic)
  if (field.placeholder && type !== 'ssn') {
    props.push(`placeholder="${escapeJsx(field.placeholder)}"`);
  }

  // maxlength (if not already set)
  if (field.maxlength != null && type !== 'ssn' && type !== 'zip') {
    props.push(`maxLength={${field.maxlength}}`);
  }

  // textarea rows
  if (type === 'textarea' && field.rows != null) {
    props.push(`rows={${field.rows}}`);
  }

  // options for select/combobox/segmented-control
  if ((type === 'select' || type === 'combobox' || type === 'segmented-control') && field.options) {
    const optionsStr = JSON.stringify(field.options);
    props.push(`options={${optionsStr}}`);
  }

  // radio group options from children
  if (type === 'radio' && field.children) {
    const radioOptions = field.children.map((c) => ({
      value: c.value ?? c.name,
      label: c.label,
    }));
    props.push(`options={${JSON.stringify(radioOptions)}}`);
  }

  // checkbox-group options from children
  if (type === 'checkbox-group' && field.children) {
    const cbOptions = field.children.map((c) => ({
      value: c.value ?? c.name,
      label: c.label,
    }));
    props.push(`options={${JSON.stringify(cbOptions)}}`);
  }

  // date min/max
  if ((type === 'date' || type === 'memorable-date') && field.min) {
    props.push(`min="${field.min}"`);
  }
  if ((type === 'date' || type === 'memorable-date') && field.max) {
    props.push(`max="${field.max}"`);
  }

  // value
  if (field.value) {
    props.push(`value="${escapeJsx(field.value)}"`);
  }

  return props.join('\n          ');
}

/** Escape special characters for JSX string attributes. */
function escapeJsx(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&apos;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Generate a React Native screen TSX from a FormSchema.
 */
export function generateReactNativeForm(
  schema: FormSchema,
  options?: { screenName?: string; includeValidation?: boolean },
): ReactNativeFormResult {
  const screenName = options?.screenName ?? 'FormScreen';
  const includeValidation = options?.includeValidation ?? false;

  const warnings: string[] = [];
  const features: string[] = ['scroll-view'];
  const componentSet = new Set<string>();
  let fieldCount = 0;

  if (schema.sections.length > 0) {
    features.push('sections');
  }

  // Collect all fields and their components
  const sectionBlocks: string[] = [];

  for (const section of schema.sections) {
    const fieldLines: string[] = [];

    for (const field of section.fields) {
      const componentName = COMPONENT_MAP[field.type];

      if (!componentName) {
        // file type has no RN equivalent
        if (field.type === 'file') {
          warnings.push(`Field "${field.name}" (type: file) skipped — no React Native equivalent in @civui/react-native`);
        } else {
          warnings.push(`Field "${field.name}" (type: ${field.type}) skipped — unsupported type`);
        }
        continue;
      }

      componentSet.add(componentName);
      fieldCount++;

      const propsStr = buildProps(field);
      fieldLines.push(`        <${componentName}\n          ${propsStr}\n        />`);

      // Track features
      if (field.options) features.push('options');
      if (field.children) features.push('options');
    }

    if (fieldLines.length > 0) {
      const heading = section.heading;
      if (heading) {
        sectionBlocks.push(
          `      {/* ${heading} */}\n      <View style={styles.section}>\n        <Text style={styles.sectionHeading}>${escapeJsx(heading)}</Text>\n${fieldLines.join('\n')}\n      </View>`,
        );
      } else {
        sectionBlocks.push(
          `      <View style={styles.section}>\n${fieldLines.join('\n')}\n      </View>`,
        );
      }
    }
  }

  // Deduplicate features
  const uniqueFeatures = [...new Set(features)];

  // Build imports
  const rnImports = ['View', 'ScrollView', 'Text', 'StyleSheet'];
  const civuiComponents = [...componentSet].sort();
  const imports: string[] = [];

  // Pre-compute required fields so we know whether to emit useState
  const requiredFields = includeValidation ? collectFields(schema.sections).filter((f) => f.required) : [];
  const hasValidation = includeValidation && requiredFields.length > 0;

  let importBlock = `import React from 'react';\n`;

  if (hasValidation) {
    importBlock += `import { useState } from 'react';\n`;
    uniqueFeatures.push('validation');
  }

  importBlock += `import { ${rnImports.join(', ')} } from 'react-native';\n`;

  if (civuiComponents.length > 0) {
    const civuiImportLine = `import { ${civuiComponents.join(', ')} } from '@civui/react-native';`;
    importBlock += civuiImportLine + '\n';
    imports.push(...civuiComponents);
  }

  // Build validation logic
  let validationBlock = '';
  if (hasValidation) {
    const errorStateLines = requiredFields
      .map((f) => `    ${toCamelCase(f.name)}: '',`)
      .join('\n');
    const validationChecks = requiredFields
      .map(
        (f) =>
          `    if (!formData.${toCamelCase(f.name)}) {\n      newErrors.${toCamelCase(f.name)} = '${escapeJsx(f.label)} is required';\n      valid = false;\n    }`,
      )
      .join('\n');
    const formDataState = requiredFields
      .map((f) => `    ${toCamelCase(f.name)}: '',`)
      .join('\n');

    validationBlock = `
  const [formData, setFormData] = useState({
${formDataState}
  });
  const [errors, setErrors] = useState({
${errorStateLines}
  });

  const validate = () => {
    const newErrors = { ...errors };
    let valid = true;
${validationChecks}
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = () => {
    if (validate()) {
      // Submit form data
    }
  };
`;
  }

  // Build the component
  const tsx = `${importBlock}
export default function ${screenName}() {
${validationBlock}
  return (
    <ScrollView style={styles.container}>
${sectionBlocks.join('\n\n')}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
});
`;

  return {
    tsx,
    imports,
    fieldCount,
    features: uniqueFeatures,
    warnings,
  };
}

