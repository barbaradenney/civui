/**
 * generate_data_table tool — generate an accessible, interactive data table
 * with add/remove rows, sortable columns, totals, and ARIA announcements.
 */
import type { FormSchema } from '../schema/index.js';
import { escapeHtml } from './html-utils.js';

export interface DataTableResult {
  html: string;
  javascript: string;
  features: string[];
  columns: string[];
}

export function generateDataTable(
  schema: FormSchema,
  options?: { initialRows?: number },
): DataTableResult {
  if (!schema.dataTable) {
    throw new Error('Schema must have a dataTable configuration');
  }

  const config = schema.dataTable;
  const initialRows = options?.initialRows ?? config.minRows ?? 1;
  const features: string[] = ['data-table'];
  const columns = config.columns.map((col) => col.id);

  // --- Build HTML ---
  const htmlParts: string[] = [];

  htmlParts.push(`<div data-civ-data-table class="civ-overflow-x-auto">`);
  htmlParts.push(`  <table class="civ-w-full civ-border-collapse civ-border">`);
  htmlParts.push(`    <caption>${escapeHtml(config.caption)}</caption>`);

  // thead
  htmlParts.push(`    <thead>`);
  htmlParts.push(`      <tr>`);
  for (const col of config.columns) {
    const widthStyle = col.width ? ` style="width: ${escapeHtml(col.width)}"` : '';
    if (config.sortable) {
      htmlParts.push(
        `        <th scope="col"${widthStyle}>` +
        `<button data-civ-sort="${escapeHtml(col.id)}" class="civ-text-sm">` +
        `${escapeHtml(col.label)} <span aria-hidden="true"></span></button></th>`,
      );
    } else {
      htmlParts.push(`        <th scope="col"${widthStyle}>${escapeHtml(col.label)}</th>`);
    }
  }
  htmlParts.push(`        <th scope="col" class="civ-w-12"><span class="civ-sr-only">Actions</span></th>`);
  htmlParts.push(`      </tr>`);
  htmlParts.push(`    </thead>`);

  // tbody
  htmlParts.push(`    <tbody>`);
  for (let rowIdx = 0; rowIdx < initialRows; rowIdx++) {
    htmlParts.push(`      <tr data-civ-table-row>`);
    for (const col of config.columns) {
      const cellHtml = renderCellInput(col, rowIdx);
      htmlParts.push(`        <td>${cellHtml}</td>`);
    }
    htmlParts.push(
      `        <td><button type="button" data-civ-remove-row class="civ-text-error civ-text-sm" aria-label="Remove row ${rowIdx + 1}">Remove</button></td>`,
    );
    htmlParts.push(`      </tr>`);
  }
  htmlParts.push(`    </tbody>`);

  // tfoot
  const showTotals = config.showTotals ?? [];
  if (showTotals.length > 0) {
    features.push('totals');
    htmlParts.push(`    <tfoot>`);
    htmlParts.push(`      <tr>`);
    config.columns.forEach((col, idx) => {
      if (idx === 0 && !showTotals.includes(col.id)) {
        htmlParts.push(`        <td>Total</td>`);
      } else if (showTotals.includes(col.id)) {
        if (idx === 0) {
          htmlParts.push(
            `        <td>Total <span data-civ-total="${escapeHtml(col.id)}" class="civ-font-bold">0</span></td>`,
          );
        } else {
          htmlParts.push(
            `        <td><span data-civ-total="${escapeHtml(col.id)}" class="civ-font-bold">0</span></td>`,
          );
        }
      } else {
        htmlParts.push(`        <td></td>`);
      }
    });
    htmlParts.push(`        <td></td>`);
    htmlParts.push(`      </tr>`);
    htmlParts.push(`    </tfoot>`);
  }

  htmlParts.push(`  </table>`);
  htmlParts.push(
    `  <button type="button" data-civ-add-row class="civ-mt-2 civ-px-3 civ-py-1 civ-rounded civ-border civ-text-sm">Add row</button>`,
  );
  htmlParts.push(`  <div aria-live="polite" class="civ-sr-only" data-civ-table-announcer></div>`);
  htmlParts.push(`</div>`);

  // --- Features ---
  features.push('add-remove-rows');
  if (config.sortable) {
    features.push('sortable');
  }
  const hasCurrency = config.columns.some((col) => col.type === 'currency');
  if (hasCurrency) {
    features.push('currency');
  }
  features.push('aria-live');

  // --- Build JavaScript ---
  const jsLines: string[] = [];

  jsLines.push('(function() {');
  jsLines.push('  var container = document.querySelector("[data-civ-data-table]");');
  jsLines.push('  if (!container) return;');
  jsLines.push('  var tbody = container.querySelector("tbody");');
  jsLines.push('  var addBtn = container.querySelector("[data-civ-add-row]");');
  jsLines.push('  var announcer = container.querySelector("[data-civ-table-announcer]");');
  jsLines.push(`  var minRows = ${config.minRows ?? 1};`);
  jsLines.push(`  var maxRows = ${config.maxRows ?? 999};`);
  jsLines.push('');

  // Column metadata for JS
  const colMeta = config.columns.map((col) => ({
    id: col.id,
    type: col.type,
  }));
  jsLines.push('  var columnMeta = ' + JSON.stringify(colMeta) + ';');
  jsLines.push('  var showTotals = ' + JSON.stringify(showTotals) + ';');
  jsLines.push('');

  // Announce helper
  jsLines.push('  function announce(message) {');
  jsLines.push('    if (announcer) {');
  jsLines.push('      announcer.textContent = message;');
  jsLines.push('    }');
  jsLines.push('  }');
  jsLines.push('');

  // Reindex helper
  jsLines.push('  function reindexRows() {');
  jsLines.push('    var rows = tbody.querySelectorAll("[data-civ-table-row]");');
  jsLines.push('    rows.forEach(function(row, idx) {');
  jsLines.push('      var inputs = row.querySelectorAll("input, select");');
  jsLines.push('      inputs.forEach(function(input) {');
  jsLines.push('        var name = input.getAttribute("name");');
  jsLines.push('        if (name) {');
  jsLines.push('          input.setAttribute("name", name.replace(/\\[\\d+\\]/, "[" + idx + "]"));');
  jsLines.push('        }');
  jsLines.push('        var label = input.getAttribute("aria-label");');
  jsLines.push('        if (label) {');
  jsLines.push('          input.setAttribute("aria-label", label.replace(/row \\d+/, "row " + (idx + 1)));');
  jsLines.push('        }');
  jsLines.push('      });');
  jsLines.push('      var removeBtn = row.querySelector("[data-civ-remove-row]");');
  jsLines.push('      if (removeBtn) {');
  jsLines.push('        removeBtn.setAttribute("aria-label", "Remove row " + (idx + 1));');
  jsLines.push('      }');
  jsLines.push('    });');
  jsLines.push('    updateRemoveButtons();');
  jsLines.push('  }');
  jsLines.push('');

  // Update remove buttons (disable at min)
  jsLines.push('  function updateRemoveButtons() {');
  jsLines.push('    var rows = tbody.querySelectorAll("[data-civ-table-row]");');
  jsLines.push('    var removeBtns = tbody.querySelectorAll("[data-civ-remove-row]");');
  jsLines.push('    var atMin = rows.length <= minRows;');
  jsLines.push('    removeBtns.forEach(function(btn) {');
  jsLines.push('      btn.disabled = atMin;');
  jsLines.push('    });');
  jsLines.push('  }');
  jsLines.push('');

  // Recalculate totals
  jsLines.push('  function recalculateTotals() {');
  jsLines.push('    if (showTotals.length === 0) return;');
  jsLines.push('    showTotals.forEach(function(colId) {');
  jsLines.push('      var total = 0;');
  jsLines.push('      var rows = tbody.querySelectorAll("[data-civ-table-row]");');
  jsLines.push('      rows.forEach(function(row) {');
  jsLines.push('        var input = row.querySelector("[name^=\\"" + colId + "\\"]");');
  jsLines.push('        if (input) {');
  jsLines.push('          var val = parseFloat(input.value);');
  jsLines.push('          if (!isNaN(val)) total += val;');
  jsLines.push('        }');
  jsLines.push('      });');
  jsLines.push('      var colInfo = columnMeta.find(function(c) { return c.id === colId; });');
  jsLines.push('      var formatted = (colInfo && colInfo.type === "currency") ? total.toFixed(2) : String(total);');
  jsLines.push('      var span = container.querySelector("[data-civ-total=\\"" + colId + "\\"]");');
  jsLines.push('      if (span) span.textContent = formatted;');
  jsLines.push('    });');
  jsLines.push('  }');
  jsLines.push('');

  // Dispatch table change event
  jsLines.push('  function dispatchChange() {');
  jsLines.push('    var rows = tbody.querySelectorAll("[data-civ-table-row]");');
  jsLines.push('    var totals = {};');
  jsLines.push('    showTotals.forEach(function(colId) {');
  jsLines.push('      var span = container.querySelector("[data-civ-total=\\"" + colId + "\\"]");');
  jsLines.push('      totals[colId] = span ? parseFloat(span.textContent) || 0 : 0;');
  jsLines.push('    });');
  jsLines.push('    container.dispatchEvent(new CustomEvent("civ-table-change", {');
  jsLines.push('      bubbles: true,');
  jsLines.push('      detail: { rowCount: rows.length, totals: totals }');
  jsLines.push('    }));');
  jsLines.push('  }');
  jsLines.push('');

  // Add row
  jsLines.push('  if (addBtn) {');
  jsLines.push('  addBtn.addEventListener("click", function() {');
  jsLines.push('    var rows = tbody.querySelectorAll("[data-civ-table-row]");');
  jsLines.push('    if (rows.length >= maxRows) return;');
  jsLines.push('    var lastRow = rows[rows.length - 1];');
  jsLines.push('    var newRow = lastRow.cloneNode(true);');
  jsLines.push('    var inputs = newRow.querySelectorAll("input, select");');
  jsLines.push('    inputs.forEach(function(input) {');
  jsLines.push('      input.value = "";');
  jsLines.push('    });');
  jsLines.push('    tbody.appendChild(newRow);');
  jsLines.push('    reindexRows();');
  jsLines.push('    recalculateTotals();');
  jsLines.push('    announce("Row added, now " + tbody.querySelectorAll("[data-civ-table-row]").length + " rows");');
  jsLines.push('    dispatchChange();');
  jsLines.push('  });');
  jsLines.push('  }');
  jsLines.push('');

  // Remove row (delegated)
  jsLines.push('  tbody.addEventListener("click", function(e) {');
  jsLines.push('    var btn = e.target.closest("[data-civ-remove-row]");');
  jsLines.push('    if (!btn) return;');
  jsLines.push('    var rows = tbody.querySelectorAll("[data-civ-table-row]");');
  jsLines.push('    if (rows.length <= minRows) return;');
  jsLines.push('    var row = btn.closest("[data-civ-table-row]");');
  jsLines.push('    if (row) row.remove();');
  jsLines.push('    reindexRows();');
  jsLines.push('    recalculateTotals();');
  jsLines.push('    announce("Row removed, now " + tbody.querySelectorAll("[data-civ-table-row]").length + " rows");');
  jsLines.push('    dispatchChange();');
  jsLines.push('  });');
  jsLines.push('');

  // Input change listener for totals and events
  jsLines.push('  tbody.addEventListener("input", function() {');
  jsLines.push('    recalculateTotals();');
  jsLines.push('    dispatchChange();');
  jsLines.push('  });');
  jsLines.push('');

  // Sort
  if (config.sortable) {
    jsLines.push('  var sortState = {};');
    jsLines.push('  container.querySelectorAll("[data-civ-sort]").forEach(function(btn) {');
    jsLines.push('    btn.addEventListener("click", function() {');
    jsLines.push('      var colId = btn.getAttribute("data-civ-sort");');
    jsLines.push('      var asc = sortState[colId] !== "asc";');
    jsLines.push('      sortState[colId] = asc ? "asc" : "desc";');
    jsLines.push('');
    jsLines.push('      // Update sort indicators');
    jsLines.push('      container.querySelectorAll("[data-civ-sort] span").forEach(function(s) {');
    jsLines.push('        s.textContent = "";');
    jsLines.push('      });');
    jsLines.push('      var indicator = btn.querySelector("span");');
    jsLines.push('      if (indicator) indicator.textContent = asc ? " \\u25B2" : " \\u25BC";');
    jsLines.push('');
    jsLines.push('      // Find column index');
    jsLines.push('      var colIndex = columnMeta.findIndex(function(c) { return c.id === colId; });');
    jsLines.push('      if (colIndex === -1) return;');
    jsLines.push('');
    jsLines.push('      var rows = Array.from(tbody.querySelectorAll("[data-civ-table-row]"));');
    jsLines.push('      rows.sort(function(a, b) {');
    jsLines.push('        var aInput = a.querySelectorAll("input, select")[colIndex];');
    jsLines.push('        var bInput = b.querySelectorAll("input, select")[colIndex];');
    jsLines.push('        var aVal = aInput ? aInput.value : "";');
    jsLines.push('        var bVal = bInput ? bInput.value : "";');
    jsLines.push('        var aNum = parseFloat(aVal);');
    jsLines.push('        var bNum = parseFloat(bVal);');
    jsLines.push('        if (!isNaN(aNum) && !isNaN(bNum)) {');
    jsLines.push('          return asc ? aNum - bNum : bNum - aNum;');
    jsLines.push('        }');
    jsLines.push('        return asc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);');
    jsLines.push('      });');
    jsLines.push('      rows.forEach(function(row) { tbody.appendChild(row); });');
    jsLines.push('      reindexRows();');
    jsLines.push('    });');
    jsLines.push('  });');
  }

  jsLines.push('');
  jsLines.push('  // Initial setup');
  jsLines.push('  updateRemoveButtons();');
  jsLines.push('  recalculateTotals();');
  jsLines.push('})();');

  return {
    html: htmlParts.join('\n'),
    javascript: jsLines.join('\n'),
    features,
    columns,
  };
}

function renderCellInput(
  col: { id: string; label: string; type: string; options?: Array<{ value: string; label: string }>; required?: boolean; width?: string },
  rowIdx: number,
): string {
  const name = `${escapeHtml(col.id)}[${rowIdx}]`;
  const ariaLabel = `${escapeHtml(col.label)} row ${rowIdx + 1}`;
  const req = col.required ? ' required' : '';

  switch (col.type) {
    case 'text':
      return `<input type="text" name="${name}" class="civ-input civ-w-full" aria-label="${ariaLabel}"${req}>`;

    case 'number':
      return `<input type="number" name="${name}" class="civ-input civ-w-full" inputmode="numeric" aria-label="${ariaLabel}"${req}>`;

    case 'currency':
      return `<input type="number" name="${name}" class="civ-input civ-w-full" inputmode="decimal" step="0.01" min="0" aria-label="${ariaLabel}"${req}>`;

    case 'date':
      return `<input type="date" name="${name}" class="civ-input civ-w-full" aria-label="${ariaLabel}"${req}>`;

    case 'select': {
      const opts = (col.options ?? [])
        .map((o) => `<option value="${escapeHtml(o.value)}">${escapeHtml(o.label)}</option>`)
        .join('');
      return `<select name="${name}" class="civ-input civ-w-full" aria-label="${ariaLabel}"${req}>${opts}</select>`;
    }

    default:
      return `<input type="text" name="${name}" class="civ-input civ-w-full" aria-label="${ariaLabel}"${req}>`;
  }
}
