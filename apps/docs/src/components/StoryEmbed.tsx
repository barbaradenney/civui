import React, { useRef, useEffect, useState } from 'react';

interface StoryEmbedProps {
  id: string;
  title?: string;
  minHeight?: number;
}

/**
 * Auto-resizing Storybook iframe embed.
 * Polls the iframe's content height and resizes to fit.
 */
export default function StoryEmbed({ id, title, minHeight = 100 }: StoryEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(minHeight);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let interval: ReturnType<typeof setInterval>;

    const handleLoad = () => {
      // Poll the iframe content height since cross-origin postMessage
      // isn't reliable with Storybook's iframe setup
      const resize = () => {
        try {
          const doc = iframe.contentDocument || iframe.contentWindow?.document;
          if (doc) {
            const body = doc.body;
            const html = doc.documentElement;
            if (body && html) {
              const contentHeight = Math.max(
                body.scrollHeight,
                body.offsetHeight,
                html.scrollHeight,
                html.offsetHeight
              );
              if (contentHeight > minHeight) {
                setHeight(contentHeight + 16); // 16px padding
              }
            }
          }
        } catch {
          // Cross-origin — fall back to a reasonable height
          // We can't read the content, so use MutationObserver via postMessage
        }
      };

      // Initial resize after render
      setTimeout(resize, 500);
      setTimeout(resize, 1500);
      setTimeout(resize, 3000);

      // Keep checking for dynamic content changes
      interval = setInterval(resize, 2000);
    };

    iframe.addEventListener('load', handleLoad);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      if (interval) clearInterval(interval);
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
        transition: 'height 0.2s ease',
      }}
    />
  );
}
