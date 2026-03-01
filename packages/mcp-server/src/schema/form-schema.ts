import { z } from 'zod';

export const FieldType = z.enum([
  'text',
  'email',
  'tel',
  'number',
  'password',
  'search',
  'url',
  'ssn',
  'zip',
  'textarea',
  'select',
  'combobox',
  'radio',
  'checkbox',
  'checkbox-group',
  'date',
  'memorable-date',
  'file',
  'toggle',
]);

export type FieldType = z.infer<typeof FieldType>;

export const FieldOption = z.object({
  value: z.string(),
  label: z.string(),
  disabled: z.boolean().optional(),
});

export type FieldOption = z.infer<typeof FieldOption>;

export const ConditionExpression = z.object({
  field: z.string(),
  operator: z.enum(['eq', 'neq', 'in', 'notIn', 'exists', 'notExists']),
  value: z.union([z.string(), z.array(z.string())]).optional(),
});

export type ConditionExpression = z.infer<typeof ConditionExpression>;

export interface FormField {
  type: FieldType;
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  options?: FieldOption[];
  maxlength?: number;
  minlength?: number;
  pattern?: string;
  min?: string;
  max?: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  autocomplete?: string;
  inputmode?: string;
  rows?: number;
  children?: FormField[];
  visibleWhen?: ConditionExpression;
  requiredWhen?: ConditionExpression;
  entityType?: string;
}

export const FormField: z.ZodType<FormField> = z.object({
  type: FieldType,
  name: z.string(),
  label: z.string(),
  hint: z.string().optional(),
  required: z.boolean().optional(),
  disabled: z.boolean().optional(),
  placeholder: z.string().optional(),
  value: z.string().optional(),
  options: z.array(FieldOption).optional(),
  maxlength: z.number().optional(),
  minlength: z.number().optional(),
  pattern: z.string().optional(),
  min: z.string().optional(),
  max: z.string().optional(),
  accept: z.string().optional(),
  multiple: z.boolean().optional(),
  maxFiles: z.number().optional(),
  maxSize: z.number().optional(),
  autocomplete: z.string().optional(),
  inputmode: z.string().optional(),
  rows: z.number().optional(),
  children: z.lazy(() => z.array(FormField)).optional(),
  visibleWhen: ConditionExpression.optional(),
  requiredWhen: ConditionExpression.optional(),
  entityType: z.string().optional(),
});

export const FormSection = z.object({
  heading: z.string().optional(),
  fields: z.array(FormField),
  repeatable: z.boolean().optional(),
  repeatableKey: z.string().optional(),
  repeatableMin: z.number().optional(),
  repeatableMax: z.number().optional(),
  repeatableAddLabel: z.string().optional(),
  repeatableRemoveLabel: z.string().optional(),
  ref: z.string().optional(),
  namespace: z.string().optional(),
});

export type FormSection = z.infer<typeof FormSection>;

export const SubFormDefinition = z.object({
  description: z.string().optional(),
  fields: z.array(FormField),
});

export type SubFormDefinition = z.infer<typeof SubFormDefinition>;

export const CrossFieldRule = z.object({
  id: z.string(),
  description: z.string(),
  when: ConditionExpression,
  then: z.object({
    action: z.enum(['require', 'show', 'hide', 'setError']),
    targets: z.array(z.string()),
    message: z.string().optional(),
  }),
});

export type CrossFieldRule = z.infer<typeof CrossFieldRule>;

export const FormSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  action: z.string().optional(),
  method: z.string().optional(),
  sections: z.array(FormSection),
  subForms: z.record(z.string(), SubFormDefinition).optional(),
  crossFieldRules: z.array(CrossFieldRule).optional(),
});

export type FormSchema = z.infer<typeof FormSchema>;
