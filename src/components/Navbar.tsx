"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import toast from "react-hot-toast";
import Brand from "@/components/Brand";

const links = [
  { label: "Home", href: "#home" },
  { label: "Browse equipment", href: "#featured" },
  { label: "Categories", href: "#categories" },
  { label: "How it works", href: "#how-it-works" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#e8ebe7]/90 bg-[#f7f8f6]/90 backdrop-blur-xl">
      <nav
        className="section-wrap flex h-[76px] items-center justify-between"
        aria-label="Main navigation"
      >
        <Brand />
        <div className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <Link
              className="text-[13px] font-medium text-[#68756d] transition-colors hover:text-[#14251e]"
              href={link.href}
              key={link.label}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          <button
            type="button"
            className="px-3 py-2 text-sm font-medium text-[#536159] transition-colors hover:text-[#14251e]"
            onClick={() => toast("Member sign-in is coming soon.")}
          >
            Log in
          </button>
          <Link
            className="rounded-full bg-[#14251e] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#263b31]"
            href="#featured"
          >
            Get started
          </Link>
        </div>
        <button
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="grid size-10 place-items-center rounded-full border border-[#e2e7e2] text-[#14251e] lg:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>
      {menuOpen && (
        <div className="border-t border-[#e8ebe7] bg-[#f7f8f6] px-5 pb-5 pt-3 lg:hidden">
          <div className="mx-auto flex max-w-[1240px] flex-col">
            {links.map((link) => (
              <Link
                className="border-b border-[#e8ebe7] py-3.5 text-sm font-medium text-[#536159]"
                href={link.href}
                key={link.label}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 flex gap-3">
              <button
                className="flex-1 rounded-full border border-[#dfe5df] px-4 py-2.5 text-sm font-medium text-[#263b31]"
                onClick={() => {
                  toast("Member sign-in is coming soon.");
                  setMenuOpen(false);
                }}
                type="button"
              >
                Log in
              </button>
              <Link
                className="flex-1 rounded-full bg-[#14251e] px-4 py-2.5 text-center text-sm font-semibold text-white"
                href="#featured"
                onClick={() => setMenuOpen(false)}
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
