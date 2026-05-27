/**
 * generate_feedback_ui tool — generate inline comment/feedback panels
 * for reviewer and applicant modes in multi-actor workflows.
 */
import type { FormSchema } from '../schema/index.js';
import { escapeHtml, slugify } from './html-utils.js';

export interface FeedbackComment {
  target: string;
  author: string;
  text: string;
  timestamp?: string;
  resolved?: boolean;
}

export interface FeedbackUiResult {
  html: string;
  javascript: string;
  features: string[];
  commentTargets: Array<{ name: string; type: 'section' | 'field' }>;
}

export function generateFeedbackUi(
  schema: FormSchema,
  options?: {
    mode?: 'reviewer' | 'applicant';
    existingComments?: FeedbackComment[];
  },
): FeedbackUiResult {
  const hasFeedbackConfig = !!schema.feedback;
  const hasWorkflowFeedback = schema.workflow?.states.some((s) => s.allowsFeedback);

  if (!hasFeedbackConfig && !hasWorkflowFeedback) {
    throw new Error(
      'Schema must have a `feedback` configuration or workflow states with `allowsFeedback` to generate feedback UI',
    );
  }

  const mode = options?.mode ?? 'reviewer';
  const existingComments = options?.existingComments ?? [];
  const granularity = schema.feedback?.granularity ?? 'section';
  const requiresResolution = schema.feedback?.requiresResolution ?? false;
  const features: string[] = ['feedback'];
  const commentTargets: FeedbackUiResult['commentTargets'] = [];

  // Determine targets based on granularity
  if (granularity === 'section') {
    features.push('section-level-feedback');
    for (const section of schema.sections) {
      const heading = section.heading ?? 'Untitled section';
      commentTargets.push({ name: heading, type: 'section' });
    }
  } else {
    features.push('field-level-feedback');
    for (const section of schema.sections) {
      for (const field of section.fields) {
        commentTargets.push({ name: field.name, type: 'field' });
      }
    }
  }

  // Generate HTML
  const htmlParts: string[] = [];

  if (requiresResolution) {
    features.push('requires-resolution');
    const unresolved = existingComments.filter((c) => !c.resolved);
    if (unresolved.length > 0) {
      htmlParts.push(
        `<div class="civ-p-4 civ-mb-4 civ-bg-warning-lightest civ-border civ-border-warning civ-rounded" role="alert">`,
        `  <p class="civ-font-bold">${unresolved.length} unresolved comment${unresolved.length === 1 ? '' : 's'}</p>`,
        `  <ul class="civ-mt-2 civ-list-disc civ-ps-6">`,
      );
      for (const c of unresolved) {
        const slug = slugify(c.target);
        htmlParts.push(
          `    <li><a href="#feedback-${escapeHtml(slug)}" class="civ-text-primary civ-underline">${escapeHtml(c.target)}: ${escapeHtml(c.text.substring(0, 80))}</a></li>`,
        );
      }
      htmlParts.push(`  </ul>`, `</div>`);
    }
  }

  for (const target of commentTargets) {
    const slug = slugify(target.name);
    const targetComments = existingComments.filter((c) => c.target === target.name);

    // Trigger button before the panel it controls
    htmlParts.push(
      `<button type="button" data-civ-feedback-trigger="${escapeHtml(target.name)}" ` +
        `aria-expanded="false" aria-controls="feedback-${escapeHtml(slug)}" ` +
        `class="civ-text-sm civ-text-primary civ-underline">` +
        `${targetComments.length > 0 ? `Comments (${targetComments.length})` : 'Add comment'}` +
        `</button>`,
    );

    htmlParts.push(
      `<div id="feedback-${escapeHtml(slug)}" data-civ-feedback-panel="${escapeHtml(target.name)}" ` +
        `role="complementary" aria-label="Feedback for ${escapeHtml(target.name)}" ` +
        `class="civ-p-4 civ-border civ-rounded civ-mt-2" hidden>`,
    );

    if (targetComments.length > 0) {
      for (const comment of targetComments) {
        const resolvedClass = comment.resolved ? ' civ-opacity-60' : '';
        htmlParts.push(
          `  <div class="civ-mb-2 civ-p-2 civ-border-s-4 civ-border-primary${resolvedClass}">`,
          `    <p class="civ-text-sm civ-font-bold">${escapeHtml(comment.author)}${comment.timestamp ? ` <time datetime="${escapeHtml(comment.timestamp)}">${escapeHtml(comment.timestamp)}</time>` : ''}</p>`,
          `    <p>${escapeHtml(comment.text)}</p>`,
          comment.resolved ? '    <p class="civ-text-sm civ-text-success">Resolved</p>' : '',
          `  </div>`,
        );
      }
    } else {
      htmlParts.push(`  <p class="civ-text-sm">No comments</p>`);
    }

    if (mode === 'reviewer') {
      htmlParts.push(
        `  <div class="civ-mt-2">`,
        `    <label for="comment-${escapeHtml(slug)}" class="civ-text-sm civ-font-bold">Add comment</label>`,
        `    <textarea id="comment-${escapeHtml(slug)}" class="civ-input civ-mt-1" rows="3"></textarea>`,
        `    <button type="button" data-civ-feedback-submit="${escapeHtml(target.name)}" class="civ-mt-2 civ-px-4 civ-py-2 civ-rounded civ-bg-primary civ-text-white">Submit comment</button>`,
        `  </div>`,
      );
    }

    htmlParts.push(`</div>`);
  }

  features.push(mode === 'reviewer' ? 'reviewer-mode' : 'applicant-mode');

  // Deduplicate features
  const uniqueFeatures = [...new Set(features)];

  // Generate JavaScript
  const jsLines: string[] = [
    '(function() {',
    '  // Toggle feedback panels',
    '  document.querySelectorAll("[data-civ-feedback-trigger]").forEach(function(btn) {',
    '    btn.addEventListener("click", function() {',
    '      var target = btn.getAttribute("data-civ-feedback-trigger");',
    '      var panel = document.querySelector(\'[data-civ-feedback-panel="\' + target + \'"]\');',
    '      if (panel) {',
    '        var isHidden = panel.hasAttribute("hidden");',
    '        if (isHidden) { panel.removeAttribute("hidden"); } else { panel.setAttribute("hidden", ""); }',
    '        btn.setAttribute("aria-expanded", isHidden ? "true" : "false");',
    '      }',
    '    });',
    '  });',
    '',
  ];

  if (mode === 'reviewer') {
    jsLines.push(
      '  // Submit feedback',
      '  document.querySelectorAll("[data-civ-feedback-submit]").forEach(function(btn) {',
      '    btn.addEventListener("click", function() {',
      '      var target = btn.getAttribute("data-civ-feedback-submit");',
      '      var panel = btn.closest("[data-civ-feedback-panel]");',
      '      var textarea = panel ? panel.querySelector("textarea") : null;',
      '      if (textarea && textarea.value.trim()) {',
      '        btn.dispatchEvent(new CustomEvent("civ-feedback-submit", {',
      '          bubbles: true,',
      '          detail: { target: target, text: textarea.value.trim() }',
      '        }));',
      '        textarea.value = "";',
      '      }',
      '    });',
      '  });',
    );
  }

  jsLines.push('})();');

  return {
    html: htmlParts.join('\n'),
    javascript: jsLines.join('\n'),
    features: uniqueFeatures,
    commentTargets,
  };
}
