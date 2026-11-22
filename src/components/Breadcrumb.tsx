import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5">
      <ol className="flex min-h-11 flex-wrap items-center gap-2 text-sm text-[#68756d]">
        {items.map((item, index) => (
          <li className="flex items-center gap-2" key={`${item.label}-${index}`}>
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link className="inline-flex min-h-11 items-center underline-offset-4 hover:text-[#14251e] hover:underline" href={item.href}>
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-semibold text-[#26352c]">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
