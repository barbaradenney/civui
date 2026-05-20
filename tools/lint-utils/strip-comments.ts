/**
 * Replace the inside of every `/* ... *\/` block comment AND every
 * `//` line comment with spaces, preserving newlines so line numbers
 * stay aligned with the original source.
 *
 * Used by line-by-line lint scanners (hardcoded-tokens,
 * readonly-cascade, combobox-no-autocomplete) to avoid matching on
 * prose inside JSDoc / design-decision comments. The classic false
 * positive is a comment like "stacking ancestor, and z-index: 1 on
 * :focus" being flagged as a hardcoded z-index value.
 *
 * The CSS variant (`ext === '.css'`) does NOT strip `//` line
 * comments because CSS treats `//` literally (e.g. inside
 * `url(//cdn.example.com/img.png)`). Block comments are the only
 * comment form in CSS.
 *
 * The TS variant (`ext === '.ts'`) strips both forms and tracks
 * string-literal boundaries (single, double, and backtick) so a
 * `// not a comment` inside a template literal is preserved.
 */
export function stripComments(src: string, ext: '.ts' | '.css'): string {
  let out = '';
  let i = 0;
  let inBlock = false;
  let inLine = false;
  let inStr: string | null = null;
  while (i < src.length) {
    const ch = src[i];
    const next = src[i + 1];
    if (inBlock) {
      if (ch === '*' && next === '/') {
        out += '  ';
        i += 2;
        inBlock = false;
        continue;
      }
      out += ch === '\n' ? '\n' : ' ';
      i++;
      continue;
    }
    if (inLine) {
      if (ch === '\n') {
        out += '\n';
        inLine = false;
      } else {
        out += ' ';
      }
      i++;
      continue;
    }
    if (inStr) {
      out += ch;
      if (ch === '\\' && next !== undefined) {
        out += next;
        i += 2;
        continue;
      }
      if (ch === inStr) inStr = null;
      i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      out += '  ';
      i += 2;
      inBlock = true;
      continue;
    }
    if (ext === '.ts' && ch === '/' && next === '/') {
      out += '  ';
      i += 2;
      inLine = true;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inStr = ch;
      out += ch;
      i++;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}
