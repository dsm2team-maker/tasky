"use client";

import { useRef, useEffect, useState, ReactNode, UIEvent } from "react";

export default function ScrollSyncTable({
  children,
  className = "",
  minWidth,
}: {
  children: ReactNode;
  className?: string;
  minWidth: number;
}) {
  const topRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const check = () => setOverflowing(el.scrollWidth > el.clientWidth + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const sync = (src: "top" | "body") => (e: UIEvent<HTMLDivElement>) => {
    const from = e.currentTarget;
    const to = src === "top" ? bodyRef.current : topRef.current;
    if (to && to.scrollLeft !== from.scrollLeft) to.scrollLeft = from.scrollLeft;
  };

  return (
    <div className={className}>
      {overflowing && (
        <div
          ref={topRef}
          onScroll={sync("top")}
          className="overflow-x-auto border-b border-gray-700"
          aria-hidden="true"
        >
          <div style={{ width: minWidth, height: 1 }} />
        </div>
      )}
      <div ref={bodyRef} onScroll={sync("body")} className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
}
