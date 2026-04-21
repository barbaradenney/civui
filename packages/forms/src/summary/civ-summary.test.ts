import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-summary.js';
import type { CivSummary, SummarySection } from './civ-summary.js';

afterEach(cleanupFixtures);

describe('civ-summary', () => {
  const sampleSections: SummarySection[] = [
    {
      heading: '',
      items: [
        { label: 'First name', value: 'Jane', editHref: '#step-1' },
        { label: 'Last name', value: 'Doe', editHref: '#step-1' },
        { label: 'Phone number' },
      ],
    },
  ];

  it('renders a heading', async () => {
    const el = await fixture<CivSummary>('<civ-summary heading="Review your application"></civ-summary>');

    const h2 = el.querySelector('h2');
    expect(h2).not.toBeNull();
    expect(h2!.textContent).toBe('Review your application');
  });

  it('renders items as definition list rows', async () => {
    const el = await fixture<CivSummary>('<civ-summary></civ-summary>') as CivSummary;
    el.sections = sampleSections;
    await elementUpdated(el);

    const fields = el.querySelectorAll('civ-read-only-field');
    expect(fields.length).toBe(3);
    expect(fields[0].getAttribute('label')).toBe('First name');
    expect(fields[0].getAttribute('value')).toBe('Jane');
  });

  it('shows "Not provided" for missing values', async () => {
    const el = await fixture<CivSummary>('<civ-summary></civ-summary>') as CivSummary;
    el.sections = sampleSections;
    await elementUpdated(el);

    const fields = el.querySelectorAll('civ-read-only-field');
    // Phone number (3rd item) has no value
    expect(fields[2].getAttribute('value')).toBe('');
  });

  it('renders inline edit links on items with editHref', async () => {
    const el = await fixture<CivSummary>('<civ-summary></civ-summary>') as CivSummary;
    el.sections = sampleSections;
    await elementUpdated(el);

    const fields = el.querySelectorAll('civ-read-only-field');
    expect(fields[0].getAttribute('edit-href')).toBe('#step-1');
    expect(fields[2].getAttribute('edit-href')).toBe(''); // no edit link
  });

  it('section-level editHref applies to all items', async () => {
    const el = await fixture<CivSummary>('<civ-summary></civ-summary>') as CivSummary;
    el.sections = [
      {
        heading: '',
        editHref: '/profile/settings',
        locked: true,
        items: [
          { label: 'Name', value: 'Jane' },
          { label: 'DOB', value: 'Jan 1' },
        ],
      },
    ];
    await elementUpdated(el);

    const fields = el.querySelectorAll('civ-read-only-field');
    expect(fields[0].getAttribute('edit-href')).toBe('/profile/settings');
    expect(fields[1].getAttribute('edit-href')).toBe('/profile/settings');
  });

  it('locked sections use profile edit label', async () => {
    const el = await fixture<CivSummary>('<civ-summary></civ-summary>') as CivSummary;
    el.sections = [
      {
        heading: '',
        editHref: '/profile',
        locked: true,
        items: [{ label: 'Name', value: 'Jane' }],
      },
    ];
    await elementUpdated(el);

    const field = el.querySelector('civ-read-only-field');
    expect(field!.getAttribute('edit-label')).toContain('profile');
  });

  it('renders dividers between multiple items but not after last', async () => {
    const el = await fixture<CivSummary>('<civ-summary></civ-summary>') as CivSummary;
    el.sections = sampleSections;
    await elementUpdated(el);

    const dividers = el.querySelectorAll('civ-divider');
    // 3 items → 2 dividers (between 1-2 and 2-3, none after 3)
    expect(dividers.length).toBe(2);
  });

  it('no dividers for single-item sections', async () => {
    const el = await fixture<CivSummary>('<civ-summary></civ-summary>') as CivSummary;
    el.sections = [
      {
        heading: '',
        items: [{ label: 'Email', value: 'test@test.com' }],
      },
    ];
    await elementUpdated(el);

    const dividers = el.querySelectorAll('civ-divider');
    expect(dividers.length).toBe(0);
  });

  it('renders array values as separate lines', async () => {
    const el = await fixture<CivSummary>('<civ-summary></civ-summary>') as CivSummary;
    el.sections = [
      {
        heading: '',
        items: [
          { label: 'Languages', value: ['English', 'Spanish', 'French'] },
        ],
      },
    ];
    await elementUpdated(el);

    const field = el.querySelector('civ-read-only-field');
    expect(field).not.toBeNull();
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
        heading: '',
        editHref: 'javascript:alert(1)',
        items: [{ label: 'Name', value: 'Jane' }],
      },
    ];
    await elementUpdated(el);

    const field = el.querySelector('civ-read-only-field');
    expect(field!.getAttribute('edit-href')).toBe('');
  });
});
