/**
 * Workflow & case management tool definitions.
 */

import { z } from 'zod';
import { FormSchema } from '../schema/index.js';
import {
  generateWorkflowUi,
  generateDelegationSections,
  generateFeedbackUi,
  generateCaseDashboard,
  generateAuditTrail,
  generateAmendmentFlow,
  generateDecisionNotice,
  generateEmailTemplate,
  generatePdfNotice,
  generateLockMatrix,
  generateSectionProgress,
  generateApiHandler,
} from '../tools/index.js';
import type { ToolDefinition } from './types.js';

export const WORKFLOW_TOOLS: ToolDefinition[] = [
  {
    name: 'generate_workflow_ui',
    description:
      'Generate workflow status banner, transition buttons, and companion JavaScript ' +
      'for multi-actor form workflows. Shows current state, available actions, and ' +
      'handles confirmation dialogs, comment requirements, and section-complete validation.',
    params: {
      schema: FormSchema.describe('Form schema with workflow definition'),
      currentState: z
        .string()
        .optional()
        .describe('Current workflow state ID (default: initialState)'),
      currentActor: z
        .string()
        .optional()
        .describe('Current actor ID (default: first actor)'),
    },
    handler: ({ schema, currentState, currentActor }) =>
      generateWorkflowUi(schema, currentState, currentActor),
  },
  {
    name: 'generate_delegation_sections',
    description:
      'Generate representative information, attestation, and consent sections for ' +
      'delegation/representative forms. Produces FormSection objects ready to merge, ' +
      'attestation HTML, and cross-field rules for conditional delegation fields.',
    params: {
      schema: FormSchema.describe('Form schema with delegation configuration'),
      delegationType: z
        .string()
        .optional()
        .describe('Filter to a specific delegation type ID (default: all types)'),
    },
    handler: ({ schema, delegationType }) =>
      generateDelegationSections(schema, delegationType),
  },
  {
    name: 'generate_feedback_ui',
    description:
      'Generate inline comment/feedback panels for reviewer and applicant modes. ' +
      'Supports section-level or field-level granularity, existing comments, ' +
      'resolution tracking, and custom events for feedback submission.',
    params: {
      schema: FormSchema.describe(
        'Form schema with feedback configuration or workflow with allowsFeedback',
      ),
      mode: z
        .enum(['reviewer', 'applicant'])
        .optional()
        .default('reviewer')
        .describe('Feedback mode: reviewer (add comments) or applicant (read-only)'),
      existingComments: z
        .array(
          z.object({
            target: z.string(),
            author: z.string(),
            text: z.string(),
            timestamp: z.string().optional(),
            resolved: z.boolean().optional(),
          }),
        )
        .optional()
        .describe('Existing comments to render'),
    },
    handler: ({ schema, mode, existingComments }) =>
      generateFeedbackUi(schema, { mode, existingComments }),
  },
  {
    name: 'generate_case_dashboard',
    description:
      'Generate a composed case-style dashboard combining workflow status, ' +
      'section progress, and audit trail into a responsive two-column layout. ' +
      'Returns merged HTML, JavaScript, and feature summary.',
    params: {
      schema: FormSchema.describe('Form schema with workflow definition'),
      currentState: z
        .string()
        .optional()
        .describe('Current workflow state ID'),
      currentActor: z
        .string()
        .optional()
        .describe('Current actor ID'),
      completedValues: z
        .record(z.string(), z.union([z.string(), z.array(z.string())]))
        .optional()
        .describe('Map of field names to their current values'),
      auditEntries: z
        .array(
          z.object({
            timestamp: z.string(),
            actor: z.string(),
            action: z.string(),
            details: z.string().optional(),
            stateFrom: z.string().optional(),
            stateTo: z.string().optional(),
          }),
        )
        .optional()
        .describe('Audit trail entries'),
    },
    handler: ({ schema, currentState, currentActor, completedValues, auditEntries }) =>
      generateCaseDashboard(schema, {
        currentState,
        currentActor,
        completedValues,
        auditEntries,
      }),
  },
  {
    name: 'generate_audit_trail',
    description:
      'Generate a timeline/history component for case-style forms. ' +
      'Renders chronologically sorted entries with timestamps, actor badges, ' +
      'action descriptions, state transitions, and detail text.',
    params: {
      schema: FormSchema.describe('Form schema with workflow or actors'),
      entries: z
        .array(
          z.object({
            timestamp: z.string().describe('ISO 8601 timestamp'),
            actor: z.string().describe('Actor ID or name'),
            action: z.string().describe('Action description'),
            details: z.string().optional(),
            stateFrom: z.string().optional(),
            stateTo: z.string().optional(),
          }),
        )
        .describe('Audit trail entries to render'),
    },
    handler: ({ schema, entries }) => generateAuditTrail(schema, entries),
  },
  {
    name: 'generate_amendment_flow',
    description:
      'Generate a post-submission amendment request UI with a diff table showing ' +
      'original vs amended values, optional reason textarea, and approval notice.',
    params: {
      schema: FormSchema.describe('Form schema for field labels'),
      originalValues: z
        .record(z.string(), z.string())
        .describe('Original submitted values (name → value)'),
      amendedValues: z
        .record(z.string(), z.string())
        .describe('Amended values (name → value)'),
      requiresReason: z
        .boolean()
        .optional()
        .describe('Show reason textarea (default: true)'),
      requiresApproval: z
        .boolean()
        .optional()
        .describe('Show approval notice (default: false)'),
    },
    handler: ({ schema, originalValues, amendedValues, requiresReason, requiresApproval }) =>
      generateAmendmentFlow(schema, originalValues, amendedValues, {
        requiresReason,
        requiresApproval,
      }),
  },
  {
    name: 'generate_decision_notice',
    description:
      'Generate a formal approval/denial letter with merge-field substitution, ' +
      'legal citations, appeal information, and print support.',
    params: {
      schema: FormSchema.describe('Form schema with decisionNotice configuration'),
      decision: z
        .string()
        .describe('Decision key matching a template (e.g., "approved", "denied")'),
      formData: z
        .record(z.string(), z.string())
        .describe('Form data for merge field substitution (fieldName → value)'),
    },
    handler: ({ schema, decision, formData }) =>
      generateDecisionNotice(schema, decision, formData),
  },
  {
    name: 'generate_email_template',
    description:
      'Generate an HTML email (confirmation or decision) with inline CSS, ' +
      'table layout, and plain text fallback. Email-client compatible.',
    params: {
      schema: FormSchema.describe('Form schema to generate email from'),
      type: z.enum(['confirmation', 'decision']).describe('Email type'),
      formData: z
        .record(z.string(), z.union([z.string(), z.array(z.string())]))
        .optional()
        .describe('Form submission data'),
      decision: z.string().optional().describe('Decision key (required for decision type)'),
      replyTo: z.string().optional().describe('Reply-to email address'),
      subject: z.string().optional().describe('Custom email subject line'),
    },
    handler: ({ schema, type, formData, decision, replyTo, subject }) =>
      generateEmailTemplate(schema, {
        type,
        formData,
        decision,
        replyTo,
        subject,
      }),
  },
  {
    name: 'generate_pdf_notice',
    description:
      'Generate a print-optimized decision notice with @media print CSS, ' +
      'page break rules, and running headers for PDF generation.',
    params: {
      schema: FormSchema.describe('Form schema with decisionNotice configuration'),
      decision: z
        .string()
        .describe('Decision key matching a template (e.g., "approved", "denied")'),
      formData: z
        .record(z.string(), z.string())
        .describe('Form data for merge field substitution'),
      includeHeader: z
        .boolean()
        .optional()
        .describe('Include running header with agency name (default: true)'),
      pageSize: z
        .enum(['letter', 'a4'])
        .optional()
        .describe('Page size (default: "letter")'),
      orientation: z
        .enum(['portrait', 'landscape'])
        .optional()
        .describe('Page orientation (default: "portrait")'),
    },
    handler: ({ schema, decision, formData, includeHeader, pageSize, orientation }) =>
      generatePdfNotice(schema, decision, formData, {
        includeHeader,
        pageSize,
        orientation,
      }),
  },
  {
    name: 'generate_lock_matrix',
    description:
      'Generate a state x actor permission matrix showing which sections are editable, ' +
      'readonly, or hidden for each workflow state and actor combination. ' +
      'Returns matrix data, markdown summary table, and data attribute documentation.',
    params: {
      schema: FormSchema.describe('Form schema with workflow and actors'),
    },
    handler: ({ schema }) => generateLockMatrix(schema),
  },
  {
    name: 'generate_section_progress',
    description:
      'Generate a section completion checklist with progress tracking. ' +
      'Shows complete/incomplete/not-started status per section, ' +
      'overall percentage, anchor links, and JavaScript for dynamic updates.',
    params: {
      schema: FormSchema.describe('Form schema with sections'),
      completedValues: z
        .record(z.string(), z.union([z.string(), z.array(z.string())]))
        .optional()
        .describe('Map of field names to their current values for completion calculation'),
    },
    handler: ({ schema, completedValues }) =>
      generateSectionProgress(schema, completedValues),
  },
  {
    name: 'generate_api_handler',
    description:
      'Generate a server-side API route handler with Zod validation, typed request bodies, ' +
      'and per-field error responses. Supports Express, Hono, and Fastify.',
    params: {
      schema: FormSchema.describe('Form schema to derive handler from'),
      framework: z
        .enum(['express', 'hono', 'fastify'])
        .optional()
        .describe('Server framework (default: "express")'),
      includeValidation: z
        .boolean()
        .optional()
        .describe('Include Zod validation schema (default: true)'),
      includeTypes: z
        .boolean()
        .optional()
        .describe('Include TypeScript interface (default: true)'),
    },
    handler: ({ schema, framework, includeValidation, includeTypes }) =>
      generateApiHandler(schema, {
        framework,
        includeValidation,
        includeTypes,
      }),
  },
];
