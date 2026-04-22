import React, { useRef, useEffect, useState, useCallback } from 'react';

interface StoryEmbedProps {
  id: string;
  title?: string;
  minHeight?: number;
}

/**
 * Storybook iframe embed with automatic height sizing.
 *
 * Uses ResizeObserver on the iframe's contentDocument body (same-origin)
 * to reactively match the iframe height to its content. No polling,
 * no timeouts — catches async web component renders, dynamic content
 * changes, and font loading layout shifts.
 */
export default function StoryEmbed({ id, title, minHeight = 100 }: StoryEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const [height, setHeight] = useState(minHeight);

  const handleLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc?.body) return;

      // Clean up previous observer
      observerRef.current?.disconnect();

      const ro = new ResizeObserver(() => {
        const contentHeight = Math.max(
          doc.body.scrollHeight,
          doc.documentElement.scrollHeight
        );
        if (contentHeight > minHeight) {
          setHeight(contentHeight + 2);
        }
      });

      ro.observe(doc.body);
      ro.observe(doc.documentElement);
      observerRef.current = ro;
    } catch {
      // Cross-origin fallback — keep minHeight
    }
  }, [minHeight]);

  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <iframe
      ref={iframeRef}
      src={`/civui/storybook/iframe.html?id=${id}&viewMode=story`}
      title={title || id}
      width="100%"
      height={height}
      scrolling="no"
      onLoad={handleLoad}
      style={{
        border: '1px solid #dfe1e2',
        borderRadius: '6px',
        overflow: 'hidden',
      }}
    />
  );
}
