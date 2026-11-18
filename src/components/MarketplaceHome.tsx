"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  HardHat,
  Heart,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  Truck,
  UsersRound,
  X,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import CategoryCard from "@/components/CategoryCard";
import EquipmentCard from "@/components/EquipmentCard";
import SectionHeading from "@/components/SectionHeading";
import { categories, equipment, reviews, type Equipment } from "@/data/marketplace";

const benefits = [
  {
    icon: BadgeCheck,
    title: "Verified equipment owners",
    description:
      "Real people, real listings. Every owner is checked before they rent with us.",
  },
  {
    icon: CircleDollarSign,
    title: "Fair, upfront prices",
    description:
      "Clear daily rates and no surprise checkout fees. Keep the budget on track.",
  },
  {
    icon: Clock3,
    title: "Rent on your schedule",
    description:
      "Pick it up for a day or keep it for a month. Your project sets the pace.",
  },
  {
    icon: ShieldCheck,
    title: "A safer way to rent",
    description:
      "Secure booking and straightforward support give every rental a better start.",
  },
];

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Find the right gear",
    description:
      "Search trusted local listings by category, location, and the dates you need.",
  },
  {
    number: "02",
    icon: CalendarDays,
    title: "Book your rental",
    description:
      "Choose your rental window, connect with the owner, and confirm the details.",
  },
  {
    number: "03",
    icon: Truck,
    title: "Pick up and get to work",
    description:
      "Collect your equipment or arrange delivery. Then get straight to the good part.",
  },
];

function EquipmentDialog({
  item,
  onClose,
}: {
  item: Equipment;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#101d17]/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <motion.section
        animate={{ opacity: 1, scale: 1, y: 0 }}
        aria-labelledby="equipment-dialog-title"
        aria-modal="true"
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
        initial={{ opacity: 0, scale: 0.97, y: 14 }}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="relative aspect-[1.8/1] bg-[#edf0ec]">
          <Image
            alt={item.imageAlt}
            className="image-cover"
            fill
            sizes="(max-width: 640px) 100vw, 576px"
            src={item.image}
          />
          <button
            aria-label="Close equipment details"
            className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-white/90 text-[#263b31] shadow-sm"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-[#f3f5f2] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#65736a]">
              {item.category}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold">
              <Star size={14} className="fill-[#f2a73b] text-[#f2a73b]" />
              {item.rating.toFixed(1)} ({item.reviewCount} reviews)
            </span>
          </div>
          <h2
            className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#17271f]"
            id="equipment-dialog-title"
          >
            {item.name}
          </h2>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-[#77827a]">
            <MapPin size={15} />
            {item.location}
          </p>
          <p className="mt-4 text-sm leading-6 text-[#68756d]">
            {item.description}
          </p>
          <div className="mt-6 flex flex-col gap-4 border-t border-[#edf0ec] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xl font-semibold text-[#17271f]">
              ${item.dailyRate}
              <span className="ml-1 text-sm font-normal text-[#77827a]">
                / day
              </span>
            </p>
            <button
              className="rounded-full bg-[#f26a3d] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#df5832]"
              onClick={() => {
                toast("Booking requests are coming soon.");
                onClose();
              }}
              type="button"
            >
              Check availability
            </button>
          </div>
          <p className="mt-4 text-xs text-[#89938c]">
            Listed by {item.owner} · {item.availability.toLowerCase()}
          </p>
        </div>
      </motion.section>
    </div>
  );
}

export default function MarketplaceHome() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [submittedLocation, setSubmittedLocation] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null,
  );

  const filteredEquipment = useMemo(() => {
    const searchTerm = submittedQuery.trim().toLowerCase();
    const locationTerm = submittedLocation.trim().toLowerCase();

    return equipment.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        `${item.name} ${item.category} ${item.description}`
          .toLowerCase()
          .includes(searchTerm);
      const matchesLocation =
        !locationTerm || item.location.toLowerCase().includes(locationTerm);
      const matchesCategory =
        !activeCategory || item.category === activeCategory;

      return matchesSearch && matchesLocation && matchesCategory;
    });
  }, [activeCategory, submittedLocation, submittedQuery]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedQuery(query);
    setSubmittedLocation(location);
    setActiveCategory("");
    document.getElementById("featured")?.scrollIntoView({ behavior: "smooth" });
  }

  function selectCategory(name: string) {
    setActiveCategory((current) => (current === name ? "" : name));
    setSubmittedQuery("");
    setSubmittedLocation("");
  }

  function toggleFavorite(item: Equipment) {
    const isSaved = favorites.includes(item.id);
    setFavorites((current) =>
      isSaved
        ? current.filter((favorite) => favorite !== item.id)
        : [...current, item.id],
    );
    toast.success(
      isSaved ? "Removed from your saved gear" : "Added to your saved gear",
    );
  }

  return (
    <>
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 2800,
          style: {
            borderRadius: "14px",
            background: "#14251e",
            color: "#fff",
            fontSize: "13px",
          },
        }}
      />
      <main>
        <section
          className="section-wrap relative pb-16 pt-12 sm:pb-20 sm:pt-[72px] lg:pb-[100px] lg:pt-[82px]"
          id="home"
        >
          <div className="grid items-center gap-12 lg:grid-cols-[0.93fr_1.07fr] lg:gap-[72px]">
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 18 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e5e9e3] bg-white px-3.5 py-2 text-[11px] font-semibold text-[#546359] shadow-sm">
                <span className="size-1.5 rounded-full bg-[#f26a3d]" />
                THE LOCAL MARKETPLACE FOR BIG IDEAS
              </div>
              <h1 className="mt-6 max-w-[650px] text-[3.1rem] font-semibold leading-[1.02] tracking-[-0.075em] text-[#17271f] sm:text-[4.25rem] lg:text-[4.55rem]">
                Rent the equipment.
                <span className="block text-[#f26a3d]">Get the job done.</span>
              </h1>
              <p className="mt-5 max-w-[490px] text-[15px] leading-7 text-[#738077] sm:text-base">
                From the first dig to the final shot, find reliable local gear
                for whatever you&apos;re building next.
              </p>
              <form
                className="mt-8 rounded-[20px] border border-[#e6eae5] bg-white p-2 shadow-[0_12px_42px_rgba(34,56,41,0.08)] sm:flex sm:items-center"
                onSubmit={handleSearch}
              >
                <label className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5">
                  <Search
                    className="shrink-0 text-[#f26a3d]"
                    size={19}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-[#9aa39c]">
                      What do you need?
                    </span>
                    <input
                      className="mt-1 w-full border-0 bg-transparent p-0 text-sm font-medium text-[#17271f] placeholder:text-[#a0a8a2] focus:outline-none focus:ring-0"
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Excavator, camera, van..."
                      value={query}
                    />
                  </span>
                </label>
                <div className="mx-3 hidden h-10 w-px bg-[#e8ebe7] sm:block" />
                <label className="flex min-w-0 flex-1 items-center gap-3 border-t border-[#edf0ec] px-3 py-2.5 sm:border-t-0">
                  <MapPin
                    className="shrink-0 text-[#f26a3d]"
                    size={18}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-[#9aa39c]">
                      Where?
                    </span>
                    <input
                      className="mt-1 w-full border-0 bg-transparent p-0 text-sm font-medium text-[#17271f] placeholder:text-[#a0a8a2] focus:outline-none focus:ring-0"
                      onChange={(event) => setLocation(event.target.value)}
                      placeholder="City or ZIP code"
                      value={location}
                    />
                  </span>
                </label>
                <button
                  aria-label="Search equipment"
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#f26a3d] px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#df5832] sm:mt-0 sm:w-auto"
                  type="submit"
                >
                  <Search size={16} className="sm:hidden" />
                  Search
                </button>
              </form>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2.5">
                <Link
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#23372c] transition-colors hover:text-[#f26a3d]"
                  href="#featured"
                >
                  Browse equipment <ArrowRight size={16} />
                </Link>
                <Link
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#7b867e] transition-colors hover:text-[#23372c]"
                  href="#list-equipment"
                >
                  List your equipment <ArrowUpRight size={15} />
                </Link>
              </div>
              <div className="mt-9 flex items-center gap-4 border-t border-[#e8ebe7] pt-6">
                <div className="flex -space-x-2.5" aria-hidden="true">
                  {reviews.slice(0, 3).map((review) => (
                    <span
                      className="relative size-9 overflow-hidden rounded-full border-[2px] border-[#f7f8f6] bg-[#e9ede8]"
                      key={review.name}
                    >
                      <Image
                        alt=""
                        className="image-cover"
                        fill
                        sizes="36px"
                        src={review.avatar}
                      />
                    </span>
                  ))}
                </div>
                <p className="text-xs leading-5 text-[#7d8981]">
                  <span className="font-semibold text-[#26372d]">12,000+</span>{" "}
                  people found their gear here
                  <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#35463a]">
                    <Star
                      size={12}
                      className="fill-[#f2a73b] text-[#f2a73b]"
                    />
                    4.9/5
                  </span>
                </p>
              </div>
            </motion.div>

            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="relative mx-auto w-full max-w-[590px] lg:ml-auto"
              initial={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.75, delay: 0.12, ease: "easeOut" }}
            >
              <div className="relative aspect-[1.09/1] overflow-hidden rounded-[30px] bg-[#dbe1da] shadow-[0_26px_75px_rgba(30,53,37,0.18)] sm:aspect-[1.14/1]">
                <Image
                  alt="A construction professional operating equipment on a sunlit job site"
                  className="image-cover"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 54vw"
                  src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1400&q=90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101d17]/35 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white sm:bottom-7 sm:left-7 sm:right-7">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/75">
                      READY WHEN YOU ARE
                    </p>
                    <p className="mt-1.5 text-lg font-semibold tracking-tight sm:text-xl">
                      Make room for the big stuff.
                    </p>
                  </div>
                  <span className="grid size-10 place-items-center rounded-full border border-white/40 bg-white/15 backdrop-blur-md">
                    <ArrowDownRight size={19} />
                  </span>
                </div>
              </div>
              <motion.div
                animate={{ y: [0, -7, 0] }}
                className="absolute -left-3 top-8 flex items-center gap-3 rounded-2xl border border-white/70 bg-white/95 p-3.5 shadow-[0_14px_35px_rgba(26,45,32,0.12)] backdrop-blur sm:-left-7 sm:top-12 sm:p-4"
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <span className="grid size-10 place-items-center rounded-xl bg-[#fff1eb] text-[#f26a3d]">
                  <HardHat size={20} />
                </span>
                <span>
                  <span className="block text-xs font-semibold text-[#203127]">
                    Gear you can count on
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-[10px] text-[#7d8981]">
                    <Check size={11} className="text-[#4c9863]" />
                    Owner verified
                  </span>
                </span>
              </motion.div>
              <div className="absolute -bottom-5 right-3 flex items-center gap-3 rounded-2xl border border-white/70 bg-white/95 p-3.5 shadow-[0_14px_35px_rgba(26,45,32,0.12)] backdrop-blur sm:-bottom-6 sm:right-7 sm:p-4">
                <span className="grid size-10 place-items-center rounded-xl bg-[#edf6ee] text-[#468453]">
                  <UsersRound size={20} />
                </span>
                <span>
                  <span className="block text-lg font-semibold tracking-tight text-[#203127]">
                    12k+
                  </span>
                  <span className="text-[10px] text-[#7d8981]">
                    local rentals made
                  </span>
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-y border-[#e8ebe7] bg-white py-5">
          <div className="section-wrap flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-center sm:justify-between sm:text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#96a098]">
              YOUR NEXT PROJECT STARTS HERE
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-xs font-medium text-[#748078]">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={15} className="text-[#63826a]" /> Verified
                local owners
              </span>
              <span className="inline-flex items-center gap-2">
                <CircleDollarSign size={15} className="text-[#63826a]" /> No
                hidden fees
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 size={15} className="text-[#63826a]" /> Flexible
                rentals
              </span>
            </div>
          </div>
        </section>

        <section className="section-wrap section-space" id="categories">
          <motion.div
            className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <SectionHeading
              description="Whether you're on a job site or setting a stage, there's a better way to get the gear."
              eyebrow="Find your category"
              title="Equipment for every kind of work."
            />
            <Link
              className="inline-flex items-center gap-2 self-start pb-1 text-sm font-semibold text-[#33463a] transition-colors hover:text-[#f26a3d] sm:self-auto"
              href="#featured"
            >
              Explore all gear <ArrowRight size={16} />
            </Link>
          </motion.div>
          <div className="mt-8 grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {categories.map((category, index) => (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                key={category.name}
                transition={{ duration: 0.38, delay: index * 0.06 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <CategoryCard
                  category={category}
                  onSelect={selectCategory}
                />
              </motion.div>
            ))}
          </div>
        </section>

        <section className="section-wrap pb-20 sm:pb-24" id="featured">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <SectionHeading
              description="Well-cared-for gear from people nearby. Clear pricing, honest details, and no big-box runaround."
              eyebrow="A few good finds"
              title="Gear that gets the job done."
            />
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                aria-pressed={!activeCategory}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                  !activeCategory
                    ? "border-[#14251e] bg-[#14251e] text-white"
                    : "border-[#e2e7e2] bg-white text-[#66736a] hover:border-[#14251e]"
                }`}
                onClick={() => selectCategory("")}
                type="button"
              >
                All equipment
              </button>
              <button
                className="inline-flex items-center gap-1.5 rounded-full border border-[#e2e7e2] bg-white px-4 py-2 text-xs font-semibold text-[#66736a] transition-colors hover:border-[#14251e]"
                onClick={() => {
                  setSubmittedQuery("");
                  setSubmittedLocation("");
                  setQuery("");
                  setLocation("");
                  setActiveCategory("");
                }}
                type="button"
              >
                Reset filters <ChevronDown size={13} className="rotate-180" />
              </button>
            </div>
          </div>
          {(activeCategory || submittedQuery || submittedLocation) && (
            <p className="mt-5 text-sm text-[#77827a]" aria-live="polite">
              {filteredEquipment.length}{" "}
              {filteredEquipment.length === 1 ? "listing" : "listings"} found
              {activeCategory ? ` in ${activeCategory}` : ""}
              {submittedLocation ? ` near ${submittedLocation}` : ""}
              {submittedQuery ? ` for “${submittedQuery}”` : ""}
            </p>
          )}
          {filteredEquipment.length > 0 ? (
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {filteredEquipment.map((item, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  key={item.id}
                  transition={{ duration: 0.4, delay: (index % 3) * 0.07 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                >
                  <EquipmentCard
                    isFavorite={favorites.includes(item.id)}
                    item={item}
                    onToggleFavorite={toggleFavorite}
                    onViewDetails={setSelectedEquipment}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="mt-7 rounded-3xl border border-dashed border-[#d9e0d9] bg-white px-6 py-14 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#f3f5f2] text-[#65736a]">
                <Search size={21} />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-[#17271f]">
                No exact matches just yet
              </h3>
              <p className="mt-2 text-sm text-[#77827a]">
                Try a nearby city or a broader equipment search.
              </p>
              <button
                className="mt-5 text-sm font-semibold text-[#f26a3d] hover:text-[#d95530]"
                onClick={() => {
                  setQuery("");
                  setLocation("");
                  setSubmittedQuery("");
                  setSubmittedLocation("");
                  setActiveCategory("");
                }}
                type="button"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        <section
          className="section-space border-y border-[#e8ebe7] bg-white"
          id="how-it-works"
        >
          <div className="section-wrap">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <SectionHeading
                centered
                description="Rentora keeps the process simple, so you can spend less time sourcing and more time making progress."
                eyebrow="Three steps, no fuss"
                title="From search to start-up."
              />
            </motion.div>
            <div className="relative mt-12 grid gap-8 md:grid-cols-3 md:gap-5">
              <div className="absolute left-[19%] right-[19%] top-[35px] hidden border-t border-dashed border-[#d9e1d9] md:block" />
              {steps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <motion.article
                    className="relative z-10 flex flex-col items-center text-center"
                    initial={{ opacity: 0, y: 16 }}
                    key={step.number}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                  >
                    <div className="relative grid size-[70px] place-items-center rounded-[22px] border border-[#e8ebe7] bg-[#f7f8f6] text-[#31513c] shadow-[0_5px_18px_rgba(36,61,42,0.05)]">
                      <Icon size={25} strokeWidth={1.7} />
                      <span className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full border-2 border-white bg-[#f26a3d] text-[9px] font-bold text-white">
                        {step.number.slice(1)}
                      </span>
                    </div>
                    <h3 className="mt-5 text-base font-semibold tracking-tight text-[#17271f]">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-[290px] text-sm leading-6 text-[#77827a]">
                      {step.description}
                    </p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section-wrap section-space">
          <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-[84px]">
            <motion.div
              className="relative mx-auto w-full max-w-[530px]"
              initial={{ opacity: 0, x: -18 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55 }}
              viewport={{ once: true, amount: 0.25 }}
            >
              <div className="relative aspect-[1.1/1] overflow-hidden rounded-[28px] bg-[#e4e9e3]">
                <Image
                  alt="A worker preparing tools for a hands-on project"
                  className="image-cover"
                  fill
                  sizes="(max-width: 1024px) 100vw, 46vw"
                  src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=85"
                />
              </div>
              <div className="absolute -bottom-5 -right-3 flex items-center gap-3 rounded-2xl border border-white/70 bg-white p-4 shadow-[0_14px_35px_rgba(26,45,32,0.12)] sm:-right-5">
                <span className="grid size-10 place-items-center rounded-xl bg-[#edf6ee] text-[#468453]">
                  <ShieldCheck size={20} />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-[#203127]">
                    Good people. Good gear.
                  </span>
                  <span className="mt-1 block text-[10px] text-[#7d8981]">
                    Every rental starts with trust.
                  </span>
                </span>
              </div>
            </motion.div>
            <div>
              <SectionHeading
                description="The best projects don’t start with a big equipment bill. They start with the right gear, from someone who knows it."
                eyebrow="A smarter way to get equipped"
                title="Big-project energy. No big-equipment commitment."
              />
              <div className="mt-8 grid gap-x-6 gap-y-6 sm:grid-cols-2">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;

                  return (
                    <motion.div
                      className="flex gap-3.5"
                      initial={{ opacity: 0, y: 12 }}
                      key={benefit.title}
                      transition={{ duration: 0.35, delay: index * 0.07 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#42624a] shadow-[0_2px_12px_rgba(36,61,42,0.06)]">
                        <Icon size={19} strokeWidth={1.8} />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-[#22352a]">
                          {benefit.title}
                        </span>
                        <span className="mt-1.5 block text-xs leading-5 text-[#7b867e]">
                          {benefit.description}
                        </span>
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden border-y border-[#e8ebe7] bg-[#eff2ed]">
          <div className="section-wrap grid items-center gap-10 py-14 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-[74px]">
            <div>
              <SectionHeading
                description="The gear our community reaches for most. Ready for the next job, weekend, or big idea."
                eyebrow="The community favorites"
                title="Popular for a reason."
              />
              <Link
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#31443a] transition-colors hover:text-[#f26a3d]"
                href="#featured"
              >
                Find your next favorite <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[equipment[0], equipment[3], equipment[1]].map(
                (item, index) => (
                  <motion.button
                    className={`group overflow-hidden rounded-[20px] bg-white text-left shadow-[0_4px_18px_rgba(27,45,34,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_26px_rgba(27,45,34,0.12)] ${
                      index === 1 ? "sm:mt-8" : ""
                    }`}
                    key={item.id}
                    onClick={() => setSelectedEquipment(item)}
                    type="button"
                    whileInView={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 18 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true, amount: 0.2 }}
                  >
                    <span className="relative block aspect-[1.12/1] overflow-hidden bg-[#dfe6de]">
                      <Image
                        alt={item.imageAlt}
                        className="image-cover transition-transform duration-700 group-hover:scale-105"
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 270px"
                        src={item.image}
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-[#526258]">
                        Popular
                      </span>
                    </span>
                    <span className="block p-3.5">
                      <span className="block truncate text-xs font-semibold text-[#22352a]">
                        {item.name}
                      </span>
                      <span className="mt-1.5 flex items-center justify-between text-[11px] text-[#818c84]">
                        <span>{item.category}</span>
                        <span className="font-semibold text-[#31443a]">
                          ${item.dailyRate}/day
                        </span>
                      </span>
                    </span>
                  </motion.button>
                ),
              )}
            </div>
          </div>
        </section>

        <section className="section-wrap section-space">
          <motion.div
            className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <SectionHeading
              description="We could tell you how easy it is. We’d rather let the people using Rentora tell you."
              eyebrow="Words from the workbench"
              title="A good rental leaves a good impression."
            />
            <div className="flex items-center gap-2 text-sm font-semibold text-[#35463a]">
              <Star size={16} className="fill-[#f2a73b] text-[#f2a73b]" />
              4.9 average rating
            </div>
          </motion.div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {reviews.map((review, index) => (
              <motion.article
                className="rounded-[20px] border border-[#e8ebe7] bg-white p-5 shadow-[0_3px_15px_rgba(27,45,34,0.035)] sm:p-5"
                initial={{ opacity: 0, y: 15 }}
                key={review.name}
                transition={{ duration: 0.4, delay: index * 0.07 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <div className="flex items-center gap-0.5" aria-label="5 out of 5 stars">
                  {Array.from({ length: review.rating }, (_, starIndex) => (
                    <Star
                      aria-hidden="true"
                      className="fill-[#f2a73b] text-[#f2a73b]"
                      key={starIndex}
                      size={13}
                    />
                  ))}
                </div>
                <p className="mt-4 min-h-[100px] text-[13px] leading-[1.7] text-[#66736a]">
                  “{review.text}”
                </p>
                <div className="mt-5 flex items-center gap-3 border-t border-[#edf0ec] pt-4">
                  <span className="relative size-10 overflow-hidden rounded-full bg-[#e7ece7]">
                    <Image
                      alt=""
                      className="image-cover"
                      fill
                      sizes="40px"
                      src={review.avatar}
                    />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold text-[#22352a]">
                      {review.name}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-[#87918a]">
                      {review.role}
                    </span>
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="section-wrap pb-16 sm:pb-20" id="list-equipment">
          <div className="relative overflow-hidden rounded-[28px] bg-[#182b21] px-6 py-10 sm:px-10 sm:py-12 lg:px-[60px] lg:py-[58px]">
            <div className="pointer-events-none absolute -right-20 -top-32 size-[340px] rounded-full border border-white/[0.08]" />
            <div className="pointer-events-none absolute -right-4 -top-16 size-[210px] rounded-full border border-white/[0.08]" />
            <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div className="max-w-[640px]">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f79572]">
                  Own great equipment?
                </p>
                <h2 className="mt-3 text-[2rem] font-semibold leading-[1.12] tracking-[-0.055em] text-white sm:text-[2.7rem]">
                  Let your equipment work a little harder.
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-6 text-white/60 sm:text-[15px]">
                  Help someone tackle their next big job and earn from gear
                  that would otherwise be sitting idle.
                </p>
              </div>
              <a
                className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-[#f26a3d] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#df5832] lg:self-center"
                href="mailto:hello@rentora.com?subject=List%20my%20equipment"
              >
                List your equipment <ArrowUpRight size={16} />
              </a>
            </div>
            <div className="relative mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-5 text-xs text-white/65">
              <span className="inline-flex items-center gap-1.5">
                <Check size={14} className="text-[#8fca96]" /> Set your own
                availability
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check size={14} className="text-[#8fca96]" /> Connect with
                local renters
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check size={14} className="text-[#8fca96]" /> Earn on your
                terms
              </span>
            </div>
          </div>
        </section>
      </main>
      <AnimatePresence>
        {selectedEquipment && (
          <EquipmentDialog
            item={selectedEquipment}
            onClose={() => setSelectedEquipment(null)}
          />
        )}
      </AnimatePresence>
      <span className="sr-only">
        <Heart aria-hidden="true" />{" "}
        {favorites.length ? `${favorites.length} saved listings` : ""}
      </span>
    </>
  );
}
