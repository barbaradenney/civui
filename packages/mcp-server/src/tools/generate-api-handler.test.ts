import { describe, it, expect } from 'vitest';
import { generateApiHandler } from './generate-api-handler.js';
import type { FormSchema } from '../schema/index.js';

function schema(overrides?: { action?: string }): FormSchema {
  return {
    action: overrides?.action,
    sections: [
      {
        fields: [
          { type: 'text', name: 'fullName', label: 'Full name', required: true },
          { type: 'email', name: 'email', label: 'Email', required: true },
          { type: 'number', name: 'age', label: 'Age', min: '18', max: '120' },
          { type: 'checkbox', name: 'agree', label: 'I agree', required: true },
        ],
      },
    ],
  };
}

describe('generateApiHandler', () => {
  it('throws when schema has no sections', () => {
    expect(() => generateApiHandler({ sections: [] })).toThrow(
      'Schema must have at least one section',
    );
  });

  it('returns code, features, routes', () => {
    const result = generateApiHandler(schema());
    expect(result).toHaveProperty('code');
    expect(result).toHaveProperty('features');
    expect(result).toHaveProperty('routes');
    expect(typeof result.code).toBe('string');
    expect(Array.isArray(result.routes)).toBe(true);
  });

  // --- Express ---
  it('express: generates Router import', () => {
    const result = generateApiHandler(schema(), { framework: 'express' });
    expect(result.code).toContain("import { Router } from 'express'");
  });

  it('express: generates POST route', () => {
    const result = generateApiHandler(schema(), { framework: 'express' });
    expect(result.code).toContain("router.post('/api/submit'");
    expect(result.routes).toContain('POST /api/submit');
  });

  it('express: uses custom action path', () => {
    const result = generateApiHandler(schema({ action: '/forms/apply' }), { framework: 'express' });
    expect(result.code).toContain("'/forms/apply'");
    expect(result.routes).toContain('POST /forms/apply');
  });

  it('express: includes Zod validation by default', () => {
    const result = generateApiHandler(schema(), { framework: 'express' });
    expect(result.code).toContain("import { z } from 'zod'");
    expect(result.code).toContain('const formSchema = z.object({');
    expect(result.code).toContain('safeParse');
    expect(result.features).toContain('zod-validation');
  });

  it('express: omits validation when disabled', () => {
    const result = generateApiHandler(schema(), {
      framework: 'express',
      includeValidation: false,
    });
    expect(result.code).not.toContain("import { z }");
    expect(result.features).not.toContain('zod-validation');
  });

  // --- Hono ---
  it('hono: generates Hono import and zValidator', () => {
    const result = generateApiHandler(schema(), { framework: 'hono' });
    expect(result.code).toContain("import { Hono } from 'hono'");
    expect(result.code).toContain("import { zValidator }");
    expect(result.features).toContain('hono');
  });

  it('hono: generates app.post route', () => {
    const result = generateApiHandler(schema(), { framework: 'hono' });
    expect(result.code).toContain("app.post('/api/submit'");
  });

  // --- Fastify ---
  it('fastify: generates FastifyInstance import', () => {
    const result = generateApiHandler(schema(), { framework: 'fastify' });
    expect(result.code).toContain("FastifyInstance");
    expect(result.features).toContain('fastify');
  });

  it('fastify: generates fastify.post route', () => {
    const result = generateApiHandler(schema(), { framework: 'fastify' });
    expect(result.code).toContain("fastify.post('/api/submit'");
  });

  // --- Types ---
  it('includes TypeScript interface by default', () => {
    const result = generateApiHandler(schema());
    expect(result.code).toContain('interface FormData');
    expect(result.code).toContain('fullName: string');
    expect(result.code).toContain('age?: number');
    expect(result.code).toContain('agree: boolean');
    expect(result.features).toContain('typed-request');
  });

  it('omits types when disabled', () => {
    const result = generateApiHandler(schema(), { includeTypes: false });
    expect(result.code).not.toContain('interface FormData');
    expect(result.features).not.toContain('typed-request');
  });

  // --- Validation schema ---
  it('returns validationSchema when validation is enabled', () => {
    const result = generateApiHandler(schema());
    expect(result.validationSchema).toBeDefined();
    expect(result.validationSchema).toContain('z.object');
  });

  it('default framework is express', () => {
    const result = generateApiHandler(schema());
    expect(result.features).toContain('express');
  });
});
