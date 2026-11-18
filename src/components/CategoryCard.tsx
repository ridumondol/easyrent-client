import Image from "next/image";
import Link from "next/link";
import type { EquipmentCategory } from "@/data/marketplace";

type CategoryCardProps = {
  category: EquipmentCategory;
  onSelect: (name: string) => void;
};

export default function CategoryCard({
  category,
  onSelect,
}: CategoryCardProps) {
  const Icon = category.icon;

  return (
    <Link
      className="group relative isolate flex min-h-[178px] overflow-hidden rounded-2xl bg-[#34483d] p-5 text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      href="#featured"
      onClick={() => onSelect(category.name)}
    >
      <Image
        alt={category.imageAlt}
        className="image-cover -z-20 transition-transform duration-700 group-hover:scale-105"
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
        src={category.image}
      />
      <span className="absolute inset-0 -z-10 bg-gradient-to-t from-[#101d17]/90 via-[#14251e]/25 to-[#14251e]/10" />
      <div className="mt-auto flex w-full items-end justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">{category.name}</p>
          <p className="mt-1 text-xs text-white/75">{category.count}</p>
        </div>
        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/25 bg-white/10 backdrop-blur-sm transition-colors group-hover:bg-[#f26a3d]">
          <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
