"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, SlidersHorizontal } from "lucide-react";
import PublicPageFrame from "@/components/PublicPageFrame";
import { LoadingState, ErrorState } from "@/components/dashboard/DashboardUI";
import { apiRequest, getErrorMessage } from "@/lib/api";
import { getEquipmentImageSrc } from "@/lib/images";
import { useAuth } from "@/components/auth/AuthProvider";
import Breadcrumb from "@/components/Breadcrumb";

type ListedEquipment = {
  _id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  location: string;
  pricePerDay: number;
  rentalType: "daily" | "weekly" | "monthly";
  quantity: number;
  availability: boolean;
};

type EquipmentResponse = {
  equipment: ListedEquipment[];
  pagination: { currentPage: number; totalPages: number; totalItems: number };
};

const categories = [
  "construction",
  "photography",
  "vehicles",
  "agriculture",
  "electronics",
  "events",
  "tools",
  "camping",
  "music",
  "sports",
];

export default function EquipmentPage() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<ListedEquipment[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [rentalType, setRentalType] = useState("");
  const [availability, setAvailability] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function restoreUrlState() {
      const params = new URLSearchParams(window.location.search);
      setSearch(params.get("search") ?? "");
      setCategory(params.get("category") ?? "");
      setRentalType(params.get("rentalType") ?? "");
      setAvailability(params.get("availability") ?? "");
      setMinPrice(params.get("minPrice") ?? "");
      setMaxPrice(params.get("maxPrice") ?? "");
      setSort(params.get("sort") ?? "newest");
      setQuery(params.toString());
      setPage(Number(params.get("page") ?? "1"));
    }
    restoreUrlState();
    window.addEventListener("popstate", restoreUrlState);
    return () => window.removeEventListener("popstate", restoreUrlState);
  }, []);

  useEffect(() => {
    if (!mobileFiltersOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileFiltersOpen(false);
        requestAnimationFrame(() => filterTriggerRef.current?.focus());
      }
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileFiltersOpen]);

  useEffect(() => {
    const controller = new AbortController();
    apiRequest<EquipmentResponse>(`/equipment?${query}`, { signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return;
        setItems(result.equipment);
        setPage(result.pagination.currentPage);
        setPages(Math.max(result.pagination.totalPages, 1));
        setTotal(result.pagination.totalItems);
        setError("");
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return;
        setError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [query, retry]);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: "1", limit: "12", sort });
    if (search.trim()) params.set("search", search.trim());
    if (category) params.set("category", category);
    if (rentalType) params.set("rentalType", rentalType);
    if (availability) params.set("availability", availability);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    const nextQuery = params.toString();
    setQuery(nextQuery);
    window.history.pushState({}, "", `/equipment${nextQuery ? `?${nextQuery}` : ""}`);
    setMobileFiltersOpen(false);
  }

  function goToPage(nextPage: number) {
    setLoading(true);
    setError("");
    const params = new URLSearchParams(query);
    params.set("page", String(nextPage));
    const nextQuery = params.toString();
    setQuery(nextQuery);
    window.history.pushState({}, "", `/equipment?${nextQuery}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearFilters() {
    const params = new URLSearchParams({ page: "1", limit: "12", sort: "newest" });
    setSearch("");
    setCategory("");
    setRentalType("");
    setAvailability("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setLoading(true);
    setError("");
    setQuery(params.toString());
    window.history.pushState({}, "", "/equipment");
  }

  const activeFilters = [
    search.trim() ? { key: "search", label: `Search: ${search.trim()}` } : null,
    category ? { key: "category", label: `Category: ${category}` } : null,
    rentalType ? { key: "rentalType", label: `Rental: ${rentalType}` } : null,
    availability ? { key: "availability", label: availability === "true" ? "Available" : "Unavailable" } : null,
    minPrice ? { key: "minPrice", label: `Min: $${minPrice}` } : null,
    maxPrice ? { key: "maxPrice", label: `Max: $${maxPrice}` } : null,
  ].filter((filter): filter is { key: string; label: string } => Boolean(filter));

  function retryEquipmentRequest() {
    setLoading(true);
    setError("");
    setRetry((current) => current + 1);
  }

  return (
    <PublicPageFrame>
      <section className="section-wrap py-12 sm:py-16">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "All Equipment" }]} />
        <div className="mb-9 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ed7049]">The rental collection</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em] text-[#17271f] sm:text-5xl">Good gear, ready when you are.</h1>
          <p className="mt-4 text-sm leading-6 text-[#77827a]">Explore approved equipment from local owners. Find a fit by category, rental period, availability, and price.</p>
        </div>

        <div className="mb-4 flex items-center justify-between md:hidden">
          <button ref={filterTriggerRef} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#dfe5df] bg-white px-4 text-sm font-semibold text-[#26352c]" onClick={() => setMobileFiltersOpen(true)} type="button">
            <SlidersHorizontal size={17} /> Filters
          </button>
          <button className="min-h-11 text-sm font-semibold text-[#a93f23]" onClick={clearFilters} type="button">Clear all</button>
        </div>
        <form className="mb-4 hidden gap-3 rounded-2xl border border-[#e8ebe7] bg-white p-4 shadow-sm md:grid md:grid-cols-4 xl:grid-cols-7" onSubmit={applyFilters}>
          <label className="relative md:col-span-2 xl:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold text-[#34483b]">Search name or location</span>
            <Search aria-hidden="true" className="absolute left-3.5 top-[42px] -translate-y-1/2 text-[#89938c]" size={17} />
            <input className="w-full rounded-xl border border-[#dfe5df] bg-transparent py-3 pl-10 pr-10 text-base text-[#26352c] outline-none focus:border-[#718b78]" onChange={(event) => setSearch(event.target.value)} placeholder="Search equipment or location" value={search} />
            {search && <button aria-label="Clear search" className="absolute right-2 top-[29px] grid size-9 place-items-center rounded-full text-[#68756d]" onClick={() => setSearch("")} type="button">×</button>}
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-semibold text-[#34483b]">Category</span>
            <select className="w-full rounded-xl border border-[#e2e7e2] bg-white px-3 py-3 text-sm text-[#536159]" onChange={(event) => setCategory(event.target.value)} value={category}>
              <option value="">All categories</option>
              {categories.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-semibold text-[#34483b]">Rental period</span>
            <select className="w-full rounded-xl border border-[#e2e7e2] bg-white px-3 py-3 text-sm text-[#536159]" onChange={(event) => setRentalType(event.target.value)} value={rentalType}>
              <option value="">Any rental period</option>
              <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-semibold text-[#34483b]">Availability</span>
            <select className="w-full rounded-xl border border-[#e2e7e2] bg-white px-3 py-3 text-sm text-[#536159]" onChange={(event) => setAvailability(event.target.value)} value={availability}>
              <option value="">Any availability</option><option value="true">Available</option><option value="false">Unavailable</option>
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-semibold text-[#34483b]">Sort results</span>
            <select className="w-full rounded-xl border border-[#e2e7e2] bg-white px-3 py-3 text-sm text-[#536159]" onChange={(event) => setSort(event.target.value)} value={sort}>
              <option value="newest">Recently added</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option>
            </select>
          </label>
          <fieldset className="xl:col-span-1">
            <legend className="mb-1.5 text-xs font-semibold text-[#34483b]">Price range</legend>
            <div className="flex gap-2">
              <label className="min-w-0 w-1/2"><span className="sr-only">Minimum price</span><input className="w-full rounded-xl border border-[#e2e7e2] px-3 py-3 text-base" min="0" onChange={(event) => setMinPrice(event.target.value)} placeholder="Min $" type="number" value={minPrice} /></label>
              <label className="min-w-0 w-1/2"><span className="sr-only">Maximum price</span><input className="w-full rounded-xl border border-[#e2e7e2] px-3 py-3 text-base" min="0" onChange={(event) => setMaxPrice(event.target.value)} placeholder="Max $" type="number" value={maxPrice} /></label>
            </div>
          </fieldset>
          <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#14251e] px-4 py-3 text-sm font-semibold text-white hover:bg-[#263b31] md:col-span-3 xl:col-span-6" type="submit"><SlidersHorizontal size={16} /> Apply filters</button>
          <button className="min-h-11 rounded-xl border border-[#dfe5df] px-3 text-sm font-semibold text-[#536159]" onClick={clearFilters} type="button">Clear</button>
        </form>

        {activeFilters.length > 0 && (
          <div aria-label="Active filters" className="mb-6 flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <button
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#dfe5df] bg-white px-3 text-sm text-[#536159]"
                key={filter.key}
                onClick={() => {
                  if (filter.key === "search") setSearch("");
                  if (filter.key === "category") setCategory("");
                  if (filter.key === "rentalType") setRentalType("");
                  if (filter.key === "availability") setAvailability("");
                  if (filter.key === "minPrice") setMinPrice("");
                  if (filter.key === "maxPrice") setMaxPrice("");
                  const params = new URLSearchParams(query);
                  params.delete(filter.key);
                  params.set("page", "1");
                  const nextQuery = params.toString();
                  setQuery(nextQuery);
                  window.history.pushState({}, "", `/equipment?${nextQuery}`);
                }}
                type="button"
              >
                {filter.label} <span aria-hidden="true">×</span>
              </button>
            ))}
          </div>
        )}

        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-[80] md:hidden" role="presentation" onClick={() => setMobileFiltersOpen(false)}>
            <div className="absolute inset-0 bg-[#101d17]/55" />
            <section aria-labelledby="mobile-filter-title" aria-modal="true" className="absolute bottom-0 left-0 right-0 max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl" role="dialog" onClick={(event) => event.stopPropagation()}>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#17271f]" id="mobile-filter-title">Filters</h2>
                <button aria-label="Close filters" className="grid size-11 place-items-center rounded-full border border-[#dfe5df]" onClick={() => setMobileFiltersOpen(false)} type="button">×</button>
              </div>
              <form className="grid gap-4" onSubmit={applyFilters}>
                <label className="text-sm font-semibold text-[#34483b]">Search<input className="mt-1.5 w-full rounded-xl border border-[#dfe5df] px-4 py-3 text-base" onChange={(event) => setSearch(event.target.value)} value={search} /></label>
                <label className="text-sm font-semibold text-[#34483b]">Category<select className="mt-1.5 w-full rounded-xl border border-[#dfe5df] px-4 py-3 text-base" onChange={(event) => setCategory(event.target.value)} value={category}><option value="">All categories</option>{categories.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
                <label className="text-sm font-semibold text-[#34483b]">Rental period<select className="mt-1.5 w-full rounded-xl border border-[#dfe5df] px-4 py-3 text-base" onChange={(event) => setRentalType(event.target.value)} value={rentalType}><option value="">Any period</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></label>
                <label className="text-sm font-semibold text-[#34483b]">Availability<select className="mt-1.5 w-full rounded-xl border border-[#dfe5df] px-4 py-3 text-base" onChange={(event) => setAvailability(event.target.value)} value={availability}><option value="">Any availability</option><option value="true">Available</option><option value="false">Unavailable</option></select></label>
                <div className="grid grid-cols-2 gap-3"><label className="text-sm font-semibold text-[#34483b]">Minimum price<input className="mt-1.5 w-full rounded-xl border border-[#dfe5df] px-3 py-3 text-base" min="0" onChange={(event) => setMinPrice(event.target.value)} type="number" value={minPrice} /></label><label className="text-sm font-semibold text-[#34483b]">Maximum price<input className="mt-1.5 w-full rounded-xl border border-[#dfe5df] px-3 py-3 text-base" min="0" onChange={(event) => setMaxPrice(event.target.value)} type="number" value={maxPrice} /></label></div>
                <label className="text-sm font-semibold text-[#34483b]">Sort<select className="mt-1.5 w-full rounded-xl border border-[#dfe5df] px-4 py-3 text-base" onChange={(event) => setSort(event.target.value)} value={sort}><option value="newest">Recently added</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option></select></label>
                <div className="mt-2 grid grid-cols-2 gap-3 border-t border-[#edf0ec] pt-4"><button className="min-h-12 rounded-xl border border-[#dfe5df] text-sm font-semibold" onClick={clearFilters} type="button">Reset</button><button className="min-h-12 rounded-xl bg-[#14251e] text-sm font-semibold text-white" type="submit">Apply</button></div>
              </form>
            </section>
          </div>
        )}

        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-[#77827a]">{total} approved listing{total === 1 ? "" : "s"}</p>
          <Link className="text-sm font-semibold text-[#e9673e] hover:underline" href="/how-it-works">How renting works</Link>
        </div>
        {loading ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((n) => <LoadingState key={n} rows={2} />)}</div> : error ? <ErrorState message={error} onRetry={retryEquipmentRequest} /> : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#dce3dc] bg-white px-6 py-16 text-center"><h2 className="text-lg font-semibold text-[#26352c]">No equipment matched</h2><p className="mt-2 text-sm text-[#77827a]">Try widening your price range or clearing a filter.</p><button className="mt-5 min-h-11 rounded-full bg-[#14251e] px-5 text-sm font-semibold text-white" onClick={clearFilters} type="button">Clear filters</button></div>
        ) : (
          <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <article className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-[#e8ebe7] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg" key={item._id}>
                <Link className="relative block aspect-[1.42/1] overflow-hidden bg-[#edf0ec]" href={`/equipment/${item._id}`}>
                  <Image alt={item.title} className="object-cover transition-transform duration-500 group-hover:scale-105" fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" src={getEquipmentImageSrc(item.image)} />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold text-[#385a40]">{item.availability ? "Available" : "Unavailable"}</span>
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#738077]">{item.category} · {item.rentalType}</p>
                  <h2 className="mt-2 line-clamp-1 text-lg font-semibold text-[#17271f]">{item.title}</h2>
                  <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[#77827a]">{item.description}</p>
                  <p className="mt-3 text-xs text-[#818c84]">{item.location} · {item.quantity} unit{item.quantity === 1 ? "" : "s"}</p>
                  <div className="mt-auto flex items-center justify-between border-t border-[#edf0ec] pt-4">
                    <p className="font-semibold text-[#17271f]">${item.pricePerDay}<span className="ml-1 text-xs font-normal text-[#818c84]">/ {item.rentalType}</span></p>
                    <Link className="inline-flex min-h-11 items-center rounded-full bg-[#f4f6f3] px-4 text-sm font-semibold text-[#31443a] hover:bg-[#14251e] hover:text-white" href={!authLoading && !user ? `/login?next=/equipment/${item._id}&reason=equipment` : `/equipment/${item._id}`}>View details</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        {!loading && pages > 1 && (
          <nav aria-label="Equipment pages" className="mt-9 flex flex-wrap items-center justify-center gap-2">
            <button className="min-h-11 rounded-full border border-[#dfe5df] px-4 text-sm disabled:opacity-40" disabled={page <= 1} onClick={() => goToPage(page - 1)} type="button">Previous</button>
            {Array.from({ length: pages }, (_, index) => index + 1).filter((number) => pages <= 7 || number === 1 || number === pages || Math.abs(number - page) <= 1).map((number) => (
              <button aria-current={number === page ? "page" : undefined} aria-label={`Page ${number}`} className={`grid size-11 place-items-center rounded-full border text-sm font-semibold ${number === page ? "border-[#14251e] bg-[#14251e] text-white" : "border-[#dfe5df] bg-white text-[#536159]"}`} key={number} onClick={() => goToPage(number)} type="button">{number}</button>
            ))}
            <button className="min-h-11 rounded-full border border-[#dfe5df] px-4 text-sm disabled:opacity-40" disabled={page >= pages} onClick={() => goToPage(page + 1)} type="button">Next</button>
          </nav>
        )}
      </section>
    </PublicPageFrame>
  );
}
