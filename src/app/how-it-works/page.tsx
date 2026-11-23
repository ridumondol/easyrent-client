import Link from "next/link";
import { ArrowRight, CalendarDays, ClipboardCheck, Search } from "lucide-react";
import PublicPageFrame from "@/components/PublicPageFrame";

const steps = [
  { icon: Search, number: "01", title: "Find the right equipment", text: "Browse approved local listings and narrow them down by category, rental period, availability, and budget." },
  { icon: CalendarDays, number: "02", title: "Request your dates", text: "Choose your start and end dates, quantity, and delivery details. The server checks availability and calculates your rental total." },
  { icon: ClipboardCheck, number: "03", title: "Pay securely and get to work", text: "Complete the demo payment using Card, bKash Demo, or Nagad Demo. Your booking and payment status are recorded in your dashboard." },
];

export default function HowItWorksPage() {
  return (
    <PublicPageFrame>
      <section className="section-wrap py-16 sm:py-24"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ed7049]">Simple from start to finish</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em] text-[#17271f] sm:text-5xl">Less searching. More doing.</h1><p className="mt-4 text-base leading-7 text-[#68756d]">A clear rental flow for customers and equipment owners.</p></div><div className="mt-11 grid gap-5 lg:grid-cols-3">{steps.map(({ icon: Icon, number, title, text }) => <article className="rounded-3xl border border-[#e8ebe7] bg-white p-7 shadow-sm" key={number}><div className="flex items-center justify-between"><span className="grid size-12 place-items-center rounded-2xl bg-[#edf3ee] text-[#42614b]"><Icon size={21} /></span><span className="text-sm font-bold tracking-widest text-[#e2e7e2]">{number}</span></div><h2 className="mt-6 text-xl font-semibold text-[#17271f]">{title}</h2><p className="mt-3 text-sm leading-6 text-[#77827a]">{text}</p></article>)}</div><div className="mt-10 rounded-3xl bg-[#14251e] p-7 text-white sm:flex sm:items-center sm:justify-between sm:p-9"><div><h2 className="text-2xl font-semibold">Ready to start your next project?</h2><p className="mt-2 text-sm text-white/70">Find the equipment you need from owners nearby.</p></div><Link className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#f26a3d] px-5 py-3 text-sm font-semibold sm:mt-0" href="/equipment">Browse equipment <ArrowRight size={16} /></Link></div></section>
    </PublicPageFrame>
  );
}
