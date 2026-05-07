/**
 * generate_timeout_warning tool — WCAG 2.2.1-compliant session timeout
 * dialog with countdown, extension, and redirect support.
 */
import type { FormSchema } from '../schema/index.js';

export interface TimeoutWarningResult {
  html: string;
  javascript: string;
  features: string[];
}

interface TimeoutConfig {
  sessionTimeoutMs: number;
  warningBeforeMs: number;
  extendable?: boolean;
  maxExtensions?: number;
  redirectUrl?: string;
}

function resolveConfig(
  schema?: FormSchema,
  standalone?: TimeoutConfig,
): TimeoutConfig {
  if (standalone) return standalone;
  if (schema?.timeoutWarning) return schema.timeoutWarning;
  throw new Error(
    'Either a schema with timeoutWarning configuration or standalone config is required',
  );
}

export function generateTimeoutWarning(
  schemaOrConfig: FormSchema | TimeoutConfig,
  standalone?: TimeoutConfig,
): TimeoutWarningResult {
  // Determine if first arg is a schema or standalone config
  let config: TimeoutConfig;
  if ('sessionTimeoutMs' in schemaOrConfig) {
    config = schemaOrConfig;
  } else {
    config = resolveConfig(schemaOrConfig as FormSchema, standalone);
  }

  const extendable = config.extendable !== false;
  const hasMaxExtensions = config.maxExtensions !== undefined && config.maxExtensions !== null;
  const hasRedirect = !!config.redirectUrl;

  const features: string[] = ['timeout-warning', 'dialog', 'countdown', 'wcag-2-2-1'];
  if (extendable) features.push('extendable');
  if (hasRedirect) features.push('redirect');

  const htmlParts: string[] = [];

  htmlParts.push(`<dialog data-civ-timeout-warning class="civ-p-6 civ-rounded civ-shadow-lg civ-max-w-md" aria-labelledby="timeout-heading">`);
  htmlParts.push(`  <h2 id="timeout-heading" class="civ-text-lg civ-font-bold civ-mb-4">Session expiring</h2>`);
  htmlParts.push(`  <p data-civ-timeout-message>Your session will expire in <span data-civ-countdown aria-live="polite" aria-atomic="true"></span>.</p>`);

  htmlParts.push(`  <div class="civ-flex civ-gap-4 civ-mt-6">`);
  if (extendable) {
    htmlParts.push(
      `    <button type="button" data-civ-timeout-extend class="civ-bg-primary civ-text-white civ-px-4 civ-py-2 civ-rounded">Extend session</button>`,
    );
  }
  htmlParts.push(
    `    <button type="button" data-civ-timeout-logout class="civ-bg-base-lighter civ-px-4 civ-py-2 civ-rounded">Log out</button>`,
  );
  htmlParts.push(`  </div>`);
  htmlParts.push(`</dialog>`);

  // JavaScript
  const jsLines: string[] = [
    '(function() {',
    '  var dialog = document.querySelector("[data-civ-timeout-warning]");',
    '  if (!dialog) return;',
    '  var countdownEl = dialog.querySelector("[data-civ-countdown]");',
    '  var extendBtn = dialog.querySelector("[data-civ-timeout-extend]");',
    '  var logoutBtn = dialog.querySelector("[data-civ-timeout-logout]");',
    '',
    `  var sessionTimeoutMs = ${config.sessionTimeoutMs};`,
    `  var warningBeforeMs = ${config.warningBeforeMs};`,
    `  var maxExtensions = ${hasMaxExtensions ? config.maxExtensions : 'Infinity'};`,
    '  var extensionCount = 0;',
    '  var warningTimer = null;',
    '  var countdownInterval = null;',
    '  var expireTime = 0;',
    '',
    '  function formatTime(ms) {',
    '    var totalSec = Math.max(0, Math.ceil(ms / 1000));',
    '    var min = Math.floor(totalSec / 60);',
    '    var sec = totalSec % 60;',
    '    if (min > 0) return min + " minute" + (min !== 1 ? "s" : "") + (sec > 0 ? " " + sec + " second" + (sec !== 1 ? "s" : "") : "");',
    '    return sec + " second" + (sec !== 1 ? "s" : "");',
    '  }',
    '',
    '  function showWarning() {',
    '    expireTime = Date.now() + warningBeforeMs;',
    '    if (dialog.showModal) dialog.showModal(); else dialog.setAttribute("open", "");',
    '    updateCountdown();',
    '    countdownInterval = setInterval(updateCountdown, 1000);',
    '  }',
    '',
    '  function updateCountdown() {',
    '    var remaining = expireTime - Date.now();',
    '    if (remaining <= 0) {',
    '      clearInterval(countdownInterval);',
    '      onExpire();',
    '      return;',
    '    }',
    '    if (countdownEl) countdownEl.textContent = formatTime(remaining);',
    '  }',
    '',
    '  function onExpire() {',
    '    if (dialog.close) dialog.close();',
    '    dialog.dispatchEvent(new CustomEvent("civ-timeout-expire", { bubbles: true }));',
    hasRedirect
      ? `    window.location.href = ${JSON.stringify(config.redirectUrl)};`
      : '',
    '  }',
    '',
    '  function startTimers() {',
    '    clearTimeout(warningTimer);',
    '    clearInterval(countdownInterval);',
    '    warningTimer = setTimeout(showWarning, sessionTimeoutMs - warningBeforeMs);',
    '  }',
    '',
  ];

  if (extendable) {
    jsLines.push(
      '  if (extendBtn) {',
      '    extendBtn.addEventListener("click", function() {',
      '      if (extensionCount >= maxExtensions) return;',
      '      extensionCount++;',
      '      clearInterval(countdownInterval);',
      '      if (dialog.close) dialog.close();',
      '      startTimers();',
      '      dialog.dispatchEvent(new CustomEvent("civ-timeout-extend", { bubbles: true, detail: { extensionCount: extensionCount } }));',
      '      if (extensionCount >= maxExtensions && extendBtn) {',
      '        extendBtn.disabled = true;',
      '      }',
      '    });',
      '  }',
      '',
    );
  }

  jsLines.push(
    '  if (logoutBtn) {',
    '    logoutBtn.addEventListener("click", function() {',
    '      clearTimeout(warningTimer);',
    '      clearInterval(countdownInterval);',
    '      if (dialog.close) dialog.close();',
    '      dialog.dispatchEvent(new CustomEvent("civ-timeout-expire", { bubbles: true }));',
    hasRedirect
      ? `      window.location.href = ${JSON.stringify(config.redirectUrl)};`
      : '',
    '    });',
    '  }',
    '',
    '  startTimers();',
    '})();',
  );

  return {
    html: htmlParts.join('\n'),
    javascript: jsLines.join('\n'),
    features,
  };
}
