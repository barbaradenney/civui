import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-file-list.js';
import type { CivFileList } from './civ-file-list.js';

describe('civ-file-list', () => {
  afterEach(cleanupFixtures);

  it('renders nothing when files is empty', async () => {
    const el = await fixture<CivFileList>('<civ-file-list></civ-file-list>');
    expect(el.querySelector('ul')).toBeNull();
  });

  it('renders file names', async () => {
    const el = await fixture<CivFileList>('<civ-file-list></civ-file-list>') as CivFileList;
    el.files = [
      { name: 'doc.pdf', size: 1000 },
      { name: 'photo.jpg', size: 2000 },
    ];
    await elementUpdated(el);

    const items = el.querySelectorAll('.civ-file-item');
    expect(items.length).toBe(2);
  });

  it('renders download links when url is provided', async () => {
    const el = await fixture<CivFileList>('<civ-file-list></civ-file-list>') as CivFileList;
    el.files = [{ name: 'doc.pdf', size: 1000, url: '/files/doc.pdf' }];
    await elementUpdated(el);

    const link = el.querySelector('.civ-file-item a') as HTMLAnchorElement;
    expect(link).not.toBeNull();
    expect(link.href).toContain('/files/doc.pdf');
    expect(link.target).toBe('_blank');
  });

  it('renders plain text when no url', async () => {
    const el = await fixture<CivFileList>('<civ-file-list></civ-file-list>') as CivFileList;
    el.files = [{ name: 'doc.pdf', size: 1000 }];
    await elementUpdated(el);

    expect(el.querySelector('.civ-file-item a')).toBeNull();
    expect(el.querySelector('.civ-file-item .civ-font-bold')!.textContent).toBe('doc.pdf');
  });

  it('formats file size', async () => {
    const el = await fixture<CivFileList>('<civ-file-list></civ-file-list>') as CivFileList;
    el.files = [{ name: 'big.pdf', size: 2400000 }];
    await elementUpdated(el);

    const text = el.querySelector('.civ-file-item')!.textContent;
    expect(text).toContain('2.3 MB');
  });

  it('renders javascript: url as plain text, not a link (XSS prevention)', async () => {
    const el = await fixture<CivFileList>('<civ-file-list></civ-file-list>') as CivFileList;
    el.files = [{ name: 'evil.pdf', size: 1000, url: 'javascript:alert(1)' }];
    await elementUpdated(el);

    expect(el.querySelector('.civ-file-item a')).toBeNull();
    expect(el.querySelector('.civ-file-item .civ-font-bold')!.textContent).toBe('evil.pdf');
  });

  it('has role="list" on the <ul>', async () => {
    const el = await fixture<CivFileList>('<civ-file-list></civ-file-list>') as CivFileList;
    el.files = [{ name: 'doc.pdf', size: 1000 }];
    await elementUpdated(el);

    const ul = el.querySelector('ul');
    expect(ul!.getAttribute('role')).toBe('list');
  });

  it('renders download icon for each file item', async () => {
    const el = await fixture<CivFileList>('<civ-file-list></civ-file-list>') as CivFileList;
    el.files = [{ name: 'doc.pdf', size: 1000 }];
    await elementUpdated(el);

    const icon = el.querySelector('.civ-file-item civ-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('name')).toBe('download');
  });

  it('sets aria-label on the list', async () => {
    const el = await fixture<CivFileList>('<civ-file-list label="Uploaded documents"></civ-file-list>') as CivFileList;
    el.files = [{ name: 'doc.pdf', size: 1000 }];
    await elementUpdated(el);

    const ul = el.querySelector('ul');
    expect(ul!.getAttribute('aria-label')).toBe('Uploaded documents');
  });
});
