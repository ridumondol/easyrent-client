import Image from "next/image";
import { Heart, MapPin, Star } from "lucide-react";
import type { Equipment } from "@/data/marketplace";

type EquipmentCardProps = {
  item: Equipment;
  isFavorite: boolean;
  onToggleFavorite: (item: Equipment) => void;
  onViewDetails: (item: Equipment) => void;
};

export default function EquipmentCard({
  item,
  isFavorite,
  onToggleFavorite,
  onViewDetails,
}: EquipmentCardProps) {
  return (
    <article className="group overflow-hidden rounded-[20px] border border-[#e8ebe7] bg-white shadow-[0_3px_15px_rgba(27,45,34,0.035)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_38px_rgba(27,45,34,0.1)]">
      <div className="relative aspect-[1.42/1] overflow-hidden bg-[#edf0ec]">
        <Image
          alt={item.imageAlt}
          className="image-cover transition-transform duration-700 group-hover:scale-[1.04]"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
          src={item.image}
        />
        <span className="absolute left-3.5 top-3.5 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[10px] font-semibold text-[#385a40] shadow-sm backdrop-blur">
          {item.availability}
        </span>
        <button
          aria-label={
            isFavorite
              ? `Remove ${item.name} from saved equipment`
              : `Save ${item.name} to favorites`
          }
          aria-pressed={isFavorite}
          className="absolute right-3.5 top-3.5 grid size-9 place-items-center rounded-full bg-white/90 text-[#59675e] shadow-sm backdrop-blur transition-colors hover:text-[#f26a3d]"
          onClick={() => onToggleFavorite(item)}
          type="button"
        >
          <Heart
            size={17}
            fill={isFavorite ? "currentColor" : "none"}
            className={isFavorite ? "text-[#f26a3d]" : ""}
          />
        </button>
      </div>
      <div className="p-4 sm:p-[18px]">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-[#f3f5f2] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.07em] text-[#65736a]">
            {item.category}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#26352c]">
            <Star size={13} className="fill-[#f2a73b] text-[#f2a73b]" />
            {item.rating.toFixed(1)}
            <span className="font-normal text-[#909a92]">
              ({item.reviewCount})
            </span>
          </span>
        </div>
        <h3 className="mt-3 line-clamp-1 text-[15px] font-semibold tracking-[-0.02em] text-[#17271f]">
          {item.name}
        </h3>
        <p className="mt-1.5 flex items-center gap-1 text-xs text-[#818c84]">
          <MapPin size={13} aria-hidden="true" />
          {item.location}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-[#edf0ec] pt-3.5">
          <p className="text-[15px] font-semibold tracking-tight text-[#17271f]">
            ${item.dailyRate}
            <span className="ml-1 text-xs font-normal text-[#818c84]">
              / day
            </span>
          </p>
          <button
            className="rounded-full bg-[#f4f6f3] px-3.5 py-2 text-xs font-semibold text-[#31443a] transition-colors hover:bg-[#14251e] hover:text-white"
            onClick={() => onViewDetails(item)}
            type="button"
          >
            View details
          </button>
        </div>
      </div>
    </article>
  );
}
