/**
 * Tests for tools/lint-readonly-cascade.ts.
 *
 * Two kinds of coverage:
 *
 * 1. `findOpenTags` — parses a string and lists the
 *    readonly-supporting `<civ-*>` opening tags inside it. Multi-line
 *    tags, attribute values containing `>`, and tags that span
 *    template-literal expressions are the interesting cases.
 *
 * 2. `findCascadeGaps` — given a source string, returns the cascade
 *    violations (tags with `?disabled` but no `?readonly`). Covers
 *    every binding form the lint should accept (`?readonly`,
 *    `.readonly`, bare `readonly`) and rejects.
 */
import { describe, it, expect } from 'vitest';
import {
  findOpenTags,
  findCascadeGaps,
  findNativeOpenTags,
  findNativeReadonlyGaps,
} from '../lint-readonly-cascade.js';

describe('findOpenTags', () => {
  it('lists a single readonly-supporting tag on one line', () => {
    const src = '<civ-text-input label="x"></civ-text-input>';
    const tags = findOpenTags(src);
    expect(tags.map((t) => t.tag)).toEqual(['civ-text-input']);
  });

  it('skips tags that are not in the readonly-supporting set', () => {
    const src = '<civ-button label="x"></civ-button><civ-text-input></civ-text-input>';
    const tags = findOpenTags(src);
    expect(tags.map((t) => t.tag)).toEqual(['civ-text-input']);
  });

  it('captures multi-line opening tags', () => {
    const src = `<civ-select
      label="State"
      name="state"
      ?disabled="\${this.disabled}"
    ></civ-select>`;
    const tags = findOpenTags(src);
    expect(tags).toHaveLength(1);
    expect(tags[0].tag).toBe('civ-select');
  });

  it('does not treat `>` inside a quoted attribute as the tag close', () => {
    // The `>` inside the regex literal in the attribute value would
    // confuse a naive parser. The state machine inside findOpenTags
    // must skip characters inside strings.
    const src = `<civ-text-input pattern=">42" ?disabled="\${x}"></civ-text-input>`;
    const tags = findOpenTags(src);
    expect(tags).toHaveLength(1);
    const opening = src.slice(tags[0].start, tags[0].end + 1);
    expect(opening).toContain('pattern=">42"');
  });
});

describe('findCascadeGaps', () => {
  it('flags a tag with ?disabled but no ?readonly', () => {
    const src = `<civ-select label="x" ?disabled="\${this.disabled}"></civ-select>`;
    const gaps = findCascadeGaps(src);
    expect(gaps).toHaveLength(1);
    expect(gaps[0].tag).toBe('civ-select');
  });

  it('accepts ?readonly as the cascade form', () => {
    const src = `<civ-select label="x" ?disabled="\${this.disabled}" ?readonly="\${this.readonly}"></civ-select>`;
    expect(findCascadeGaps(src)).toHaveLength(0);
  });

  it('accepts `.readonly` property binding as the cascade form', () => {
    const src = `<civ-yes-no legend="x" ?disabled="\${this.disabled}" .readonly="\${this.readonly}"></civ-yes-no>`;
    expect(findCascadeGaps(src)).toHaveLength(0);
  });

  it('accepts bare `readonly="…"` as the cascade form', () => {
    const src = `<civ-text-input label="x" ?disabled="\${this.disabled}" readonly="\${this.readonly}"></civ-text-input>`;
    expect(findCascadeGaps(src)).toHaveLength(0);
  });

  it('does NOT flag a tag without ?disabled', () => {
    // Decorative usage — neither disabled nor readonly is forwarded.
    // The lint shouldn't pull this in.
    const src = `<civ-text-input label="x"></civ-text-input>`;
    expect(findCascadeGaps(src)).toHaveLength(0);
  });

  it('reports line number relative to the source start', () => {
    const src = `// header line 1
// header line 2
<civ-select
  label="x"
  ?disabled="\${this.disabled}"
></civ-select>`;
    const gaps = findCascadeGaps(src);
    expect(gaps).toHaveLength(1);
    expect(gaps[0].line).toBe(3);
  });

  it('uses the provided file path in findings', () => {
    const src = `<civ-select ?disabled="\${x}"></civ-select>`;
    const gaps = findCascadeGaps(src, 'fake/path.ts');
    expect(gaps[0].file).toBe('fake/path.ts');
  });

  it('finds multiple gaps in the same source', () => {
    const src = `
      <civ-select ?disabled="\${x}"></civ-select>
      <civ-text-input ?disabled="\${x}" ?readonly="\${y}"></civ-text-input>
      <civ-memorable-date ?disabled="\${x}"></civ-memorable-date>
    `;
    const gaps = findCascadeGaps(src);
    expect(gaps.map((g) => g.tag).sort()).toEqual(['civ-memorable-date', 'civ-select']);
  });

  it('does NOT flag tags outside the readonly-supporting set even with ?disabled', () => {
    // civ-button takes ?disabled but doesn't take readonly. It must
    // not be in READONLY_TAGS, so the lint shouldn't fire.
    const src = `<civ-button label="x" ?disabled="\${this.disabled}"></civ-button>`;
    expect(findCascadeGaps(src)).toHaveLength(0);
  });
});

describe('findNativeOpenTags', () => {
  it('finds native <input> and <textarea> open tags', () => {
    const src = `<input type="text" /><textarea></textarea>`;
    expect(findNativeOpenTags(src).map((t) => t.tag)).toEqual(['input', 'textarea']);
  });

  it('captures multi-line native tags and ignores `>` inside attributes', () => {
    const src = `<input
      type="text"
      pattern=">42"
      ?disabled="\${this.disabled}"
    />`;
    const tags = findNativeOpenTags(src);
    expect(tags).toHaveLength(1);
    const opening = src.slice(tags[0].start, tags[0].end + 1);
    expect(opening).toContain('pattern=">42"');
  });
});

describe('findNativeReadonlyGaps', () => {
  it('flags a native <input> that binds ?disabled but not ?readonly (the date-picker bug)', () => {
    // Mirrors the civ-date-picker regression: a text input with disabled
    // but no readonly binding.
    const src = `<input type="text" ?disabled="\${this.disabled}" ?required="\${this.required}" />`;
    const gaps = findNativeReadonlyGaps(src, 'civ-date-picker');
    expect(gaps).toHaveLength(1);
    expect(gaps[0].tag).toBe('input');
  });

  it('accepts a native <input> that binds both ?disabled and ?readonly', () => {
    const src = `<input type="text" ?disabled="\${this.disabled}" ?readonly="\${this.readonly}" />`;
    expect(findNativeReadonlyGaps(src, 'civ-text-input')).toHaveLength(0);
  });

  it('flags a <textarea> with ?disabled but no ?readonly', () => {
    const src = `<textarea ?disabled="\${this.disabled}"></textarea>`;
    expect(findNativeReadonlyGaps(src, 'civ-textarea')).toHaveLength(1);
  });

  it('skips <input type="checkbox"> — HTML has no readonly for it', () => {
    const src = `<input type="checkbox" ?disabled="\${this.disabled}" />`;
    expect(findNativeReadonlyGaps(src, 'civ-checkbox')).toHaveLength(0);
  });

  it('skips <input type="radio">', () => {
    const src = `<input type="radio" ?disabled="\${this.disabled}" />`;
    expect(findNativeReadonlyGaps(src, 'civ-radio')).toHaveLength(0);
  });

  it('skips <input type="file"> (the file-upload hidden input)', () => {
    const src = `<input type="file" ?disabled="\${this.disabled || this.readonly}" />`;
    expect(findNativeReadonlyGaps(src, 'civ-file-upload')).toHaveLength(0);
  });

  it('does NOT flag a native input without ?disabled', () => {
    const src = `<input type="text" .value="\${this._v}" />`;
    expect(findNativeReadonlyGaps(src, 'civ-x')).toHaveLength(0);
  });

  it('treats a dynamic type binding as text-like (still flagged)', () => {
    // Can't prove a `type="${this.type}"` isn't text — require readonly.
    const src = `<input type="\${this.type}" ?disabled="\${this.disabled}" />`;
    expect(findNativeReadonlyGaps(src, 'civ-text-input')).toHaveLength(1);
  });
});
