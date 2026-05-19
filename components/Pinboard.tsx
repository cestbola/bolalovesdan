import type { Item } from "@/lib/types";
import PinnedItem from "./PinnedItem";

export default function Pinboard({ items }: { items: Item[] }) {
  return (
    <div className="absolute inset-0">
      {items.map((item) => (
        <PinnedItem key={item.id} item={item} />
      ))}
    </div>
  );
}
