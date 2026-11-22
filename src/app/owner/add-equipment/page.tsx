"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  DollarSign,
  FileText,
  Image as ImageIcon,
  MapPin,
  Plus,
  ShieldCheck,
  Tag,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { PageIntro } from "@/components/dashboard/DashboardUI";
import { apiRequest, getErrorMessage, type Equipment } from "@/lib/api";
import { getEquipmentImageSrc } from "@/lib/images";

const categories = [
  "construction",
  "photography",
  "vehicles",
  "agriculture",
  "electronics",
  "party",
  "tools",
  "sports",
  "camping",
  "music",
  "other",
];

const rentalTypes = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const conditions = [
  { value: "new", label: "New (Mint condition)" },
  { value: "like-new", label: "Like New (Barely used)" },
  { value: "good", label: "Good (Fully functional, minor cosmetic wear)" },
  { value: "fair", label: "Fair (Shows normal wear, works as expected)" },
  { value: "worn", label: "Worn (Heavy usage, functional)" },
];

export default function AddEquipmentPage() {
  const { user, token } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("construction");
  const [location, setLocation] = useState(user?.address || "");
  const [pricePerDay, setPricePerDay] = useState<number | "">("");
  const [rentalType, setRentalType] = useState<"daily" | "weekly" | "monthly">("daily");
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState("good");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [image, setImage] = useState("");
  const [rentalTerms, setRentalTerms] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      toast.error("Please sign in as an owner to list equipment.");
      return;
    }
    if (!title.trim() || !description.trim() || !location.trim() || !image.trim() || !pricePerDay) {
      setError("Please fill in all required fields including image URL and daily price.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await apiRequest<{ equipment: Equipment }>("/equipment", {
        method: "POST",
        token,
        body: {
          title: title.trim(),
          description: description.trim(),
          category,
          location: location.trim(),
          pricePerDay: Number(pricePerDay),
          rentalType,
          quantity: Number(quantity),
          condition,
          brand: brand.trim() || undefined,
          model: model.trim() || undefined,
          image: image.trim(),
          rentalTerms: rentalTerms.trim() || undefined,
        },
      });

      toast.success("Equipment listing submitted for admin approval!");
      router.push("/owner/equipment");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      toast.error(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageIntro
        eyebrow="Inventory Management"
        title="Add New Equipment"
        description="List your gear for rent on the Rentora marketplace. Listings are reviewed by administrators before becoming visible to renters."
      />

      <div className="grid gap-6 lg:grid-cols-3 max-w-5xl">
        {/* Main Form (2 cols) */}
        <section className="lg:col-span-2 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 1. Identification */}
            <div>
              <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-2.5 mb-4 flex items-center gap-2">
                <Tag size={16} className="text-emerald-800" /> Equipment Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="eq-title" className="block text-xs font-semibold text-neutral-700 mb-1">
                    Equipment Title / Name *
                  </label>
                  <input
                    id="eq-title"
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/10"
                    minLength={3}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Caterpillar Mini Excavator 301.7 CR"
                    required
                    value={title}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="eq-category" className="block text-xs font-semibold text-neutral-700 mb-1">
                      Category *
                    </label>
                    <select
                      id="eq-category"
                      className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/10 capitalize"
                      onChange={(e) => setCategory(e.target.value)}
                      value={category}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="eq-condition" className="block text-xs font-semibold text-neutral-700 mb-1">
                      Condition *
                    </label>
                    <select
                      id="eq-condition"
                      className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/10"
                      onChange={(e) => setCondition(e.target.value)}
                      value={condition}
                    >
                      {conditions.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="eq-brand" className="block text-xs font-semibold text-neutral-700 mb-1">
                      Brand / Manufacturer (optional)
                    </label>
                    <input
                      id="eq-brand"
                      className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/10"
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. Caterpillar, Sony, DeWalt"
                      value={brand}
                    />
                  </div>
                  <div>
                    <label htmlFor="eq-model" className="block text-xs font-semibold text-neutral-700 mb-1">
                      Model / Series (optional)
                    </label>
                    <input
                      id="eq-model"
                      className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/10"
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="e.g. 301.7 CR, FX3, DWE7485"
                      value={model}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Pricing & Logistics */}
            <div>
              <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-2.5 mb-4 flex items-center gap-2">
                <DollarSign size={16} className="text-emerald-800" /> Pricing & Availability
              </h3>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="eq-price" className="block text-xs font-semibold text-neutral-700 mb-1">
                      Rental Price ($ USD) *
                    </label>
                    <input
                      id="eq-price"
                      className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/10"
                      min="0.01"
                      onChange={(e) => setPricePerDay(e.target.value ? Number(e.target.value) : "")}
                      placeholder="e.g. 150.00"
                      required
                      step="0.01"
                      type="number"
                      value={pricePerDay}
                    />
                  </div>
                  <div>
                    <label htmlFor="eq-rental-type" className="block text-xs font-semibold text-neutral-700 mb-1">
                      Billing Type *
                    </label>
                    <select
                      id="eq-rental-type"
                      className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/10"
                      onChange={(e) => setRentalType(e.target.value as "daily" | "weekly" | "monthly")}
                      value={rentalType}
                    >
                      {rentalTypes.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label} Rate
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="eq-quantity" className="block text-xs font-semibold text-neutral-700 mb-1">
                      Available Quantity *
                    </label>
                    <input
                      id="eq-quantity"
                      className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/10"
                      min="1"
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      required
                      type="number"
                      value={quantity}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="eq-location" className="block text-xs font-semibold text-neutral-700 mb-1">
                    Pick-up & Return Location *
                  </label>
                  <input
                    id="eq-location"
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/10"
                    minLength={2}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Austin, TX (Warehouse District, Bay 4)"
                    required
                    value={location}
                  />
                </div>
              </div>
            </div>

            {/* 3. Image Link & Upload */}
            <div>
              <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-2.5 mb-4 flex items-center gap-2">
                <ImageIcon size={16} className="text-emerald-800" /> Equipment Photo
              </h3>
              <div>
                <label htmlFor="eq-image" className="block text-xs font-semibold text-neutral-700 mb-1">
                  Equipment Image URL (ImgBB, Unsplash, or Direct Image URL) *
                </label>
                <input
                  id="eq-image"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/10"
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://i.ibb.co/... or https://images.unsplash.com/..."
                  required
                  type="url"
                  value={image}
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  You can upload your photos to <a href="https://imgbb.com" target="_blank" rel="noreferrer" className="text-emerald-700 font-semibold underline">imgbb.com</a> and paste the direct image link here.
                </p>
              </div>
            </div>

            {/* 4. Description & Terms */}
            <div>
              <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-2.5 mb-4 flex items-center gap-2">
                <FileText size={16} className="text-emerald-800" /> Description & Terms
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="eq-desc" className="block text-xs font-semibold text-neutral-700 mb-1">
                    Equipment Description *
                  </label>
                  <textarea
                    id="eq-desc"
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/10 resize-y min-h-24"
                    minLength={10}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide full specifications, operating details, inclusions (cables, blades, trailer, etc.)."
                    required
                    value={description}
                  />
                </div>

                <div>
                  <label htmlFor="eq-terms" className="block text-xs font-semibold text-neutral-700 mb-1">
                    Rental Terms & Conditions (optional)
                  </label>
                  <textarea
                    id="eq-terms"
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/10 resize-y min-h-20"
                    onChange={(e) => setRentalTerms(e.target.value)}
                    placeholder="e.g. Security deposit requirements, operating license needed, clean return policy."
                    value={rentalTerms}
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700" role="alert">
                {error}
              </p>
            )}

            <div className="flex justify-end pt-2">
              <button
                className="inline-flex items-center gap-2 rounded-full bg-emerald-800 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 disabled:opacity-50"
                disabled={submitting}
                type="submit"
              >
                <Plus size={16} /> {submitting ? "Submitting Listing…" : "Publish Equipment Listing"}
              </button>
            </div>
          </form>
        </section>

        {/* Right Column: Listing Preview & Owner Summary */}
        <div className="space-y-6">
          {/* Card Preview */}
          <section className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">
              Live Listing Preview
            </h4>
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-[#edf0ec]">
              <div className="relative aspect-[1.3/1] bg-neutral-200">
                {image ? (
                  <Image
                    alt={title || "Preview"}
                    className="object-cover"
                    fill
                    sizes="350px"
                    src={getEquipmentImageSrc(image)}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-neutral-400">
                    <ImageIcon size={32} />
                    <span className="text-xs mt-1">Image Preview</span>
                  </div>
                )}
                <span className="absolute left-2.5 top-2.5 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur-xs">
                  Pending Review
                </span>
              </div>
              <div className="p-4 bg-white">
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-800 capitalize border border-emerald-200/50">
                  {category} · {rentalType}
                </span>
                <h4 className="mt-2 text-sm font-bold text-neutral-900 line-clamp-1">
                  {title || "Untitled Equipment"}
                </h4>
                <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
                  <MapPin size={12} /> {location || "Location not set"}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-2.5">
                  <p className="text-sm font-bold text-emerald-900">
                    ${pricePerDay ? Number(pricePerDay).toFixed(2) : "0.00"}{" "}
                    <span className="text-xs font-normal text-neutral-500">/{rentalType}</span>
                  </p>
                  <span className="text-xs text-neutral-400">{quantity} in stock</span>
                </div>
              </div>
            </div>
          </section>

          {/* Owner Identity block */}
          <section className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm text-xs space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-neutral-400">
              Listing Owner
            </h4>
            <div className="flex items-center gap-3 border-b border-neutral-100 pb-3">
              <div className="grid size-9 place-items-center rounded-full bg-emerald-100 font-bold text-emerald-800">
                {user?.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-neutral-900 truncate">{user?.name}</p>
                <p className="text-neutral-500 truncate">{user?.email}</p>
              </div>
              <ShieldCheck className="text-emerald-700" size={16} />
            </div>
            <div className="flex items-center justify-between text-neutral-600">
              <span>Approval policy:</span>
              <span className="font-medium text-amber-700">Requires Admin Approval</span>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
