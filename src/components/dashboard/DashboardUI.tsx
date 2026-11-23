"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  CircleDashed,
  CircleX,
  RotateCcw,
  type LucideIcon,
  PackageOpen,
} from "lucide-react";
import type { ReactNode } from "react";

export function PageIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#ec7047]">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#17271f] sm:text-[2.4rem]">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#77827a]">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  note,
  icon: Icon,
  accent = false,
  delay = 0,
}: {
  label: string;
  value: string | number;
  note: string;
  icon: LucideIcon;
  accent?: boolean;
  delay?: number;
}) {
  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[#e8ebe7] bg-white p-5 shadow-[0_5px_22px_rgba(27,45,34,0.025)]"
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, delay }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[#77827a]">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#17271f]">
            {value}
          </p>
        </div>
        <span
          className={`grid size-10 place-items-center rounded-xl ${
            accent ? "bg-[#fff0e9] text-[#ed7049]" : "bg-[#edf3ee] text-[#42614b]"
          }`}
        >
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-3 text-[11px] text-[#909a92]">{note}</p>
    </motion.article>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const color =
    normalized === "paid" || normalized === "success" || normalized === "approved" || normalized === "completed" || normalized === "confirmed" || normalized === "available"
      ? "bg-[#e9f5ec] text-[#24673a] border border-[#b9dcc2] dark:bg-[#13331f] dark:text-[#86efac] dark:border-[#1e5234]"
      : normalized === "pending" || normalized === "unpaid"
        ? "bg-[#fff5e3] text-[#805b12] border border-[#f0dfaa] dark:bg-[#382409] dark:text-[#fde047] dark:border-[#593b11]"
        : normalized === "refunded" || normalized === "cancelled" || normalized === "rejected" || normalized === "failed" || normalized === "unavailable"
          ? "bg-[#fff0ec] text-[#9f3d2b] border border-[#f2c6bb] dark:bg-[#3c1917] dark:text-[#fca5a5] dark:border-[#6b2622]"
          : "bg-[#f0f2f0] text-[#5f6d64] border border-[#dce0dc] dark:bg-[#1e2c22] dark:text-[#a3b2a7] dark:border-[#2b3930]";

  const Icon =
    normalized === "paid" || normalized === "success" || normalized === "approved" || normalized === "completed" || normalized === "confirmed" || normalized === "available"
      ? CheckCircle2
      : normalized === "pending" || normalized === "unpaid"
        ? CircleDashed
        : normalized === "refunded"
          ? RotateCcw
          : CircleX;

  return (
    <span className={`inline-flex min-h-7 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold capitalize ${color}`}>
      <Icon aria-hidden="true" size={14} />
      {status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}
    </span>
  );
}

export function LoadingState({ rows = 4 }: { rows?: number }) {
  return (
    <div aria-label="Loading" className="animate-pulse space-y-3">
      {Array.from({ length: rows }, (_, index) => (
        <div
          className="h-[68px] rounded-xl border border-[#e8ebe7] bg-white"
          key={index}
        />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = PackageOpen,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#dce3dc] bg-white px-6 py-14 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#f2f5f1] text-[#647168]">
        <Icon size={21} />
      </span>
      <h2 className="mt-4 text-base font-semibold text-[#26352c]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#818c84]">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#f2d5cb] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 shrink-0 text-[#c25439]" size={18} />
        <div>
          <p className="text-sm font-semibold text-[#713a2c]">We couldn’t load this information</p>
          <p className="mt-1 text-xs leading-5 text-[#916758]">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[#b94e34]"
          onClick={onRetry}
          type="button"
        >
          Try again <ArrowUpRight size={13} />
        </button>
      )}
    </div>
  );
}

export function TableFrame({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e8ebe7] bg-white shadow-[0_5px_22px_rgba(27,45,34,0.025)]">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export const tableHeadClass =
  "whitespace-nowrap bg-[#f8f9f7] dark:bg-[#131d16] px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-[#879188] dark:text-[#a3b2a7]";
export const tableCellClass =
  "whitespace-nowrap border-t border-[#edf0ec] dark:border-[#24352b] px-5 py-4 text-xs text-[#536159] dark:text-[#c9d6cd]";
