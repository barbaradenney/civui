import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/core';
import '@civui/inputs';
import '@civui/inputs';
import '@civui/actions';
import '@civui/layout';
import '@civui/feedback';
import '@civui/actions';
import '../repeater/civ-repeater.js';
import '../fieldset/civ-fieldset.js';
import '../conditional/civ-conditional.js';
import '../data-field/civ-data-field.js';
import '../summary/civ-summary.js';

const meta: Meta = {
  title: 'Patterns/Healthcare',
  parameters: {
    docs: {
      description: {
        component: `
Common healthcare and medical form patterns for government applications.
These examples compose existing CivUI components — no custom components needed.
Useful for VA healthcare enrollment, Medicare/Medicaid applications, and
clinic scheduling systems.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// ── 1. Medication List ────────────────────────────────────────

export const MedicationList: Story = {
  name: 'Medication list',
  parameters: {
    docs: {
      description: {
        story:
          'A repeatable medication entry using `civ-repeater`. Each entry captures medication name, dosage, frequency, and prescribing provider. The combobox allows searching common medications while still permitting free-text entry.',
      },
    },
  },
  render: () => html`
    <civ-repeater legend="Current medications" name="medications" item-label="medication">
      <div>
        <civ-combobox label="Medication name" required name="medication_name"
            placeholder="Search or type medication name"
            .options=${[
              { value: 'lisinopril', label: 'Lisinopril' },
              { value: 'metformin', label: 'Metformin' },
              { value: 'amlodipine', label: 'Amlodipine' },
              { value: 'metoprolol', label: 'Metoprolol' },
              { value: 'omeprazole', label: 'Omeprazole' },
              { value: 'levothyroxine', label: 'Levothyroxine' },
              { value: 'atorvastatin', label: 'Atorvastatin' },
              { value: 'losartan', label: 'Losartan' },
              { value: 'gabapentin', label: 'Gabapentin' },
              { value: 'sertraline', label: 'Sertraline' },
            ]}></civ-combobox>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <civ-text-input label="Dosage" hint="For example: 10mg" required name="dosage"></civ-text-input>
          <civ-select label="Frequency" required name="frequency" .options=${[
              { value: 'once-daily', label: 'Once daily' },
              { value: 'twice-daily', label: 'Twice daily' },
              { value: 'three-daily', label: 'Three times daily' },
              { value: 'four-daily', label: 'Four times daily' },
              { value: 'as-needed', label: 'As needed' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
            ]}></civ-select>
        </div>
        <civ-text-input label="Prescribing provider" hint="Doctor or clinic that prescribed this medication" name="prescriber"></civ-text-input>
      </div>
    </civ-repeater>
  `,
};

// ── 2. Provider Selection ─────────────────────────────────────

export const ProviderSelection: Story = {
  name: 'Provider selection',
  parameters: {
    docs: {
      description: {
        story:
          'A combobox for searching a provider directory by name. Pair with a specialty filter to narrow results. Use `civ-combobox` for large provider lists where the user likely knows who they are looking for.',
      },
    },
  },
  render: () => html`
    <div style="max-width: 480px; display: grid; gap: 1rem;">
      <civ-select label="Specialty" hint="Narrow results by provider specialty" name="specialty" empty-label="All specialties" .options=${[
          { value: 'primary-care', label: 'Primary care' },
          { value: 'cardiology', label: 'Cardiology' },
          { value: 'dermatology', label: 'Dermatology' },
          { value: 'endocrinology', label: 'Endocrinology' },
          { value: 'mental-health', label: 'Mental health' },
          { value: 'neurology', label: 'Neurology' },
          { value: 'ophthalmology', label: 'Ophthalmology' },
          { value: 'orthopedics', label: 'Orthopedics' },
          { value: 'physical-therapy', label: 'Physical therapy' },
          { value: 'podiatry', label: 'Podiatry' },
        ]}></civ-select>
      <civ-combobox label="Provider" required hint="Search by provider name" name="provider"
          placeholder="Type a provider name"
          .options=${[
            { value: 'dr-chen', label: 'Dr. Maria Chen — Primary care' },
            { value: 'dr-johnson', label: 'Dr. Robert Johnson — Cardiology' },
            { value: 'dr-patel', label: 'Dr. Anita Patel — Endocrinology' },
            { value: 'dr-williams', label: 'Dr. Sarah Williams — Mental health' },
            { value: 'dr-garcia', label: 'Dr. Carlos Garcia — Neurology' },
            { value: 'dr-kim', label: 'Dr. James Kim — Orthopedics' },
            { value: 'dr-thompson', label: 'Dr. Lisa Thompson — Dermatology' },
          ]}></civ-combobox>
      <civ-textarea label="Reason for visit" name="reason" placeholder="Briefly describe why you need to see this provider"></civ-textarea>
    </div>
  `,
};

// ── 3. Insurance Card Upload ──────────────────────────────────

export const InsuranceCardUpload: Story = {
  name: 'Insurance card upload',
  parameters: {
    docs: {
      description: {
        story:
          'Front and back insurance card capture using two `civ-file-upload` instances with `accept="image/*"`. Each carries its own `label` for clear instructions. On mobile, `accept="image/*"` prompts the camera option.',
      },
    },
  },
  render: () => html`
    <div style="max-width: 480px; display: grid; gap: 1rem;">
      <civ-alert intent="info" spacing="sm">
        Please upload clear photos of the front and back of your insurance card.
        Accepted formats: JPG, PNG, or PDF.
      </civ-alert>
      <civ-file-upload label="Front of insurance card" required name="insurance_front"
          accept="image/*,.pdf"
          max-size="10"></civ-file-upload>
      <civ-file-upload label="Back of insurance card" required name="insurance_back"
          accept="image/*,.pdf"
          max-size="10"></civ-file-upload>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <civ-text-input label="Insurance company" name="insurance_company" autocomplete="organization"></civ-text-input>
        <civ-text-input label="Member ID" name="member_id"></civ-text-input>
      </div>
      <civ-text-input label="Group number" name="group_number"></civ-text-input>
    </div>
  `,
};

// ── 4. Allergy List ───────────────────────────────────────────

export const AllergyList: Story = {
  name: 'Allergy list',
  parameters: {
    docs: {
      description: {
        story:
          'A repeatable allergy entry with severity classification and reaction description. Uses `civ-repeater` with a radio group for severity and a textarea for the reaction. A yes/no gate asks if the patient has any allergies before showing the repeater.',
      },
    },
  },
  render: () => html`
    <div style="max-width: 480px; display: grid; gap: 1rem;">
      <civ-yes-no legend="Do you have any known allergies?" required name="has_allergies"></civ-yes-no>
      <civ-conditional when="has_allergies" equals="yes">
        <civ-repeater legend="Allergies" name="allergies" item-label="allergy">
          <div>
            <civ-text-input label="Allergen" required hint="Medication, food, or environmental allergen" name="allergen"></civ-text-input>
            <civ-radio-group legend="Severity" required name="severity">
              <civ-radio label="Mild" value="mild" description="Rash, itching, or minor swelling"></civ-radio>
              <civ-radio label="Moderate" value="moderate" description="Hives, significant swelling, or breathing difficulty"></civ-radio>
              <civ-radio label="Severe" value="severe" description="Anaphylaxis or life-threatening reaction"></civ-radio>
            </civ-radio-group>
            <civ-textarea label="Reaction" hint="Describe what happens when exposed" name="reaction" rows="2"></civ-textarea>
          </div>
        </civ-repeater>
      </civ-conditional>
    </div>
  `,
};

// ── 5. Appointment Confirmation Card ──────────────────────────

export const AppointmentConfirmation: Story = {
  name: 'Appointment confirmation',
  parameters: {
    docs: {
      description: {
        story:
          'A read-only confirmation card showing appointment details after scheduling. Uses `civ-card` with `civ-data-field` rows and action links for reschedule/cancel. The alert at the top confirms the booking.',
      },
    },
  },
  render: () => html`
    <div style="max-width: 480px; display: grid; gap: 1rem;">
      <civ-alert intent="success" heading="Appointment confirmed">
        Your appointment has been scheduled. You will receive a confirmation email shortly.
      </civ-alert>
      <civ-card>
        <h3 slot="data-card-header" class="civ-m-0">Appointment details</h3>
        <civ-data-field label="Date" value="Monday, May 5, 2026"></civ-data-field>
        <civ-data-field label="Time" value="10:30 AM — 11:00 AM"></civ-data-field>
        <civ-data-field label="Provider" value="Dr. Maria Chen"></civ-data-field>
        <civ-data-field label="Specialty" value="Primary care"></civ-data-field>
        <civ-data-field label="Location" value="VA Medical Center, Building 2, Room 214"></civ-data-field>
        <civ-data-field label="Reason for visit" value="Annual physical exam"></civ-data-field>
        <civ-data-field label="Confirmation number" value="APT-2026-05-0847"></civ-data-field>
        <civ-divider spacing="sm"></civ-divider>
        <div style="display: flex; gap: 1rem;">
          <civ-link label="Reschedule appointment" href="#reschedule"></civ-link>
          <civ-link label="Cancel appointment" href="#cancel"></civ-link>
        </div>
      </civ-card>
      <civ-alert intent="info" spacing="sm">
        Please arrive 15 minutes early and bring your insurance card and photo ID.
      </civ-alert>
    </div>
  `,
};

// ── 6. Symptom Checker ────────────────────────────────────────

export const SymptomChecker: Story = {
  name: 'Symptom checker',
  parameters: {
    docs: {
      description: {
        story:
          'A checkbox group of common symptoms with conditional follow-up questions. When a symptom is checked, a conditional reveal asks for duration and severity. This pattern is common in pre-visit screening questionnaires.',
      },
    },
  },
  render: () => html`
    <div style="max-width: 480px; display: grid; gap: 1rem;">
      <civ-checkbox-group legend="What symptoms are you experiencing?" required hint="Select all that apply" name="symptoms">
        <civ-checkbox label="Headache" value="headache"></civ-checkbox>
        <civ-checkbox label="Fever or chills" value="fever"></civ-checkbox>
        <civ-checkbox label="Cough" value="cough"></civ-checkbox>
        <civ-checkbox label="Shortness of breath" value="breathing"></civ-checkbox>
        <civ-checkbox label="Fatigue" value="fatigue"></civ-checkbox>
        <civ-checkbox label="Nausea or vomiting" value="nausea"></civ-checkbox>
        <civ-checkbox label="Muscle or joint pain" value="pain"></civ-checkbox>
        <civ-checkbox label="Dizziness" value="dizziness"></civ-checkbox>
      </civ-checkbox-group>

      <civ-conditional when="symptoms" equals="fever">
        <civ-text-input label="What is your current temperature?" hint="For example: 101.2" name="temperature" type="number" inputmode="decimal"></civ-text-input>
      </civ-conditional>

      <civ-conditional when="symptoms" equals="breathing">
        <civ-alert intent="warning" spacing="sm">
          If you are having severe difficulty breathing, please call 911 or go to the nearest emergency room.
        </civ-alert>
        <civ-radio-group legend="When does the shortness of breath occur?" required name="breathing_when">
          <civ-radio label="At rest" value="rest"></civ-radio>
          <civ-radio label="During light activity" value="light-activity"></civ-radio>
          <civ-radio label="Only during exercise" value="exercise"></civ-radio>
        </civ-radio-group>
      </civ-conditional>

      <civ-select label="How long have you had these symptoms?" required name="duration" .options=${[
          { value: 'today', label: 'Started today' },
          { value: '2-3-days', label: '2–3 days' },
          { value: '4-7-days', label: '4–7 days' },
          { value: '1-2-weeks', label: '1–2 weeks' },
          { value: 'more-than-2-weeks', label: 'More than 2 weeks' },
        ]}></civ-select>

      <civ-textarea label="Additional details" hint="Anything else your provider should know" name="details" rows="3"></civ-textarea>
    </div>
  `,
};

// ── 7. Pharmacy Selection ─────────────────────────────────────

export const PharmacySelection: Story = {
  name: 'Pharmacy selection',
  parameters: {
    docs: {
      description: {
        story:
          'Preferred pharmacy selection using radio cards with descriptions showing address and hours. A combobox alternative allows searching a larger directory. Common in prescription and medication management flows.',
      },
    },
  },
  render: () => html`
    <div style="max-width: 480px; display: grid; gap: 1.5rem;">
      <civ-radio-group legend="Select your preferred pharmacy" required name="pharmacy">
        <civ-radio
          label="VA Medical Center Pharmacy"
          value="va-pharmacy"
          description="123 Veterans Blvd, Building 1 — Mon–Fri 8:00 AM – 5:00 PM"
        ></civ-radio>
        <civ-radio
          label="VA Community Pharmacy — Eastside"
          value="va-east"
          description="456 Oak Street — Mon–Sat 9:00 AM – 7:00 PM"
        ></civ-radio>
        <civ-radio
          label="VA Mail-Order Pharmacy"
          value="va-mail"
          description="Prescriptions mailed to your home — allow 7–10 business days"
        ></civ-radio>
      </civ-radio-group>

      <civ-divider></civ-divider>

      <p style="margin: 0; font-weight: 600;">Or search for a community pharmacy</p>
      <civ-combobox label="Pharmacy name or ZIP code" hint="Search nearby pharmacies" name="community_pharmacy"
          placeholder="Type a pharmacy name or ZIP"
          .options=${[
            { value: 'cvs-22301', label: 'CVS Pharmacy — 789 Main St, 22301' },
            { value: 'walgreens-22302', label: 'Walgreens — 321 Elm Ave, 22302' },
            { value: 'rite-aid-22301', label: 'Rite Aid — 555 Oak Ln, 22301' },
            { value: 'costco-22305', label: 'Costco Pharmacy — 100 Commerce Dr, 22305' },
          ]}></civ-combobox>
    </div>
  `,
};

// ── 8. Medical History Screening ──────────────────────────────

export const MedicalHistoryScreening: Story = {
  name: 'Medical history screening',
  parameters: {
    docs: {
      description: {
        story:
          'A series of yes/no screening questions with conditional reveals for follow-up details. This is the standard pattern for medical history intake — each condition asks if diagnosed, then conditionally asks for date of diagnosis and current treatment.',
      },
    },
  },
  render: () => html`
    <div style="max-width: 480px; display: grid; gap: 1rem;">
      <civ-alert intent="info" spacing="sm">
        Please answer the following questions about your medical history. This information helps your provider give you the best care.
      </civ-alert>

      <civ-yes-no legend="Have you ever been diagnosed with high blood pressure (hypertension)?" name="hypertension"></civ-yes-no>
      <civ-conditional when="hypertension" equals="yes">
        <div style="padding-left: 1.5rem; border-left: 4px solid var(--civ-color-primary-DEFAULT); display: grid; gap: 1rem;">
          <civ-text-input label="Year diagnosed" hint="For example: 2018" name="hypertension_year" type="number" inputmode="numeric"></civ-text-input>
          <civ-yes-no legend="Are you currently taking medication for this?" name="hypertension_medication"></civ-yes-no>
        </div>
      </civ-conditional>

      <civ-yes-no legend="Have you ever been diagnosed with diabetes?" name="diabetes"></civ-yes-no>
      <civ-conditional when="diabetes" equals="yes">
        <div style="padding-left: 1.5rem; border-left: 4px solid var(--civ-color-primary-DEFAULT); display: grid; gap: 1rem;">
          <civ-radio-group legend="Type of diabetes" required name="diabetes_type">
            <civ-radio label="Type 1" value="type1"></civ-radio>
            <civ-radio label="Type 2" value="type2"></civ-radio>
            <civ-radio label="Not sure" value="unsure"></civ-radio>
          </civ-radio-group>
          <civ-text-input label="Year diagnosed" name="diabetes_year" type="number" inputmode="numeric"></civ-text-input>
        </div>
      </civ-conditional>

      <civ-yes-no legend="Have you ever been diagnosed with heart disease?" name="heart_disease"></civ-yes-no>
      <civ-conditional when="heart_disease" equals="yes">
        <div style="padding-left: 1.5rem; border-left: 4px solid var(--civ-color-primary-DEFAULT); display: grid; gap: 1rem;">
          <civ-textarea label="Describe the condition" hint="For example: coronary artery disease, heart failure, arrhythmia" name="heart_details" rows="2"></civ-textarea>
        </div>
      </civ-conditional>

      <civ-yes-no legend="Have you ever had surgery?" name="surgery"></civ-yes-no>
      <civ-conditional when="surgery" equals="yes">
        <div style="padding-left: 1.5rem; border-left: 4px solid var(--civ-color-primary-DEFAULT);">
          <civ-repeater legend="Surgeries" name="surgeries" item-label="surgery">
            <div>
              <civ-text-input label="Surgery or procedure" required name="surgery_name"></civ-text-input>
              <civ-text-input label="Approximate date" hint="For example: March 2020" name="surgery_date"></civ-text-input>
            </div>
          </civ-repeater>
        </div>
      </civ-conditional>
    </div>
  `,
};

// ── 9. Vitals Display ─────────────────────────────────────────

export const VitalsDisplay: Story = {
  name: 'Vitals display',
  parameters: {
    docs: {
      description: {
        story:
          'Read-only display of patient vitals using `civ-data-field`. Suitable for review pages, patient portals, and provider dashboards. Tags indicate if values are within normal range.',
      },
    },
  },
  render: () => html`
    <div style="max-width: 480px; display: grid; gap: 1rem;">
      <civ-card>
        <h3 slot="data-card-header" class="civ-m-0">Vitals — May 1, 2026</h3>
        <div style="display: grid; gap: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <civ-data-field label="Blood pressure" value="128/82 mmHg" style="flex: 1;"></civ-data-field>
            <civ-tag label="Elevated" color="orange" spacing="sm"></civ-tag>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <civ-data-field label="Heart rate" value="72 bpm" style="flex: 1;"></civ-data-field>
            <civ-tag label="Normal" color="blue" spacing="sm"></civ-tag>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <civ-data-field label="Temperature" value="98.6 °F" style="flex: 1;"></civ-data-field>
            <civ-tag label="Normal" color="blue" spacing="sm"></civ-tag>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <civ-data-field label="Respiratory rate" value="16 breaths/min" style="flex: 1;"></civ-data-field>
            <civ-tag label="Normal" color="blue" spacing="sm"></civ-tag>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <civ-data-field label="Oxygen saturation" value="97%" style="flex: 1;"></civ-data-field>
            <civ-tag label="Normal" color="blue" spacing="sm"></civ-tag>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <civ-data-field label="Weight" value="185 lbs" style="flex: 1;"></civ-data-field>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <civ-data-field label="Height" value="5' 10&quot;" style="flex: 1;"></civ-data-field>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <civ-data-field label="BMI" value="26.5" style="flex: 1;"></civ-data-field>
            <civ-tag label="Overweight" color="orange" spacing="sm"></civ-tag>
          </div>
        </div>
      </civ-card>
    </div>
  `,
};

// ── 10. Referral Status Tracker ───────────────────────────────

export const ReferralStatusTracker: Story = {
  name: 'Referral status tracker',
  parameters: {
    docs: {
      description: {
        story:
          'A read-only status view for tracking referral and authorization steps. Uses `civ-list` with badges to show step status and list items with descriptions for each stage. Common in specialist referral tracking and pre-authorization flows.',
      },
    },
  },
  render: () => html`
    <div style="max-width: 480px; display: grid; gap: 1rem;">
      <civ-card>
        <h3 slot="data-card-header" class="civ-m-0">Referral to Cardiology</h3>
        <div style="display: grid; gap: 0.5rem; margin-bottom: 1rem;">
          <civ-data-field label="Referral number" value="REF-2026-04-1192"></civ-data-field>
          <civ-data-field label="Referred by" value="Dr. Maria Chen — Primary care"></civ-data-field>
          <civ-data-field label="Referred to" value="Dr. Robert Johnson — Cardiology"></civ-data-field>
          <civ-data-field label="Reason" value="Elevated blood pressure, chest discomfort"></civ-data-field>
        </div>

        <civ-divider spacing="sm"></civ-divider>
        <p style="margin: 0.5rem 0; font-weight: 700;">Authorization steps</p>

        <civ-list dividers>
          <civ-list-item>
            <civ-badge slot="start" label="Complete" intent="success"></civ-badge>
            <span slot="heading">Referral submitted</span>
            <span slot="description">April 28, 2026 — Submitted by Dr. Chen's office</span>
          </civ-list-item>
          <civ-list-item>
            <civ-badge slot="start" label="Complete" intent="success"></civ-badge>
            <span slot="heading">Insurance pre-authorization requested</span>
            <span slot="description">April 29, 2026 — Sent to insurance for review</span>
          </civ-list-item>
          <civ-list-item>
            <civ-badge slot="start" label="In progress" intent="warning"></civ-badge>
            <span slot="heading">Insurance review</span>
            <span slot="description">Estimated completion: May 3, 2026</span>
          </civ-list-item>
          <civ-list-item>
            <civ-badge slot="start" label="Pending" intent="info"></civ-badge>
            <span slot="heading">Schedule appointment</span>
            <span slot="description">Available after authorization is approved</span>
          </civ-list-item>
        </civ-list>
      </civ-card>

      <civ-alert intent="info" spacing="sm">
        You will receive a notification when your authorization is approved and you can schedule your appointment.
      </civ-alert>
    </div>
  `,
};
