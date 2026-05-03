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
 *   until the embed scrolls into view. Pages with many story embeds
 *   no longer load all iframes upfront.
 *
 * - **Auto-resize**: Uses ResizeObserver on the iframe's contentDocument
 *   body (same-origin) to reactively match the iframe height to its
 *   content. No polling, no timeouts.
 *
 * - **Refresh-safe**: Checks if the iframe is already loaded on mount
 *   (handles the case where the iframe loads before React hydrates).
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
      { rootMargin: '200px' }, // start loading 200px before visible
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

      // Clean up previous observer
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

      // Initial sync
      syncHeight();

      const ro = new ResizeObserver(syncHeight);
      ro.observe(doc.body);
      ro.observe(doc.documentElement);
      observerRef.current = ro;
    } catch {
      // Cross-origin fallback — keep minHeight
    }
  }, [minHeight]);

  const handleLoad = useCallback(() => {
    setupResizeObserver();
  }, [setupResizeObserver]);

  // Refresh-safe: if iframe loaded before React hydrated, onLoad won't fire.
  // Check on mount + when iframe ref changes.
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Check if already loaded (readyState or body exists)
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc?.readyState === 'complete' && doc?.body?.childElementCount > 0) {
        setupResizeObserver();
      }
    } catch {
      // Cross-origin — ignore
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
            border: '1px solid #dfe1e2',
            borderRadius: '6px',
            overflow: 'hidden',
          }}
        />
      )}
    </div>
  );
}
