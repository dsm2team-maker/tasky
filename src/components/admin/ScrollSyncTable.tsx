"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  PointerEvent as ReactPointerEvent,
} from "react";

export default function ScrollSyncTable({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState({ leftPct: 0, widthPct: 100 });
  const [needsScroll, setNeedsScroll] = useState(false);

  const measure = useCallback(() => {
    const el = bodyRef.current;
    if (!el) return;
    const { scrollWidth, clientWidth, scrollLeft } = el;
    const overflow = scrollWidth > clientWidth + 1;
    setNeedsScroll(overflow);
    if (!overflow) return;
    const widthPct = (clientWidth / scrollWidth) * 100;
    const maxScroll = scrollWidth - clientWidth;
    const leftPct = maxScroll > 0 ? (scrollLeft / maxScroll) * (100 - widthPct) : 0;
    setThumb({ leftPct, widthPct });
  }, []);

  useEffect(() => {
    measure();
    const el = bodyRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const scrollToClientX = (clientX: number) => {
    const track = trackRef.current;
    const el = bodyRef.current;
    if (!track || !el) return;
    const rect = track.getBoundingClientRect();
    const thumbWidthPx = (rect.width * thumb.widthPct) / 100;
    const usable = rect.width - thumbWidthPx;
    const x = Math.min(Math.max(clientX - rect.left - thumbWidthPx / 2, 0), usable);
    const ratio = usable > 0 ? x / usable : 0;
    el.scrollLeft = ratio * (el.scrollWidth - el.clientWidth);
  };

  const onThumbPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = bodyRef.current;
    const track = trackRef.current;
    if (!el || !track) return;
    const startX = e.clientX;
    const startScrollLeft = el.scrollLeft;
    const trackWidth = track.getBoundingClientRect().width;
    const thumbTrackWidth = trackWidth * (1 - thumb.widthPct / 100);
    const scrollableWidth = el.scrollWidth - el.clientWidth;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const deltaScroll = thumbTrackWidth > 0 ? (dx / thumbTrackWidth) * scrollableWidth : 0;
      el.scrollLeft = startScrollLeft + deltaScroll;
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div className={className}>
      {needsScroll && (
        <div className="px-4 pt-3 pb-2 border-b border-gray-700">
          <div
            ref={trackRef}
            onClick={(e) => scrollToClientX(e.clientX)}
            className="relative h-2 rounded-full bg-gray-900 cursor-pointer"
          >
            <div
              onPointerDown={onThumbPointerDown}
              className="absolute top-0 h-2 rounded-full bg-gray-500 hover:bg-gray-400 active:bg-gray-300 cursor-grab active:cursor-grabbing transition-colors touch-none"
              style={{ left: `${thumb.leftPct}%`, width: `${thumb.widthPct}%` }}
            />
          </div>
        </div>
      )}
      <div ref={bodyRef} onScroll={measure} className="scroll-x-visible overflow-x-auto">
        {children}
      </div>
    </div>
  );
}
