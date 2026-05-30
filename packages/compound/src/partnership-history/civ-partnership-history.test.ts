import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import '@civui/inputs';
import './civ-partnership-history.js';

afterEach(cleanupFixtures);

describe('civ-partnership-history', () => {
  it('renders a fieldset with legend', async () => {
    const el = await fixture('<civ-partnership-history legend="First marriage" name="m1"></civ-partnership-history>');
    const fieldset = el.querySelector('fieldset');
    expect(fieldset).not.toBeNull();
    const legend = el.querySelector('legend');
    expect(legend!.textContent).toContain('First marriage');
  });

  it('renders spouse name fields', async () => {
    const el = await fixture('<civ-partnership-history name="m"></civ-partnership-history>');
    expect(el.querySelector('civ-name')).not.toBeNull();
  });

  it('cascades required to the spouse civ-name child', async () => {
    const el = await fixture('<civ-partnership-history name="m" required></civ-partnership-history>');
    const name = el.querySelector('civ-name') as HTMLElement;
    expect(name.hasAttribute('required')).toBe(true);
  });

  it('renders marriage date', async () => {
    const el = await fixture('<civ-partnership-history name="m"></civ-partnership-history>');
    const dates = el.querySelectorAll('civ-memorable-date');
    expect(dates.length).toBeGreaterThanOrEqual(1);
  });

  it('renders marriage status radio group', async () => {
    const el = await fixture('<civ-partnership-history name="m"></civ-partnership-history>');
    const radioGroup = el.querySelector('civ-radio-group');
    expect(radioGroup).not.toBeNull();
  });

  it('hides end date when status is current', async () => {
    const el = await fixture('<civ-partnership-history name="m"></civ-partnership-history>') as any;
    el.marriageValue = { ...el.marriageValue, status: 'current' };
    await elementUpdated(el);

    // civ-memorable-date is self-contained — its `legend` attribute
    // is the visible group label. Collect those.
    const dates = el.querySelectorAll('civ-memorable-date');
    const legends = Array.from(dates).map((d: any) => d.getAttribute('legend'));
    expect(legends).not.toContain('Date marriage ended');
  });

  it('shows end date when status is divorced', async () => {
    const el = await fixture('<civ-partnership-history name="m"></civ-partnership-history>') as any;
    el.marriageValue = { ...el.marriageValue, status: 'divorced' };
    await elementUpdated(el);

    // civ-memorable-date is self-contained — its `legend` attribute
    // is the visible group label. Collect those.
    const dates = el.querySelectorAll('civ-memorable-date');
    const legends = Array.from(dates).map((d: any) => d.getAttribute('legend'));
    expect(legends).toContain('Date marriage ended');
  });

  it('shows end date with sensitive label when status is widowed', async () => {
    const el = await fixture('<civ-partnership-history name="m"></civ-partnership-history>') as any;
    el.marriageValue = { ...el.marriageValue, status: 'widowed' };
    await elementUpdated(el);

    // civ-memorable-date is self-contained — its `legend` attribute
    // is the visible group label. Collect those.
    const dates = el.querySelectorAll('civ-memorable-date');
    const legends = Array.from(dates).map((d: any) => d.getAttribute('legend'));
    expect(legends).toContain('Date of their passing');
  });

  it('clears end date when switching to current', async () => {
    const el = await fixture('<civ-partnership-history name="m"></civ-partnership-history>') as any;
    el.marriageValue = { ...el.marriageValue, status: 'divorced', endDate: '2020-01-01' };
    await elementUpdated(el);

    const radioGroup = el.querySelector('civ-radio-group') as any;
    radioGroup.dispatchEvent(new CustomEvent('civ-change', { detail: { value: 'current' }, bubbles: true }));
    await elementUpdated(el);

    expect(el.marriageValue.endDate).toBe('');
  });

  it('serializes value as JSON', async () => {
    const el = await fixture('<civ-partnership-history name="m"></civ-partnership-history>') as any;
    el.marriageValue = { ...el.marriageValue, spouseFirst: 'Jane', marriageDate: '2015-06-20', status: 'current' };
    await elementUpdated(el);

    const parsed = JSON.parse(el.value);
    expect(parsed.spouseFirst).toBe('Jane');
    expect(parsed.status).toBe('current');
  });

  it('fires civ-change on status change', async () => {
    const el = await fixture('<civ-partnership-history name="m"></civ-partnership-history>');
    const handler = vi.fn();
    el.addEventListener('civ-change', handler as EventListener);

    const radioGroup = el.querySelector('civ-radio-group') as any;
    radioGroup.dispatchEvent(new CustomEvent('civ-change', { detail: { value: 'divorced' }, bubbles: true }));

    expect(handler).toHaveBeenCalled();
  });

  it('resets all data on formResetCallback', async () => {
    const el = await fixture('<civ-partnership-history name="m"></civ-partnership-history>') as any;
    el.marriageValue = { ...el.marriageValue, spouseFirst: 'Jane', status: 'divorced', endDate: '2020-01-01' };
    await elementUpdated(el);

    el.formResetCallback();
    await elementUpdated(el);

    expect(el.marriageValue.spouseFirst).toBe('');
    expect(el.marriageValue.status).toBe('');
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-partnership-history name="m"></civ-partnership-history>');
    expect(el.shadowRoot).toBeNull();
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-partnership-history') as any;
    expect(Ctor.formAssociated).toBe(true);
  });
});

describe('civ-partnership-history step prop', () => {
  it('renders only the partner name + type for step="who"', async () => {
    const el = await fixture('<civ-partnership-history name="m" step="who" show-marriage-type></civ-partnership-history>');
    expect(el.querySelector('civ-name')).not.toBeNull();
    expect(el.querySelector('[data-marriage-type]')).not.toBeNull();
    expect(el.querySelector('[data-marriage-status]')).toBeNull();
    expect(el.querySelector('civ-memorable-date')).toBeNull();
  });

  it('renders only the type-specific date/location for step="details"', async () => {
    const el = await fixture('<civ-partnership-history name="m" step="details"></civ-partnership-history>');
    expect(el.querySelector('civ-name')).toBeNull();
    expect(el.querySelector('[data-marriage-status]')).toBeNull();
    expect(el.querySelector('civ-memorable-date')).not.toBeNull();
  });

  it('renders only the status + end-date for step="status"', async () => {
    const el = await fixture('<civ-partnership-history name="m" step="status"></civ-partnership-history>') as any;
    el.marriageValue = { ...el.marriageValue, status: 'divorced' };
    await elementUpdated(el);
    expect(el.querySelector('civ-name')).toBeNull();
    expect(el.querySelector('[data-marriage-status]')).not.toBeNull();
    expect(el.querySelector('civ-memorable-date')).not.toBeNull();
  });

  it('renders all sections when step is unset', async () => {
    const el = await fixture('<civ-partnership-history name="m" show-marriage-type></civ-partnership-history>');
    expect(el.querySelector('civ-name')).not.toBeNull();
    expect(el.querySelector('[data-marriage-type]')).not.toBeNull();
    expect(el.querySelector('[data-marriage-status]')).not.toBeNull();
  });

  it('uses step-specific default legend when consumer omits legend', async () => {
    const el = await fixture('<civ-partnership-history name="m" step="who"></civ-partnership-history>');
    const legend = el.querySelector('legend');
    expect(legend?.textContent).toContain('About your partner');
  });

  it('consumer-supplied legend overrides the step default', async () => {
    const el = await fixture('<civ-partnership-history name="m" step="who" legend="Tell us about your spouse"></civ-partnership-history>');
    const legend = el.querySelector('legend');
    expect(legend?.textContent).toContain('Tell us about your spouse');
  });
});

describe('civ-partnership-history status-assumed', () => {
  it('skips the status radio group when status-assumed is set', async () => {
    const el = await fixture('<civ-partnership-history name="m" status-assumed="widowed"></civ-partnership-history>');
    await elementUpdated(el);

    expect(el.querySelector('civ-radio-group')).toBeNull();
  });

  it('auto-sets status in the value', async () => {
    const el = await fixture('<civ-partnership-history name="m" status-assumed="widowed"></civ-partnership-history>') as any;
    await elementUpdated(el);

    expect(el.marriageValue.status).toBe('widowed');
  });

  it('shows date field with sensitive label for widowed', async () => {
    const el = await fixture('<civ-partnership-history name="m" status-assumed="widowed"></civ-partnership-history>') as any;
    await elementUpdated(el);

    // civ-memorable-date is self-contained — its `legend` attribute
    // is the visible group label. Collect those.
    const dates = el.querySelectorAll('civ-memorable-date');
    const legends = Array.from(dates).map((d: any) => d.getAttribute('legend'));
    expect(legends).toContain('Date of their passing');
    expect(legends).not.toContain('Date marriage ended');
  });

  it('uses standard label for non-widowed assumed status', async () => {
    const el = await fixture('<civ-partnership-history name="m" status-assumed="divorced"></civ-partnership-history>') as any;
    await elementUpdated(el);

    // civ-memorable-date is self-contained — its `legend` attribute
    // is the visible group label. Collect those.
    const dates = el.querySelectorAll('civ-memorable-date');
    const legends = Array.from(dates).map((d: any) => d.getAttribute('legend'));
    expect(legends).toContain('Date marriage ended');
  });
});

describe('civ-partnership-history marriage type', () => {
  it('hides marriage type by default', async () => {
    const el = await fixture('<civ-partnership-history name="m"></civ-partnership-history>');
    expect(el.querySelector('[data-marriage-type]')).toBeNull();
  });

  it('shows marriage type select when show-marriage-type is set', async () => {
    const el = await fixture('<civ-partnership-history name="m" show-marriage-type></civ-partnership-history>');
    await elementUpdated(el);

    const select = el.querySelector('[data-marriage-type]') as any;
    expect(select).not.toBeNull();
    expect(select.options.length).toBe(6);
  });

  it('shows marriage-category fields for legal marriage (date, city, state)', async () => {
    const el = await fixture('<civ-partnership-history name="m" show-marriage-type></civ-partnership-history>') as any;
    el.marriageValue = { ...el.marriageValue, marriageType: 'legal' };
    await elementUpdated(el);

    // civ-memorable-date is self-contained — its `legend` attribute
    // is the visible group label. Collect those.
    const dates = el.querySelectorAll('civ-memorable-date');
    const legends = Array.from(dates).map((d: any) => d.getAttribute('legend'));
    expect(legends).toContain('Date of marriage');
    expect(el.querySelector('civ-text-input[name="m.marriageCity"]')).not.toBeNull();
  });

  it('shows civil-union-category fields for civil union (date, jurisdiction)', async () => {
    const el = await fixture('<civ-partnership-history name="m" show-marriage-type></civ-partnership-history>') as any;
    el.marriageValue = { ...el.marriageValue, marriageType: 'civil-union' };
    await elementUpdated(el);

    // civ-memorable-date is self-contained — its `legend` attribute
    // is the visible group label. Collect those.
    const dates = el.querySelectorAll('civ-memorable-date');
    const legends = Array.from(dates).map((d: any) => d.getAttribute('legend'));
    expect(legends).toContain('Date of registration');
    expect(el.querySelector('civ-text-input[name="m.jurisdiction"]')).not.toBeNull();
    // Should NOT show marriage-category fields
    expect(el.querySelector('civ-text-input[name="m.marriageCity"]')).toBeNull();
  });

  it('shows cohabitation fields for common law (start date, state, description)', async () => {
    const el = await fixture('<civ-partnership-history name="m" show-marriage-type></civ-partnership-history>') as any;
    el.marriageValue = { ...el.marriageValue, marriageType: 'common-law' };
    await elementUpdated(el);

    // civ-memorable-date is self-contained — its `legend` attribute
    // is the visible group label. Collect those.
    const dates = el.querySelectorAll('civ-memorable-date');
    const legends = Array.from(dates).map((d: any) => d.getAttribute('legend'));
    expect(legends).toContain('Date you began living together');
    expect(el.querySelector('civ-text-input[name="m.cohabitationState"]')).not.toBeNull();
    expect(el.querySelector('civ-text-input[name="m.marriageTypeDescription"]')).not.toBeNull();
  });

  it('shows approximate date and description for other type', async () => {
    const el = await fixture('<civ-partnership-history name="m" show-marriage-type></civ-partnership-history>') as any;
    el.marriageValue = { ...el.marriageValue, marriageType: 'other' };
    await elementUpdated(el);

    // civ-memorable-date is self-contained — its `legend` attribute
    // is the visible group label. Collect those.
    const dates = el.querySelectorAll('civ-memorable-date');
    const legends = Array.from(dates).map((d: any) => d.getAttribute('legend'));
    expect(legends).toContain('Approximate date union began');
    expect(el.querySelector('civ-text-input[name="m.marriageTypeDescription"]')).not.toBeNull();
  });

  it('clears marriage-category fields when switching to civil-union category', async () => {
    const el = await fixture('<civ-partnership-history name="m" show-marriage-type></civ-partnership-history>') as any;
    el.marriageValue = { ...el.marriageValue, marriageType: 'legal', marriageDate: '2020-06-15', marriageCity: 'Austin' };
    await elementUpdated(el);

    const select = el.querySelector('[data-marriage-type]') as any;
    select.dispatchEvent(new CustomEvent('civ-change', { detail: { value: 'civil-union' }, bubbles: true }));
    await elementUpdated(el);

    expect(el.marriageValue.marriageDate).toBe('');
    expect(el.marriageValue.marriageCity).toBe('');
  });
});

describe('civ-partnership-history adaptive status options', () => {
  afterEach(() => {});

  it('uses marriage status vocabulary when showMarriageType is off (implicit marriage)', async () => {
    const el = await fixture('<civ-partnership-history name="m"></civ-partnership-history>') as any;
    await elementUpdated(el);
    const radios = el.querySelectorAll('[data-marriage-status] civ-radio');
    const values = Array.from(radios).map((r: any) => r.getAttribute('value'));
    expect(values).toEqual(['current', 'divorced', 'widowed', 'annulled']);
  });

  it('uses marriage status vocabulary when type is legal marriage', async () => {
    const el = await fixture('<civ-partnership-history name="m" show-marriage-type></civ-partnership-history>') as any;
    el.marriageValue = { ...el.marriageValue, marriageType: 'legal' };
    await elementUpdated(el);
    const radios = el.querySelectorAll('[data-marriage-status] civ-radio');
    const values = Array.from(radios).map((r: any) => r.getAttribute('value'));
    expect(values).toContain('divorced');
    expect(values).toContain('widowed');
    expect(values).toContain('annulled');
  });

  it('switches to partnership status vocabulary for cohabitation', async () => {
    const el = await fixture('<civ-partnership-history name="m" show-marriage-type></civ-partnership-history>') as any;
    el.marriageValue = { ...el.marriageValue, marriageType: 'common-law' };
    await elementUpdated(el);
    const radios = el.querySelectorAll('[data-marriage-status] civ-radio');
    const values = Array.from(radios).map((r: any) => r.getAttribute('value'));
    expect(values).toEqual(['current', 'ended', 'partner-deceased']);
  });

  it('switches to partnership status vocabulary for civil-union / DP', async () => {
    const el = await fixture('<civ-partnership-history name="m" show-marriage-type></civ-partnership-history>') as any;
    el.marriageValue = { ...el.marriageValue, marriageType: 'civil-union' };
    await elementUpdated(el);
    const radios = el.querySelectorAll('[data-marriage-status] civ-radio');
    const values = Array.from(radios).map((r: any) => r.getAttribute('value'));
    expect(values).not.toContain('divorced');
    expect(values).not.toContain('annulled');
    expect(values).toContain('ended');
    expect(values).toContain('partner-deceased');
  });

  it('uses "Date the relationship ended" for ended status (partnership)', async () => {
    const el = await fixture('<civ-partnership-history name="m" show-marriage-type></civ-partnership-history>') as any;
    el.marriageValue = { ...el.marriageValue, marriageType: 'common-law', status: 'ended' };
    await elementUpdated(el);
    const endDate = el.querySelector('civ-memorable-date[name="m.endDate"]');
    expect(endDate?.getAttribute('legend')).toBe('Date the relationship ended');
  });

  it('uses "Date of their passing" for partner-deceased status', async () => {
    const el = await fixture('<civ-partnership-history name="m" show-marriage-type></civ-partnership-history>') as any;
    el.marriageValue = { ...el.marriageValue, marriageType: 'common-law', status: 'partner-deceased' };
    await elementUpdated(el);
    const endDate = el.querySelector('civ-memorable-date[name="m.endDate"]');
    expect(endDate?.getAttribute('legend')).toBe('Date of their passing');
  });
});

describe('civ-partnership-history default legend', () => {
  afterEach(() => {});

  it('defaults to the inclusive "About this partnership" rather than marriage-specific text', async () => {
    const el = await fixture('<civ-partnership-history name="m"></civ-partnership-history>') as any;
    await elementUpdated(el);
    // The top-level legend is rendered via renderFormHeader → renderLegend.
    // Look for the legend element with the "About this" text.
    const legendText = el.querySelector('legend')?.textContent ?? '';
    expect(legendText).toContain('About this partnership');
  });

  it('honors a consumer-set legend over the default', async () => {
    const el = await fixture('<civ-partnership-history name="m" legend="About this marriage"></civ-partnership-history>') as any;
    await elementUpdated(el);
    const legendText = el.querySelector('legend')?.textContent ?? '';
    expect(legendText).toContain('About this marriage');
  });
});

describe('civ-partnership-history sub-component event handlers', () => {
  afterEach(cleanupFixtures);

  it('updates spouse name fields and fires civ-input on civ-name input', async () => {
    const el = await fixture('<civ-partnership-history name="m"></civ-partnership-history>') as any;
    await elementUpdated(el);

    const inputs: any[] = [];
    el.addEventListener('civ-input', (e: any) => inputs.push(e.detail.value));

    const name = el.querySelector('civ-name')!;
    name.dispatchEvent(new CustomEvent('civ-input', {
      detail: { value: { first: 'Alice', middle: '', last: 'Smith', suffix: '' } },
      bubbles: true,
    }));
    await elementUpdated(el);

    expect(el._data.spouseFirst).toBe('Alice');
    expect(el._data.spouseLast).toBe('Smith');
    expect(inputs).toHaveLength(1);
  });

  it('fires civ-change on civ-name commit', async () => {
    const el = await fixture('<civ-partnership-history name="m"></civ-partnership-history>') as any;
    await elementUpdated(el);

    const changes: any[] = [];
    el.addEventListener('civ-change', (e: any) => changes.push(e.detail.value));

    const name = el.querySelector('civ-name')!;
    name.dispatchEvent(new CustomEvent('civ-change', {
      detail: { value: { first: 'Alice', middle: '', last: 'Smith', suffix: 'Jr' } },
      bubbles: true,
    }));
    await elementUpdated(el);

    expect(changes).toHaveLength(1);
    expect(changes[0].spouseSuffix).toBe('Jr');
  });

  it('updates a date field via _onFieldInput / _onFieldChange (marriage ceremony date)', async () => {
    const el = await fixture('<civ-partnership-history name="m" status-assumed="current"></civ-partnership-history>') as any;
    await elementUpdated(el);

    const date = el.querySelector('civ-memorable-date[name="m.marriageDate"]') as any;
    expect(date).not.toBeNull();
    date.dispatchEvent(new CustomEvent('civ-input', { detail: { value: '2010-06-15' }, bubbles: true }));
    await elementUpdated(el);
    expect(el._data.marriageDate).toBe('2010-06-15');

    date.dispatchEvent(new CustomEvent('civ-change', { detail: { value: '2010-06-15' }, bubbles: true }));
    await elementUpdated(el);
    expect(el._data.marriageDate).toBe('2010-06-15');
  });

  it('clears a stale cross-vocabulary status when the partnership type flips', async () => {
    const el = await fixture('<civ-partnership-history name="m" show-marriage-type></civ-partnership-history>') as any;
    await elementUpdated(el);
    const typeSelect = el.querySelector('[data-marriage-type]');
    typeSelect.dispatchEvent(new CustomEvent('civ-change', { detail: { value: 'legal' }, bubbles: true }));
    await elementUpdated(el);
    el.querySelector('[data-marriage-status]')
      .dispatchEvent(new CustomEvent('civ-change', { detail: { value: 'divorced' }, bubbles: true }));
    await elementUpdated(el);
    expect(el._data.status).toBe('divorced');

    // 'divorced' isn't a valid status in the partnership (common-law) vocabulary.
    typeSelect.dispatchEvent(new CustomEvent('civ-change', { detail: { value: 'common-law' }, bubbles: true }));
    await elementUpdated(el);
    expect(el._data.status).toBe('');
    expect(el._data.endDate).toBe('');
  });

  it('preserves a status that is valid in both vocabularies across a same-vocab type flip', async () => {
    const el = await fixture('<civ-partnership-history name="m" show-marriage-type></civ-partnership-history>') as any;
    await elementUpdated(el);
    const typeSelect = el.querySelector('[data-marriage-type]');
    typeSelect.dispatchEvent(new CustomEvent('civ-change', { detail: { value: 'civil-union' }, bubbles: true }));
    await elementUpdated(el);
    el.querySelector('[data-marriage-status]')
      .dispatchEvent(new CustomEvent('civ-change', { detail: { value: 'ended' }, bubbles: true }));
    await elementUpdated(el);
    // civil-union → common-law: both use the partnership vocabulary, so 'ended' survives.
    typeSelect.dispatchEvent(new CustomEvent('civ-change', { detail: { value: 'common-law' }, bubbles: true }));
    await elementUpdated(el);
    expect(el._data.status).toBe('ended');
  });

  it('required partnership is invalid until partner last name and status are set', async () => {
    const el = await fixture('<civ-partnership-history name="m" required></civ-partnership-history>') as any;
    await elementUpdated(el);
    expect(el.checkValidity()).toBe(false);

    el.marriageValue = { ...el.marriageValue, spouseLast: 'Doe' };
    await elementUpdated(el);
    expect(el.checkValidity()).toBe(false); // status still missing

    el.marriageValue = { ...el.marriageValue, status: 'current' };
    await elementUpdated(el);
    expect(el.checkValidity()).toBe(true);
  });
});
