import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import '@civui/inputs';
import './civ-service-history.js';

afterEach(cleanupFixtures);

describe('civ-service-history', () => {
  it('renders a fieldset with legend', async () => {
    const el = await fixture('<civ-service-history legend="Service period 1" name="s1"></civ-service-history>');
    const fieldset = el.querySelector('fieldset');
    expect(fieldset).not.toBeNull();
    const legend = el.querySelector('legend');
    expect(legend!.textContent).toContain('Service period 1');
  });

  it('renders branch select with options', async () => {
    const el = await fixture('<civ-service-history name="s"></civ-service-history>');
    await elementUpdated(el);
    const branchSelect = el.querySelector('[data-service-branch]') as any;
    expect(branchSelect).not.toBeNull();
    expect(branchSelect.options.length).toBe(18);
    expect(branchSelect.options[0].value).toBe('army');
  });

  it('renders discharge type select with options', async () => {
    const el = await fixture('<civ-service-history name="s"></civ-service-history>');
    await elementUpdated(el);
    const dischargeSelect = el.querySelector('[data-service-discharge]') as any;
    expect(dischargeSelect).not.toBeNull();
    expect(dischargeSelect.options.length).toBe(6);
    expect(dischargeSelect.options[0].value).toBe('honorable');
  });

  it('renders start and end date fields', async () => {
    const el = await fixture('<civ-service-history name="s"></civ-service-history>');
    const dates = el.querySelectorAll('civ-memorable-date');
    expect(dates.length).toBe(2);
  });

  it('hides service number by default', async () => {
    const el = await fixture('<civ-service-history name="s"></civ-service-history>');
    const serviceNum = el.querySelector('civ-text-input[name="s.serviceNumber"]');
    expect(serviceNum).toBeNull();
  });

  it('shows service number when show-service-number is set', async () => {
    const el = await fixture('<civ-service-history name="s" show-service-number></civ-service-history>');
    const serviceNum = el.querySelector('civ-text-input[name="s.serviceNumber"]');
    expect(serviceNum).not.toBeNull();
  });

  it('serializes value as JSON', async () => {
    const el = await fixture('<civ-service-history name="s"></civ-service-history>') as any;
    el.serviceValue = { ...el.serviceValue, branch: 'navy', startDate: '2005-06-01', endDate: '2010-06-01', dischargeType: 'honorable' };
    await elementUpdated(el);

    const parsed = JSON.parse(el.value);
    expect(parsed.branch).toBe('navy');
    expect(parsed.dischargeType).toBe('honorable');
  });

  it('provides typed getter', async () => {
    const el = await fixture('<civ-service-history name="s"></civ-service-history>') as any;
    el.serviceValue = { ...el.serviceValue, branch: 'army' };
    expect(el.serviceValue.branch).toBe('army');
  });

  it('fires civ-change on branch change', async () => {
    const el = await fixture('<civ-service-history name="s"></civ-service-history>');
    const handler = vi.fn();
    el.addEventListener('civ-change', handler as EventListener);

    const branchSelect = el.querySelector('[data-service-branch]') as any;
    branchSelect.dispatchEvent(new CustomEvent('civ-change', { detail: { value: 'navy' }, bubbles: true }));

    expect(handler).toHaveBeenCalled();
    expect(handler.mock.calls[0][0].detail.value.branch).toBe('navy');
  });

  it('resets all data on formResetCallback', async () => {
    const el = await fixture('<civ-service-history name="s"></civ-service-history>') as any;
    el.serviceValue = { ...el.serviceValue, branch: 'army', startDate: '2005-01-01' };
    await elementUpdated(el);

    el.formResetCallback();
    await elementUpdated(el);

    expect(el.serviceValue.branch).toBe('');
    expect(el.serviceValue.startDate).toBe('');
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-service-history name="s"></civ-service-history>');
    expect(el.shadowRoot).toBeNull();
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-service-history') as any;
    expect(Ctor.formAssociated).toBe(true);
  });
});

describe('civ-service-history sub-component event handlers', () => {
  afterEach(cleanupFixtures);

  it('updates dischargeType on civ-select change and dispatches civ-input + civ-change', async () => {
    const el = await fixture('<civ-service-history name="s"></civ-service-history>') as any;
    await elementUpdated(el);

    const inputs: any[] = [];
    const changes: any[] = [];
    el.addEventListener('civ-input', (e: any) => inputs.push(e.detail.value));
    el.addEventListener('civ-change', (e: any) => changes.push(e.detail.value));

    const select = el.querySelector('[data-service-discharge]')!;
    select.dispatchEvent(new CustomEvent('civ-change', {
      detail: { value: 'honorable' }, bubbles: true,
    }));
    await elementUpdated(el);

    expect(el._service.dischargeType).toBe('honorable');
    expect(inputs).toHaveLength(1);
    expect(changes).toHaveLength(1);
  });

  it('updates start/end date fields via _onFieldInput / _onFieldChange', async () => {
    const el = await fixture('<civ-service-history name="s"></civ-service-history>') as any;
    await elementUpdated(el);

    const startDate = el.querySelector('civ-memorable-date[name="s.startDate"]') as any;
    expect(startDate).not.toBeNull();
    startDate.dispatchEvent(new CustomEvent('civ-input', { detail: { value: '2010-01-01' }, bubbles: true }));
    await elementUpdated(el);
    expect(el._service.startDate).toBe('2010-01-01');

    startDate.dispatchEvent(new CustomEvent('civ-change', { detail: { value: '2010-01-01' }, bubbles: true }));
    await elementUpdated(el);
    expect(el._service.startDate).toBe('2010-01-01');
  });
});
