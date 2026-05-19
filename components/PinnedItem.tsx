import type { Item } from "@/lib/types";
import ItemContent from "./ItemContent";

export default function PinnedItem({ item }: { item: Item }) {
  const style: React.CSSProperties = {
    position: "absolute",
    left: `${item.x}%`,
    top: `${item.y}%`,
    transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${item.scale})`,
    transformOrigin: "center center",
  };

  return (
    <div
      data-item-id={item.id}
      data-item-type={item.type}
      style={style}
      className="select-none"
    >
      <ItemContent item={item} />
    </div>
  );
}
