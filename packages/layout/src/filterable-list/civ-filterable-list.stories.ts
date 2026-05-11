import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-filterable-list.js';
import '../list/civ-list.js';
import '../list/civ-list-item.js';
import '@civui/inputs/text-input';
import '@civui/actions/filter-chip';
import '@civui/actions/filter-chip-group';
import '@civui/core';
import '@civui/feedback/badge';

const meta: Meta = {
  title: 'Layout/Filterable List',
  component: 'civ-filterable-list',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A filtering controller that coordinates slotted filter controls with a slotted list of items.
The component handles search matching, named attribute filtering, AND composition, result counts,
and screen-reader announcements — while the consumer provides any filter UI they want.

**How it works:**
- Slot filter controls (search inputs, chips, selects) into the filter zone
- Add \`data-filter\` attributes on list items for searchable text
- Add \`data-filter-{name}\` for named filters (e.g., \`data-filter-letter="A"\`)
- The component listens for \`civ-input\`/\`civ-change\` events and shows/hides items
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// ── Glossary (search + A-Z) ──────────────────────────────────

const GLOSSARY_TERMS = [
  { term: 'Accessibility', letter: 'A', definition: 'The practice of making information, activities, and environments usable by all people, including those with disabilities.' },
  { term: 'Appeal', letter: 'A', definition: 'A formal request to review a decision made about your claim or benefits.' },
  { term: 'Benefits', letter: 'B', definition: 'Financial entitlements and services provided to eligible individuals by the government.' },
  { term: 'Claim', letter: 'C', definition: 'A formal application for benefits or compensation filed with a government agency.' },
  { term: 'Compensation', letter: 'C', definition: 'Monthly tax-free payments made to veterans with service-connected disabilities.' },
  { term: 'Dependent', letter: 'D', definition: 'A spouse, child, or parent who relies on a veteran for financial support.' },
  { term: 'Disability rating', letter: 'D', definition: 'A percentage assigned to a service-connected condition that determines compensation amount.' },
  { term: 'Effective date', letter: 'E', definition: 'The date from which benefits are paid, often the date a claim was filed.' },
  { term: 'Enrollment', letter: 'E', definition: 'The process of registering for healthcare or other benefit programs.' },
  { term: 'Form', letter: 'F', definition: 'A standardized document used to apply for benefits, report changes, or provide information.' },
  { term: 'GI Bill', letter: 'G', definition: 'Education benefits for veterans, service members, and their families.' },
  { term: 'Healthcare', letter: 'H', definition: 'Medical services available to eligible veterans through VA medical centers and clinics.' },
  { term: 'Intent to File', letter: 'I', definition: 'A notification that preserves your effective date while you prepare a full claim.' },
  { term: 'Pension', letter: 'P', definition: 'A needs-based benefit for wartime veterans with limited income.' },
  { term: 'Power of Attorney', letter: 'P', definition: 'Authorization for a representative to act on your behalf in claims processing.' },
  { term: 'Rating decision', letter: 'R', definition: 'An official determination of a disability claim, including the assigned rating percentage.' },
  { term: 'Service connection', letter: 'S', definition: 'The link between a current disability and an event, injury, or disease during military service.' },
  { term: 'Supplemental claim', letter: 'S', definition: 'A new review of a previously denied claim with new and relevant evidence.' },
  { term: 'Veteran', letter: 'V', definition: 'A person who served in the active military and was discharged under conditions other than dishonorable.' },
  { term: 'Vocational rehabilitation', letter: 'V', definition: 'Employment services and training for veterans with service-connected disabilities.' },
];

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const Glossary: Story = {
  name: 'Glossary (A-Z)',
  parameters: {
    docs: {
      description: {
        story:
          'A glossary of terms with search and A-Z alphabet filter chips. Search matches against term names and definitions. Alphabet chips filter by first letter. Both compose with AND logic.',
      },
    },
  },
  render: () => html`
    <civ-filterable-list label="Glossary of terms" no-results-message="No terms match your search. Try a different keyword or letter.">
      <div data-filterable-list-filters style="display: grid; gap: 0.75rem;">
        <civ-text-input label="Search terms" data-filterable-list-search type="search" clearable leading-icon="search" placeholder="Search by keyword"></civ-text-input>
        <civ-filter-chip-group mode="single" label="Filter by letter">
          <civ-filter-chip label="All" value="" selected spacing="sm"></civ-filter-chip>
          ${LETTERS.map(l => html`
            <civ-filter-chip label="${l}" value="${l}" spacing="sm"></civ-filter-chip>
          `)}
        </civ-filter-chip-group>
      </div>
      <civ-list dividers>
        ${GLOSSARY_TERMS.map(t => html`
          <civ-list-item
            data-filter="${t.term} ${t.definition}"
            data-filter-letter="${t.letter}"
            heading="${t.term}"
            description="${t.definition}"
          ></civ-list-item>
        `)}
      </civ-list>
    </civ-filterable-list>
  `,
};

// ── Organization directory (multi-category) ───────────────────

export const OrganizationDirectory: Story = {
  name: 'Organization directory',
  parameters: {
    docs: {
      description: {
        story:
          'A government organization directory with search and category filter chips (multi-select). Similar to GOV.UK\'s departments page. Items can match multiple filter criteria.',
      },
    },
  },
  render: () => html`
    <civ-filterable-list label="Government organizations">
      <div data-filterable-list-filters style="display: grid; gap: 0.75rem;">
        <civ-text-input label="Search organizations" data-filterable-list-search type="search" clearable leading-icon="search" placeholder="Search by name"></civ-text-input>
        <civ-filter-chip-group mode="multi" label="Filter by type">
          <civ-filter-chip label="Department" value="department"></civ-filter-chip>
          <civ-filter-chip label="Agency" value="agency"></civ-filter-chip>
          <civ-filter-chip label="Commission" value="commission"></civ-filter-chip>
        </civ-filter-chip-group>
      </div>
      <civ-list dividers>
        <civ-list-item data-filter="Department of Veterans Affairs" data-filter-type="department"
          heading="Department of Veterans Affairs" description="Provides healthcare, benefits, and memorial services to veterans and their families."
          href="#"></civ-list-item>
        <civ-list-item data-filter="Department of Health and Human Services" data-filter-type="department"
          heading="Department of Health and Human Services" description="Protects the health of all Americans and provides essential human services."
          href="#"></civ-list-item>
        <civ-list-item data-filter="Department of Education" data-filter-type="department"
          heading="Department of Education" description="Promotes student achievement and preparation for global competitiveness."
          href="#"></civ-list-item>
        <civ-list-item data-filter="Social Security Administration" data-filter-type="agency"
          heading="Social Security Administration" description="Administers Social Security retirement, disability, and survivor benefits."
          href="#"></civ-list-item>
        <civ-list-item data-filter="Centers for Medicare and Medicaid Services" data-filter-type="agency"
          heading="Centers for Medicare & Medicaid Services" description="Administers Medicare, Medicaid, and the Children's Health Insurance Program."
          href="#"></civ-list-item>
        <civ-list-item data-filter="Food and Drug Administration" data-filter-type="agency"
          heading="Food and Drug Administration" description="Responsible for protecting public health through regulation of food, drugs, and medical devices."
          href="#"></civ-list-item>
        <civ-list-item data-filter="Equal Employment Opportunity Commission" data-filter-type="commission"
          heading="Equal Employment Opportunity Commission" description="Enforces federal laws prohibiting employment discrimination."
          href="#"></civ-list-item>
        <civ-list-item data-filter="Federal Communications Commission" data-filter-type="commission"
          heading="Federal Communications Commission" description="Regulates interstate and international communications."
          href="#"></civ-list-item>
      </civ-list>
    </civ-filterable-list>
  `,
};

// ── Medication lookup (search only) ───────────────────────────

export const MedicationLookup: Story = {
  name: 'Medication lookup',
  parameters: {
    docs: {
      description: {
        story:
          'A medication search using only a search input — no chips. The `data-filter` attribute includes extra keywords (brand names, conditions) that are searchable but not displayed. This shows the power of decoupling search text from display text.',
      },
    },
  },
  render: () => html`
    <civ-filterable-list label="Find a medication" no-results-message="No medications match. Try a different spelling or brand name.">
      <div data-filterable-list-filters>
        <civ-text-input label="Search medications" hint="Search by drug name, brand name, or condition" data-filterable-list-search type="search" clearable leading-icon="search" placeholder="Type a medication name"></civ-text-input>
      </div>
      <civ-list dividers>
        <civ-list-item data-filter="Acetaminophen Tylenol pain fever headache" heading="Acetaminophen"
          description="Brand: Tylenol. Used for pain relief and fever reduction."></civ-list-item>
        <civ-list-item data-filter="Amlodipine Norvasc blood pressure hypertension" heading="Amlodipine"
          description="Brand: Norvasc. Calcium channel blocker for high blood pressure."></civ-list-item>
        <civ-list-item data-filter="Atorvastatin Lipitor cholesterol" heading="Atorvastatin"
          description="Brand: Lipitor. Statin for lowering cholesterol."></civ-list-item>
        <civ-list-item data-filter="Gabapentin Neurontin nerve pain seizures neuropathy" heading="Gabapentin"
          description="Brand: Neurontin. Used for nerve pain and seizures."></civ-list-item>
        <civ-list-item data-filter="Ibuprofen Advil Motrin pain inflammation" heading="Ibuprofen"
          description="Brand: Advil, Motrin. NSAID for pain and inflammation."></civ-list-item>
        <civ-list-item data-filter="Levothyroxine Synthroid thyroid hypothyroidism" heading="Levothyroxine"
          description="Brand: Synthroid. Thyroid hormone replacement."></civ-list-item>
        <civ-list-item data-filter="Lisinopril Zestril blood pressure heart failure" heading="Lisinopril"
          description="Brand: Zestril. ACE inhibitor for blood pressure and heart failure."></civ-list-item>
        <civ-list-item data-filter="Losartan Cozaar blood pressure hypertension" heading="Losartan"
          description="Brand: Cozaar. ARB for high blood pressure."></civ-list-item>
        <civ-list-item data-filter="Metformin Glucophage diabetes blood sugar type 2" heading="Metformin"
          description="Brand: Glucophage. First-line treatment for type 2 diabetes."></civ-list-item>
        <civ-list-item data-filter="Metoprolol Lopressor heart rate blood pressure beta blocker" heading="Metoprolol"
          description="Brand: Lopressor. Beta blocker for heart rate and blood pressure."></civ-list-item>
        <civ-list-item data-filter="Omeprazole Prilosec acid reflux GERD stomach" heading="Omeprazole"
          description="Brand: Prilosec. Proton pump inhibitor for acid reflux."></civ-list-item>
        <civ-list-item data-filter="Sertraline Zoloft depression anxiety SSRI" heading="Sertraline"
          description="Brand: Zoloft. SSRI antidepressant for depression and anxiety."></civ-list-item>
      </civ-list>
    </civ-filterable-list>
  `,
};

// ── People directory ──────────────────────────────────────────

export const PeopleDirectory: Story = {
  name: 'People directory',
  parameters: {
    docs: {
      description: {
        story:
          'A staff directory with search and department filter chips. List items use slots for richer content (badges, descriptions). Demonstrates that any content can go inside filtered list items.',
      },
    },
  },
  render: () => html`
    <civ-filterable-list label="Staff directory">
      <div data-filterable-list-filters style="display: grid; gap: 0.75rem;">
        <civ-text-input label="Search staff" data-filterable-list-search type="search" clearable leading-icon="search" placeholder="Search by name or role"></civ-text-input>
        <civ-filter-chip-group mode="single" label="Filter by department">
          <civ-filter-chip label="All" value="" selected></civ-filter-chip>
          <civ-filter-chip label="Engineering" value="engineering"></civ-filter-chip>
          <civ-filter-chip label="Design" value="design"></civ-filter-chip>
          <civ-filter-chip label="Product" value="product"></civ-filter-chip>
          <civ-filter-chip label="Operations" value="operations"></civ-filter-chip>
        </civ-filter-chip-group>
      </div>
      <civ-list dividers>
        <civ-list-item data-filter="Maria Chen Engineering Lead" data-filter-dept="engineering" heading="Maria Chen" description="Engineering Lead — Platform team"></civ-list-item>
        <civ-list-item data-filter="Robert Johnson Engineering Senior" data-filter-dept="engineering" heading="Robert Johnson" description="Senior Engineer — API team"></civ-list-item>
        <civ-list-item data-filter="Sarah Williams Design Director" data-filter-dept="design" heading="Sarah Williams" description="Design Director — Design systems"></civ-list-item>
        <civ-list-item data-filter="Anita Patel Design Senior" data-filter-dept="design" heading="Anita Patel" description="Senior Designer — Accessibility"></civ-list-item>
        <civ-list-item data-filter="Carlos Garcia Product Manager" data-filter-dept="product" heading="Carlos Garcia" description="Product Manager — Forms platform"></civ-list-item>
        <civ-list-item data-filter="Lisa Thompson Product Analyst" data-filter-dept="product" heading="Lisa Thompson" description="Product Analyst — User research"></civ-list-item>
        <civ-list-item data-filter="James Kim Operations Program" data-filter-dept="operations" heading="James Kim" description="Program Manager — Delivery"></civ-list-item>
        <civ-list-item data-filter="David Lee Operations Support" data-filter-dept="operations" heading="David Lee" description="Operations Support — Infrastructure"></civ-list-item>
      </civ-list>
    </civ-filterable-list>
  `,
};

// ── Search only (minimal) ─────────────────────────────────────

export const SearchOnly: Story = {
  name: 'Search only (minimal)',
  parameters: {
    docs: {
      description: {
        story:
          'The simplest configuration — just a search input filtering a list. No chips, no categories. Shows that the component works with minimal setup.',
      },
    },
  },
  render: () => html`
    <civ-filterable-list label="FAQ">
      <div data-filterable-list-filters>
        <civ-text-input label="Search frequently asked questions" data-filterable-list-search type="search" clearable leading-icon="search" placeholder="Type a keyword"></civ-text-input>
      </div>
      <civ-list dividers>
        <civ-list-item data-filter="How do I apply for benefits" heading="How do I apply for benefits?" description="You can apply online, by mail, or in person at your local regional office."></civ-list-item>
        <civ-list-item data-filter="What is my disability rating" heading="What is my disability rating?" description="Your disability rating is a percentage that represents the severity of your service-connected condition."></civ-list-item>
        <civ-list-item data-filter="How long does a claim take" heading="How long does a claim take?" description="Most claims are processed within 125 days, but complex cases may take longer."></civ-list-item>
        <civ-list-item data-filter="Can I check my claim status online" heading="Can I check my claim status online?" description="Yes, sign in to your account to view the status of your pending claims."></civ-list-item>
        <civ-list-item data-filter="How do I update my address" heading="How do I update my address?" description="You can update your address online, by phone, or by submitting a change of address form."></civ-list-item>
        <civ-list-item data-filter="What documents do I need to file a claim" heading="What documents do I need to file a claim?" description="You'll need your DD214, medical records, and any supporting evidence related to your condition."></civ-list-item>
      </civ-list>
    </civ-filterable-list>
  `,
};
