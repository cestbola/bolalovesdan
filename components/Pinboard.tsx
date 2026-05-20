"use client";

import { useEffect, useState } from "react";
import type { Item } from "@/lib/types";
import PinnedItem from "./PinnedItem";

const BREAKPOINTS: ReadonlyArray<{ min: number; cols: number }> = [
  { min: 1536, cols: 7 },
  { min: 1280, cols: 6 },
  { min: 1024, cols: 5 },
  { min: 768, cols: 3 },
  { min: 640, cols: 2 },
  { min: 0, cols: 2 },
];

function colsForWidth(w: number) {
  return BREAKPOINTS.find((b) => w >= b.min)?.cols ?? 2;
}

export default function Pinboard({ items }: { items: Item[] }) {
  const [cols, setCols] = useState<number>(2);

  useEffect(() => {
    const update = () => setCols(colsForWidth(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const columns: Item[][] = Array.from({ length: cols }, () => []);
  items.forEach((item, i) => columns[i % cols].push(item));

  return (
    <div className="mx-auto w-full max-w-[1800px] px-4 sm:px-6 flex items-start gap-6">
      {columns.map((col, i) => (
        <div key={i} className="flex-1 min-w-0 flex flex-col gap-6">
          {col.map((item) => (
            <PinnedItem key={item.id} item={item} />
          ))}
        </div>
      ))}
    </div>
  );
}
