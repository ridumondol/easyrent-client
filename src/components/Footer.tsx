import Link from "next/link";
import {
  AtSign,
  ArrowUpRight,
  BriefcaseBusiness,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import Brand from "@/components/Brand";

const footerLinks = [
  { label: "Browse equipment", href: "#featured" },
  { label: "Categories", href: "#categories" },
  { label: "How it works", href: "#how-it-works" },
  { label: "List your equipment", href: "#list-equipment" },
];

const categoryLinks = [
  "Construction",
  "Vehicles",
  "Agriculture",
  "Photography",
];

export default function Footer() {
  return (
    <footer className="bg-[#111f18] text-white" id="contact">
      <div className="section-wrap grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1fr] lg:gap-10 lg:py-[72px]">
        <div>
          <Brand light />
          <p className="mt-5 max-w-xs text-sm leading-6 text-white/55">
            Good gear should be easy to find. Rent the tools, machines, and
            equipment that keep your next idea moving.
          </p>
          <div className="mt-6 flex items-center gap-2.5">
            <a
              aria-label="Rentora on Instagram"
              className="grid size-9 place-items-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-[#f26a3d] hover:text-white"
              href="https://www.instagram.com/"
              rel="noreferrer"
              target="_blank"
            >
              <AtSign size={16} />
            </a>
            <a
              aria-label="Rentora on LinkedIn"
              className="grid size-9 place-items-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-[#f26a3d] hover:text-white"
              href="https://www.linkedin.com/"
              rel="noreferrer"
              target="_blank"
            >
              <BriefcaseBusiness size={16} />
            </a>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Explore</h2>
          <ul className="mt-5 space-y-3">
            {footerLinks.map((link) => (
              <li key={link.label}>
                <Link
                  className="text-sm text-white/55 transition-colors hover:text-white"
                  href={link.href}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Popular categories</h2>
          <ul className="mt-5 space-y-3">
            {categoryLinks.map((category) => (
              <li key={category}>
                <Link
                  className="text-sm text-white/55 transition-colors hover:text-white"
                  href="#categories"
                >
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Get in touch</h2>
          <ul className="mt-5 space-y-4">
            <li className="flex items-start gap-2.5 text-sm text-white/55">
              <Mail size={15} className="mt-0.5 shrink-0 text-[#f4825d]" />
              <a className="hover:text-white" href="mailto:hello@rentora.com">
                hello@rentora.com
              </a>
            </li>
            <li className="flex items-start gap-2.5 text-sm text-white/55">
              <Phone size={15} className="mt-0.5 shrink-0 text-[#f4825d]" />
              <a className="hover:text-white" href="tel:+15125550146">
                +1 (512) 555-0146
              </a>
            </li>
            <li className="flex items-start gap-2.5 text-sm text-white/55">
              <MapPin size={15} className="mt-0.5 shrink-0 text-[#f4825d]" />
              Austin, Texas
            </li>
          </ul>
          <a
            className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-white/75 transition-colors hover:text-white"
            href="mailto:hello@rentora.com"
          >
            Talk to our team <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="section-wrap flex flex-col gap-2 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Rentora, Inc. All rights reserved.</p>
          <p>Built for the people who make things happen.</p>
        </div>
      </div>
    </footer>
  );
}
