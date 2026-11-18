import Link from "next/link";
import { Boxes } from "lucide-react";

type BrandProps = {
  light?: boolean;
};

export default function Brand({ light = false }: BrandProps) {
  return (
    <Link
      href="/"
      aria-label="Rentora home"
      className={`inline-flex items-center gap-2.5 font-semibold tracking-tight ${
        light ? "text-white" : "text-[#14251e]"
      }`}
    >
      <span className="grid size-9 place-items-center rounded-xl bg-[#f26a3d] text-white shadow-sm">
        <Boxes size={20} strokeWidth={2.2} aria-hidden="true" />
      </span>
      <span className="text-[1.3rem]">rentora</span>
    </Link>
  );
}
