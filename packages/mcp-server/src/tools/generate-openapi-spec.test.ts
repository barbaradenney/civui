import { describe, it, expect } from 'vitest';
import { generateOpenApiSpec } from './generate-openapi-spec.js';
import type { FormSchema } from '../schema/index.js';

describe('generateOpenApiSpec', () => {
  const basicSchema: FormSchema = {
    title: 'Test Form',
    description: 'A test form',
    sections: [{ fields: [{ type: 'text', name: 'name', label: 'Full name' }] }],
  };

  it('generates valid OpenAPI 3.0.3 structure', () => {
    const result = generateOpenApiSpec(basicSchema);
    expect(result.spec.openapi).toBe('3.0.3');
  });

  it('populates info section from schema title and description', () => {
    const result = generateOpenApiSpec(basicSchema);
    const info = result.spec.info as Record<string, unknown>;
    expect(info.title).toBe('Test Form');
    expect(info.description).toBe('A test form');
    expect(info.version).toBe('1.0.0');
  });

  it('maps text field to string property', () => {
    const result = generateOpenApiSpec(basicSchema);
    const paths = result.spec.paths as Record<string, unknown>;
    const post = (paths['/api/submit'] as Record<string, unknown>).post as Record<string, unknown>;
    const body = post.requestBody as Record<string, unknown>;
    const content = (body.content as Record<string, unknown>)['application/json'] as Record<string, unknown>;
    const schema = content.schema as Record<string, unknown>;
    const props = schema.properties as Record<string, Record<string, unknown>>;
    expect(props.name.type).toBe('string');
  });

  it('maps number field to number property', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [{ fields: [{ type: 'number', name: 'age', label: 'Age' }] }],
    };
    const result = generateOpenApiSpec(schema);
    const paths = result.spec.paths as Record<string, unknown>;
    const post = (paths['/api/submit'] as Record<string, unknown>).post as Record<string, unknown>;
    const body = post.requestBody as Record<string, unknown>;
    const content = (body.content as Record<string, unknown>)['application/json'] as Record<string, unknown>;
    const s = content.schema as Record<string, unknown>;
    const props = s.properties as Record<string, Record<string, unknown>>;
    expect(props.age.type).toBe('number');
  });

  it('includes required fields in schema.required', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [{ fields: [{ type: 'text', name: 'name', label: 'Name', required: true }] }],
    };
    const result = generateOpenApiSpec(schema);
    const paths = result.spec.paths as Record<string, unknown>;
    const post = (paths['/api/submit'] as Record<string, unknown>).post as Record<string, unknown>;
    const body = post.requestBody as Record<string, unknown>;
    const content = (body.content as Record<string, unknown>)['application/json'] as Record<string, unknown>;
    const s = content.schema as Record<string, unknown>;
    expect(s.required).toContain('name');
  });

  it('maps select field to string with enum', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [{
        fields: [{
          type: 'select',
          name: 'state',
          label: 'State',
          options: [{ value: 'ca', label: 'California' }, { value: 'ny', label: 'New York' }],
        }],
      }],
    };
    const result = generateOpenApiSpec(schema);
    const paths = result.spec.paths as Record<string, unknown>;
    const post = (paths['/api/submit'] as Record<string, unknown>).post as Record<string, unknown>;
    const body = post.requestBody as Record<string, unknown>;
    const content = (body.content as Record<string, unknown>)['application/json'] as Record<string, unknown>;
    const s = content.schema as Record<string, unknown>;
    const props = s.properties as Record<string, Record<string, unknown>>;
    expect(props.state.enum).toEqual(['ca', 'ny']);
  });

  it('maps checkbox-group to array of strings', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [{
        fields: [{
          type: 'checkbox-group',
          name: 'benefits',
          label: 'Benefits',
          options: [{ value: 'health', label: 'Health' }],
        }],
      }],
    };
    const result = generateOpenApiSpec(schema);
    const paths = result.spec.paths as Record<string, unknown>;
    const post = (paths['/api/submit'] as Record<string, unknown>).post as Record<string, unknown>;
    const body = post.requestBody as Record<string, unknown>;
    const content = (body.content as Record<string, unknown>)['application/json'] as Record<string, unknown>;
    const s = content.schema as Record<string, unknown>;
    const props = s.properties as Record<string, Record<string, unknown>>;
    expect(props.benefits.type).toBe('array');
  });

  it('uses multipart/form-data for file upload fields', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [{ fields: [{ type: 'file', name: 'doc', label: 'Document' }] }],
    };
    const result = generateOpenApiSpec(schema);
    const paths = result.spec.paths as Record<string, unknown>;
    const post = (paths['/api/submit'] as Record<string, unknown>).post as Record<string, unknown>;
    const body = post.requestBody as Record<string, unknown>;
    const content = body.content as Record<string, unknown>;
    expect(content['multipart/form-data']).toBeDefined();
    expect(result.features).toContain('file-upload');
  });

  it('maps repeatable section to array of objects', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [{
        heading: 'Dependents',
        repeatable: true,
        repeatableKey: 'dependents',
        fields: [{ type: 'text', name: 'dep-name', label: 'Dependent name' }],
      }],
    };
    const result = generateOpenApiSpec(schema);
    const paths = result.spec.paths as Record<string, unknown>;
    const post = (paths['/api/submit'] as Record<string, unknown>).post as Record<string, unknown>;
    const body = post.requestBody as Record<string, unknown>;
    const content = (body.content as Record<string, unknown>)['application/json'] as Record<string, unknown>;
    const s = content.schema as Record<string, unknown>;
    const props = s.properties as Record<string, Record<string, unknown>>;
    expect(props.dependents.type).toBe('array');
    expect(result.features).toContain('repeatable');
  });

  it('maps namespace section to nested object', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [{
        namespace: 'address',
        fields: [
          { type: 'text', name: 'street', label: 'Street' },
          { type: 'text', name: 'city', label: 'City' },
        ],
      }],
    };
    const result = generateOpenApiSpec(schema);
    const paths = result.spec.paths as Record<string, unknown>;
    const post = (paths['/api/submit'] as Record<string, unknown>).post as Record<string, unknown>;
    const body = post.requestBody as Record<string, unknown>;
    const content = (body.content as Record<string, unknown>)['application/json'] as Record<string, unknown>;
    const s = content.schema as Record<string, unknown>;
    const props = s.properties as Record<string, Record<string, unknown>>;
    expect(props.address.type).toBe('object');
    expect(result.features).toContain('namespace');
  });

  it('uses custom basePath', () => {
    const result = generateOpenApiSpec(basicSchema, { basePath: '/v1' });
    const paths = result.spec.paths as Record<string, unknown>;
    expect(paths['/v1/submit']).toBeDefined();
  });

  it('uses custom operationId', () => {
    const result = generateOpenApiSpec(basicSchema, { operationId: 'submitTestForm' });
    const paths = result.spec.paths as Record<string, unknown>;
    const post = (paths['/api/submit'] as Record<string, unknown>).post as Record<string, unknown>;
    expect(post.operationId).toBe('submitTestForm');
  });

  it('uses custom tags', () => {
    const result = generateOpenApiSpec(basicSchema, { tags: ['Applications'] });
    const paths = result.spec.paths as Record<string, unknown>;
    const post = (paths['/api/submit'] as Record<string, unknown>).post as Record<string, unknown>;
    expect(post.tags).toEqual(['Applications']);
  });

  it('includes examples when includeExamples is true', () => {
    const result = generateOpenApiSpec(basicSchema, { includeExamples: true });
    const paths = result.spec.paths as Record<string, unknown>;
    const post = (paths['/api/submit'] as Record<string, unknown>).post as Record<string, unknown>;
    const body = post.requestBody as Record<string, unknown>;
    const content = (body.content as Record<string, unknown>)['application/json'] as Record<string, unknown>;
    expect(content.example).toBeDefined();
    expect(result.features).toContain('examples');
  });

  it('generates non-empty YAML output', () => {
    const result = generateOpenApiSpec(basicSchema);
    expect(result.yaml).toBeTruthy();
    expect(result.yaml.length).toBeGreaterThan(0);
    expect(result.yaml).toContain('openapi');
  });

  it('includes 400 validation error response schema', () => {
    const result = generateOpenApiSpec(basicSchema);
    const paths = result.spec.paths as Record<string, unknown>;
    const post = (paths['/api/submit'] as Record<string, unknown>).post as Record<string, unknown>;
    const responses = post.responses as Record<string, Record<string, unknown>>;
    expect(responses['400']).toBeDefined();
    expect(responses['400'].description).toBe('Validation Error');
  });

  it('reports correct fieldCount', () => {
    const result = generateOpenApiSpec(basicSchema);
    expect(result.fieldCount).toBe(1);
  });
});
