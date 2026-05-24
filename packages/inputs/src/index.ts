// Side-effect imports ensure custom elements are registered.
// Named re-exports alone can be tree-shaken by bundlers.
import './text-input/civ-text-input.js';
import './textarea/civ-textarea.js';
import './number/civ-number.js';
import './select/civ-select.js';
import './combobox/civ-combobox.js';
import './date-picker/civ-date-picker.js';
import './date-range-picker/civ-date-range-picker.js';
import './date-input/civ-memorable-date.js';
import './time-picker/civ-time-picker.js';
import './file-upload/civ-file-upload.js';
import './toggle/civ-toggle.js';
import './yes-no/civ-yes-no.js';
import './ssn/civ-ssn.js';
import './phone/civ-phone.js';
import './email/civ-email.js';
import './zip/civ-zip.js';
import './ein/civ-ein.js';
import './currency/civ-currency.js';
import './routing-number/civ-routing-number.js';
import './country/civ-country.js';
import './va-file-number/civ-va-file-number.js';
// Selection controls — moved from the former @civui/controls package
// since consumers always reached for both packages together.
import './checkbox/civ-checkbox.js';
import './checkbox/civ-checkbox-group.js';
import './radio/civ-radio.js';
import './radio/civ-radio-group.js';
import './segmented-control/civ-segment.js';
import './segmented-control/civ-segmented-control.js';

// Preset Input Base Class
export { PresetInputWrapper } from './preset-input/index.js';

// Text Input
export { CivTextInput } from './text-input/index.js';
export type { TextInputType, TextInputMask, TextInputValidate } from './text-input/index.js';

// Textarea
export { CivTextarea } from './textarea/index.js';

// Number
export { CivNumber } from './number/index.js';

// Select
export { CivSelect } from './select/index.js';
export type { SelectOption } from './select/index.js';

// Combobox
export { CivCombobox } from './combobox/index.js';
export type { ComboboxOption } from './combobox/index.js';

// Date Picker
export { CivDatePicker } from './date-picker/index.js';

// Date Range Picker
export { CivDateRangePicker } from './date-range-picker/index.js';
export type { DateRangeValue } from './date-range-picker/index.js';

// Memorable Date
export { CivMemorableDate } from './date-input/index.js';

// Time Picker
export { CivTimePicker } from './time-picker/index.js';
export type { TimePickerFormat } from './time-picker/index.js';

// File Upload
export { CivFileUpload } from './file-upload/index.js';

// Toggle
export { CivToggle } from './toggle/index.js';

// Yes/No
export { CivYesNo } from './yes-no/index.js';

// SSN
export { CivSsn } from './ssn/index.js';

// Phone
export { CivPhone } from './phone/index.js';

// Email
export { CivEmail } from './email/index.js';

// ZIP
export { CivZip } from './zip/index.js';

// EIN
export { CivEin } from './ein/index.js';

// Currency
export { CivCurrency } from './currency/index.js';

// Routing Number
export { CivRoutingNumber } from './routing-number/index.js';

// Country
export { CivCountry } from './country/index.js';

// VA File Number
export { CivVaFileNumber } from './va-file-number/index.js';


// ── Selection controls (formerly @civui/controls) ────────────
// Checkbox + Radio + Segmented Control. Kept conceptually
// distinct in docs (their own sidebar category) but live in
// @civui/inputs since they're all form-participating inputs and
// consumers always reach for both packages together.

// Checkbox
export { CivCheckbox, CivCheckboxGroup } from './checkbox/index.js';

// Radio
export { CivRadio, CivRadioGroup } from './radio/index.js';

// Segmented Control
export { CivSegmentedControl, CivSegment } from './segmented-control/index.js';
