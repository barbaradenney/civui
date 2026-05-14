import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildRowHeading,
  appendInlineRow,
  appendFormStepsSummaryCard,
  updateFormStepsSummaryText,
  buildFormStepShell,
  extractFormStepsValues,
} from './repeater-row-builder.js';

let container: HTMLElement;

beforeEach(() => {
  document.body.innerHTML = '';
  container = document.createElement('div');
  document.body.appendChild(container);
});

describe('buildRowHeading', () => {
  it('picks h{level+1} from the legend level', () => {
    const h = buildRowHeading({ legendLevel: 2, idPrefix: 'r', index: 0, itemLabel: 'item' });
    expect(h.tagName).toBe('H3');
  });

  it('defaults to h3 when no legendLevel is given', () => {
    const h = buildRowHeading({ legendLevel: undefined, idPrefix: 'r', index: 0, itemLabel: 'item' });
    expect(h.tagName).toBe('H3');
  });

  it('clamps at h6 even when the legend is already h6', () => {
    const h = buildRowHeading({ legendLevel: 6, idPrefix: 'r', index: 0, itemLabel: 'item' });
    expect(h.tagName).toBe('H6');
  });

  it('builds the id as `${idPrefix}-${index}-heading`', () => {
    const h = buildRowHeading({ legendLevel: 2, idPrefix: 'row-abc', index: 5, itemLabel: 'item' });
    expect(h.id).toBe('row-abc-5-heading');
  });

  it('attaches the civ-repeater-row-heading class', () => {
    const h = buildRowHeading({ legendLevel: 2, idPrefix: 'r', index: 0, itemLabel: 'item' });
    expect(h.classList.contains('civ-repeater-row-heading')).toBe(true);
  });

  it('sets the localized text to "{itemLabel} {index+1}"', () => {
    const h = buildRowHeading({ legendLevel: 2, idPrefix: 'r', index: 3, itemLabel: 'dependent' });
    expect(h.textContent).toBe('dependent 4');
  });
});

describe('appendInlineRow', () => {
  function buildTemplate(): Node[] {
    const input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('name', 'val');
    return [input];
  }

  it('appends a row element with the expected structural attributes', () => {
    appendInlineRow({
      container,
      template: buildTemplate(),
      index: 0,
      baseName: 'items',
      itemLabel: 'item',
      idPrefix: 'r',
      legendLevel: 2,
      min: 0,
      rowCount: 0,
    });
    const row = container.querySelector('[data-civ-repeater-row]')!;
    expect(row).not.toBeNull();
    expect(row.getAttribute('role')).toBe('group');
    expect(row.getAttribute('aria-labelledby')).toBe('r-0-heading');
    expect(row.classList.contains('civ-repeater-row')).toBe(true);
    expect(row.classList.contains('civ-card')).toBe(true);
  });

  it('clones the template into the row', () => {
    appendInlineRow({
      container,
      template: buildTemplate(),
      index: 0,
      baseName: 'items',
      itemLabel: 'item',
      idPrefix: 'r',
      legendLevel: 2,
      min: 0,
      rowCount: 0,
    });
    const input = container.querySelector('[data-civ-repeater-row] input')!;
    expect(input).not.toBeNull();
  });

  it('indexes child [name] attributes as `${baseName}[${index}].${name}`', () => {
    appendInlineRow({
      container,
      template: buildTemplate(),
      index: 2,
      baseName: 'dependents',
      itemLabel: 'dependent',
      idPrefix: 'r',
      legendLevel: 2,
      min: 0,
      rowCount: 0,
    });
    const input = container.querySelector('input')!;
    expect(input.getAttribute('name')).toBe('dependents[2].val');
  });

  it('falls back to "items" when no baseName is provided', () => {
    appendInlineRow({
      container,
      template: buildTemplate(),
      index: 0,
      baseName: '',
      itemLabel: 'item',
      idPrefix: 'r',
      legendLevel: 2,
      min: 0,
      rowCount: 0,
    });
    const input = container.querySelector('input')!;
    expect(input.getAttribute('name')).toBe('items[0].val');
  });

  it('appends a Remove button when row count is at or above min', () => {
    appendInlineRow({
      container,
      template: buildTemplate(),
      index: 0,
      baseName: 'items',
      itemLabel: 'item',
      idPrefix: 'r',
      legendLevel: 2,
      min: 0,
      rowCount: 0,
    });
    expect(container.querySelector('civ-action-button[danger]')).not.toBeNull();
  });

  it('omits the Remove button while we are below min', () => {
    appendInlineRow({
      container,
      template: buildTemplate(),
      index: 0,
      baseName: 'items',
      itemLabel: 'item',
      idPrefix: 'r',
      legendLevel: 2,
      min: 2,
      rowCount: 0,
    });
    expect(container.querySelector('civ-action-button[danger]')).toBeNull();
  });

  it('renders Remove with data-civ-repeater-action="remove" for delegated click handling', () => {
    appendInlineRow({
      container,
      template: buildTemplate(),
      index: 0,
      baseName: 'items',
      itemLabel: 'item',
      idPrefix: 'r',
      legendLevel: 2,
      min: 0,
      rowCount: 0,
    });
    const removeBtn = container.querySelector('civ-action-button[danger]')!;
    expect(removeBtn.getAttribute('data-civ-repeater-action')).toBe('remove');
  });
});

describe('appendFormStepsSummaryCard', () => {
  it('appends a summary card with the BEM content + actions layout', () => {
    appendFormStepsSummaryCard({
      container,
      data: { firstName: 'Alex', lastName: 'Chen' },
      index: 0,
      itemLabel: 'dependent',
      idPrefix: 'r',
      legendLevel: 2,
    });
    const row = container.querySelector('[data-civ-repeater-row]')!;
    expect(row.querySelector('.civ-list-item__content')).not.toBeNull();
    expect(row.querySelector('.civ-list-item__actions')).not.toBeNull();
  });

  it('renders the summary text from the saved field values', () => {
    appendFormStepsSummaryCard({
      container,
      data: { firstName: 'Alex', lastName: 'Chen' },
      index: 0,
      itemLabel: 'dependent',
      idPrefix: 'r',
      legendLevel: 2,
    });
    const content = container.querySelector('.civ-list-item__content')!;
    expect(content.textContent).toBe('Alex, Chen');
  });

  it('renders both Edit and Remove buttons inside the actions cluster', () => {
    appendFormStepsSummaryCard({
      container,
      data: { firstName: 'Alex' },
      index: 1,
      itemLabel: 'dependent',
      idPrefix: 'r',
      legendLevel: 2,
    });
    const actions = container.querySelector('.civ-list-item__actions')!;
    const editBtn = actions.querySelector('civ-action-button[data-civ-repeater-action="edit"]')!;
    const removeBtn = actions.querySelector('civ-action-button[data-civ-repeater-action="remove"]')!;
    expect(editBtn).not.toBeNull();
    expect(removeBtn).not.toBeNull();
    expect(removeBtn.hasAttribute('danger')).toBe(true);
  });

  it('puts the row heading id into aria-labelledby for the screen-reader landmark', () => {
    appendFormStepsSummaryCard({
      container,
      data: {},
      index: 4,
      itemLabel: 'dependent',
      idPrefix: 'row-xyz',
      legendLevel: 2,
    });
    const row = container.querySelector('[data-civ-repeater-row]')!;
    expect(row.getAttribute('aria-labelledby')).toBe('row-xyz-4-heading');
    const heading = row.querySelector('.civ-repeater-row-heading')!;
    expect(heading.id).toBe('row-xyz-4-heading');
  });
});

describe('updateFormStepsSummaryText', () => {
  it('only swaps the summary span text — actions and heading stay put', () => {
    appendFormStepsSummaryCard({
      container,
      data: { firstName: 'Alex', lastName: 'Chen' },
      index: 0,
      itemLabel: 'dependent',
      idPrefix: 'r',
      legendLevel: 2,
    });
    const row = container.querySelector('[data-civ-repeater-row]')!;
    const removeBtnBefore = row.querySelector('civ-action-button[danger]');

    updateFormStepsSummaryText(row, { firstName: 'Jordan', lastName: 'Lee' }, 0, 'dependent');

    const content = row.querySelector('.civ-list-item__content')!;
    expect(content.textContent).toBe('Jordan, Lee');
    // Action cluster pointer survives the update — important because the
    // delegated click listener on the rows container only sees the action
    // attributes, but we don't want to lose focus state etc. unnecessarily.
    expect(row.querySelector('civ-action-button[danger]')).toBe(removeBtnBefore);
  });

  it('is a no-op when the row has no summary text node (defensive)', () => {
    const orphan = document.createElement('div');
    orphan.setAttribute('data-civ-repeater-row', '0');
    expect(() => {
      updateFormStepsSummaryText(orphan, { x: 'y' }, 0, 'item');
    }).not.toThrow();
  });
});

describe('buildFormStepShell', () => {
  function buildStepTemplate(): Node[] {
    const stepA = document.createElement('div');
    stepA.setAttribute('data-step-label', 'Name');
    const nameInput = document.createElement('input');
    nameInput.setAttribute('name', 'firstName');
    stepA.appendChild(nameInput);

    const stepB = document.createElement('div');
    stepB.setAttribute('data-step-label', 'Contact');
    const emailInput = document.createElement('input');
    emailInput.setAttribute('name', 'email');
    stepB.appendChild(emailInput);

    return [stepA, stepB];
  }

  it('produces a civ-form-step element with the saved-button label', () => {
    const step = buildFormStepShell({
      template: buildStepTemplate(),
      index: 0,
      itemLabel: 'dependent',
      baseName: 'deps',
      sensitive: false,
      showPause: false,
    });
    expect(step.tagName.toLowerCase()).toBe('civ-form-step');
    expect(step.getAttribute('complete-label')).toBe('Save dependent');
  });

  it('forwards the sensitive flag to the form-step host', () => {
    const step = buildFormStepShell({
      template: buildStepTemplate(),
      index: 0,
      itemLabel: 'dependent',
      baseName: 'deps',
      sensitive: true,
      showPause: false,
    });
    expect(step.hasAttribute('sensitive')).toBe(true);
  });

  it('forwards the show-pause flag to the form-step host', () => {
    const step = buildFormStepShell({
      template: buildStepTemplate(),
      index: 0,
      itemLabel: 'dependent',
      baseName: 'deps',
      sensitive: false,
      showPause: true,
    });
    expect(step.hasAttribute('show-pause')).toBe(true);
  });

  it('indexes [name] attributes inside each [data-step-label] block', () => {
    const step = buildFormStepShell({
      template: buildStepTemplate(),
      index: 3,
      itemLabel: 'dependent',
      baseName: 'dependents',
      sensitive: false,
      showPause: false,
    });
    const inputs = step.querySelectorAll('input');
    expect(inputs[0].getAttribute('name')).toBe('dependents[3].firstName');
    expect(inputs[1].getAttribute('name')).toBe('dependents[3].email');
  });

  it('falls back to "items" when no baseName is provided', () => {
    const step = buildFormStepShell({
      template: buildStepTemplate(),
      index: 0,
      itemLabel: 'dependent',
      baseName: '',
      sensitive: false,
      showPause: false,
    });
    const input = step.querySelector('input')!;
    expect(input.getAttribute('name')).toBe('items[0].firstName');
  });

  it('skips fields whose name already contains [ (idempotent re-index)', () => {
    // The form-steps path calls _buildFormSteps every time the wizard
    // opens, including on edit. If a field was already indexed
    // (`dependents[0].firstName`), re-indexing should not produce
    // `dependents[3].dependents[0].firstName`.
    const tmpl = buildStepTemplate();
    // Pre-index one field to simulate a re-open.
    const first = (tmpl[0] as Element).querySelector('input')!;
    first.setAttribute('name', 'dependents[0].firstName');
    const step = buildFormStepShell({
      template: tmpl,
      index: 3,
      itemLabel: 'dependent',
      baseName: 'dependents',
      sensitive: false,
      showPause: false,
    });
    const inputs = step.querySelectorAll('input');
    expect(inputs[0].getAttribute('name')).toBe('dependents[0].firstName');
    expect(inputs[1].getAttribute('name')).toBe('dependents[3].email');
  });
});

describe('extractFormStepsValues', () => {
  it('captures values from standard form elements', () => {
    container.innerHTML = `
      <input name="firstName" value="Alex" />
      <select name="state">
        <option value="VA" selected>Virginia</option>
      </select>
      <textarea name="notes">hello</textarea>
    `;
    const data = extractFormStepsValues(container);
    expect(data).toEqual({ firstName: 'Alex', state: 'VA', notes: 'hello' });
  });

  it('captures values from civ-* custom elements', () => {
    const input = document.createElement('civ-text-input');
    input.setAttribute('name', 'email');
    (input as HTMLElement & { value?: string }).value = 'a@b.gov';
    container.appendChild(input);

    const data = extractFormStepsValues(container);
    expect(data).toEqual({ email: 'a@b.gov' });
  });

  it('skips elements that have a [name] but no value property', () => {
    container.innerHTML = `
      <div name="not-a-field"></div>
      <input name="real" value="x" />
    `;
    const data = extractFormStepsValues(container);
    expect(data).toEqual({ real: 'x' });
  });

  it('skips fields with no name attribute', () => {
    container.innerHTML = `
      <input value="orphan" />
      <input name="kept" value="y" />
    `;
    const data = extractFormStepsValues(container);
    expect(data).toEqual({ kept: 'y' });
  });
});
