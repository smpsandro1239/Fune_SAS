'use client';

import React, { useEffect, useRef, useState } from 'react';

const CANVAS_W = 520;
const CANVAS_H = 760;

interface FlyerScaledViewProps {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  className?: string;
}

export default function FlyerScaledView({
  children,
  minScale = 0.2,
  maxScale = 1,
  className = '',
}: FlyerScaledViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      setScale(Math.min(maxScale, Math.max(minScale, width / CANVAS_W)));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [minScale, maxScale]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`} style={{ height: CANVAS_H * scale }}>
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{ width: CANVAS_W, height: CANVAS_H, transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
