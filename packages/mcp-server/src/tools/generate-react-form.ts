/**
 * generate_react_form tool — generate a React web component (TSX) from a FormSchema,
 * using CivUI web components as custom elements in JSX with proper event handling.
 */
import type { FormSchema, FormField, FieldType } from '../schema/index.js';
import { collectFields, toCamelCase } from './shared-utils.js';

export interface ReactFormResult {
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

/** FieldType → CivUI HTML tag mapping. */
const TAG_MAP: Partial<Record<FieldType, string>> = {
  text: 'civ-text-input',
  email: 'civ-text-input',
  tel: 'civ-text-input',
  number: 'civ-text-input',
  password: 'civ-text-input',
  search: 'civ-text-input',
  url: 'civ-text-input',
  ssn: 'civ-text-input',
  zip: 'civ-text-input',
  textarea: 'civ-textarea',
  select: 'civ-select',
  combobox: 'civ-combobox',
  radio: 'civ-radio-group',
  checkbox: 'civ-checkbox',
  'checkbox-group': 'civ-checkbox-group',
  toggle: 'civ-toggle',
  date: 'civ-date-picker',
  'memorable-date': 'civ-memorable-date',
  'segmented-control': 'civ-segmented-control',
  file: 'civ-file-upload',
};

/** Escape special characters for JSX string attributes. */
function escapeJsx(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Generate TypeScript type for a field. */
function fieldToTsType(field: FormField): string {
  switch (field.type) {
    case 'number':
      return 'number';
    case 'checkbox':
    case 'toggle':
      return 'boolean';
    case 'checkbox-group':
      if (field.options) {
        return `(${field.options.map((o) => `'${o.value}'`).join(' | ')})[]`;
      }
      return 'string[]';
    case 'file':
      return field.multiple ? 'File[]' : 'File | null';
    default:
      if (field.options) {
        return field.options.map((o) => `'${o.value}'`).join(' | ');
      }
      return 'string';
  }
}

/** Build JSX attributes for a field. */
function buildAttrs(field: FormField): string {
  const attrs: string[] = [];
  const type = field.type;

  attrs.push(`name="${field.name}"`);

  if (LEGEND_TYPES.has(type)) {
    attrs.push(`legend="${escapeJsx(field.label)}"`);
  } else {
    attrs.push(`label="${escapeJsx(field.label)}"`);
  }

  if (field.hint) {
    attrs.push(`hint="${escapeJsx(field.hint)}"`);
  }

  if (field.required) {
    attrs.push('required');
  }

  if (field.disabled) {
    attrs.push('disabled');
  }

  // type-specific
  switch (type) {
    case 'email':
      attrs.push('type="email"');
      break;
    case 'tel':
      attrs.push('type="tel"');
      break;
    case 'number':
      attrs.push('type="number"');
      break;
    case 'password':
      attrs.push('type="password"');
      break;
    case 'search':
      attrs.push('type="search"');
      break;
    case 'url':
      attrs.push('type="url"');
      break;
    case 'ssn':
      attrs.push('type="text"');
      attrs.push('maxlength="11"');
      break;
    case 'zip':
      attrs.push('type="text"');
      attrs.push('maxlength="10"');
      break;
    default:
      break;
  }

  if (field.placeholder && type !== 'ssn') {
    attrs.push(`placeholder="${escapeJsx(field.placeholder)}"`);
  }

  if (field.maxlength != null && type !== 'ssn' && type !== 'zip') {
    attrs.push(`maxlength="${field.maxlength}"`);
  }

  if (type === 'textarea' && field.rows != null) {
    attrs.push(`rows="${field.rows}"`);
  }

  if ((type === 'date' || type === 'memorable-date') && field.min) {
    attrs.push(`min="${field.min}"`);
  }
  if ((type === 'date' || type === 'memorable-date') && field.max) {
    attrs.push(`max="${field.max}"`);
  }

  if (field.value) {
    attrs.push(`value="${escapeJsx(field.value)}"`);
  }

  return attrs.join('\n            ');
}

/** Generate children JSX for option-based components. */
function buildChildren(field: FormField, indent: string): string {
  const type = field.type;
  const lines: string[] = [];

  if (type === 'select' || type === 'combobox') {
    if (field.options) {
      for (const opt of field.options) {
        lines.push(`${indent}  <option value="${escapeJsx(opt.value)}">${escapeJsx(opt.label)}</option>`);
      }
    }
  }

  if (type === 'radio' && field.children) {
    for (const child of field.children) {
      const val = child.value ?? child.name;
      lines.push(`${indent}  <civ-radio value="${escapeJsx(val)}" label="${escapeJsx(child.label)}"></civ-radio>`);
    }
  }

  if (type === 'checkbox-group' && field.children) {
    for (const child of field.children) {
      const val = child.value ?? child.name;
      lines.push(`${indent}  <civ-checkbox value="${escapeJsx(val)}" label="${escapeJsx(child.label)}"></civ-checkbox>`);
    }
  }

  if (type === 'segmented-control' && field.options) {
    for (const opt of field.options) {
      lines.push(`${indent}  <civ-segment value="${escapeJsx(opt.value)}" label="${escapeJsx(opt.label)}"></civ-segment>`);
    }
  }

  return lines.join('\n');
}

/**
 * Generate a React web component TSX from a FormSchema.
 */
export function generateReactForm(
  schema: FormSchema,
  options?: {
    componentName?: string;
    stateManagement?: 'useState' | 'react-hook-form';
    includeTypes?: boolean;
  },
): ReactFormResult {
  const componentName = options?.componentName ?? 'Form';
  const stateManagement = options?.stateManagement ?? 'useState';
  const includeTypes = options?.includeTypes ?? true;

  const warnings: string[] = [];
  const features: string[] = ['custom-events'];
  const imports: string[] = [];
  let fieldCount = 0;

  if (schema.sections.length > 0) {
    features.push('sections');
  }

  const allFields = collectFields(schema.sections);
  const hasOptions = allFields.some((f) => f.options || f.children);
  if (hasOptions) features.push('options');
  const hasFile = allFields.some((f) => f.type === 'file');
  if (hasFile) features.push('file-upload');

  // Build TypeScript FormData interface
  let formDataInterface = '';
  if (includeTypes) {
    features.push('typescript');
    const tsLines: string[] = ['interface FormData {'];
    for (const field of allFields) {
      const optional = field.required ? '' : '?';
      tsLines.push(`  ${toCamelCase(field.name)}${optional}: ${fieldToTsType(field)};`);
    }
    tsLines.push('}');
    formDataInterface = tsLines.join('\n');
  }

  // Build section blocks
  const sectionBlocks: string[] = [];

  for (const section of schema.sections) {
    const fieldLines: string[] = [];

    for (const field of section.fields) {
      const tag = TAG_MAP[field.type];
      if (!tag) {
        warnings.push(`Field "${field.name}" (type: ${field.type}) skipped — unsupported type`);
        continue;
      }

      fieldCount++;
      const attrsStr = buildAttrs(field);
      const children = buildChildren(field, '          ');

      if (children) {
        fieldLines.push(`          <${tag}\n            ${attrsStr}\n          >\n${children}\n          </${tag}>`);
      } else {
        fieldLines.push(`          <${tag}\n            ${attrsStr}\n          ></${tag}>`);
      }
    }

    if (fieldLines.length > 0) {
      if (section.heading) {
        sectionBlocks.push(
          `        <fieldset>\n          <legend className="civ-text-xl civ-font-semibold civ-mb-4">${escapeJsx(section.heading)}</legend>\n${fieldLines.join('\n\n')}\n        </fieldset>`,
        );
      } else {
        sectionBlocks.push(fieldLines.join('\n\n'));
      }
    }
  }

  // Build import block and state management
  let importBlock: string;
  let stateBlock: string;
  let submitHandler: string;
  let refBlock: string;

  if (stateManagement === 'react-hook-form') {
    features.push('react-hook-form');
    importBlock = `import React, { useRef, useEffect } from 'react';\nimport { useForm } from 'react-hook-form';\n`;
    imports.push('useForm');

    const defaultValues: string[] = [];
    for (const field of allFields) {
      const key = toCamelCase(field.name);
      switch (field.type) {
        case 'number':
          defaultValues.push(`    ${key}: 0,`);
          break;
        case 'checkbox':
        case 'toggle':
          defaultValues.push(`    ${key}: false,`);
          break;
        case 'checkbox-group':
          defaultValues.push(`    ${key}: [],`);
          break;
        default:
          defaultValues.push(`    ${key}: '',`);
      }
    }

    stateBlock = `  const { register, handleSubmit, setValue, formState: { errors } } = useForm${includeTypes ? '<FormData>' : ''}({\n    defaultValues: {\n${defaultValues.join('\n')}\n    },\n  });\n`;
    submitHandler = `  const onSubmit = handleSubmit((data) => {\n    console.log('Form submitted:', data);\n  });\n`;

    // Ref + useEffect for custom event handling
    const refLines: string[] = [];
    const effectLines: string[] = [];
    for (const field of allFields) {
      const camel = toCamelCase(field.name);
      const refName = `${camel}Ref`;
      refLines.push(`  const ${refName} = useRef<HTMLElement>(null);`);
      const valExpr = field.type === 'checkbox' || field.type === 'toggle'
        ? `(e as CustomEvent).detail.checked`
        : field.type === 'checkbox-group'
          ? `(e as CustomEvent).detail.values`
          : field.type === 'file'
            ? `(e as CustomEvent).detail.files`
            : `(e as CustomEvent).detail.value`;
      effectLines.push(
        `    if (${refName}.current) {\n      const handler = (e: Event) => setValue('${camel}', ${valExpr});\n      ${refName}.current.addEventListener('civ-change', handler);\n      cleanups.push(() => ${refName}.current?.removeEventListener('civ-change', handler));\n    }`,
      );
    }
    refBlock = refLines.join('\n') + '\n\n  useEffect(() => {\n    const cleanups: (() => void)[] = [];\n' + effectLines.join('\n') + '\n    return () => cleanups.forEach((fn) => fn());\n  }, [setValue]);\n';
  } else {
    importBlock = `import React, { useState, useRef, useEffect } from 'react';\n`;

    const stateLines: string[] = [];
    for (const field of allFields) {
      const camel = toCamelCase(field.name);
      switch (field.type) {
        case 'number':
          stateLines.push(`  const [${camel}, set${camel.charAt(0).toUpperCase() + camel.slice(1)}] = useState${includeTypes ? '<number>' : ''}(0);`);
          break;
        case 'checkbox':
        case 'toggle':
          stateLines.push(`  const [${camel}, set${camel.charAt(0).toUpperCase() + camel.slice(1)}] = useState${includeTypes ? '<boolean>' : ''}(false);`);
          break;
        case 'checkbox-group':
          stateLines.push(`  const [${camel}, set${camel.charAt(0).toUpperCase() + camel.slice(1)}] = useState${includeTypes ? '<string[]>' : ''}([]);`);
          break;
        default:
          stateLines.push(`  const [${camel}, set${camel.charAt(0).toUpperCase() + camel.slice(1)}] = useState${includeTypes ? '<string>' : ''}('');`);
      }
    }
    stateBlock = stateLines.join('\n') + '\n';
    submitHandler = `  const handleSubmit = (e: React.FormEvent) => {\n    e.preventDefault();\n    console.log('Form submitted');\n  };\n`;

    // Ref + useEffect for custom event handling
    const refLines: string[] = [];
    const effectLines: string[] = [];
    for (const field of allFields) {
      const camel = toCamelCase(field.name);
      const setter = `set${camel.charAt(0).toUpperCase() + camel.slice(1)}`;
      const refName = `${camel}Ref`;
      refLines.push(`  const ${refName} = useRef<HTMLElement>(null);`);
      const valExpr = field.type === 'checkbox' || field.type === 'toggle'
        ? `(e as CustomEvent).detail.checked`
        : field.type === 'checkbox-group'
          ? `(e as CustomEvent).detail.values`
          : field.type === 'file'
            ? `(e as CustomEvent).detail.files`
            : `(e as CustomEvent).detail.value`;
      effectLines.push(
        `    if (${refName}.current) {\n      const handler = (e: Event) => ${setter}(${valExpr});\n      ${refName}.current.addEventListener('civ-change', handler);\n      cleanups.push(() => ${refName}.current?.removeEventListener('civ-change', handler));\n    }`,
      );
    }
    refBlock = refLines.join('\n') + '\n\n  useEffect(() => {\n    const cleanups: (() => void)[] = [];\n' + effectLines.join('\n') + '\n    return () => cleanups.forEach((fn) => fn());\n  }, []);\n';
  }

  // Assemble TSX
  const tsx = `${importBlock}
${includeTypes ? formDataInterface + '\n\n' : ''}export default function ${componentName}() {
${stateBlock}
${refBlock}
${submitHandler}
  return (
    <form onSubmit={${stateManagement === 'react-hook-form' ? 'onSubmit' : 'handleSubmit'}}>
      <div className="civ-space-y-6">
${sectionBlocks.join('\n\n')}
      </div>

      <button type="submit" className="civ-bg-primary civ-text-white civ-px-6 civ-py-3 civ-rounded civ-mt-6">
        Submit
      </button>
    </form>
  );
}
`;

  return {
    tsx,
    imports,
    fieldCount,
    features: [...new Set(features)],
    warnings,
  };
}
