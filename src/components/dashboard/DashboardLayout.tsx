"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Boxes,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Package,
  PlusCircle,
  UserRound,
  UsersRound,
  Heart,
  type LucideIcon,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import Brand from "@/components/Brand";
import { getErrorMessage } from "@/lib/api";
import ThemeToggle from "@/components/ThemeToggle";
import Breadcrumb from "@/components/Breadcrumb";

type DashboardRole = "renter" | "owner" | "admin";
type NavigationItem = { label: string; href: string; icon: LucideIcon };

const navigation: Record<DashboardRole, NavigationItem[]> = {
  renter: [
    { label: "Overview", href: "/customer", icon: LayoutDashboard },
    { label: "My rentals", href: "/customer/bookings", icon: Package },
    { label: "Favorites", href: "/customer/favorites", icon: Heart },
    { label: "Payments", href: "/customer/payments", icon: CreditCard },
    { label: "Profile", href: "/customer/profile", icon: UserRound },
  ],
  owner: [
    { label: "Overview", href: "/owner", icon: LayoutDashboard },
    { label: "Add equipment", href: "/owner/add-equipment", icon: PlusCircle },
    { label: "My equipment", href: "/owner/equipment", icon: Boxes },
    { label: "My equipment rentals", href: "/owner/requests", icon: UsersRound },
    { label: "Profile", href: "/owner/profile", icon: UserRound },
  ],
  admin: [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "All users", href: "/admin/users", icon: UsersRound },
    { label: "All equipment", href: "/admin/equipment", icon: Boxes },
    { label: "All rentals", href: "/admin/rentals", icon: ClipboardList },
    { label: "Profile", href: "/admin/profile", icon: UserRound },
  ],
};

function PageLoading() {
  return (
    <main id="main-content" className="min-h-screen bg-[#f7f8f6] p-6 sm:p-10">
      <div className="mx-auto max-w-5xl animate-pulse space-y-5">
        <div className="h-8 w-56 rounded-lg bg-[#e8ebe7]" />
        <div className="h-4 w-80 max-w-full rounded bg-[#e8ebe7]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div className="h-32 rounded-2xl bg-white" key={item} />
          ))}
        </div>
        <div className="h-72 rounded-2xl bg-white" />
      </div>
    </main>
  );
}

export default function DashboardLayout({
  role,
  children,
}: {
  role: DashboardRole;
  children: ReactNode;
}) {
  const { user, loading, error, logout, reloadUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const expectedPath = role === "owner" ? "/owner" : role === "admin" ? "/admin" : "/customer";

  useEffect(() => {
    if (loading || error) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== role) {
      router.replace(
        user.role === "owner"
          ? "/owner"
          : user.role === "renter"
            ? "/customer"
            : user.role === "admin"
              ? "/admin"
              : "/",
      );
    }
  }, [error, loading, role, router, user]);

  if (loading) {
    return (
      <>
        <PageLoading />
        <div hidden>{children}</div>
      </>
    );
  }

  if (error && !user) {
    return (
      <>
        <main id="main-content" className="grid min-h-screen place-items-center bg-[#f7f8f6] p-6">
          <section className="w-full max-w-md rounded-3xl border border-[#e8ebe7] bg-white p-8 text-center shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ec7047]">
              Session check
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#17271f]">
              We couldn’t verify your account
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#77827a]">{error}</p>
            <button
              className="mt-6 rounded-full bg-[#14251e] px-5 py-3 text-sm font-semibold text-white"
              onClick={() => void reloadUser()}
              type="button"
            >
              Try again
            </button>
          </section>
        </main>
        <div hidden>{children}</div>
      </>
    );
  }

  if (!user || user.role !== role) {
    return (
      <>
        <PageLoading />
        <div hidden>{children}</div>
      </>
    );
  }

  const navItems = navigation[role];
  const activeLabel =
    navItems.find((item) => item.href === pathname)?.label ??
    navItems.find((item) => item.href !== expectedPath && pathname.startsWith(item.href))?.label ??
    "Overview";

  async function handleLogout() {
    try {
      await logout();
    } catch (logoutError) {
      toast.error(getErrorMessage(logoutError));
    } finally {
      router.replace("/");
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f6]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-5 p-3 sm:p-5 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-8 lg:p-8">
        <aside className="flex flex-col rounded-[26px] border border-[#e8ebe7] bg-white p-4 shadow-[0_8px_32px_rgba(27,45,34,0.035)] lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)] lg:p-5">
          <div className="flex items-center justify-between lg:block">
            <Brand />
            <span className="rounded-full bg-[#f3f5f2] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#647168] lg:mt-6 lg:inline-flex">
              {role === "owner" ? "Owner space" : role === "admin" ? "Admin space" : "Customer space"}
            </span>
          </div>

          <nav
            aria-label="Dashboard navigation"
            className="mt-5 flex gap-1 overflow-x-auto pb-1 lg:mt-8 lg:block lg:space-y-1 lg:overflow-visible"
          >
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = href === pathname;
              return (
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors lg:flex ${
                    isActive
                      ? "bg-[#14251e] text-white shadow-sm"
                      : "text-[#647168] hover:bg-[#f4f6f3] hover:text-[#14251e]"
                  }`}
                  href={href}
                  key={href}
                >
                  <Icon aria-hidden="true" size={17} />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-5 hidden rounded-2xl bg-[#f7f8f6] p-4 lg:mt-auto lg:block">
            <p className="text-xs font-semibold text-[#263b31]">Need equipment?</p>
            <p className="mt-1 text-xs leading-5 text-[#77827a]">
              {role === "admin"
                ? "Review marketplace activity and keep EasyRent running smoothly."
                : "Browse local listings and find the right gear for your next project."}
            </p>
            <Link
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#e9673e]"
              href="/#featured"
            >
              {role === "admin" ? "Open marketplace" : "Explore marketplace"} <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="mt-5 hidden items-center gap-3 border-t border-[#edf0ec] pt-5 lg:flex">
            <Link
              href={role === "owner" ? "/owner/profile" : role === "admin" ? "/admin/profile" : "/customer/profile"}
              className="group flex min-w-0 flex-1 items-center gap-3 transition-opacity hover:opacity-85"
              title="View my profile"
            >
              <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-emerald-800/20 bg-[#eaf0eb] text-sm font-bold text-[#31513c] flex items-center justify-center">
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
                <p className="truncate text-sm font-semibold text-[#17271f] group-hover:text-emerald-800 transition-colors">
                  {user.name}
                </p>
                <p className="truncate text-xs text-[#818c84]">{user.email}</p>
              </div>
            </Link>
            <button
              aria-label="Sign out"
              className="grid size-9 place-items-center rounded-full text-[#77827a] transition-colors hover:bg-[#f4f6f3] hover:text-[#14251e]"
              onClick={() => void handleLogout()}
              type="button"
            >
              <LogOut size={16} />
            </button>
          </div>
        </aside>

        <main id="main-content" className="min-w-0">
          <Breadcrumb items={[
            { label: "Dashboard", href: expectedPath },
            { label: activeLabel },
          ]} />
          <header className="mb-6 flex items-center justify-between gap-4 px-1 py-2 sm:mb-8">
            <div>
              <p className="text-xs font-semibold text-[#879188]">
                {role === "owner" ? "Owner dashboard" : role === "admin" ? "Admin dashboard" : "Customer dashboard"}
              </p>
              <p className="mt-1 text-xl font-semibold tracking-tight text-[#17271f] sm:text-2xl">
                {activeLabel}
              </p>
            </div>
            <ThemeToggle />
            <Link
              className="inline-flex items-center gap-2 rounded-full border border-[#e1e7e1] bg-white px-4 py-2.5 text-xs font-semibold text-[#34483b] transition hover:border-[#cbd6cc]"
              href="/"
            >
              Marketplace <ArrowUpRight size={14} />
            </Link>
            <button
              aria-label="Sign out"
              className="grid size-10 shrink-0 place-items-center rounded-full border border-[#e1e7e1] bg-white text-[#647168] transition hover:bg-[#f4f6f3] lg:hidden"
              onClick={() => void handleLogout()}
              type="button"
            >
              <LogOut size={15} />
            </button>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
