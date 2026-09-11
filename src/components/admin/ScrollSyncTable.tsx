"use client";

import { useRef, ReactNode, UIEvent } from "react";

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

  const sync = (src: "top" | "body") => (e: UIEvent<HTMLDivElement>) => {
    const from = e.currentTarget;
    const to = src === "top" ? bodyRef.current : topRef.current;
    if (to && to.scrollLeft !== from.scrollLeft) to.scrollLeft = from.scrollLeft;
  };

  return (
    <div className={className}>
      <div
        ref={topRef}
        onScroll={sync("top")}
        className="scroll-x-visible overflow-x-auto overflow-y-hidden border-b border-gray-700"
        style={{ height: 14 }}
        aria-hidden="true"
      >
        <div style={{ width: minWidth, height: 1 }} />
      </div>
      <div
        ref={bodyRef}
        onScroll={sync("body")}
        className="scroll-x-visible overflow-x-auto"
      >
        {children}
      </div>
    </div>
  );
}
