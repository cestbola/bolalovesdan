import type { Item } from "@/lib/types";

export default function ItemContent({
  item,
  interactive = true,
}: {
  item: Item;
  interactive?: boolean;
}) {
  switch (item.type) {
    case "image":
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.src}
          alt={item.alt}
          draggable={false}
          className="block max-w-[260px] max-h-[260px] object-contain pointer-events-none shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
        />
      );
    case "text":
      return (
        <div
          className="max-w-[280px] px-4 py-3 text-neutral-100 leading-tight whitespace-pre-wrap"
          style={{ fontFamily: "var(--font-hand), cursive", fontSize: "1.75rem" }}
        >
          {item.content}
        </div>
      );
    case "link": {
      const inner = (
        <>
          <div className="font-medium underline underline-offset-4 decoration-neutral-500">
            {item.title || item.url}
          </div>
          <div className="text-xs text-neutral-400 truncate mt-1">{item.url}</div>
        </>
      );
      if (interactive) {
        return (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block max-w-[260px] bg-neutral-900/80 backdrop-blur-sm px-4 py-3 text-sm text-neutral-100 ring-1 ring-white/15 shadow-[0_6px_20px_rgb(0,0,0,0.5)] hover:bg-neutral-800 transition-colors"
          >
            {inner}
          </a>
        );
      }
      return (
        <div className="inline-block max-w-[260px] bg-neutral-900/80 backdrop-blur-sm px-4 py-3 text-sm text-neutral-100 ring-1 ring-white/15 shadow-[0_6px_20px_rgb(0,0,0,0.5)]">
          {inner}
        </div>
      );
    }
    case "video":
      return (
        <video
          src={item.src}
          controls={interactive}
          playsInline
          className="block max-w-[320px] max-h-[320px] shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
        />
      );
  }
}
