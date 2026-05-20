import type { Item } from "@/lib/types";
import PinnedItem from "./PinnedItem";

export default function Pinboard({ items }: { items: Item[] }) {
  return (
    <div className="mx-auto w-full max-w-[1800px] px-4 sm:px-6 columns-1 sm:columns-2 md:columns-3 lg:columns-5 xl:columns-6 2xl:columns-7 gap-6">
      {items.map((item) => (
        <PinnedItem key={item.id} item={item} />
      ))}
    </div>
  );
}
