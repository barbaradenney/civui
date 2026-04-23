/**
 * generate_intro_page tool — generates the government form introduction page.
 */

import { escapeHtml } from './html-utils.js';
import type { GovFormDefinition } from '../resources/gov-form-registry.js';

export interface IntroPageResult {
  html: string;
  javascript: string;
  features: string[];
}

export function generateIntroPage(form: GovFormDefinition): IntroPageResult {
  const features = ['intro-page'];

  const html = `<!-- VA Form ${escapeHtml(form.formNumber)} — Introduction Page -->
<div class="civ-form-intro">
  <civ-page-header>
    <h1 data-heading class="civ-heading-xl">${escapeHtml(form.title)}</h1>
    <span data-subheading>VA Form ${escapeHtml(form.formNumber)}</span>
  </civ-page-header>

  <p class="civ-text-muted civ-mb-6">Use this form to apply for VA benefits. If you're signed in, we can prefill some of your information to save you time.</p>

  <div class="civ-flex civ-gap-3">
    <civ-button label="Sign in and start" variant="primary" data-start-signed-in></civ-button>
    <civ-button label="Start without signing in" variant="tertiary" data-start-guest></civ-button>
  </div>
</div>`;

  const javascript = '';

  return { html, javascript, features };
}
