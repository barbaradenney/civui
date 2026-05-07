import { describe, it, expect } from 'vitest';
import { lookupStyle, ELEMENT_TYPES } from './style-lookup.js';
import type { ElementType } from './style-lookup.js';

describe('ELEMENT_TYPES', () => {
  it('contains 17 element types', () => {
    expect(ELEMENT_TYPES).toHaveLength(17);
  });

  it('includes all expected element types', () => {
    const expected: ElementType[] = [
      'label', 'legend', 'required-mark', 'hint', 'error-text',
      'input', 'fieldset', 'group-layout', 'checkbox', 'radio',
      'toggle', 'segment', 'file-upload', 'combobox', 'date-picker',
      'form-error-summary', 'sr-only',
    ];
    for (const el of expected) {
      expect(ELEMENT_TYPES).toContain(el);
    }
  });
});

describe('lookupStyle', () => {
  describe('unknown element', () => {
    it('returns empty classes and error note for unknown element', () => {
      const result = lookupStyle('banana');
      expect(result.classes).toEqual([]);
      expect(result.notes).toBeDefined();
      expect(result.notes![0]).toContain('Unknown element');
      expect(result.notes![0]).toContain('banana');
    });

    it('lists all valid types in the error note', () => {
      const result = lookupStyle('invalid');
      for (const el of ELEMENT_TYPES) {
        expect(result.notes![0]).toContain(el);
      }
    });
  });

  describe('label', () => {
    it('returns .civ-label class', () => {
      const result = lookupStyle('label');
      expect(result.classes).toEqual(['.civ-label']);
    });

    it('has no stateClasses', () => {
      const result = lookupStyle('label');
      expect(result.stateClasses).toBeUndefined();
    });

    it('has no focusRing', () => {
      const result = lookupStyle('label');
      expect(result.focusRing).toBeUndefined();
    });
  });

  describe('legend', () => {
    it('returns .civ-legend class', () => {
      const result = lookupStyle('legend');
      expect(result.classes).toEqual(['.civ-legend']);
    });
  });

  describe('required-mark', () => {
    it('returns .civ-required-mark class', () => {
      const result = lookupStyle('required-mark');
      expect(result.classes).toEqual(['.civ-required-mark']);
    });
  });

  describe('hint', () => {
    it('returns .civ-hint by default', () => {
      const result = lookupStyle('hint');
      expect(result.classes).toEqual(['.civ-hint']);
    });

    it('returns .civ-hint--group for group variant', () => {
      const result = lookupStyle('hint', 'group');
      expect(result.classes).toEqual(['.civ-hint--group']);
    });
  });

  describe('error-text', () => {
    it('returns .civ-error-text by default', () => {
      const result = lookupStyle('error-text');
      expect(result.classes).toEqual(['.civ-error-text']);
    });

    it('returns .civ-error-text--group for group variant', () => {
      const result = lookupStyle('error-text', 'group');
      expect(result.classes).toEqual(['.civ-error-text--group']);
    });

    it('includes role="alert" note', () => {
      const result = lookupStyle('error-text');
      expect(result.notes!.some(n => n.includes('role="alert"'))).toBe(true);
    });
  });

  describe('input', () => {
    it('returns .civ-input class', () => {
      const result = lookupStyle('input');
      expect(result.classes).toEqual(['.civ-input']);
    });

    it('includes error and disabled states', () => {
      const result = lookupStyle('input');
      expect(result.stateClasses).toBeDefined();
      expect(result.stateClasses!.error).toContain('aria-invalid');
      expect(result.stateClasses!.disabled).toContain('disabled');
    });

    it('includes focusRing', () => {
      const result = lookupStyle('input');
      expect(result.focusRing).toContain('global');
    });

    it('filters states when requested', () => {
      const result = lookupStyle('input', undefined, ['error']);
      expect(result.stateClasses).toBeDefined();
      expect(result.stateClasses!.error).toBeDefined();
      expect(result.stateClasses!.disabled).toBeUndefined();
    });

    it('returns no stateClasses when filtering for non-existent state', () => {
      const result = lookupStyle('input', undefined, ['checked']);
      expect(result.stateClasses).toBeUndefined();
    });
  });

  describe('fieldset', () => {
    it('returns .civ-fieldset class', () => {
      const result = lookupStyle('fieldset');
      expect(result.classes).toEqual(['.civ-fieldset']);
    });
  });

  describe('group-layout', () => {
    it('returns vertical layout by default', () => {
      const result = lookupStyle('group-layout');
      expect(result.classes).toEqual(['.civ-group-layout--vertical']);
    });

    it('returns vertical layout for vertical variant', () => {
      const result = lookupStyle('group-layout', 'vertical');
      expect(result.classes).toEqual(['.civ-group-layout--vertical']);
    });

    it('returns horizontal layout for horizontal variant', () => {
      const result = lookupStyle('group-layout', 'horizontal');
      expect(result.classes).toEqual(['.civ-group-layout--horizontal']);
    });
  });

  describe('checkbox', () => {
    it('returns check-input and check-label by default', () => {
      const result = lookupStyle('checkbox');
      expect(result.classes).toContain('.civ-check-input');
      expect(result.classes).toContain('.civ-check-label');
    });

    it('returns tile classes for tile variant', () => {
      const result = lookupStyle('checkbox', 'tile');
      expect(result.classes).toContain('.civ-check-tile');
      expect(result.classes).toContain('.civ-check-input');
      expect(result.classes).toContain('.civ-check-label');
    });

    it('includes checked and disabled states', () => {
      const result = lookupStyle('checkbox');
      expect(result.stateClasses!.checked).toContain('accent-primary');
      expect(result.stateClasses!.checked).toContain('civ-border-primary');
      expect(result.stateClasses!.disabled).toContain('civ-opacity-50');
    });

    it('includes focusRing', () => {
      const result = lookupStyle('checkbox');
      expect(result.focusRing).toBeDefined();
    });

    it('mentions check-description in notes', () => {
      const result = lookupStyle('checkbox');
      expect(result.notes!.some(n => n.includes('.civ-check-description'))).toBe(true);
    });
  });

  describe('radio', () => {
    it('returns same check-input and check-label classes as checkbox', () => {
      const result = lookupStyle('radio');
      expect(result.classes).toContain('.civ-check-input');
      expect(result.classes).toContain('.civ-check-label');
    });

    it('returns tile classes for tile variant', () => {
      const result = lookupStyle('radio', 'tile');
      expect(result.classes).toContain('.civ-check-tile');
    });

    it('notes that radio shares checkbox classes', () => {
      const result = lookupStyle('radio');
      expect(result.notes!.some(n => n.includes('.civ-check-'))).toBe(true);
    });
  });

  describe('toggle', () => {
    it('returns track and thumb classes', () => {
      const result = lookupStyle('toggle');
      expect(result.classes).toContain('.civ-toggle-track');
      expect(result.classes).toContain('.civ-toggle-thumb');
    });

    it('includes checked and disabled states', () => {
      const result = lookupStyle('toggle');
      expect(result.stateClasses!.checked).toContain('aria-checked="true"');
      expect(result.stateClasses!.disabled).toContain('disabled');
    });

    it('includes focusRing', () => {
      const result = lookupStyle('toggle');
      expect(result.focusRing).toBeDefined();
    });
  });

  describe('segment', () => {
    it('returns segment-btn class', () => {
      const result = lookupStyle('segment');
      expect(result.classes).toEqual(['.civ-segment-btn']);
    });

    it('includes selected and disabled states', () => {
      const result = lookupStyle('segment');
      expect(result.stateClasses!.selected).toContain('civ-bg-primary');
      expect(result.stateClasses!.disabled).toContain('civ-opacity-50');
    });

    it('mentions segment position rounding in notes', () => {
      const result = lookupStyle('segment');
      expect(result.notes!.some(n => n.includes('civ-rounded-s'))).toBe(true);
    });
  });

  describe('file-upload', () => {
    it('returns dropzone class', () => {
      const result = lookupStyle('file-upload');
      expect(result.classes).toEqual(['.civ-dropzone']);
    });

    it('includes dragging, error, and disabled states', () => {
      const result = lookupStyle('file-upload');
      expect(result.stateClasses!.dragging).toContain('data-dragging');
      expect(result.stateClasses!.error).toContain('aria-invalid');
      expect(result.stateClasses!.disabled).toContain('aria-disabled');
    });

    it('mentions file-item and file-remove-btn in notes', () => {
      const result = lookupStyle('file-upload');
      expect(result.notes!.some(n => n.includes('.civ-list-item'))).toBe(true);
      expect(result.notes!.some(n => n.includes('.civ-list-item__actions'))).toBe(true);
    });
  });

  describe('combobox', () => {
    it('returns input, listbox, and option classes', () => {
      const result = lookupStyle('combobox');
      expect(result.classes).toContain('.civ-input');
      expect(result.classes).toContain('.civ-combobox-listbox');
      expect(result.classes).toContain('.civ-combobox-option');
    });

    it('includes active, error, and disabled states', () => {
      const result = lookupStyle('combobox');
      expect(result.stateClasses!.active).toContain('data-active');
      expect(result.stateClasses!.error).toContain('aria-invalid');
      expect(result.stateClasses!.disabled).toContain('disabled');
    });
  });

  describe('date-picker', () => {
    it('returns input, dialog, and day classes', () => {
      const result = lookupStyle('date-picker');
      expect(result.classes).toContain('.civ-input');
      expect(result.classes).toContain('.civ-datepicker-dialog');
      expect(result.classes).toContain('.civ-datepicker-day');
    });

    it('includes selected and disabled states', () => {
      const result = lookupStyle('date-picker');
      expect(result.stateClasses!.selected).toContain('aria-selected');
      expect(result.stateClasses!.disabled).toContain('aria-disabled');
    });

    it('mentions nav-btn and cal-btn in notes', () => {
      const result = lookupStyle('date-picker');
      expect(result.notes!.some(n => n.includes('.civ-datepicker-nav-btn'))).toBe(true);
      expect(result.notes!.some(n => n.includes('.civ-datepicker-cal-btn'))).toBe(true);
    });
  });

  describe('form-error-summary', () => {
    it('returns summary and heading classes', () => {
      const result = lookupStyle('form-error-summary');
      expect(result.classes).toContain('.civ-form-error-summary');
      expect(result.classes).toContain('.civ-form-error-heading');
    });

    it('has no focusRing', () => {
      const result = lookupStyle('form-error-summary');
      expect(result.focusRing).toBeUndefined();
    });
  });

  describe('sr-only', () => {
    it('returns .civ-sr-only class', () => {
      const result = lookupStyle('sr-only');
      expect(result.classes).toEqual(['.civ-sr-only']);
    });

    it('mentions screen readers in notes', () => {
      const result = lookupStyle('sr-only');
      expect(result.notes!.some(n => n.includes('screen reader'))).toBe(true);
    });
  });

  describe('state filtering', () => {
    it('returns only requested states', () => {
      const result = lookupStyle('file-upload', undefined, ['error']);
      expect(result.stateClasses).toBeDefined();
      expect(Object.keys(result.stateClasses!)).toEqual(['error']);
    });

    it('returns multiple requested states', () => {
      const result = lookupStyle('file-upload', undefined, ['error', 'disabled']);
      expect(result.stateClasses).toBeDefined();
      expect(Object.keys(result.stateClasses!)).toHaveLength(2);
      expect(result.stateClasses!.error).toBeDefined();
      expect(result.stateClasses!.disabled).toBeDefined();
    });

    it('omits stateClasses when no states match', () => {
      const result = lookupStyle('label', undefined, ['error']);
      expect(result.stateClasses).toBeUndefined();
    });
  });

  describe('combined variant and state', () => {
    it('returns tile classes with filtered checked state', () => {
      const result = lookupStyle('checkbox', 'tile', ['checked']);
      expect(result.classes).toContain('.civ-check-tile');
      expect(result.stateClasses).toBeDefined();
      expect(result.stateClasses!.checked).toBeDefined();
      expect(result.stateClasses!.disabled).toBeUndefined();
    });

    it('returns group error-text variant with no states', () => {
      const result = lookupStyle('error-text', 'group', ['error']);
      expect(result.classes).toEqual(['.civ-error-text--group']);
      expect(result.stateClasses).toBeUndefined();
    });
  });

  describe('variant handling', () => {
    it('ignores unknown variants and returns base classes', () => {
      const result = lookupStyle('input', 'unknown-variant');
      expect(result.classes).toEqual(['.civ-input']);
    });

    it('applies known variant', () => {
      const result = lookupStyle('checkbox', 'tile');
      expect(result.classes).toContain('.civ-check-tile');
    });
  });

  describe('every element type returns a result', () => {
    for (const el of ELEMENT_TYPES) {
      it(`${el} returns non-empty classes`, () => {
        const result = lookupStyle(el);
        expect(result.classes.length).toBeGreaterThan(0);
      });
    }
  });

  describe('focusRing presence', () => {
    const interactive: ElementType[] = [
      'input', 'checkbox', 'radio', 'toggle', 'segment',
      'file-upload', 'combobox', 'date-picker',
    ];
    const nonInteractive: ElementType[] = [
      'label', 'legend', 'required-mark', 'hint', 'error-text',
      'fieldset', 'group-layout', 'form-error-summary', 'sr-only',
    ];

    for (const el of interactive) {
      it(`${el} has focusRing`, () => {
        const result = lookupStyle(el);
        expect(result.focusRing).toBeDefined();
      });
    }

    for (const el of nonInteractive) {
      it(`${el} has no focusRing`, () => {
        const result = lookupStyle(el);
        expect(result.focusRing).toBeUndefined();
      });
    }
  });
});
