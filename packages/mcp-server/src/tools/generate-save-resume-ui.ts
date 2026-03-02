/**
 * generate_save_resume_ui tool — generate HTML + JavaScript for save-and-resume
 * functionality including auto-save, manual save, resume detection, and session timeout.
 */
import type { FormSchema } from '../schema/index.js';
import { slugify } from './html-utils.js';

export interface SaveResumeResult {
  html: string;
  javascript: string;
  features: string[];
}

interface ResolvedOptions {
  autoSaveIntervalMs: number;
  sessionTimeoutMs: number;
  warningBeforeTimeoutMs: number;
  storageKey: string;
  showLastSaved: boolean;
}

function resolveOptions(
  schema: FormSchema,
  options?: {
    autoSaveIntervalMs?: number;
    sessionTimeoutMs?: number;
    warningBeforeTimeoutMs?: number;
    storageKey?: string;
    showLastSaved?: boolean;
  },
): ResolvedOptions {
  const schemaConfig = schema.saveResume ?? {};
  const defaultStorageKey = schema.title ? slugify(schema.title) : 'civ-form-draft';

  return {
    autoSaveIntervalMs:
      options?.autoSaveIntervalMs ?? schemaConfig.autoSaveIntervalMs ?? 30000,
    sessionTimeoutMs:
      options?.sessionTimeoutMs ?? schemaConfig.sessionTimeoutMs ?? 900000,
    warningBeforeTimeoutMs:
      options?.warningBeforeTimeoutMs ?? schemaConfig.warningBeforeTimeoutMs ?? 120000,
    storageKey:
      options?.storageKey ?? schemaConfig.storageKey ?? defaultStorageKey,
    showLastSaved:
      options?.showLastSaved ?? schemaConfig.showLastSaved ?? true,
  };
}

function buildHtml(config: ResolvedOptions): string {
  const parts: string[] = [];

  // Save status bar
  parts.push(
    `<div data-civ-save-status class="civ-flex civ-items-center civ-gap-2 civ-text-sm civ-text-base-dark" aria-live="polite">`,
    `  <span data-civ-save-indicator>Not saved</span>`,
  );
  if (config.showLastSaved) {
    parts.push(`  <span data-civ-last-saved></span>`);
  }
  parts.push(`</div>`);

  // Manual save button
  parts.push(
    `<button type="button" data-civ-save-manual class="civ-px-3 civ-py-1 civ-rounded civ-border civ-text-sm">Save progress</button>`,
  );

  // Resume banner
  parts.push(
    `<div data-civ-resume-banner class="civ-p-4 civ-bg-info-lighter civ-border civ-rounded civ-mb-4" hidden role="alert">`,
    `  <p>You have a saved draft from <span data-civ-saved-date></span>.</p>`,
    `  <div class="civ-flex civ-gap-2 civ-mt-2">`,
    `    <button data-civ-resume class="civ-px-3 civ-py-1 civ-rounded civ-bg-primary civ-text-white civ-text-sm">Resume where you left off</button>`,
    `    <button data-civ-start-over class="civ-px-3 civ-py-1 civ-rounded civ-border civ-text-sm">Start over</button>`,
    `  </div>`,
    `</div>`,
  );

  // Timeout dialog
  parts.push(
    `<dialog data-civ-timeout-dialog class="civ-p-6 civ-rounded civ-shadow-lg civ-max-w-sm">`,
    `  <h2 class="civ-text-lg civ-font-bold civ-mb-2">Session expiring</h2>`,
    `  <p class="civ-mb-4">Your session will expire in <span data-civ-timeout-countdown></span> seconds. Any unsaved changes will be lost.</p>`,
    `  <div class="civ-flex civ-gap-2">`,
    `    <button data-civ-timeout-continue class="civ-px-3 civ-py-1 civ-rounded civ-bg-primary civ-text-white civ-text-sm">Continue working</button>`,
    `    <button data-civ-timeout-save-close class="civ-px-3 civ-py-1 civ-rounded civ-border civ-text-sm">Save and close</button>`,
    `  </div>`,
    `</dialog>`,
  );

  return parts.join('\n');
}

function buildJavascript(config: ResolvedOptions): string {
  // Escape storageKey for safe embedding in JS string literal
  const safeKey = config.storageKey.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

  const lines: string[] = [
    '(function() {',
    '  \'use strict\';',
    '',
    `  var STORAGE_KEY = '${safeKey}';`,
    `  var AUTO_SAVE_INTERVAL = ${config.autoSaveIntervalMs};`,
    `  var SESSION_TIMEOUT = ${config.sessionTimeoutMs};`,
    `  var WARNING_BEFORE_TIMEOUT = ${config.warningBeforeTimeoutMs};`,
    `  var SHOW_LAST_SAVED = ${config.showLastSaved};`,
    '',
    '  var dirty = false;',
    '  var sessionTimer = null;',
    '  var warningTimer = null;',
    '  var countdownInterval = null;',
    '',
    '  // --- Serialization ---',
    '  function serializeForm() {',
    '    var form = document.querySelector("civ-form") || document.querySelector("form");',
    '    if (!form) return null;',
    '    var data = {};',
    '    form.querySelectorAll("[name]").forEach(function(el) {',
    '      var name = el.getAttribute("name");',
    '      var tag = el.tagName.toLowerCase();',
    '      if (tag === "civ-checkbox-group") {',
    '        var checked = [];',
    '        el.querySelectorAll("civ-checkbox[checked]").forEach(function(cb) {',
    '          checked.push(cb.getAttribute("value") || "");',
    '        });',
    '        data[name] = checked;',
    '      } else if (tag === "civ-toggle" || tag === "civ-checkbox") {',
    '        data[name] = el.hasAttribute("checked") ? "true" : "false";',
    '      } else {',
    '        data[name] = el.value || el.getAttribute("value") || "";',
    '      }',
    '    });',
    '    data._savedAt = new Date().toISOString();',
    '    return data;',
    '  }',
    '',
    '  // --- Save ---',
    '  function save() {',
    '    var data = serializeForm();',
    '    if (!data) return;',
    '    try {',
    '      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));',
    '    } catch (e) {',
    '      return;',
    '    }',
    '    dirty = false;',
    '    updateIndicator("Saved");',
    '    if (SHOW_LAST_SAVED) {',
    '      updateLastSaved(data._savedAt);',
    '    }',
    '    document.dispatchEvent(new CustomEvent("civ-save", { bubbles: true }));',
    '  }',
    '',
    '  // --- UI updates ---',
    '  function updateIndicator(text) {',
    '    var el = document.querySelector("[data-civ-save-indicator]");',
    '    if (el) el.textContent = text;',
    '  }',
    '',
    '  function updateLastSaved(isoString) {',
    '    var el = document.querySelector("[data-civ-last-saved]");',
    '    if (el) {',
    '      var d = new Date(isoString);',
    '      el.textContent = "Last saved: " + d.toLocaleTimeString();',
    '    }',
    '  }',
    '',
    '  // --- Prefill from saved data ---',
    '  function prefillForm(data) {',
    '    Object.keys(data).forEach(function(name) {',
    '      if (name === "_savedAt") return;',
    '      var val = data[name];',
    '      var el = document.querySelector(\'[name="\' + name + \'"]\');',
    '      if (!el) return;',
    '      var tag = el.tagName.toLowerCase();',
    '      if (tag === "civ-radio-group") {',
    '        var radio = el.querySelector(\'civ-radio[value="\' + val + \'"]\');',
    '        if (radio) radio.setAttribute("checked", "");',
    '        if ("value" in el) el.value = val;',
    '      } else if (tag === "civ-checkbox-group") {',
    '        var vals = Array.isArray(val) ? val : [val];',
    '        vals.forEach(function(v) {',
    '          var cb = el.querySelector(\'civ-checkbox[value="\' + v + \'"]\');',
    '          if (cb) cb.setAttribute("checked", "");',
    '        });',
    '      } else if (tag === "civ-select" || tag === "civ-combobox") {',
    '        var v = Array.isArray(val) ? val[0] : val;',
    '        el.setAttribute("value", v);',
    '        if ("value" in el) el.value = v;',
    '      } else if (tag === "civ-toggle" || tag === "civ-checkbox") {',
    '        if (val === "true" || val === "on" || val === "1") {',
    '          el.setAttribute("checked", "");',
    '        } else {',
    '          el.removeAttribute("checked");',
    '        }',
    '      } else {',
    '        var s = Array.isArray(val) ? val.join(", ") : val;',
    '        el.setAttribute("value", s);',
    '        if ("value" in el) el.value = s;',
    '      }',
    '    });',
    '  }',
    '',
    '  // --- Dirty tracking via civ-change ---',
    '  document.addEventListener("civ-change", function() {',
    '    dirty = true;',
    '    updateIndicator("Unsaved changes");',
    '  });',
    '',
    '  // --- Auto-save on interval (only if dirty) ---',
    '  setInterval(function() {',
    '    if (dirty) {',
    '      save();',
    '    }',
    '  }, AUTO_SAVE_INTERVAL);',
    '',
    '  // --- Manual save button ---',
    '  var saveBtn = document.querySelector("[data-civ-save-manual]");',
    '  if (saveBtn) {',
    '    saveBtn.addEventListener("click", function() {',
    '      save();',
    '    });',
    '  }',
    '',
    '  // --- Resume detection on load ---',
    '  var raw = null;',
    '  try {',
    '    raw = localStorage.getItem(STORAGE_KEY);',
    '  } catch (e) {',
    '    // Storage unavailable',
    '  }',
    '  if (raw) {',
    '    try {',
    '      var saved = JSON.parse(raw);',
    '      var banner = document.querySelector("[data-civ-resume-banner]");',
    '      if (banner && saved._savedAt) {',
    '        var dateEl = banner.querySelector("[data-civ-saved-date]");',
    '        if (dateEl) {',
    '          dateEl.textContent = new Date(saved._savedAt).toLocaleString();',
    '        }',
    '        banner.removeAttribute("hidden");',
    '      }',
    '',
    '      // Resume button',
    '      var resumeBtn = document.querySelector("[data-civ-resume]");',
    '      if (resumeBtn) {',
    '        resumeBtn.addEventListener("click", function() {',
    '          prefillForm(saved);',
    '          if (banner) banner.setAttribute("hidden", "");',
    '          document.dispatchEvent(new CustomEvent("civ-resume", {',
    '            bubbles: true,',
    '            detail: { savedAt: saved._savedAt }',
    '          }));',
    '        });',
    '      }',
    '',
    '      // Start over button',
    '      var startOverBtn = document.querySelector("[data-civ-start-over]");',
    '      if (startOverBtn) {',
    '        startOverBtn.addEventListener("click", function() {',
    '          try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}',
    '          if (banner) banner.setAttribute("hidden", "");',
    '          document.dispatchEvent(new CustomEvent("civ-start-over", { bubbles: true }));',
    '        });',
    '      }',
    '    } catch (e) {',
    '      // Invalid JSON — ignore',
    '    }',
    '  }',
    '',
    '  // --- Session timeout ---',
    '  function resetSessionTimer() {',
    '    if (sessionTimer) clearTimeout(sessionTimer);',
    '    if (warningTimer) clearTimeout(warningTimer);',
    '    if (countdownInterval) clearInterval(countdownInterval);',
    '',
    '    var warningDelay = SESSION_TIMEOUT - WARNING_BEFORE_TIMEOUT;',
    '    if (warningDelay < 0) warningDelay = 0;',
    '',
    '    warningTimer = setTimeout(function() {',
    '      showTimeoutWarning();',
    '    }, warningDelay);',
    '',
    '    sessionTimer = setTimeout(function() {',
    '      // Session expired — auto-save and dispatch timeout',
    '      save();',
    '      document.dispatchEvent(new CustomEvent("civ-timeout", { bubbles: true }));',
    '    }, SESSION_TIMEOUT);',
    '  }',
    '',
    '  function showTimeoutWarning() {',
    '    var dialog = document.querySelector("[data-civ-timeout-dialog]");',
    '    var countdownEl = document.querySelector("[data-civ-timeout-countdown]");',
    '    if (!dialog) return;',
    '',
    '    var remaining = Math.ceil(WARNING_BEFORE_TIMEOUT / 1000);',
    '    if (countdownEl) countdownEl.textContent = String(remaining);',
    '',
    '    if (typeof dialog.showModal === "function") {',
    '      dialog.showModal();',
    '    } else {',
    '      dialog.setAttribute("open", "");',
    '    }',
    '',
    '    document.dispatchEvent(new CustomEvent("civ-timeout-warning", { bubbles: true }));',
    '',
    '    countdownInterval = setInterval(function() {',
    '      remaining--;',
    '      if (countdownEl) countdownEl.textContent = String(remaining);',
    '      if (remaining <= 0) {',
    '        clearInterval(countdownInterval);',
    '      }',
    '    }, 1000);',
    '  }',
    '',
    '  function closeDialog() {',
    '    var dialog = document.querySelector("[data-civ-timeout-dialog]");',
    '    if (!dialog) return;',
    '    if (typeof dialog.close === "function") {',
    '      dialog.close();',
    '    } else {',
    '      dialog.removeAttribute("open");',
    '    }',
    '    if (countdownInterval) clearInterval(countdownInterval);',
    '  }',
    '',
    '  // Continue working button',
    '  var continueBtn = document.querySelector("[data-civ-timeout-continue]");',
    '  if (continueBtn) {',
    '    continueBtn.addEventListener("click", function() {',
    '      closeDialog();',
    '      resetSessionTimer();',
    '    });',
    '  }',
    '',
    '  // Save and close button',
    '  var saveCloseBtn = document.querySelector("[data-civ-timeout-save-close]");',
    '  if (saveCloseBtn) {',
    '    saveCloseBtn.addEventListener("click", function() {',
    '      save();',
    '      closeDialog();',
    '      document.dispatchEvent(new CustomEvent("civ-timeout", { bubbles: true }));',
    '    });',
    '  }',
    '',
    '  // Start session timer',
    '  resetSessionTimer();',
    '',
    '})();',
  ];

  return lines.join('\n');
}

/**
 * Generate save-and-resume UI with HTML markup and client-side JavaScript.
 * Supports auto-save, manual save, resume detection from localStorage,
 * and session timeout with warning dialog.
 */
export function generateSaveResumeUi(
  schema: FormSchema,
  options?: {
    autoSaveIntervalMs?: number;
    sessionTimeoutMs?: number;
    warningBeforeTimeoutMs?: number;
    storageKey?: string;
    showLastSaved?: boolean;
  },
): SaveResumeResult {
  const config = resolveOptions(schema, options);
  const html = buildHtml(config);
  const javascript = buildJavascript(config);

  const features: string[] = [
    'save-resume',
    'auto-save',
    'manual-save',
    'session-timeout',
    'resume-detection',
    'localStorage',
  ];

  if (config.showLastSaved) {
    features.push('show-last-saved');
  }

  return { html, javascript, features };
}
