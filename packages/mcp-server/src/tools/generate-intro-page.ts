/**
 * generate_intro_page tool — generates the VA form introduction page.
 *
 * Every VA form starts with an intro page that explains:
 * - What the form is for
 * - Steps to apply (process list)
 * - What to prepare (documents checklist)
 * - Sign-in prompt
 * - OMB/burden info
 */

import { escapeHtml } from './html-utils.js';
import type { VAFormDefinition } from '../resources/va-form-registry.js';

export interface IntroPageResult {
  html: string;
  javascript: string;
  features: string[];
}

export function generateIntroPage(form: VAFormDefinition): IntroPageResult {
  const features = ['intro-page', 'process-list'];

  const prepItems = form.preparationItems
    .map(item => `        <li>${escapeHtml(item)}</li>`)
    .join('\n');

  const nextStepsItems = form.nextSteps
    .map(item => `          <li>${escapeHtml(item)}</li>`)
    .join('\n');

  if (form.eligibility) features.push('eligibility-link');

  const html = `<!-- VA Form ${escapeHtml(form.formNumber)} — Introduction Page -->
<div class="civ-form-intro">
  <h1 class="civ-heading-xl">${escapeHtml(form.title)}</h1>
  <p class="civ-text-muted civ-mb-4">VA Form ${escapeHtml(form.formNumber)}</p>
  <p class="civ-mb-6">${escapeHtml(form.description)}</p>

  <!-- Sign-in alert (unauthenticated state) -->
  <civ-alert variant="info" heading="Sign in to start your application">
    When you sign in, we can prefill your application with information from your VA.gov profile.
    You can also save your application in progress and come back later.
  </civ-alert>

  <!-- Process list -->
  <h2 class="civ-heading-lg">Follow these steps to get started</h2>

  <ol class="civ-process-list">
    <li class="civ-process-list__item">
      <h3 class="civ-heading-md">Check your eligibility</h3>
      <p>Make sure you meet the requirements before you apply.</p>
    </li>

    <li class="civ-process-list__item">
      <h3 class="civ-heading-md">Gather your information</h3>
      <p>Here's what you'll need to apply:</p>
      <ul class="civ-mb-3">
${prepItems}
      </ul>
    </li>

    <li class="civ-process-list__item">
      <h3 class="civ-heading-md">Start your application</h3>
      <p>We'll take you through each step. It should take about ${escapeHtml(form.respondentBurden)}.</p>
      <details>
        <summary class="civ-link civ-cursor-pointer">What happens after you apply</summary>
        <ul class="civ-mt-2">
${nextStepsItems}
        </ul>
      </details>
    </li>

    <li class="civ-process-list__item">
      <h3 class="civ-heading-md">Submit your application</h3>
      <p>You'll review your information before submitting.</p>
    </li>
  </ol>

  <civ-button label="Start your application" variant="primary"></civ-button>

  <!-- OMB info -->
  <civ-divider></civ-divider>
  <div class="civ-text-sm civ-text-muted">
    <p><strong>Respondent burden:</strong> ${escapeHtml(form.respondentBurden)}</p>
    <p><strong>OMB Control Number:</strong> ${escapeHtml(form.ombNumber)}</p>
    <p>An agency may not conduct or sponsor, and a person is not required to respond to,
    a collection of information unless it displays a currently valid OMB control number.</p>
  </div>

  <!-- Need help -->
  <civ-divider></civ-divider>
  <div>
    <h2 class="civ-heading-md">Need help?</h2>
    <p>If you have questions or need help filling out this form, call us at
    <a href="tel:18008271000" class="civ-link">800-827-1000</a>
    (TTY: 711). We're here Monday through Friday, 8:00 a.m. to 9:00 p.m. ET.</p>
  </div>
</div>`;

  const javascript = `// Intro page — start application button
document.querySelector('.civ-form-intro civ-button')?.addEventListener('civ-analytics', () => {
  // Navigate to first chapter or sign-in flow
});`;

  return { html, javascript, features };
}
