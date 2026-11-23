"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import Brand from "@/components/Brand";
import { useAuth } from "@/components/auth/AuthProvider";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ThemeToggle from "@/components/ThemeToggle";

const links = [
  { label: "Home", href: "/" },
  { label: "All Equipment", href: "/equipment" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "How It Works", href: "/how-it-works" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [menuOpen]);

  async function handleLogout() {
    try {
      await logout();
      router.push("/");
    } catch {
      toast.error("The server logout request failed. Your local session was cleared.");
      router.push("/");
    }
  }

  const dashboardPath =
    user?.role === "owner"
      ? "/owner"
      : user?.role === "renter"
        ? "/customer"
        : user?.role === "admin"
          ? "/admin"
          : "/";

  const profilePath =
    user?.role === "owner"
      ? "/owner/profile"
      : user?.role === "admin"
        ? "/admin/profile"
        : "/customer/profile";

  return (
    <header className="sticky top-0 z-40 border-b border-[#e8ebe7]/90 bg-[#f7f8f6]/90 backdrop-blur-xl">
      <nav
        className="section-wrap flex h-[76px] items-center justify-between"
        aria-label="Main navigation"
      >
        <Brand />
        <div className="hidden items-center gap-5 xl:gap-7 lg:flex">
          {links.map((link) => (
            <Link
              className={`min-h-11 inline-flex items-center text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "border-b-2 border-[#c94f2d] text-[#14251e] dark:border-[#e2633d] dark:text-[#edf2ee]"
                  : "text-[#68756d] hover:text-[#14251e] dark:text-[#a3b2a7] dark:hover:text-[#edf2ee]"
              }`}
              href={link.href}
              key={link.label}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          {!loading && user ? (
            <div className="flex items-center gap-3">
              {/* User Identity Pill linking to profile */}
              <Link
                href={profilePath}
                className="group flex items-center gap-2 rounded-full border border-[#dfe5df] dark:border-[#24352b] bg-white dark:bg-[#16221a] py-1.5 pl-1.5 pr-3 transition hover:border-[#14251e] dark:hover:border-[#3d6a50] hover:shadow-xs"
                title="View your profile"
              >
                <div className="relative size-7 overflow-hidden rounded-full border border-emerald-800/20 bg-emerald-100 font-bold text-xs text-emerald-900 flex items-center justify-center">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name}
                      fill
                      sizes="28px"
                      className="object-cover"
                      unoptimized={user.image.startsWith("data:")}
                    />
                  ) : (
                    user.name.slice(0, 1).toUpperCase()
                  )}
                </div>
                <span className="text-xs font-semibold text-[#14251e] dark:text-[#edf2ee] max-w-[100px] truncate">
                  {user.name}
                </span>
                <span className="rounded-full bg-emerald-50 dark:bg-[#13331f] px-1.5 py-0.5 text-[10px] font-medium text-emerald-800 dark:text-[#86efac] capitalize border border-emerald-200/50 dark:border-[#1e5234]">
                  {user.role}
                </span>
              </Link>

              <Link
                className="rounded-full border border-[#dfe5df] dark:border-[#24352b] px-3.5 py-2 text-xs font-semibold text-[#263b31] dark:text-[#edf2ee] transition hover:bg-[#f2f5f2] dark:hover:bg-[#1e2c22]"
                href={dashboardPath}
              >
                Dashboard
              </Link>
              <button
                type="button"
                className="rounded-full bg-[#14251e] dark:bg-[#244835] border border-transparent dark:border-[#3d6a50] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#263b31] dark:hover:bg-[#2f5c44]"
                onClick={handleLogout}
              >
                Sign out
              </button>
            </div>
          ) : !loading ? (
            <>
              <Link
                className="px-3 py-2 text-sm font-medium text-[#536159] dark:text-[#a3b2a7] transition-colors hover:text-[#14251e] dark:hover:text-[#edf2ee]"
                href="/login"
              >
                Log in
              </Link>
              <Link
                className="rounded-full bg-[#14251e] dark:bg-[#244835] border border-transparent dark:border-[#3d6a50] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#263b31] dark:hover:bg-[#2f5c44]"
                href="/register"
              >
                Get started
              </Link>
            </>
          ) : null}
        </div>
        <button
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          ref={menuButtonRef}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="grid size-11 place-items-center rounded-full border border-[#e2e7e2] dark:border-[#24352b] text-[#14251e] dark:text-[#edf2ee] lg:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>
      {menuOpen && (
        <div id="mobile-navigation" className="border-t border-[#e8ebe7] dark:border-[#24352b] bg-[#f7f8f6] dark:bg-[#0f1712] px-5 pb-5 pt-3 lg:hidden">
          <div className="mx-auto flex max-w-[1240px] flex-col">
            {links.map((link) => (
              <Link
                className={`min-h-11 flex items-center border-b border-[#e8ebe7] dark:border-[#24352b] text-base font-medium ${
                  pathname === link.href ? "text-[#c94f2d] dark:text-[#f0744f]" : "text-[#536159] dark:text-[#a3b2a7]"
                }`}
                href={link.href}
                key={link.label}
                aria-current={pathname === link.href ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {!loading && user && (
              <div className="my-3 flex items-center gap-3 border-b border-[#e8ebe7] dark:border-[#24352b] pb-3">
                <div className="relative size-10 overflow-hidden rounded-full border border-emerald-800/20 bg-emerald-100 font-bold text-sm text-emerald-900 flex items-center justify-center">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                      unoptimized={user.image.startsWith("data:")}
                    />
                  ) : (
                    user.name.slice(0, 1).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#14251e] dark:text-[#edf2ee]">{user.name}</p>
                  <p className="truncate text-xs text-[#68756d] dark:text-[#a3b2a7] capitalize">{user.role} Account</p>
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <ThemeToggle />
              {!loading && user ? (
                <>
                  <Link
                    className="flex-1 rounded-full border border-[#dfe5df] dark:border-[#24352b] px-4 py-2.5 text-center text-xs font-semibold text-[#263b31] dark:text-[#edf2ee]"
                    href={profilePath}
                    onClick={() => setMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    className="flex-1 rounded-full border border-[#dfe5df] dark:border-[#24352b] px-4 py-2.5 text-center text-xs font-semibold text-[#263b31] dark:text-[#edf2ee]"
                    href={dashboardPath}
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    className="w-full rounded-full bg-[#14251e] dark:bg-[#244835] border border-transparent dark:border-[#3d6a50] px-4 py-2.5 text-center text-xs font-semibold text-white"
                    onClick={() => {
                      setMenuOpen(false);
                      void handleLogout();
                    }}
                    type="button"
                  >
                    Sign out
                  </button>
                </>
              ) : !loading ? (
                <>
                  <Link
                    className="flex-1 rounded-full border border-[#dfe5df] dark:border-[#24352b] px-4 py-2.5 text-center text-sm font-medium text-[#263b31] dark:text-[#edf2ee]"
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    className="flex-1 rounded-full bg-[#14251e] dark:bg-[#244835] border border-transparent dark:border-[#3d6a50] px-4 py-2.5 text-center text-sm font-semibold text-white"
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                  >
                    Get started
                  </Link>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
