import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, CircleDollarSign, Handshake, Sprout } from "lucide-react";
import PublicPageFrame from "@/components/PublicPageFrame";

const principles = [
  { icon: Handshake, title: "Local trust", text: "We help neighbors and small businesses share equipment through clear listings and direct communication." },
  { icon: CircleDollarSign, title: "Fair access", text: "Rent what you need for the time you need it, without committing to a purchase that sits unused." },
  { icon: BadgeCheck, title: "Careful listings", text: "Every public listing is reviewed before it reaches the marketplace, so details and expectations start in the right place." },
  { icon: Sprout, title: "Less waste", text: "Making better use of existing tools means fewer idle machines and more resources for work that matters." },
];

export default function AboutPage() {
  return (
    <PublicPageFrame>
      <section className="section-wrap grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ed7049]">A better way to get equipped</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em] text-[#17271f] sm:text-5xl">Big projects deserve access, not overhead.</h1><p className="mt-5 max-w-xl text-base leading-7 text-[#68756d]">Rentora connects people who need dependable equipment with local owners who have it. From a weekend garden project to a full production day, our marketplace makes it easier to find the right gear nearby.</p><Link className="mt-7 inline-flex rounded-full bg-[#14251e] px-6 py-3 text-sm font-semibold text-white" href="/equipment">Explore equipment</Link></div>
        <div className="relative min-h-[340px] overflow-hidden rounded-[30px] bg-[#e8ebe7]"><Image alt="A team working together on a construction project" className="object-cover" fill sizes="(max-width: 1024px) 100vw, 50vw" src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=85" /></div>
      </section>
      <section className="bg-white py-14 sm:py-20"><div className="section-wrap"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ed7049]">What guides us</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-[#17271f]">Built around useful things and real people.</h2><div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{principles.map(({ icon: Icon, title, text }) => <article className="rounded-2xl border border-[#e8ebe7] bg-[#fbfcfa] p-5" key={title}><span className="grid size-11 place-items-center rounded-xl bg-[#edf3ee] text-[#42614b]"><Icon size={20} /></span><h3 className="mt-4 font-semibold text-[#26352c]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#77827a]">{text}</p></article>)}</div></div></section>
    </PublicPageFrame>
  );
}
