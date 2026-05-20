import type { Item } from "@/lib/types";
import ItemContent from "./ItemContent";

export default function PinnedItem({ item }: { item: Item }) {
  return (
    <div
      data-item-id={item.id}
      data-item-type={item.type}
      className="flex justify-center select-none"
      style={{
        transform: `rotate(${item.rotation}deg) scale(${item.scale})`,
        transformOrigin: "center center",
      }}
    >
      <ItemContent item={item} />
    </div>
  );
}
