import React, { useRef, useEffect, useState, useCallback } from 'react';

interface StoryEmbedProps {
  id: string;
  title?: string;
  minHeight?: number;
}

/** Breathing room above + below a centered modal when sizing the iframe to it. */
const DIALOG_MARGIN = 96;
/**
 * Upper bound on the iframe height. Bounds the dialog-driven resize: a
 * viewport-height panel (e.g. an open civ-drawer) is as tall as the iframe,
 * so sizing the iframe to "fit" it would grow the frame, which grows the
 * panel, ad infinitum. The cap makes that converge instead of running away.
 */
const MAX_EMBED_HEIGHT = 1200;

/**
 * Storybook iframe embed with automatic height sizing and lazy loading.
 *
 * - **Lazy loading**: Uses IntersectionObserver to defer iframe creation
 *   until the embed scrolls into view.
 *
 * - **Auto-resize**: Two strategies:
 *   1. Same-origin (prod): ResizeObserver on iframe's contentDocument body
 *   2. Cross-origin (dev): postMessage from Storybook iframe sends height
 *
 *   Both also account for an open top-layer `<dialog>` (civ-modal / drawer /
 *   action-sheet via `showModal()`). Such dialogs are out of normal flow, so
 *   they don't grow `scrollHeight` — without this, an opened modal would be
 *   clipped by the short, `overflow:hidden` iframe. A MutationObserver on the
 *   `open` attribute catches the open/close (a ResizeObserver alone won't fire,
 *   since the body's size is unchanged).
 *
 * - **Refresh-safe**: Checks if the iframe is already loaded on mount.
 */
export default function StoryEmbed({ id, title, minHeight = 100 }: StoryEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const mutationObserverRef = useRef<MutationObserver | null>(null);
  const [height, setHeight] = useState(minHeight);
  const [visible, setVisible] = useState(false);

  // Lazy load: only create iframe when scrolled into view
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px' },
    );

    io.observe(container);
    return () => io.disconnect();
  }, []);

  const setupResizeObserver = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc?.body) return;

      observerRef.current?.disconnect();
      mutationObserverRef.current?.disconnect();

      const syncHeight = () => {
        let contentHeight = Math.max(
          doc.body.scrollHeight,
          doc.documentElement.scrollHeight,
        );
        // A top-layer <dialog> (showModal) is out of flow and doesn't grow
        // scrollHeight — measure it so the iframe expands to show it. It's
        // position:fixed, so it re-centers in the taller frame.
        const openDialog = doc.querySelector('dialog[open]') as HTMLElement | null;
        if (openDialog) {
          contentHeight = Math.max(contentHeight, openDialog.scrollHeight + DIALOG_MARGIN);
        }
        const target = Math.min(Math.max(contentHeight, minHeight), MAX_EMBED_HEIGHT);
        setHeight(target + 2);
      };

      syncHeight();

      const ro = new ResizeObserver(syncHeight);
      ro.observe(doc.body);
      ro.observe(doc.documentElement);
      observerRef.current = ro;

      // ResizeObserver won't fire on showModal() (body size is unchanged), so
      // watch the `open` attribute across the subtree to catch modal/drawer
      // open + close. rAF re-measure lets the dialog finish laying out first.
      const mo = new MutationObserver(() => {
        syncHeight();
        requestAnimationFrame(syncHeight);
      });
      mo.observe(doc.documentElement, {
        attributes: true,
        attributeFilter: ['open'],
        subtree: true,
        childList: true,
      });
      mutationObserverRef.current = mo;
    } catch {
      // Cross-origin — postMessage fallback handles this
    }
  }, [minHeight]);

  const handleLoad = useCallback(() => {
    setupResizeObserver();
  }, [setupResizeObserver]);

  // Listen for postMessage from Storybook iframe (cross-origin resize)
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type !== 'civ-story-resize') return;
      const iframe = iframeRef.current;
      if (!iframe) return;
      // Match by checking the iframe's src contains the story id
      if (e.data.storyId === id) {
        const h = Math.min(Math.max(e.data.height, minHeight), MAX_EMBED_HEIGHT);
        setHeight(h + 2);
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [id, minHeight]);

  // Refresh-safe: check if iframe already loaded
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc?.readyState === 'complete' && doc?.body?.childElementCount > 0) {
        setupResizeObserver();
      }
    } catch {
      // Cross-origin — postMessage handles it
    }

    return () => {
      observerRef.current?.disconnect();
      mutationObserverRef.current?.disconnect();
    };
  }, [visible, setupResizeObserver]);

  const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const storybookBase = isDev ? 'http://localhost:6006' : '/civui/storybook';

  return (
    <div ref={containerRef} style={{ minHeight }}>
      {visible && (
        <iframe
          ref={iframeRef}
          src={`${storybookBase}/iframe.html?id=${id}&viewMode=story`}
          title={title || id}
          width="100%"
          height={height}
          scrolling="no"
          loading="lazy"
          onLoad={handleLoad}
          style={{
            border: '1px solid var(--ifm-toc-border-color, #dfe1e2)',
            borderRadius: '6px',
            overflow: 'hidden',
            background: 'var(--ifm-background-color, #fff)',
            colorScheme: 'normal',
          }}
        />
      )}
    </div>
  );
}
