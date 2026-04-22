import React, { useRef, useEffect, useState } from 'react';

interface StoryEmbedProps {
  id: string;
  title?: string;
  minHeight?: number;
}

/**
 * Storybook iframe embed.
 *
 * Measures content height once after the iframe loads and sets the
 * height. No polling — single measurement after a render delay.
 */
export default function StoryEmbed({ id, title, minHeight = 100 }: StoryEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(minHeight);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let timer: ReturnType<typeof setTimeout>;

    const measure = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc?.body) {
          const contentHeight = Math.max(
            doc.body.scrollHeight,
            doc.documentElement.scrollHeight
          );
          if (contentHeight > minHeight) {
            setHeight(contentHeight + 16);
          }
        }
      } catch {
        // Cross-origin — keep minHeight
      }
    };

    const handleLoad = () => {
      // Single measurement after Storybook renders
      timer = setTimeout(measure, 600);
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
