import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-action-button.js';

afterEach(cleanupFixtures);

describe('civ-action-button', () => {
  it('renders a button with label', async () => {
    const el = await fixture('<civ-action-button label="Bold"></civ-action-button>');
    const btn = el.querySelector('button');
    expect(btn).not.toBeNull();
    expect(btn!.textContent).toBe('Bold');
  });

  it('defaults to tertiary variant', async () => {
    const el = await fixture('<civ-action-button label="Test"></civ-action-button>');
    const btn = el.querySelector('button');
    expect(btn!.classList.contains('civ-action-btn--tertiary')).toBe(true);
  });

  it('applies primary variant class', async () => {
    const el = await fixture('<civ-action-button label="Save" emphasis="primary"></civ-action-button>');
    const btn = el.querySelector('button');
    expect(btn!.classList.contains('civ-action-btn--primary')).toBe(true);
  });

  it('applies secondary variant class', async () => {
    const el = await fixture('<civ-action-button label="Info" emphasis="secondary"></civ-action-button>');
    const btn = el.querySelector('button');
    expect(btn!.classList.contains('civ-action-btn--secondary')).toBe(true);
  });

  it('sets aria-pressed when pressed', async () => {
    const el = await fixture('<civ-action-button label="Bold" pressed></civ-action-button>');
    const btn = el.querySelector('button');
    expect(btn!.getAttribute('aria-pressed')).toBe('true');
  });

  it('omits aria-pressed when not used as a toggle', async () => {
    const el = await fixture('<civ-action-button label="Bold"></civ-action-button>');
    const btn = el.querySelector('button');
    expect(btn!.hasAttribute('aria-pressed')).toBe(false);
  });

  it('disables the button', async () => {
    const el = await fixture('<civ-action-button label="Test" disabled></civ-action-button>');
    const btn = el.querySelector('button');
    expect(btn!.disabled).toBe(true);
  });

  it('renders a real <button> so the global focus ring applies', async () => {
    const el = await fixture('<civ-action-button label="Test"></civ-action-button>');
    const btn = el.querySelector('button')!;
    expect(btn.tagName).toBe('BUTTON');
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-action-button label="Test"></civ-action-button>');
    expect(el.shadowRoot).toBeNull();
  });

  it('renders icon-start when set', async () => {
    const el = await fixture('<civ-action-button label="Edit" icon-start="edit"></civ-action-button>');
    const icon = el.querySelector('civ-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('name')).toBe('edit');
  });

  it('renders icon-end when set', async () => {
    const el = await fixture('<civ-action-button label="More" icon-end="chevron-down"></civ-action-button>');
    const icon = el.querySelector('civ-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('name')).toBe('chevron-down');
  });

  // Note: each variant asserts the emphasis class AND the danger class
  // separately so Tailwind's content scanner sees both literal strings.
  // The danger CSS lives at the `.civ-action-btn--{emphasis}.civ-action-btn--danger`
  // compound selector; Tailwind needs to see both halves preserved so it
  // doesn't purge either rule. See tailwind.config.ts for the full
  // explanation.
  it('applies the primary + danger variant classes', async () => {
    const el = await fixture('<civ-action-button label="Delete" danger emphasis="primary"></civ-action-button>');
    const btn = el.querySelector('button');
    expect(btn!.className).toContain('civ-action-btn--primary');
    expect(btn!.className).toContain('civ-action-btn--danger');
  });

  it('applies the secondary + danger variant classes', async () => {
    const el = await fixture('<civ-action-button label="Remove" danger emphasis="secondary"></civ-action-button>');
    const btn = el.querySelector('button');
    expect(btn!.className).toContain('civ-action-btn--secondary');
    expect(btn!.className).toContain('civ-action-btn--danger');
  });

  it('applies the tertiary + danger variant classes', async () => {
    const el = await fixture('<civ-action-button label="Cancel" danger emphasis="tertiary"></civ-action-button>');
    const btn = el.querySelector('button');
    expect(btn!.className).toContain('civ-action-btn--tertiary');
    expect(btn!.className).toContain('civ-action-btn--danger');
  });

  it('sets type attribute on button', async () => {
    const el = await fixture('<civ-action-button label="Submit" type="submit"></civ-action-button>');
    const btn = el.querySelector('button');
    expect(btn!.getAttribute('type')).toBe('submit');
  });

  it('defaults button type to "button"', async () => {
    const el = await fixture('<civ-action-button label="Test"></civ-action-button>');
    const btn = el.querySelector('button');
    expect(btn!.getAttribute('type')).toBe('button');
  });

  it('fires civ-analytics event on click', async () => {
    const el = await fixture('<civ-action-button label="Bold"></civ-action-button>');
    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const btn = el.querySelector('button')!;
    btn.click();

    expect(handler).toHaveBeenCalledOnce();
  });

  it('does not fire civ-analytics when disabled', async () => {
    const el = await fixture('<civ-action-button label="Bold" disabled></civ-action-button>');
    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const btn = el.querySelector('button')!;
    btn.click();

    expect(handler).not.toHaveBeenCalled();
  });

  it('omits civ-action-btn--sm at default spacing', async () => {
    const el = await fixture('<civ-action-button label="Edit"></civ-action-button>');
    const btn = el.querySelector('button');
    expect(btn!.classList.contains('civ-action-btn--sm')).toBe(false);
  });

  it('applies civ-action-btn--sm when spacing="sm"', async () => {
    const el = await fixture('<civ-action-button label="Edit" spacing="sm"></civ-action-button>');
    const btn = el.querySelector('button');
    expect(btn!.classList.contains('civ-action-btn--sm')).toBe(true);
  });

  it('updates aria-pressed when pressed changes dynamically', async () => {
    const el = await fixture('<civ-action-button label="Bold"></civ-action-button>') as any;
    const btn = el.querySelector('button')!;
    expect(btn.hasAttribute('aria-pressed')).toBe(false);

    el.pressed = true;
    await elementUpdated(el);
    expect(btn.getAttribute('aria-pressed')).toBe('true');
  });
});

describe('CivActionButton icon-only mode', () => {
  it('wraps the label in .civ-sr-only when icon-only is set', async () => {
    const el = await fixture('<civ-action-button icon-only icon-start="more-vert" label="Row actions"></civ-action-button>');
    const btn = el.querySelector('button') as HTMLButtonElement;
    const sr = btn.querySelector('.civ-sr-only') as HTMLElement;
    expect(sr).not.toBeNull();
    expect(sr.textContent?.trim()).toBe('Row actions');
  });

  it('keeps the icon visible in icon-only mode', async () => {
    const el = await fixture('<civ-action-button icon-only icon-start="more-vert" label="More"></civ-action-button>');
    const icon = el.querySelector('civ-icon');
    expect(icon).not.toBeNull();
    expect(icon?.getAttribute('name')).toBe('more-vert');
  });

  it('applies the civ-action-btn--icon-only class', async () => {
    const el = await fixture('<civ-action-button icon-only icon-start="more-vert" label="Close"></civ-action-button>');
    const btn = el.querySelector('button.civ-action-btn--icon-only');
    expect(btn).not.toBeNull();
  });

  it('reflects the icon-only attribute to the host', async () => {
    const el = await fixture('<civ-action-button icon-only icon-start="more-vert" label="More"></civ-action-button>') as any;
    expect(el.hasAttribute('icon-only')).toBe(true);
  });
});

describe('CivActionButton loading state', () => {
  it('renders a civ-spinner in place of the leading icon when loading', async () => {
    const el = await fixture('<civ-action-button loading icon-start="check" label="Apply"></civ-action-button>');
    expect(el.querySelector('civ-spinner')).not.toBeNull();
    expect(el.querySelector('civ-icon[name="check"]')).toBeNull();
  });

  it('the inner spinner is decorative', async () => {
    const el = await fixture('<civ-action-button loading label="Apply"></civ-action-button>');
    const spinner = el.querySelector('civ-spinner') as HTMLElement;
    expect(spinner.hasAttribute('decorative')).toBe(true);
  });

  it('disables the underlying button while loading', async () => {
    const el = await fixture('<civ-action-button loading label="Apply"></civ-action-button>');
    expect(el.querySelector('button')!.disabled).toBe(true);
  });

  it('sets aria-busy on the button while loading', async () => {
    const el = await fixture('<civ-action-button loading label="Apply"></civ-action-button>');
    expect(el.querySelector('button')!.getAttribute('aria-busy')).toBe('true');
  });

  it('does NOT set aria-busy when not loading', async () => {
    const el = await fixture('<civ-action-button label="Apply"></civ-action-button>');
    expect(el.querySelector('button')!.hasAttribute('aria-busy')).toBe(false);
  });

  it('swaps the accessible name to loadingLabel while loading', async () => {
    const el = await fixture(
      '<civ-action-button loading loading-label="Applying filter…" label="Apply"></civ-action-button>',
    );
    expect(el.querySelector('button')!.getAttribute('aria-label')).toBe('Applying filter…');
  });

  it('falls back to the locale buttonLoadingLabel when loadingLabel is empty', async () => {
    const el = await fixture('<civ-action-button loading label="Apply"></civ-action-button>');
    expect(el.querySelector('button')!.getAttribute('aria-label')).toBe('Loading…');
  });

  it('removes aria-busy and aria-label when loading flips back to false', async () => {
    const el = await fixture(
      '<civ-action-button loading loading-label="Applying…" label="Apply"></civ-action-button>',
    ) as any;
    expect(el.querySelector('button')!.getAttribute('aria-busy')).toBe('true');
    el.loading = false;
    await elementUpdated(el);
    expect(el.querySelector('button')!.hasAttribute('aria-busy')).toBe(false);
    expect(el.querySelector('button')!.hasAttribute('aria-label')).toBe(false);
  });

  it('does not fire click handlers while loading', async () => {
    const el = await fixture('<civ-action-button loading label="Apply"></civ-action-button>');
    const handler = vi.fn();
    el.addEventListener('click', handler);
    el.querySelector('button')!.click();
    // disabled buttons swallow clicks at the DOM level
    expect(handler).not.toHaveBeenCalled();
  });

  it('link-mode ignores loading (navigation is not a state we wait on)', async () => {
    const el = await fixture('<civ-action-button loading href="/x" label="Edit"></civ-action-button>') as any;
    // No spinner because link mode suppresses isLoading
    expect(el.querySelector('civ-spinner')).toBeNull();
    expect(el.querySelector('a')).not.toBeNull();
  });

  it('link-mode carries aria-current and aria-label (anchor pagination)', async () => {
    const el = await fixture(
      '<civ-action-button href="/page/3" label="3" current aria-label="Page 3"></civ-action-button>',
    );
    const a = el.querySelector('a')!;
    expect(a.getAttribute('aria-current')).toBe('page');
    expect(a.getAttribute('aria-label')).toBe('Page 3');
  });

  it('link-mode omits aria-current when not current', async () => {
    const el = await fixture('<civ-action-button href="/page/4" label="4"></civ-action-button>');
    expect(el.querySelector('a')!.hasAttribute('aria-current')).toBe(false);
  });
});

describe('CivActionButton aria-label semantics', () => {
  it('honors a consumer-supplied aria-label when not loading', async () => {
    const el = await fixture(
      '<civ-action-button aria-label="Archive 3 selected rows" label="Archive"></civ-action-button>',
    );
    expect(el.querySelector('button')!.getAttribute('aria-label')).toBe('Archive 3 selected rows');
  });

  it('empty aria-label="" falls through to "no override" — the visible label becomes the accessible name (prevents ARIA-invalid empty aria-label from stripping the name)', async () => {
    const el = await fixture('<civ-action-button aria-label="" label="Save"></civ-action-button>');
    // The button should NOT carry an empty aria-label attribute that
    // strips its accessible name; the visible label "Save" is the name.
    expect(el.querySelector('button')!.hasAttribute('aria-label')).toBe(false);
  });

  it('loading-label takes precedence over consumer aria-label while loading', async () => {
    const el = await fixture(
      '<civ-action-button loading loading-label="Archiving…" aria-label="Archive 3 rows" label="Archive"></civ-action-button>',
    );
    expect(el.querySelector('button')!.getAttribute('aria-label')).toBe('Archiving…');
  });

  it('restores consumer aria-label when loading flips back off', async () => {
    const el = await fixture(
      '<civ-action-button loading loading-label="Archiving…" aria-label="Archive 3 rows" label="Archive"></civ-action-button>',
    ) as any;
    el.loading = false;
    await elementUpdated(el);
    expect(el.querySelector('button')!.getAttribute('aria-label')).toBe('Archive 3 rows');
  });
});

describe('CivActionButton pressed="false" HTML boolean trap', () => {
  it('dev-warns when the literal string "false" is set on the pressed attribute', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await fixture('<civ-action-button pressed="false" label="Mute"></civ-action-button>');
    const warnCalls = warnSpy.mock.calls.map((c) => c.join(' '));
    expect(warnCalls.some((m) => /pressed=\"false\".*truthy|HTML boolean attribute trap/i.test(m))).toBe(true);
    warnSpy.mockRestore();
  });
});
