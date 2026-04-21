import React, { useRef, useEffect, useState } from 'react';

interface StoryEmbedProps {
  id: string;
  title?: string;
  minHeight?: number;
}

/**
 * Auto-resizing Storybook iframe embed.
 * Measures content height after load and stops once stable.
 */
export default function StoryEmbed({ id, title, minHeight = 100 }: StoryEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(minHeight);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let lastHeight = 0;
    let stableCount = 0;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;

    const measure = () => {
      attempts++;
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc?.body) {
          const contentHeight = Math.max(
            doc.body.scrollHeight,
            doc.documentElement.scrollHeight
          );
          if (contentHeight > minHeight) {
            if (contentHeight === lastHeight) {
              stableCount++;
            } else {
              stableCount = 0;
              lastHeight = contentHeight;
              setHeight(contentHeight + 16);
            }
          }
        }
      } catch {
        // Cross-origin — can't measure, keep minHeight
      }

      // Stop once height is stable for 3 checks or after 10 attempts
      if (stableCount < 3 && attempts < 10) {
        timer = setTimeout(measure, 500);
      }
    };

    const handleLoad = () => {
      // Start measuring after a short delay for rendering
      timer = setTimeout(measure, 300);
    };

    iframe.addEventListener('load', handleLoad);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      clearTimeout(timer);
    };
  }, [id, minHeight]);

  return (
    <iframe
      ref={iframeRef}
      src={`/civui/storybook/iframe.html?id=${id}&viewMode=story`}
      title={title || id}
      width="100%"
      height={height}
      style={{
        border: '1px solid #dfe1e2',
        borderRadius: '6px',
        overflow: 'hidden',
      }}
    />
  );
}
