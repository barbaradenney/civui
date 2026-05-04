import React, { useRef, useEffect, useState, useCallback } from 'react';

interface StoryEmbedProps {
  id: string;
  title?: string;
  minHeight?: number;
}

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
 * - **Refresh-safe**: Checks if the iframe is already loaded on mount.
 */
export default function StoryEmbed({ id, title, minHeight = 100 }: StoryEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
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

      const syncHeight = () => {
        const contentHeight = Math.max(
          doc.body.scrollHeight,
          doc.documentElement.scrollHeight,
        );
        if (contentHeight > minHeight) {
          setHeight(contentHeight + 2);
        }
      };

      syncHeight();

      const ro = new ResizeObserver(syncHeight);
      ro.observe(doc.body);
      ro.observe(doc.documentElement);
      observerRef.current = ro;
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
      if (e.data.storyId === id && e.data.height > minHeight) {
        setHeight(e.data.height + 2);
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

    return () => observerRef.current?.disconnect();
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
