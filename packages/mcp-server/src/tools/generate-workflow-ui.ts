/**
 * generate_workflow_ui tool — generate workflow status banner, transition buttons,
 * and companion JavaScript for multi-actor form workflows.
 */
import type { FormSchema } from '../schema/index.js';
import { escapeHtml } from './html-utils.js';

export interface WorkflowUiResult {
  html: string;
  javascript: string;
  states: Array<{
    id: string;
    label: string;
    isCurrent: boolean;
    transitions: Array<{ to: string; label: string; actor: string }>;
  }>;
  features: string[];
}

export function generateWorkflowUi(
  schema: FormSchema,
  currentState?: string,
  currentActor?: string,
): WorkflowUiResult {
  if (!schema.workflow) {
    throw new Error('Schema must have a `workflow` definition to generate workflow UI');
  }

  const { workflow } = schema;
  const resolvedState = currentState ?? workflow.initialState;
  const resolvedActor = currentActor ?? (schema.actors?.[0]?.id ?? 'unknown');

  const stateObj = workflow.states.find((s) => s.id === resolvedState);
  if (!stateObj) {
    throw new Error(`Workflow state "${resolvedState}" not found in schema`);
  }

  const features: string[] = ['workflow-status'];

  // Build states summary
  const states = workflow.states.map((s) => ({
    id: s.id,
    label: s.label,
    isCurrent: s.id === resolvedState,
    transitions: workflow.transitions
      .filter((t) => t.from === s.id)
      .map((t) => ({ to: t.to, label: t.label, actor: t.actor })),
  }));

  // Filter available transitions for current actor in current state
  const availableTransitions = workflow.transitions.filter(
    (t) => t.from === resolvedState && t.actor === resolvedActor,
  );

  // Generate HTML
  const isTerminal = stateObj.terminal === true;
  let buttonsHtml = '';

  if (!isTerminal && availableTransitions.length > 0) {
    features.push('transition-buttons');
    const terminalIds = new Set(
      workflow.states.filter((s) => s.terminal).map((s) => s.id),
    );
    const buttons = availableTransitions
      .map((t) => {
        const isDestructive = t.requiresComment && terminalIds.has(t.to);
        return (
          `    <civ-button data-civ-workflow-action="${escapeHtml(t.to)}"` +
          ` label="${escapeHtml(t.label)}"${isDestructive ? ' danger' : ''}></civ-button>`
        );
      })
      .join('\n');
    buttonsHtml = `\n  <div data-civ-workflow-actions class="civ-mt-4 civ-button-row">\n${buttons}\n  </div>`;
  }

  if (isTerminal) {
    features.push('terminal-state');
  }

  const html =
    `<civ-card>\n` +
    `  <p class="civ-text-sm">Current status</p>\n` +
    `  <p class="civ-text-lg civ-font-bold" data-civ-workflow-state="${escapeHtml(resolvedState)}">${escapeHtml(stateObj.label)}</p>` +
    buttonsHtml +
    `\n</civ-card>`;

  // Generate JavaScript
  const jsLines: string[] = [
    '(function() {',
    '  const statusEl = document.querySelector("[data-civ-workflow-status]");',
    '  if (!statusEl) return;',
    '',
  ];

  if (!isTerminal && availableTransitions.length > 0) {
    jsLines.push(
      '  statusEl.querySelectorAll("[data-civ-workflow-action]").forEach(function(btn) {',
      '    btn.addEventListener("click", function() {',
      '      var toState = btn.getAttribute("data-civ-workflow-action");',
    );

    // Check if any transition requires comment
    const hasComment = availableTransitions.some((t) => t.requiresComment);
    if (hasComment) {
      features.push('requires-comment');
      jsLines.push(
        '      var comment = "";',
        '      var transition = ' + JSON.stringify(
          availableTransitions.map((t) => ({ to: t.to, requiresComment: t.requiresComment })),
        ) + '.find(function(t) { return t.to === toState; });',
        '      if (transition && transition.requiresComment) {',
        '        comment = prompt("Please provide a reason:");',
        '        if (comment === null) return;',
        '      }',
      );
    }

    // Check if any transition requires all sections complete
    const hasSectionCheck = availableTransitions.some((t) => t.requiresAllSectionsComplete);
    if (hasSectionCheck) {
      features.push('section-complete-validation');
      jsLines.push(
        '      var sectionTransition = ' + JSON.stringify(
          availableTransitions.map((t) => ({ to: t.to, requiresAllSectionsComplete: t.requiresAllSectionsComplete })),
        ) + '.find(function(t) { return t.to === toState; });',
        '      if (sectionTransition && sectionTransition.requiresAllSectionsComplete) {',
        '        var requiredFields = document.querySelectorAll("[required]");',
        '        var incomplete = Array.from(requiredFields).filter(function(f) { return !f.value; });',
        '        if (incomplete.length > 0) {',
        '          alert("Please complete all required fields before proceeding.");',
        '          incomplete[0].focus();',
        '          return;',
        '        }',
        '      }',
      );
    }

    // Check if any transition has confirmation
    const hasConfirmation = availableTransitions.some((t) => t.confirmationMessage);
    if (hasConfirmation) {
      features.push('confirmation-dialog');
      jsLines.push(
        '      var confirmTransition = ' + JSON.stringify(
          availableTransitions.map((t) => ({ to: t.to, confirmationMessage: t.confirmationMessage })),
        ) + '.find(function(t) { return t.to === toState; });',
        '      if (confirmTransition && confirmTransition.confirmationMessage) {',
        '        if (!confirm(confirmTransition.confirmationMessage)) return;',
        '      }',
      );
    }

    jsLines.push(
      '      statusEl.dispatchEvent(new CustomEvent("civ-workflow-transition", {',
      '        bubbles: true,',
      '        detail: { from: "' + escapeHtml(resolvedState) + '", to: toState, actor: "' + escapeHtml(resolvedActor) + '"' + (hasComment ? ', comment: comment' : '') + ' }',
      '      }));',
      '',
      '      // Update status display',
      '      var stateEl = statusEl.querySelector("[data-civ-workflow-state]");',
      '      if (stateEl) {',
      '        stateEl.setAttribute("data-civ-workflow-state", toState);',
      '        stateEl.textContent = toState;',
      '      }',
      '',
      '      // ARIA live announcement',
      '      var announcement = document.createElement("div");',
      '      announcement.setAttribute("role", "status");',
      '      announcement.setAttribute("aria-live", "polite");',
      '      announcement.className = "civ-sr-only";',
      '      announcement.textContent = "Status changed to " + toState;',
      '      document.body.appendChild(announcement);',
      '      setTimeout(function() { announcement.remove(); }, 1000);',
      '    });',
      '  });',
    );

    features.push('aria-live');
  }

  jsLines.push('})();');

  return {
    html,
    javascript: jsLines.join('\n'),
    states,
    features,
  };
}
