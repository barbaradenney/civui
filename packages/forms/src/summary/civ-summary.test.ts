import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-summary.js';
import type { CivSummary, SummarySection } from './civ-summary.js';

afterEach(cleanupFixtures);

describe('civ-summary', () => {
  const sampleSections: SummarySection[] = [
    {
      heading: 'Personal information',
      editHref: '#step-1',
      items: [
        { label: 'First name', value: 'Jane' },
        { label: 'Last name', value: 'Doe' },
        { label: 'Phone number' }, // no value — should show "Not provided"
      ],
    },
    {
      heading: 'Address',
      editHref: '#step-2',
      items: [
        { label: 'Street', value: '123 Main St' },
        { label: 'City', value: 'Springfield' },
        { label: 'State', value: 'IL' },
      ],
    },
  ];

  it('renders a heading', async () => {
    const el = await fixture<CivSummary>('<civ-summary heading="Review your application"></civ-summary>');

    const h2 = el.querySelector('h2');
    expect(h2).not.toBeNull();
    expect(h2!.textContent).toBe('Review your application');
  });

  it('renders sections with headings', async () => {
    const el = await fixture<CivSummary>('<civ-summary heading="Review"></civ-summary>') as CivSummary;
    el.sections = sampleSections;
    await elementUpdated(el);

    const h3s = el.querySelectorAll('h3');
    expect(h3s.length).toBe(2);
    expect(h3s[0].textContent).toBe('Personal information');
    expect(h3s[1].textContent).toBe('Address');
  });

  it('renders items as definition list', async () => {
    const el = await fixture<CivSummary>('<civ-summary></civ-summary>') as CivSummary;
    el.sections = sampleSections;
    await elementUpdated(el);

    const dts = el.querySelectorAll('dt');
    const dds = el.querySelectorAll('dd');

    expect(dts.length).toBe(6);
    expect(dts[0].textContent).toBe('First name');
    expect(dds[0].textContent!.trim()).toBe('Jane');
  });

  it('shows "Not provided" for missing values', async () => {
    const el = await fixture<CivSummary>('<civ-summary></civ-summary>') as CivSummary;
    el.sections = sampleSections;
    await elementUpdated(el);

    const dds = el.querySelectorAll('dd');
    expect(dds[2].textContent).toContain('Not provided');
  });

  it('renders edit links with correct href', async () => {
    const el = await fixture<CivSummary>('<civ-summary></civ-summary>') as CivSummary;
    el.sections = sampleSections;
    await elementUpdated(el);

    const links = el.querySelectorAll('.civ-summary-section > div > div > civ-link');
    expect(links.length).toBe(2);
    expect(links[0].getAttribute('href')).toBe('#step-1');
    expect(links[1].getAttribute('href')).toBe('#step-2');
  });

  it('edit links use tertiary variant', async () => {
    const el = await fixture<CivSummary>('<civ-summary></civ-summary>') as CivSummary;
    el.sections = sampleSections;
    await elementUpdated(el);

    const link = el.querySelector('.civ-summary-section civ-link');
    expect(link!.getAttribute('variant')).toBe('tertiary');
  });

  it('fires civ-summary-edit when edit is clicked', async () => {
    const el = await fixture<CivSummary>('<civ-summary></civ-summary>') as CivSummary;
    el.sections = sampleSections;
    await elementUpdated(el);

    let eventDetail: any = null;
    el.addEventListener('civ-summary-edit', ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    const link = el.querySelector('.civ-summary-section civ-link') as HTMLElement;
    link.click();

    expect(eventDetail).not.toBeNull();
    expect(eventDetail.section).toBe('Personal information');
    expect(eventDetail.href).toBe('#step-1');
  });

  it('omits edit link when editHref is not provided', async () => {
    const el = await fixture<CivSummary>('<civ-summary></civ-summary>') as CivSummary;
    el.sections = [
      {
        heading: 'Read only section',
        items: [{ label: 'Name', value: 'Jane' }],
      },
    ];
    await elementUpdated(el);

    const links = el.querySelectorAll('.civ-summary-section civ-link');
    expect(links.length).toBe(0);
  });

  it('renders array values as separate lines', async () => {
    const el = await fixture<CivSummary>('<civ-summary></civ-summary>') as CivSummary;
    el.sections = [
      {
        heading: 'Preferences',
        items: [
          { label: 'Languages', value: ['English', 'Spanish', 'French'] },
        ],
      },
    ];
    await elementUpdated(el);

    const dd = el.querySelector('dd')!;
    const spans = dd.querySelectorAll('span');
    expect(spans.length).toBe(3);
    expect(spans[0].textContent).toBe('English');
    expect(spans[1].textContent).toBe('Spanish');
  });

  it('uses Light DOM (no shadow root)', async () => {
    const el = await fixture<CivSummary>('<civ-summary heading="Review"></civ-summary>');
    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('h2')).not.toBeNull();
  });

  it('has region role with aria-label', async () => {
    const el = await fixture<CivSummary>('<civ-summary heading="Review your info"></civ-summary>');

    const region = el.querySelector('[role="region"]');
    expect(region).not.toBeNull();
    expect(region!.getAttribute('aria-label')).toBe('Review your info');
  });

  it('renders empty when no sections provided', async () => {
    const el = await fixture<CivSummary>('<civ-summary heading="Review"></civ-summary>');

    const sections = el.querySelectorAll('.civ-summary-section');
    expect(sections.length).toBe(0);
  });

  it('rejects javascript: URLs in editHref', async () => {
    const el = await fixture<CivSummary>('<civ-summary></civ-summary>') as CivSummary;
    el.sections = [
      {
        heading: 'Dangerous section',
        editHref: 'javascript:alert(1)',
        items: [{ label: 'Name', value: 'Jane' }],
      },
    ];
    await elementUpdated(el);

    const links = el.querySelectorAll('.civ-summary-section civ-link');
    expect(links.length).toBe(0);
  });

  it('allows hash, relative, and http(s) URLs in editHref', async () => {
    const el = await fixture<CivSummary>('<civ-summary></civ-summary>') as CivSummary;
    el.sections = [
      { heading: 'Hash', editHref: '#step-1', items: [{ label: 'A', value: 'B' }] },
      { heading: 'Relative', editHref: '/edit/1', items: [{ label: 'A', value: 'B' }] },
      { heading: 'HTTPS', editHref: 'https://example.com/edit', items: [{ label: 'A', value: 'B' }] },
    ];
    await elementUpdated(el);

    const links = el.querySelectorAll('.civ-summary-section civ-link');
    expect(links.length).toBe(3);
  });

  describe('analytics', () => {
    it('fires civ-analytics when edit is clicked', async () => {
      const el = await fixture<CivSummary>('<civ-summary></civ-summary>') as CivSummary;
      el.sections = sampleSections;
      await elementUpdated(el);

      const handler = vi.fn();
      el.addEventListener('civ-analytics', handler as EventListener);

      const link = el.querySelector('.civ-summary-section civ-link') as HTMLElement;
      link.click();

      expect(handler).toHaveBeenCalledOnce();
    });
  });
});
