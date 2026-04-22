import React, { useRef, useEffect, useState } from 'react';

interface StoryEmbedProps {
  id: string;
  title?: string;
  minHeight?: number;
}

/**
 * Storybook iframe embed.
 *
 * Measures content height twice after iframe load — once early for
 * fast-rendering stories, once later for slower ones. Two measurements
 * max, no continuous polling.
 */
export default function StoryEmbed({ id, title, minHeight = 100 }: StoryEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(minHeight);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let timer1: ReturnType<typeof setTimeout>;
    let timer2: ReturnType<typeof setTimeout>;

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
      // First measurement — catches fast-rendering stories
      timer1 = setTimeout(measure, 300);
      // Second measurement — catches stories that need more render time
      timer2 = setTimeout(measure, 1500);
    };

    iframe.addEventListener('load', handleLoad);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      clearTimeout(timer1);
      clearTimeout(timer2);
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
