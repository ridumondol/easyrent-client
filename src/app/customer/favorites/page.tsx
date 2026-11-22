"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Heart, MapPin, Star, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { EmptyState, ErrorState, PageIntro } from "@/components/dashboard/DashboardUI";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiRequest, getErrorMessage, type Equipment } from "@/lib/api";
import { getEquipmentImageSrc } from "@/lib/images";

type FavoriteRecord = {
  _id: string;
  equipmentId: string;
  equipment?: Equipment;
};

export default function CustomerFavoritesPage() {
  const { token } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFavorites = useCallback(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    apiRequest<{ favorites: FavoriteRecord[] }>("/favorites", { token })
      .then((res) => {
        setFavorites(Array.isArray(res?.favorites) ? res.favorites : []);
      })
      .catch((err: unknown) => {
        setError(getErrorMessage(err));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    let active = true;
    if (!token) {
      return;
    }
    apiRequest<{ favorites: FavoriteRecord[] }>("/favorites", { token })
      .then((res) => {
        if (active) setFavorites(Array.isArray(res?.favorites) ? res.favorites : []);
      })
      .catch((err: unknown) => {
        if (active) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  async function handleRemove(equipmentId: string, title: string) {
    if (!token) return;
    try {
      await apiRequest(`/favorites/${equipmentId}`, {
        method: "DELETE",
        token,
      });
      setFavorites((prev) =>
        prev.filter(
          (fav) =>
            String(fav.equipmentId) !== String(equipmentId) &&
            fav.equipment?._id !== equipmentId,
        ),
      );
      toast.success(`Removed ${title} from saved gear`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  }

  const validItems = favorites.filter((fav): fav is FavoriteRecord & { equipment: Equipment } =>
    Boolean(fav.equipment && fav.equipment._id),
  );

  return (
    <>
      <PageIntro
        eyebrow="Saved equipment"
        title="Favorites"
        description="Keep the equipment you're considering close at hand for upcoming projects."
        action={
          <Link
            className="inline-flex items-center gap-2 self-start rounded-full bg-[#14251e] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#263b31] sm:self-auto"
            href="/equipment"
          >
            Explore marketplace <ArrowRight size={14} />
          </Link>
        }
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div className="h-64 animate-pulse rounded-2xl bg-white" key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadFavorites} />
      ) : validItems.length === 0 ? (
        <EmptyState
          action={
            <Link
              className="inline-flex items-center gap-2 rounded-full bg-[#14251e] px-4 py-2.5 text-xs font-semibold text-white"
              href="/equipment"
            >
              Browse marketplace <ArrowRight size={14} />
            </Link>
          }
          description="You haven't saved any equipment yet. Explore the marketplace and tap the heart icon on any listing to keep it here."
          icon={Heart}
          title="No saved equipment"
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {validItems.map(({ equipment: item }) => (
            <article
              className="group overflow-hidden rounded-2xl border border-[#e8ebe7] bg-white p-4 shadow-[0_4px_20px_rgba(27,45,34,0.025)] transition hover:shadow-md"
              key={item._id}
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[#edf0ec]">
                <Image
                  alt={item.title}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  fill
                  sizes="(max-width: 640px) 100vw, 360px"
                  src={getEquipmentImageSrc(item.image)}
                />
                <button
                  aria-label={`Remove ${item.title} from favorites`}
                  className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-white/90 text-[#f26a3d] shadow-sm backdrop-blur transition hover:bg-white"
                  onClick={() => void handleRemove(item._id, item.title)}
                  type="button"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="pt-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded-full bg-[#f3f5f2] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#65736a]">
                    {item.category}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#26352c]">
                    <Star className="fill-[#f2a73b] text-[#f2a73b]" size={13} />
                    5.0
                  </span>
                </div>

                <h3 className="mt-2 line-clamp-1 font-semibold tracking-tight text-[#17271f]">
                  {item.title}
                </h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-[#818c84]">
                  <MapPin size={13} /> {item.location}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-[#edf0ec] pt-3">
                  <p className="text-sm font-semibold text-[#17271f]">
                    ${item.pricePerDay}
                    <span className="ml-1 text-xs font-normal text-[#818c84]">/ day</span>
                  </p>
                  <Link
                    className="rounded-full bg-[#14251e] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#263b31]"
                    href={`/equipment/${item._id}`}
                  >
                    View details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
