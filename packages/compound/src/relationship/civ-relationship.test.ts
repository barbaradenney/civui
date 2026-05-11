import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import '@civui/inputs';
import '@civui/controls';
import './civ-relationship.js';

afterEach(cleanupFixtures);

describe('civ-relationship', () => {
  it('renders a fieldset with legend', async () => {
    const el = await fixture('<civ-relationship legend="About the dependent" name="dep"></civ-relationship>');

    const fieldset = el.querySelector('fieldset');
    expect(fieldset).not.toBeNull();
    const legend = el.querySelector('legend');
    expect(legend!.textContent).toContain('About the dependent');
  });

  it('renders name fields by default', async () => {
    const el = await fixture('<civ-relationship name="rel"></civ-relationship>');

    const name = el.querySelector('civ-name');
    expect(name).not.toBeNull();
  });

  it('hides name fields when show-name is false', async () => {
    const el = await fixture('<civ-relationship name="rel" show-name="false"></civ-relationship>') as any;
    el.showName = false;
    await elementUpdated(el);

    expect(el.querySelector('civ-name')).toBeNull();
  });

  it('renders relationship type select', async () => {
    const el = await fixture('<civ-relationship name="rel"></civ-relationship>');

    const select = el.querySelector('civ-select');
    expect(select).not.toBeNull();
  });

  it('uses general preset by default', async () => {
    const el = await fixture('<civ-relationship name="rel"></civ-relationship>');
    await elementUpdated(el);

    const select = el.querySelector('[data-relationship-type]') as any;
    expect(select).not.toBeNull();
    const values = select.options.map((o: any) => o.value);
    expect(values).toEqual([
      'spouse', 'domestic-partner', 'child', 'stepchild', 'parent',
      'sibling', 'grandchild', 'grandparent', 'legal-guardian', 'other',
    ]);
  });

  it('switches to dependent preset', async () => {
    const el = await fixture('<civ-relationship name="rel" preset="dependent"></civ-relationship>');
    await elementUpdated(el);

    const select = el.querySelector('[data-relationship-type]') as any;
    const values = select.options.map((o: any) => o.value);
    expect(values).toContain('biological-child');
    expect(values).toContain('stepchild');
    expect(values).not.toContain('other');
  });

  it('switches to survivor preset', async () => {
    const el = await fixture('<civ-relationship name="rel" preset="survivor"></civ-relationship>');
    await elementUpdated(el);

    const select = el.querySelector('[data-relationship-type]') as any;
    const values = select.options.map((o: any) => o.value);
    expect(values).toContain('executor');
    expect(values).toContain('funeral-director');
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-relationship name="rel"></civ-relationship>');
    expect(el.shadowRoot).toBeNull();
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-relationship') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('accepts custom options with plain label strings', async () => {
    const el = await fixture('<civ-relationship name="rel"></civ-relationship>') as any;
    el.options = [
      { value: 'neighbor', label: 'Neighbor', category: 'none' },
      { value: 'coworker', label: 'Coworker', category: 'none' },
      { value: 'other', label: 'Other', category: 'other' },
    ];
    await elementUpdated(el);
    await elementUpdated(el);

    const select = el.querySelector('[data-relationship-type]') as any;
    const labels = select.options.map((o: any) => o.label);
    expect(labels).toEqual(['Neighbor', 'Coworker', 'Other']);
  });

  it('prefers label over labelKey when both are set', async () => {
    const el = await fixture('<civ-relationship name="rel"></civ-relationship>') as any;
    el.options = [
      { value: 'custom', label: 'My Custom Label', labelKey: 'relationshipOther', category: 'none' },
    ];
    await elementUpdated(el);
    await elementUpdated(el);

    const select = el.querySelector('[data-relationship-type]') as any;
    expect(select.options[0].label).toBe('My Custom Label');
  });
});

describe('civ-relationship conditional fields', () => {
  it('shows marriage date when spousal type is selected', async () => {
    const el = await fixture('<civ-relationship name="rel"></civ-relationship>') as any;

    el.relationshipValue = { ...el.relationshipValue, relationship: 'spouse' };
    await elementUpdated(el);

    const dates = el.querySelectorAll('civ-memorable-date');
    const legends = Array.from(dates).map((d: any) => d.getAttribute('legend'));
    expect(legends).toContain('Date of marriage');
  });

  it('hides marriage date when non-spousal type is selected', async () => {
    const el = await fixture('<civ-relationship name="rel"></civ-relationship>') as any;

    el.relationshipValue = { ...el.relationshipValue, relationship: 'parent' };
    await elementUpdated(el);

    const dates = el.querySelectorAll('civ-memorable-date');
    const legends = Array.from(dates).map((d: any) => d.getAttribute('legend'));
    expect(legends).not.toContain('Date of marriage');
  });

  it('shows date of birth when child type is selected', async () => {
    const el = await fixture('<civ-relationship name="rel"></civ-relationship>') as any;

    el.relationshipValue = { ...el.relationshipValue, relationship: 'child' };
    await elementUpdated(el);

    const dates = el.querySelectorAll('civ-memorable-date');
    const legends = Array.from(dates).map((d: any) => d.getAttribute('legend'));
    expect(legends).toContain('Date of birth');
  });

  it('shows other description when other type is selected', async () => {
    const el = await fixture('<civ-relationship name="rel"></civ-relationship>') as any;

    el.relationshipValue = { ...el.relationshipValue, relationship: 'other' };
    await elementUpdated(el);

    const textInput = el.querySelector('civ-text-input[name="rel.otherDescription"]');
    expect(textInput).not.toBeNull();
  });

  it('shows deceased fields when show-deceased is true', async () => {
    const el = await fixture('<civ-relationship name="rel" show-deceased></civ-relationship>');

    const yesNo = el.querySelector('civ-yes-no');
    expect(yesNo).not.toBeNull();
  });

  it('hides deceased fields by default', async () => {
    const el = await fixture('<civ-relationship name="rel"></civ-relationship>');

    expect(el.querySelector('civ-yes-no')).toBeNull();
  });

  it('shows date of death when deceased is yes', async () => {
    const el = await fixture('<civ-relationship name="rel" show-deceased></civ-relationship>') as any;

    el.relationshipValue = { ...el.relationshipValue, deceased: 'yes' };
    await elementUpdated(el);

    const dates = el.querySelectorAll('civ-memorable-date');
    const legends = Array.from(dates).map((d: any) => d.getAttribute('legend'));
    expect(legends).toContain('Date of death');
  });
});

describe('civ-relationship value management', () => {
  it('serializes value as JSON string', async () => {
    const el = await fixture('<civ-relationship name="rel"></civ-relationship>') as any;

    el.relationshipValue = { ...el.relationshipValue, first: 'Jane', last: 'Doe', relationship: 'spouse' };
    await elementUpdated(el);

    const parsed = JSON.parse(el.value);
    expect(parsed.first).toBe('Jane');
    expect(parsed.last).toBe('Doe');
    expect(parsed.relationship).toBe('spouse');
  });

  it('provides typed getter', async () => {
    const el = await fixture('<civ-relationship name="rel"></civ-relationship>') as any;

    el.relationshipValue = { ...el.relationshipValue, relationship: 'child', dateOfBirth: '2010-05-15' };
    await elementUpdated(el);

    const val = el.relationshipValue;
    expect(val.relationship).toBe('child');
    expect(val.dateOfBirth).toBe('2010-05-15');
  });

  it('clears spousal fields when switching from spousal to child category', async () => {
    const el = await fixture('<civ-relationship name="rel"></civ-relationship>') as any;

    el.relationshipValue = { ...el.relationshipValue, relationship: 'spouse', marriageDate: '2020-06-15' };
    await elementUpdated(el);
    expect(el.relationshipValue.marriageDate).toBe('2020-06-15');

    // Simulate changing relationship type via event
    const select = el.querySelector('[data-relationship-type]') as any;
    select.value = 'child';
    select.dispatchEvent(new CustomEvent('civ-change', { detail: { value: 'child' }, bubbles: true }));
    await elementUpdated(el);

    expect(el.relationshipValue.marriageDate).toBe('');
    expect(el.relationshipValue.relationship).toBe('child');
  });

  it('fires civ-change on relationship select change', async () => {
    const el = await fixture('<civ-relationship name="rel"></civ-relationship>');

    const handler = vi.fn();
    el.addEventListener('civ-change', handler as EventListener);

    const select = el.querySelector('[data-relationship-type]') as any;
    select.value = 'parent';
    select.dispatchEvent(new CustomEvent('civ-change', { detail: { value: 'parent' }, bubbles: true }));

    expect(handler).toHaveBeenCalled();
    expect(handler.mock.calls[0][0].detail.value.relationship).toBe('parent');
  });
});

describe('civ-relationship form reset', () => {
  it('clears all data on formResetCallback', async () => {
    const el = await fixture('<civ-relationship name="rel"></civ-relationship>') as any;

    el.relationshipValue = {
      ...el.relationshipValue,
      first: 'Jane',
      relationship: 'spouse',
      marriageDate: '2020-01-01',
    };
    await elementUpdated(el);

    el.formResetCallback();
    await elementUpdated(el);

    const val = el.relationshipValue;
    expect(val.first).toBe('');
    expect(val.relationship).toBe('');
    expect(val.marriageDate).toBe('');
  });

  it('clears all error props on reset', async () => {
    const el = await fixture('<civ-relationship name="rel" name-error="Required" relationship-error="Pick one"></civ-relationship>') as any;

    el.formResetCallback();
    await elementUpdated(el);

    expect(el.nameError).toBe('');
    expect(el.relationshipError).toBe('');
  });

  it('clears the top-level error on reset', async () => {
    // Regression: the pre-extraction reset block in this component (and a
    // few other compounds) silently skipped clearing `this.error`. The
    // _resetCompound helper normalizes the behavior — top-level errors
    // are now cleared on reset like every other compound.
    const el = await fixture('<civ-relationship name="rel" error="Server validation failed"></civ-relationship>') as any;
    expect(el.error).toBe('Server validation failed');

    el.formResetCallback();
    await elementUpdated(el);

    expect(el.error).toBe('');
  });
});

describe('civ-relationship category change error clearing', () => {
  it('clears spousal errors when switching to child category', async () => {
    const el = await fixture('<civ-relationship name="rel" marriage-date-error="Required"></civ-relationship>') as any;

    el.relationshipValue = { ...el.relationshipValue, relationship: 'spouse' };
    await elementUpdated(el);
    expect(el.marriageDateError).toBe('Required');

    // Switch to child category
    const select = el.querySelector('[data-relationship-type]') as any;
    select.dispatchEvent(new CustomEvent('civ-change', { detail: { value: 'child' }, bubbles: true }));
    await elementUpdated(el);

    expect(el.marriageDateError).toBe('');
  });

  it('clears child errors when switching to spousal category', async () => {
    const el = await fixture('<civ-relationship name="rel" date-of-birth-error="Required"></civ-relationship>') as any;

    el.relationshipValue = { ...el.relationshipValue, relationship: 'child' };
    await elementUpdated(el);

    const select = el.querySelector('[data-relationship-type]') as any;
    select.dispatchEvent(new CustomEvent('civ-change', { detail: { value: 'spouse' }, bubbles: true }));
    await elementUpdated(el);

    expect(el.dateOfBirthError).toBe('');
  });
});

describe('civ-relationship readonly', () => {
  it('passes readonly to yes-no', async () => {
    const el = await fixture('<civ-relationship name="rel" show-deceased></civ-relationship>') as any;
    el.readonly = true;
    await elementUpdated(el);

    const yesNo = el.querySelector('civ-yes-no') as any;
    expect(yesNo).not.toBeNull();
    await elementUpdated(yesNo);
    expect(yesNo.readonly).toBe(true);
  });

  it('passes readonly to text inputs', async () => {
    const el = await fixture('<civ-relationship name="rel"></civ-relationship>') as any;
    el.readonly = true;
    el.relationshipValue = { ...el.relationshipValue, relationship: 'other' };
    await elementUpdated(el);

    const textInput = el.querySelector('civ-text-input[name="rel.otherDescription"]');
    expect(textInput).not.toBeNull();
    expect((textInput as any).readonly).toBe(true);
  });
});

describe('civ-relationship deceased-assumed', () => {
  it('shows date of death directly without yes/no question', async () => {
    const el = await fixture('<civ-relationship name="rel" deceased-assumed></civ-relationship>');
    await elementUpdated(el);

    expect(el.querySelector('civ-yes-no')).toBeNull();
    const dateField = el.querySelector('civ-memorable-date');
    expect(dateField).not.toBeNull();
    expect(dateField!.getAttribute('legend')).toBe('Date of death');
  });

  it('auto-sets deceased to yes in the value', async () => {
    const el = await fixture('<civ-relationship name="rel" deceased-assumed></civ-relationship>') as any;
    await elementUpdated(el);

    expect(el.relationshipValue.deceased).toBe('yes');
  });

  it('does not show yes/no even when show-deceased is also set', async () => {
    const el = await fixture('<civ-relationship name="rel" deceased-assumed show-deceased></civ-relationship>');
    await elementUpdated(el);

    // deceased-assumed takes priority
    expect(el.querySelector('civ-yes-no')).toBeNull();
    expect(el.querySelector('civ-memorable-date')).not.toBeNull();
  });
});

describe('civ-relationship sub-component event handlers', () => {
  afterEach(cleanupFixtures);

  it('updates `_data` and fires civ-input when name input fires', async () => {
    const el = await fixture('<civ-relationship name="rel"></civ-relationship>') as any;
    await elementUpdated(el);

    const inputs: any[] = [];
    el.addEventListener('civ-input', (e: any) => inputs.push(e.detail.value));

    const name = el.querySelector('civ-name')!;
    name.dispatchEvent(new CustomEvent('civ-input', {
      detail: { value: { first: 'Jane', middle: '', last: 'Doe', suffix: '' } },
      bubbles: true,
    }));
    await elementUpdated(el);

    expect(el._data.first).toBe('Jane');
    expect(el._data.last).toBe('Doe');
    expect(inputs).toHaveLength(1);
    expect(inputs[0].first).toBe('Jane');
  });

  it('updates `_data` and fires civ-change when name change fires', async () => {
    const el = await fixture('<civ-relationship name="rel"></civ-relationship>') as any;
    await elementUpdated(el);

    const changes: any[] = [];
    el.addEventListener('civ-change', (e: any) => changes.push(e.detail.value));

    const name = el.querySelector('civ-name')!;
    name.dispatchEvent(new CustomEvent('civ-change', {
      detail: { value: { first: 'Jane', middle: '', last: 'Doe', suffix: 'Jr' } },
      bubbles: true,
    }));
    await elementUpdated(el);

    expect(changes).toHaveLength(1);
    expect(changes[0].suffix).toBe('Jr');
  });

  it('handles missing name detail gracefully (preserves existing fields)', async () => {
    const el = await fixture('<civ-relationship name="rel"></civ-relationship>') as any;
    el._data = { ...el._data, first: 'Existing' };
    await elementUpdated(el);

    const name = el.querySelector('civ-name')!;
    name.dispatchEvent(new CustomEvent('civ-input', { detail: {}, bubbles: true }));
    await elementUpdated(el);

    expect(el._data.first).toBe('Existing');
  });

  it('updates date fields via _onDateInput / _onDateChange (spousal)', async () => {
    const el = await fixture(
      '<civ-relationship name="rel" preset="spouse" value=\'{"relationship":"spouse"}\'></civ-relationship>'
    ) as any;
    await elementUpdated(el);

    const date = el.querySelector('civ-memorable-date[name="rel.marriageDate"]') as any;
    expect(date).not.toBeNull();
    date.dispatchEvent(new CustomEvent('civ-input', { detail: { value: '2010-06-15' }, bubbles: true }));
    await elementUpdated(el);

    expect(el._data.marriageDate).toBe('2010-06-15');

    date.dispatchEvent(new CustomEvent('civ-change', { detail: { value: '2010-06-15' }, bubbles: true }));
    await elementUpdated(el);

    expect(el._data.marriageDate).toBe('2010-06-15');
  });

  it('clears date-of-death when deceased changes from yes to no', async () => {
    const el = await fixture('<civ-relationship name="rel" show-deceased></civ-relationship>') as any;
    await elementUpdated(el);

    el._data = { ...el._data, deceased: 'yes', dateOfDeath: '2020-01-01' };
    await elementUpdated(el);

    const yesNo = el.querySelector('civ-yes-no')!;
    yesNo.dispatchEvent(new CustomEvent('civ-change', { detail: { value: 'no' }, bubbles: true }));
    await elementUpdated(el);

    expect(el._data.deceased).toBe('no');
    expect(el._data.dateOfDeath).toBe('');
  });

  it('updates otherDescription on civ-input from `other` text input', async () => {
    const el = await fixture('<civ-relationship name="rel" preset="other"></civ-relationship>') as any;
    el._data = { ...el._data, relationship: 'other' };
    await elementUpdated(el);

    const input = el.querySelector('civ-text-input[name="rel.otherDescription"]') as any;
    expect(input).not.toBeNull();
    input.dispatchEvent(new CustomEvent('civ-input', { detail: { value: 'Cousin' }, bubbles: true }));
    await elementUpdated(el);

    expect(el._data.otherDescription).toBe('Cousin');
  });

  it('fires civ-change on otherDescription commit', async () => {
    const el = await fixture('<civ-relationship name="rel" preset="other"></civ-relationship>') as any;
    el._data = { ...el._data, relationship: 'other' };
    await elementUpdated(el);

    const changes: any[] = [];
    el.addEventListener('civ-change', (e: any) => changes.push(e.detail.value));

    const input = el.querySelector('civ-text-input[name="rel.otherDescription"]') as any;
    input.dispatchEvent(new CustomEvent('civ-change', { detail: { value: 'Cousin' }, bubbles: true }));
    await elementUpdated(el);

    expect(changes).toHaveLength(1);
    expect(changes[0].otherDescription).toBe('Cousin');
  });
});

describe('civ-relationship hide-name + show-name trap', () => {
  it('renders name fields by default', async () => {
    const el = await fixture('<civ-relationship name="rel"></civ-relationship>');
    await elementUpdated(el);
    expect(el.querySelector('civ-name')).not.toBeNull();
  });

  it('hides name fields when hide-name is set', async () => {
    const el = await fixture('<civ-relationship name="rel" hide-name></civ-relationship>');
    await elementUpdated(el);
    expect(el.querySelector('civ-name')).toBeNull();
  });

  it('warns when show-name="false" is used (HTML-boolean trap)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      await fixture('<civ-relationship name="rel" show-name="false"></civ-relationship>');
      expect(warn).toHaveBeenCalled();
      const msg = warn.mock.calls.map(c => c[0]).join(' ');
      expect(msg).toMatch(/show-name="false"/);
      expect(msg).toMatch(/hide-name/);
    } finally {
      warn.mockRestore();
    }
  });

  it('does not warn when show-name is used correctly (no value)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      await fixture('<civ-relationship name="rel" show-name></civ-relationship>');
      const showNameWarns = warn.mock.calls.filter(c => String(c[0]).includes('show-name'));
      expect(showNameWarns).toHaveLength(0);
    } finally {
      warn.mockRestore();
    }
  });
});
