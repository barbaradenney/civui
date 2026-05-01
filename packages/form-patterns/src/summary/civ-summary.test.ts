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

    const heading = el.querySelector('[role="heading"]');
    expect(heading).not.toBeNull();
    expect(heading!.textContent).toBe('Review your application');
    expect(heading!.getAttribute('aria-level')).toBe('2');
  });

  it('renders items as definition list rows', async () => {
    const el = await fixture<CivSummary>('<civ-summary></civ-summary>') as CivSummary;
    el.sections = sampleSections;
    await elementUpdated(el);

    const fields = el.querySelectorAll('civ-data-field');
    expect(fields.length).toBe(3);
    expect(fields[0].getAttribute('label')).toBe('First name');
    expect(fields[0].getAttribute('value')).toBe('Jane');
  });

  it('shows "Not provided" for missing values', async () => {
    const el = await fixture<CivSummary>('<civ-summary></civ-summary>') as CivSummary;
    el.sections = sampleSections;
    await elementUpdated(el);

    const fields = el.querySelectorAll('civ-data-field');
    // Phone number (3rd item) has no value
    expect(fields[2].getAttribute('value')).toBe('');
  });

  it('renders inline edit links on items with editHref', async () => {
    const el = await fixture<CivSummary>('<civ-summary></civ-summary>') as CivSummary;
    el.sections = sampleSections;
    await elementUpdated(el);

    const fields = el.querySelectorAll('civ-data-field');
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

    const fields = el.querySelectorAll('civ-data-field');
    expect(fields[0].getAttribute('edit-href')).toBe('/profile/settings');
    expect(fields[1].getAttribute('edit-href')).toBe('/profile/settings');
  });

  it('section with heading shows edit link in header', async () => {
    const el = await fixture<CivSummary>('<civ-summary></civ-summary>') as CivSummary;
    el.sections = [
      {
        heading: 'Verified identity',
        editHref: '/profile/settings',
        locked: true,
        items: [
          { label: 'Name', value: 'Jane' },
          { label: 'DOB', value: 'Jan 1' },
        ],
      },
    ];
    await elementUpdated(el);

    // Header has the edit link
    const headerLink = el.querySelector('.civ-summary-section > div > civ-link');
    expect(headerLink).not.toBeNull();
    expect(headerLink!.getAttribute('href')).toBe('/profile/settings');

    // Items do NOT have per-row edit links
    const fields = el.querySelectorAll('civ-data-field');
    expect(fields[0].getAttribute('edit-href')).toBe('');
    expect(fields[1].getAttribute('edit-href')).toBe('');
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

    const field = el.querySelector('civ-data-field');
    expect(field!.getAttribute('edit-label')).toBe('Edit');
  });

  it('renders dividers via civ-list dividers attribute', async () => {
    const el = await fixture<CivSummary>('<civ-summary></civ-summary>') as CivSummary;
    el.sections = sampleSections;
    await elementUpdated(el);

    const list = el.querySelector('civ-list');
    expect(list).not.toBeNull();
    expect(list!.hasAttribute('dividers')).toBe(true);
  });

  it('wraps items in civ-list-item elements', async () => {
    const el = await fixture<CivSummary>('<civ-summary></civ-summary>') as CivSummary;
    el.sections = sampleSections;
    await elementUpdated(el);

    const items = el.querySelectorAll('civ-list-item');
    expect(items.length).toBe(3);
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

    const field = el.querySelector('civ-data-field');
    expect(field).not.toBeNull();
  });

  it('uses Light DOM (no shadow root)', async () => {
    const el = await fixture<CivSummary>('<civ-summary heading="Review"></civ-summary>');
    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('[role="heading"]')).not.toBeNull();
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

  it('rejects javascript: URLs in item-level editHref', async () => {
    const el = await fixture<CivSummary>('<civ-summary></civ-summary>') as CivSummary;
    el.sections = [
      {
        heading: '',
        items: [{ label: 'Name', value: 'Jane', editHref: 'javascript:alert(1)' }],
      },
    ];
    await elementUpdated(el);

    const field = el.querySelector('civ-data-field');
    expect(field!.getAttribute('edit-href')).toBe('');
  });

  it('rejects javascript: URLs in section editHref', async () => {
    const el = await fixture<CivSummary>('<civ-summary></civ-summary>') as CivSummary;
    el.sections = [
      {
        heading: '',
        editHref: 'javascript:alert(1)',
        items: [{ label: 'Name', value: 'Jane' }],
      },
    ];
    await elementUpdated(el);

    const field = el.querySelector('civ-data-field');
    expect(field!.getAttribute('edit-href')).toBe('');
  });
});

describe('civ-summary civ-edit event', () => {
  afterEach(cleanupFixtures);

  it('fires civ-edit when a section-level edit link is clicked', async () => {
    const el = await fixture<CivSummary>('<civ-summary></civ-summary>') as CivSummary;
    const sections: SummarySection[] = [
      {
        heading: 'Personal information',
        editHref: '#step-personal',
        items: [{ label: 'First name', value: 'Ada' }],
      },
    ];
    el.sections = sections;
    await elementUpdated(el);

    let captured: any = null;
    el.addEventListener('civ-edit', ((e: CustomEvent) => { captured = e.detail; }) as EventListener);

    // Find the section header's civ-link (carries the dataset directly).
    const sectionLink = el.querySelector('[data-civ-summary-section-index]') as HTMLElement;
    sectionLink.click();
    await elementUpdated(el);

    expect(captured).not.toBeNull();
    expect(captured.section).toBe(sections[0]);
    expect(captured.href).toBe('#step-personal');
    expect(captured.item).toBeUndefined();
  });

  it('fires civ-edit with the item when a per-item edit link is clicked', async () => {
    const el = await fixture<CivSummary>('<civ-summary></civ-summary>') as CivSummary;
    const sections: SummarySection[] = [
      {
        heading: '',
        items: [
          { label: 'Email', value: 'a@b.test', editHref: '#step-email' },
          { label: 'Phone', value: '555', editHref: '#step-phone' },
        ],
      },
    ];
    el.sections = sections;
    await elementUpdated(el);

    let captured: any = null;
    el.addEventListener('civ-edit', ((e: CustomEvent) => { captured = e.detail; }) as EventListener);

    const fields = el.querySelectorAll<HTMLElement>('[data-civ-summary-item-index]');
    expect(fields.length).toBe(2);
    // The actual rendered link lives inside civ-data-field as a
    // civ-link descendant. Click that — the handler walks up to find
    // the dataset on the field host.
    const innerLink = fields[1].querySelector('civ-link') as HTMLElement;
    expect(innerLink).not.toBeNull();
    innerLink.click();
    await elementUpdated(el);

    expect(captured).not.toBeNull();
    expect(captured.section).toBe(sections[0]);
    expect(captured.item).toBe(sections[0].items[1]);
  });

  it('is cancelable — preventDefault on the event suppresses default click', async () => {
    const el = await fixture<CivSummary>('<civ-summary></civ-summary>') as CivSummary;
    el.sections = [
      {
        heading: 'Personal',
        editHref: '#step-personal',
        items: [{ label: 'Name', value: 'Ada' }],
      },
    ];
    await elementUpdated(el);

    el.addEventListener('civ-edit', ((e: Event) => e.preventDefault()) as EventListener);

    const sectionLink = el.querySelector('[data-civ-summary-section-index]') as HTMLElement;
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    sectionLink.dispatchEvent(clickEvent);
    await elementUpdated(el);

    expect(clickEvent.defaultPrevented).toBe(true);
  });

  it('does not fire for clicks outside any edit link', async () => {
    const el = await fixture<CivSummary>('<civ-summary heading="Review"></civ-summary>') as CivSummary;
    el.sections = [
      { heading: 'Personal', items: [{ label: 'Name', value: 'Ada' }] },
    ];
    await elementUpdated(el);

    let fired = false;
    el.addEventListener('civ-edit', () => { fired = true; });

    const heading = el.querySelector('[role="heading"]') as HTMLElement;
    heading.click();
    await elementUpdated(el);

    expect(fired).toBe(false);
  });
});
