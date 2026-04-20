import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-task-list.js';
import './civ-task-group.js';
import './civ-task.js';
import '@civui/ui/tag';
import '@civui/ui/link';
import '@civui/forms';

const meta: Meta = {
  title: 'Navigation/Task List',
  component: 'civ-task-list',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-task-list>
      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">Prepare</h3>
        <civ-task>
          <civ-link href="#/eligibility">Check your eligibility</civ-link>
          <div data-task-status>
            <civ-tag label="Complete" variant="green" tag-style="primary"></civ-tag>
          </div>
        </civ-task>
      </civ-task-group>

      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">Fill out your application</h3>
        <civ-task>
          <civ-link href="#/personal">Personal information</civ-link>
          <div data-task-status>
            <civ-tag label="Complete" variant="green" tag-style="primary"></civ-tag>
          </div>
        </civ-task>
        <civ-task>
          <div>
            <civ-link href="#/contact">Contact information</civ-link>
            <span class="civ-hint civ-block">Phone number needed</span>
          </div>
          <div data-task-status>
            <civ-tag label="In progress" variant="teal"></civ-tag>
          </div>
        </civ-task>
        <civ-task>
          <civ-link href="#/service">Service history</civ-link>
          <div data-task-status>
            <civ-tag label="Not started" variant="blue"></civ-tag>
          </div>
        </civ-task>
        <civ-task>
          <civ-link href="#/disabilities">Disabilities and conditions</civ-link>
          <div data-task-status>
            <civ-tag label="Not started" variant="blue"></civ-tag>
          </div>
        </civ-task>
        <civ-task>
          <civ-link href="#/documents">Supporting documents</civ-link>
          <div data-task-status>
            <civ-tag label="Not started" variant="blue"></civ-tag>
          </div>
        </civ-task>
      </civ-task-group>

      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">Review and submit</h3>
        <civ-task>
          <div>
            <span class="civ-font-medium">Review your application</span>
            <span class="civ-hint civ-block">Complete all sections first</span>
          </div>
          <div data-task-status>
            <civ-tag label="Cannot start yet" variant="gray"></civ-tag>
          </div>
        </civ-task>
      </civ-task-group>
    </civ-task-list>
  `,
};

export const AllStatuses: Story = {
  render: () => html`
    <civ-task-list>
      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">Status examples</h3>
        <civ-task>
          <civ-link href="#">Not started task</civ-link>
          <div data-task-status>
            <civ-tag label="Not started" variant="blue"></civ-tag>
          </div>
        </civ-task>
        <civ-task>
          <div>
            <civ-link href="#">In progress task</civ-link>
            <span class="civ-hint civ-block">2 of 5 fields complete</span>
          </div>
          <div data-task-status>
            <civ-tag label="In progress" variant="teal"></civ-tag>
          </div>
        </civ-task>
        <civ-task>
          <civ-link href="#">Complete task</civ-link>
          <div data-task-status>
            <civ-tag label="Complete" variant="green" tag-style="primary"></civ-tag>
          </div>
        </civ-task>
        <civ-task>
          <div>
            <span class="civ-font-medium">Cannot start yet</span>
            <span class="civ-hint civ-block">Complete previous sections first</span>
          </div>
          <div data-task-status>
            <civ-tag label="Cannot start yet" variant="gray"></civ-tag>
          </div>
        </civ-task>
        <civ-task>
          <div>
            <civ-link href="#">Task with error</civ-link>
            <span class="civ-hint civ-block">Fix validation errors</span>
          </div>
          <div data-task-status>
            <civ-tag label="Error" variant="red"></civ-tag>
          </div>
        </civ-task>
      </civ-task-group>
    </civ-task-list>
  `,
};

export const MultipleGroups: Story = {
  render: () => html`
    <civ-task-list>
      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">About you</h3>
        <civ-task>
          <civ-link href="#">Your name</civ-link>
          <div data-task-status><civ-tag label="Complete" variant="green" tag-style="primary"></civ-tag></div>
        </civ-task>
        <civ-task>
          <civ-link href="#">Your date of birth</civ-link>
          <div data-task-status><civ-tag label="Complete" variant="green" tag-style="primary"></civ-tag></div>
        </civ-task>
        <civ-task>
          <civ-link href="#">Your address</civ-link>
          <div data-task-status><civ-tag label="Complete" variant="green" tag-style="primary"></civ-tag></div>
        </civ-task>
      </civ-task-group>

      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">About your service</h3>
        <civ-task>
          <civ-link href="#">Service periods</civ-link>
          <div data-task-status><civ-tag label="In progress" variant="teal"></civ-tag></div>
        </civ-task>
        <civ-task>
          <civ-link href="#">Discharge details</civ-link>
          <div data-task-status><civ-tag label="Not started" variant="blue"></civ-tag></div>
        </civ-task>
      </civ-task-group>

      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">Evidence</h3>
        <civ-task>
          <civ-link href="#">Upload DD214</civ-link>
          <div data-task-status><civ-tag label="Not started" variant="blue"></civ-tag></div>
        </civ-task>
        <civ-task>
          <civ-link href="#">Medical records</civ-link>
          <div data-task-status><civ-tag label="Not started" variant="blue"></civ-tag></div>
        </civ-task>
      </civ-task-group>
    </civ-task-list>
  `,
};

export const DisabilityCompensation: Story = {
  name: 'VA Form 21-526EZ Hub',
  render: () => html`
    <h1 class="civ-heading-xl">Apply for disability compensation</h1>
    <p class="civ-text-muted civ-mb-4">VA Form 21-526EZ</p>

    <civ-progress-bar
      value="40"
      label="Application progress"
      status="2 of 5 sections complete"
    ></civ-progress-bar>

    <civ-task-list>
      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">Prepare</h3>
        <civ-task>
          <civ-link href="#/eligibility">Check your eligibility</civ-link>
          <div data-task-status>
            <civ-tag label="Complete" variant="green" tag-style="primary"></civ-tag>
          </div>
        </civ-task>
      </civ-task-group>

      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">Fill out your application</h3>
        <civ-task>
          <div>
            <civ-link href="#/personal">Personal information</civ-link>
            <span class="civ-hint civ-block">Name, date of birth, Social Security number</span>
          </div>
          <div data-task-status>
            <civ-tag label="Complete" variant="green" tag-style="primary"></civ-tag>
          </div>
        </civ-task>
        <civ-task>
          <div>
            <civ-link href="#/contact">Contact information</civ-link>
            <span class="civ-hint civ-block">Address and phone number needed</span>
          </div>
          <div data-task-status>
            <civ-tag label="In progress" variant="teal"></civ-tag>
          </div>
        </civ-task>
        <civ-task>
          <div>
            <civ-link href="#/service">Service history</civ-link>
            <span class="civ-hint civ-block">Branch, dates, and character of service</span>
          </div>
          <div data-task-status>
            <civ-tag label="Not started" variant="blue"></civ-tag>
          </div>
        </civ-task>
        <civ-task>
          <div>
            <civ-link href="#/disabilities">Disabilities and conditions</civ-link>
            <span class="civ-hint civ-block">List each condition you're claiming</span>
          </div>
          <div data-task-status>
            <civ-tag label="Not started" variant="blue"></civ-tag>
          </div>
        </civ-task>
        <civ-task>
          <div>
            <civ-link href="#/documents">Supporting documents</civ-link>
            <span class="civ-hint civ-block">Upload DD214 and medical records</span>
          </div>
          <div data-task-status>
            <civ-tag label="Not started" variant="blue"></civ-tag>
          </div>
        </civ-task>
      </civ-task-group>

      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">Review and submit</h3>
        <civ-task>
          <div>
            <span class="civ-font-medium">Review your application</span>
            <span class="civ-hint civ-block">Complete all sections before reviewing</span>
          </div>
          <div data-task-status>
            <civ-tag label="Cannot start yet" variant="gray"></civ-tag>
          </div>
        </civ-task>
      </civ-task-group>
    </civ-task-list>
  `,
};

export const AllComplete: Story = {
  name: 'All Sections Complete',
  render: () => html`
    <h1 class="civ-heading-xl">Apply for education benefits</h1>

    <civ-progress-bar value="100" status="All sections complete"></civ-progress-bar>

    <civ-task-list>
      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">Application</h3>
        <civ-task>
          <civ-link href="#/personal">Personal information</civ-link>
          <div data-task-status><civ-tag label="Complete" variant="green" tag-style="primary"></civ-tag></div>
        </civ-task>
        <civ-task>
          <civ-link href="#/education">Education history</civ-link>
          <div data-task-status><civ-tag label="Complete" variant="green" tag-style="primary"></civ-tag></div>
        </civ-task>
        <civ-task>
          <civ-link href="#/employment">Employment history</civ-link>
          <div data-task-status><civ-tag label="Complete" variant="green" tag-style="primary"></civ-tag></div>
        </civ-task>
      </civ-task-group>

      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">Submit</h3>
        <civ-task>
          <civ-link href="#/review">Review and submit</civ-link>
          <div data-task-status><civ-tag label="Not started" variant="blue"></civ-tag></div>
        </civ-task>
      </civ-task-group>
    </civ-task-list>
  `,
};
