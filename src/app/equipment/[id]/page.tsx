"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, Heart, MapPin, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import PublicPageFrame from "@/components/PublicPageFrame";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiRequest, getErrorMessage } from "@/lib/api";
import { getEquipmentImageSrc } from "@/lib/images";
import Breadcrumb from "@/components/Breadcrumb";

type EquipmentDetails = {
  _id: string;
  title: string;
  description: string;
  category: string;
  pricePerDay: number;
  rentalType: "daily" | "weekly" | "monthly";
  location: string;
  image: string;
  quantity: number;
  condition: string;
  availability: boolean;
  brand?: string;
  model?: string;
  rentalTerms?: string;
  owner?: { _id?: string; name?: string; createdAt?: string };
};

export default function EquipmentDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, token } = useAuth();
  const [equipment, setEquipment] = useState<EquipmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorite, setFavorite] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [notes, setNotes] = useState("");
  const bookingTriggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [availabilityNote, setAvailabilityNote] = useState("");
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  useEffect(() => {
    if (!bookingOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelector<HTMLElement>("button, input, textarea, select, [href]");
    focusable?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setBookingOpen(false);
        requestAnimationFrame(() => (bookingTriggerRef.current ?? previouslyFocused)?.focus());
      }
      if (event.key === "Tab" && dialog) {
        const elements = Array.from(dialog.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [href]"));
        if (!elements.length) return;
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [bookingOpen]);

  useEffect(() => {
    let active = true;
    apiRequest<{ equipment: EquipmentDetails }>(`/equipment/${params.id}`)
      .then(({ equipment: result }) => { if (active) setEquipment(result); })
      .catch((requestError: unknown) => { if (active) setError(getErrorMessage(requestError)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [params.id]);

  useEffect(() => {
    let active = true;
    if (!token || user?.role !== "renter") {
      return () => { active = false; };
    }
    apiRequest<{ favorites: { equipmentId: string }[] }>("/favorites", { token })
      .then(({ favorites: saved }) => {
        if (active) setFavorite(saved.some((item) => String(item.equipmentId) === params.id));
      })
      .catch((requestError: unknown) => {
        if (active) toast.error(getErrorMessage(requestError));
      });
    return () => { active = false; };
  }, [params.id, token, user?.role]);

  const isFavorite = Boolean(user?.role === "renter" && favorite);

  async function toggleFavorite() {
    if (!user || !token) {
      router.push("/login");
      return;
    }
    if (user.role !== "renter") {
      toast.error("Favorites are available to customer accounts.");
      return;
    }
    try {
      await apiRequest(`/favorites/${params.id}`, { method: favorite ? "DELETE" : "POST", token });
      setFavorite((current) => !current);
      toast.success(favorite ? "Removed from favorites" : "Added to favorites");
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    }
  }

  function closeBooking() {
    setBookingOpen(false);
    requestAnimationFrame(() => bookingTriggerRef.current?.focus());
  }

  useEffect(() => {
    if (!bookingOpen || !equipment || !startDate || !endDate || endDate < startDate) {
      return;
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setCheckingAvailability(true);
      setAvailabilityNote("");
      apiRequest<{ isAvailable: boolean; availableQuantity: number; stock: number }>(
        `/bookings/availability?equipmentId=${params.id}&startDate=${startDate}&endDate=${endDate}&quantity=${quantity}`,
        { signal: controller.signal },
      )
        .then((result) => {
          setAvailabilityNote(
            result.isAvailable
              ? `Available: ${result.availableQuantity} unit(s) can be booked for these dates.`
              : `Unavailable: only ${result.availableQuantity} of ${result.stock} unit(s) are available.`,
          );
        })
        .catch((requestError: unknown) => {
          if (!controller.signal.aborted) setAvailabilityNote(getErrorMessage(requestError));
        })
        .finally(() => {
          if (!controller.signal.aborted) setCheckingAvailability(false);
        });
    }, 250);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [bookingOpen, endDate, equipment, params.id, quantity, startDate]);

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBookingError("");
    const today = new Date().toISOString().slice(0, 10);
    const errors: Record<string, string> = {};
    if (!startDate || startDate < today) errors.startDate = "Choose a start date from today onward.";
    if (!endDate) errors.endDate = "Choose an end date.";
    if (startDate && endDate && endDate < startDate) errors.endDate = "End date cannot be before the start date.";
    if (quantity < 1 || quantity > (equipment?.quantity ?? 1)) errors.quantity = `Choose between 1 and ${equipment?.quantity ?? 1} units.`;
    if (!phone.trim()) errors.phone = "Enter a contact number.";
    if (!address.trim()) errors.address = "Enter a delivery address.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setBookingError("Please correct the highlighted fields before continuing.");
      return;
    }
    if (!user || !token) {
      router.push("/login");
      return;
    }
    if (user.role !== "renter") {
      toast.error("Only customers can book equipment.");
      return;
    }
    setSubmitting(true);
    try {
      const { booking } = await apiRequest<{ booking: { _id: string } }>("/bookings", {
        method: "POST",
        token,
        body: { equipmentId: params.id, startDate, endDate, quantity, phone, address, notes },
      });
      const checkout = await apiRequest<{ checkoutUrl: string }>("/payments/checkout", {
        method: "POST",
        token,
        body: { bookingId: booking._id },
      });
      window.location.assign(checkout.checkoutUrl);
    } catch (requestError) {
      setBookingError(getErrorMessage(requestError));
      toast.error("We couldn’t start checkout. Your booking, if created, is available in My bookings.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PublicPageFrame>
      <section className="section-wrap py-10 sm:py-14">
        {equipment && !loading && !error && (
          <Breadcrumb items={[
            { label: "Home", href: "/" },
            { label: "All Equipment", href: "/equipment" },
            { label: equipment.title },
          ]} />
        )}
        <Link className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#68756d] hover:text-[#14251e]" href="/equipment"><ArrowLeft size={16} /> All equipment</Link>
        {loading ? <div className="grid animate-pulse gap-8 lg:grid-cols-2"><div className="aspect-[1.2/1] rounded-3xl bg-[#e8ebe7]" /><div className="h-96 rounded-3xl bg-white" /></div> : error || !equipment ? (
          <div className="rounded-2xl border border-[#f2d5cb] bg-white p-8 text-center"><h1 className="text-xl font-semibold text-[#17271f]">Equipment unavailable</h1><p className="mt-2 text-sm text-[#77827a]">{error || "This listing could not be found."}</p><Link className="mt-5 inline-block text-sm font-semibold text-[#e9673e]" href="/equipment">Browse listings</Link></div>
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="overflow-hidden rounded-3xl bg-[#edf0ec]">
              <div className="relative aspect-[1.2/1]"><Image alt={equipment.title} className="object-cover" fill priority sizes="(max-width: 1024px) 100vw, 60vw" src={getEquipmentImageSrc(equipment.image)} /></div>
              <div className="grid gap-4 p-5 sm:grid-cols-3">
                <div><p className="text-[10px] font-bold uppercase tracking-wider text-[#879188]">Condition</p><p className="mt-1 text-sm font-medium capitalize text-[#26352c]">{equipment.condition}</p></div>
                <div><p className="text-[10px] font-bold uppercase tracking-wider text-[#879188]">Availability</p><p className="mt-1 text-sm font-medium text-[#26352c]">{equipment.availability ? `${equipment.quantity} available` : "Currently unavailable"}</p></div>
                <div><p className="text-[10px] font-bold uppercase tracking-wider text-[#879188]">Equipment</p><p className="mt-1 text-sm font-medium text-[#26352c]">{[equipment.brand, equipment.model].filter(Boolean).join(" ") || equipment.category}</p></div>
              </div>
            </div>
            <article className="rounded-3xl border border-[#e8ebe7] bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center justify-between gap-3"><span className="rounded-full bg-[#f3f5f2] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#65736a]">{equipment.category} · {equipment.rentalType}</span><button aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"} className="grid size-10 place-items-center rounded-full border border-[#e2e7e2] text-[#e9673e]" onClick={() => void toggleFavorite()} type="button"><Heart fill={isFavorite ? "currentColor" : "none"} size={18} /></button></div>
              <h1 className="mt-5 text-3xl font-semibold tracking-[-0.045em] text-[#17271f] sm:text-4xl">{equipment.title}</h1>
              <p className="mt-3 flex items-center gap-1.5 text-sm text-[#77827a]"><MapPin size={15} />{equipment.location}</p>
              <p className="mt-6 whitespace-pre-line text-sm leading-7 text-[#68756d]">{equipment.description}</p>
              {equipment.owner && <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[#f7f8f6] p-4"><span className="grid size-10 place-items-center rounded-full bg-[#eaf0eb] font-semibold text-[#31513c]">{equipment.owner.name?.slice(0, 1).toUpperCase() ?? "O"}</span><div><p className="text-xs text-[#879188]">Listed by</p><p className="text-sm font-semibold text-[#26352c]">{equipment.owner.name ?? "Local equipment owner"}</p></div><ShieldCheck className="ml-auto text-[#4c7856]" size={18} /></div>}
              {!user && <div className="mt-6 rounded-xl border border-[#f2d5cb] bg-[#fff7f4] p-4 text-sm leading-6 text-[#713a2c]">Sign in is needed before booking. <Link className="font-bold underline" href={`/login?next=/equipment/${equipment._id}&reason=equipment`}>Sign in to continue</Link>.</div>}
              {equipment.rentalTerms && <div className="mt-6 border-t border-[#edf0ec] pt-5"><h2 className="text-sm font-semibold text-[#26352c]">Rental terms</h2><p className="mt-2 whitespace-pre-line text-base leading-7 text-[#77827a]">{equipment.rentalTerms}</p></div>}
              <div className="mt-6 flex items-end justify-between border-t border-[#edf0ec] pt-5"><p className="text-2xl font-semibold text-[#17271f]">${equipment.pricePerDay}<span className="ml-1 text-sm font-normal text-[#77827a]">/ {equipment.rentalType}</span></p><button ref={bookingTriggerRef} className="min-h-12 rounded-full bg-[#f26a3d] px-6 py-3 text-sm font-semibold text-white hover:bg-[#df5832] disabled:opacity-50" disabled={!equipment.availability} onClick={() => { setBookingOpen(true); if (user?.phone && !phone) setPhone(user.phone); if (user?.address && !address) setAddress(user.address); }} type="button">{equipment.availability ? "Book now" : "Unavailable"}</button></div>
            </article>
          </div>
        )}
      </section>
      {bookingOpen && equipment && (
        <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-[#101d17]/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) closeBooking(); }}>
          <section
            ref={dialogRef}
            aria-labelledby="book-equipment-title"
            aria-modal="true"
            className="my-auto w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
            role="dialog"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#ed7049]">Secure rental</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#17271f]" id="book-equipment-title">
                  Book this equipment
                </h2>
              </div>
              <button
                aria-label="Close booking dialog"
                className="text-2xl text-[#77827a] hover:text-[#17271f]"
                onClick={closeBooking}
                type="button"
              >
                ×
              </button>
            </div>

            {!user ? (
              <div className="mt-5 rounded-xl bg-[#f7f8f6] p-4 text-sm text-[#536159]">
                Please <Link className="font-semibold text-[#e9673e]" href="/login">sign in</Link> as a customer to book.
              </div>
            ) : user.role !== "renter" ? (
              <p className="mt-5 text-sm text-[#a14630]">Bookings are available to customer accounts.</p>
            ) : (
              <form className="mt-5 space-y-4" onSubmit={submitBooking}>
                {bookingError && <div className="rounded-xl border border-[#f2d5cb] bg-[#fff7f4] px-4 py-3 text-sm text-[#713a2c]" role="alert">{bookingError}</div>}
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-semibold text-[#34483b]">
                    Start date
                    <input
                      className="mt-1.5 block w-full rounded-xl border border-[#dfe5df] px-3 py-2.5 text-sm outline-none focus:border-emerald-700"
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(event) => setStartDate(event.target.value)}
                      required
                      type="date"
                      value={startDate}
                    />
                  </label>
                  <label className="text-xs font-semibold text-[#34483b]">
                    End date
                    <input
                      className="mt-1.5 block w-full rounded-xl border border-[#dfe5df] px-3 py-2.5 text-sm outline-none focus:border-emerald-700"
                      min={startDate || new Date().toISOString().slice(0, 10)}
                      onChange={(event) => setEndDate(event.target.value)}
                      required
                      type="date"
                      value={endDate}
                    />
                  </label>
                </div>

                {(availabilityNote || checkingAvailability) && (
                  <p aria-live="polite" className={`rounded-xl border px-4 py-3 text-sm ${availabilityNote.toLowerCase().includes("unavailable") ? "border-[#f2d5cb] bg-[#fff7f4] text-[#713a2c]" : "border-[#b9dcc2] bg-[#e9f5ec] text-[#24673a]"}`}>
                    {checkingAvailability ? "Checking availability…" : availabilityNote}
                  </p>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <span className="text-sm font-semibold text-[#34483b]">Quantity</span>
                    <div className="mt-1.5 flex min-h-12 items-center overflow-hidden rounded-xl border border-[#dfe5df]">
                      <button aria-label="Decrease quantity" className="grid size-12 shrink-0 place-items-center border-r border-[#dfe5df] text-lg" disabled={quantity <= 1} onClick={() => setQuantity((current) => Math.max(1, current - 1))} type="button">−</button>
                      <output aria-live="polite" className="flex-1 text-center text-base font-semibold">{quantity}</output>
                      <button aria-label="Increase quantity" className="grid size-12 shrink-0 place-items-center border-l border-[#dfe5df] text-lg" disabled={quantity >= equipment.quantity} onClick={() => setQuantity((current) => Math.min(equipment.quantity, current + 1))} type="button">+</button>
                    </div>
                    <p className="mt-1 text-xs text-[#77827a]">Maximum available: {equipment.quantity}</p>
                    {fieldErrors.quantity && <p className="mt-1 text-xs text-[#9f3d2b]">{fieldErrors.quantity}</p>}
                  </div>
                  <label className="text-xs font-semibold text-[#34483b]">
                    Contact number
                    <input
                      autoComplete="tel"
                      className="mt-1.5 block min-h-12 w-full rounded-xl border border-[#dfe5df] px-3 py-2.5 text-base outline-none focus:border-emerald-700"
                      onChange={(event) => setPhone(event.target.value)}
                      required
                      type="tel"
                      value={phone}
                    />
                    {fieldErrors.phone && <span className="mt-1 block text-xs text-[#9f3d2b]">{fieldErrors.phone}</span>}
                  </label>
                </div>

                <label className="block text-xs font-semibold text-[#34483b]">
                  Delivery address
                  <input
                    autoComplete="street-address"
                    className="mt-1.5 block min-h-12 w-full rounded-xl border border-[#dfe5df] px-3 py-2.5 text-base outline-none focus:border-emerald-700"
                    onChange={(event) => setAddress(event.target.value)}
                    required
                    value={address}
                  />
                  {fieldErrors.address && <span className="mt-1 block text-xs text-[#9f3d2b]">{fieldErrors.address}</span>}
                </label>

                <label className="block text-xs font-semibold text-[#34483b]">
                  Additional notes
                  <textarea
                    className="mt-1.5 block min-h-20 w-full rounded-xl border border-[#dfe5df] px-3 py-2.5 text-sm outline-none focus:border-emerald-700"
                    onChange={(event) => setNotes(event.target.value)}
                    value={notes}
                  />
                </label>

                {startDate && endDate && new Date(endDate) > new Date(startDate) && (
                  <div className="rounded-xl bg-[#f7f8f6] p-3.5 text-xs text-[#34483b] space-y-1.5 border border-[#edf0ec]">
                    <div className="flex justify-between">
                      <span className="text-[#647168]">
                        ${equipment.pricePerDay}/day × {Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))} days × {quantity} {quantity > 1 ? "units" : "unit"}:
                      </span>
                      <span className="font-semibold text-[#17271f]">
                        ${(Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))) * equipment.pricePerDay * quantity).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-[#e2e7e2] pt-1 text-sm font-bold text-[#14251e]">
                      <span>Estimated total:</span>
                      <span>${(Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))) * equipment.pricePerDay * quantity).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {bookingError && <p className="text-xs text-[#a14630]" role="alert">{bookingError}</p>}
                <p className="text-xs text-[#77827a]">
                  Your rental total is calculated and billed via Stripe’s secure test checkout.
                </p>
                <button
                  className="w-full rounded-full bg-[#14251e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#263b31] disabled:opacity-50"
                  disabled={submitting}
                  type="submit"
                >
                  {submitting ? "Preparing secure checkout…" : "Continue to payment"}
                </button>
              </form>
            )}
          </section>
        </div>
      )}
    </PublicPageFrame>
  );
}
