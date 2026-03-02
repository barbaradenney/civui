/**
 * generate_api_handler tool — server-side route handler skeleton with
 * Zod validation, typed request bodies, and per-field error responses.
 */
import type { FormSchema, FormField } from '../schema/index.js';
import { collectFields } from './html-utils.js';

export interface ApiHandlerResult {
  code: string;
  features: string[];
  routes: string[];
  validationSchema?: string;
}

function fieldToZodType(field: FormField): string {
  const base = (() => {
    switch (field.type) {
      case 'number':
        return 'z.coerce.number()';
      case 'email':
        return 'z.string().email()';
      case 'url':
        return 'z.string().url()';
      case 'checkbox':
      case 'toggle':
        return 'z.boolean()';
      case 'file':
        return 'z.string()';
      case 'checkbox-group':
        return 'z.array(z.string())';
      default:
        return 'z.string()';
    }
  })();

  let chain = base;

  if (field.minlength) {
    chain += `.min(${field.minlength})`;
  }
  if (field.maxlength) {
    chain += `.max(${field.maxlength})`;
  }
  if (field.pattern) {
    const escapedPattern = field.pattern.replace(/\//g, '\\/');
    chain += `.regex(/${escapedPattern}/)`;
  }

  if (!field.required) {
    chain += '.optional()';
  }

  return chain;
}

function fieldToTsType(field: FormField): string {
  switch (field.type) {
    case 'number':
      return 'number';
    case 'checkbox':
    case 'toggle':
      return 'boolean';
    case 'checkbox-group':
      return 'string[]';
    default:
      return 'string';
  }
}

function generateExpress(
  schema: FormSchema,
  fields: FormField[],
  includeValidation: boolean,
  includeTypes: boolean,
): { code: string; routes: string[] } {
  const lines: string[] = [];
  const routePath = schema.action ?? '/api/submit';

  if (includeValidation) {
    lines.push("import { z } from 'zod';");
  }
  lines.push("import { Router } from 'express';");
  lines.push('');

  if (includeTypes) {
    lines.push('interface FormData {');
    for (const field of fields) {
      const optional = !field.required ? '?' : '';
      lines.push(`  ${field.name}${optional}: ${fieldToTsType(field)};`);
    }
    lines.push('}');
    lines.push('');
  }

  if (includeValidation) {
    lines.push('const formSchema = z.object({');
    for (const field of fields) {
      lines.push(`  ${field.name}: ${fieldToZodType(field)},`);
    }
    lines.push('});');
    lines.push('');
  }

  lines.push('const router = Router();');
  lines.push('');
  lines.push(`router.post('${routePath}', async (req, res) => {`);

  if (includeValidation) {
    lines.push('  const parsed = formSchema.safeParse(req.body);');
    lines.push('  if (!parsed.success) {');
    lines.push('    const fieldErrors: Record<string, string> = {};');
    lines.push('    for (const issue of parsed.error.issues) {');
    lines.push('      const field = issue.path.join(".");');
    lines.push('      fieldErrors[field] = issue.message;');
    lines.push('    }');
    lines.push('    return res.status(400).json({ errors: fieldErrors });');
    lines.push('  }');
    lines.push('  const data = parsed.data;');
  } else {
    lines.push(`  const data = req.body${includeTypes ? ' as FormData' : ''};`);
  }

  lines.push('');
  lines.push('  // TODO: Process form submission');
  lines.push('  // TODO: Save to database');
  lines.push('');
  lines.push('  return res.json({ success: true, message: "Form submitted successfully" });');
  lines.push('});');
  lines.push('');
  lines.push('export default router;');

  return { code: lines.join('\n'), routes: [`POST ${routePath}`] };
}

function generateHono(
  schema: FormSchema,
  fields: FormField[],
  includeValidation: boolean,
  includeTypes: boolean,
): { code: string; routes: string[] } {
  const lines: string[] = [];
  const routePath = schema.action ?? '/api/submit';

  if (includeValidation) {
    lines.push("import { z } from 'zod';");
    lines.push("import { zValidator } from '@hono/zod-validator';");
  }
  lines.push("import { Hono } from 'hono';");
  lines.push('');

  if (includeTypes && !includeValidation) {
    lines.push('interface FormData {');
    for (const field of fields) {
      const optional = !field.required ? '?' : '';
      lines.push(`  ${field.name}${optional}: ${fieldToTsType(field)};`);
    }
    lines.push('}');
    lines.push('');
  }

  if (includeValidation) {
    lines.push('const formSchema = z.object({');
    for (const field of fields) {
      lines.push(`  ${field.name}: ${fieldToZodType(field)},`);
    }
    lines.push('});');
    lines.push('');
  }

  lines.push('const app = new Hono();');
  lines.push('');

  if (includeValidation) {
    lines.push(`app.post('${routePath}', zValidator('json', formSchema), async (c) => {`);
    lines.push('  const data = c.req.valid(\'json\');');
  } else {
    lines.push(`app.post('${routePath}', async (c) => {`);
    lines.push(`  const data = await c.req.json${includeTypes ? '<FormData>' : ''}();`);
  }

  lines.push('');
  lines.push('  // TODO: Process form submission');
  lines.push('  // TODO: Save to database');
  lines.push('');
  lines.push('  return c.json({ success: true, message: "Form submitted successfully" });');
  lines.push('});');
  lines.push('');
  lines.push('export default app;');

  return { code: lines.join('\n'), routes: [`POST ${routePath}`] };
}

function generateFastify(
  schema: FormSchema,
  fields: FormField[],
  includeValidation: boolean,
  includeTypes: boolean,
): { code: string; routes: string[] } {
  const lines: string[] = [];
  const routePath = schema.action ?? '/api/submit';

  if (includeValidation) {
    lines.push("import { z } from 'zod';");
  }
  lines.push("import { FastifyInstance } from 'fastify';");
  lines.push('');

  if (includeTypes) {
    lines.push('interface FormData {');
    for (const field of fields) {
      const optional = !field.required ? '?' : '';
      lines.push(`  ${field.name}${optional}: ${fieldToTsType(field)};`);
    }
    lines.push('}');
    lines.push('');
  }

  if (includeValidation) {
    lines.push('const formSchema = z.object({');
    for (const field of fields) {
      lines.push(`  ${field.name}: ${fieldToZodType(field)},`);
    }
    lines.push('});');
    lines.push('');
  }

  lines.push('export default async function routes(fastify: FastifyInstance) {');
  lines.push(`  fastify.post('${routePath}', async (request, reply) => {`);

  if (includeValidation) {
    lines.push('    const parsed = formSchema.safeParse(request.body);');
    lines.push('    if (!parsed.success) {');
    lines.push('      const fieldErrors: Record<string, string> = {};');
    lines.push('      for (const issue of parsed.error.issues) {');
    lines.push('        const field = issue.path.join(".");');
    lines.push('        fieldErrors[field] = issue.message;');
    lines.push('      }');
    lines.push('      return reply.status(400).send({ errors: fieldErrors });');
    lines.push('    }');
    lines.push('    const data = parsed.data;');
  } else {
    lines.push(`    const data = request.body${includeTypes ? ' as FormData' : ''};`);
  }

  lines.push('');
  lines.push('    // TODO: Process form submission');
  lines.push('    // TODO: Save to database');
  lines.push('');
  lines.push('    return reply.send({ success: true, message: "Form submitted successfully" });');
  lines.push('  });');
  lines.push('}');

  return { code: lines.join('\n'), routes: [`POST ${routePath}`] };
}

export function generateApiHandler(
  schema: FormSchema,
  options?: {
    framework?: 'express' | 'hono' | 'fastify';
    includeValidation?: boolean;
    includeTypes?: boolean;
  },
): ApiHandlerResult {
  if (!schema.sections || schema.sections.length === 0) {
    throw new Error('Schema must have at least one section');
  }

  const framework = options?.framework ?? 'express';
  const includeValidation = options?.includeValidation !== false;
  const includeTypes = options?.includeTypes !== false;
  const fields = collectFields(schema);

  const features: string[] = ['api-handler', framework];
  if (includeValidation) features.push('zod-validation');
  if (includeTypes) features.push('typed-request');

  let result: { code: string; routes: string[] };

  switch (framework) {
    case 'hono':
      result = generateHono(schema, fields, includeValidation, includeTypes);
      break;
    case 'fastify':
      result = generateFastify(schema, fields, includeValidation, includeTypes);
      break;
    case 'express':
    default:
      result = generateExpress(schema, fields, includeValidation, includeTypes);
      break;
  }

  const output: ApiHandlerResult = {
    code: result.code,
    features,
    routes: result.routes,
  };

  if (includeValidation) {
    // Extract just the validation schema portion
    const schemaStart = result.code.indexOf('const formSchema = z.object({');
    const schemaEnd = result.code.indexOf('});', schemaStart) + 3;
    if (schemaStart !== -1 && schemaEnd > schemaStart) {
      output.validationSchema = result.code.substring(schemaStart, schemaEnd);
    }
  }

  return output;
}
