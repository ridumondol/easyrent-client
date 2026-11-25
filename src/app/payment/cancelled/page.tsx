import Link from "next/link";
import { CircleDollarSign } from "lucide-react";
import PublicPageFrame from "@/components/PublicPageFrame";

export default function PaymentCancelledPage() {
  return (
    <PublicPageFrame>
      <section className="section-wrap grid min-h-[60vh] place-items-center py-16">
        <div className="w-full max-w-lg rounded-3xl border border-[#e8ebe7] bg-white p-8 text-center shadow-sm dark:border-[#29382d] dark:bg-[#16221a] sm:p-10">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#fff3ee] text-[#ae523b]"><CircleDollarSign size={28} /></span>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[#ec7047]">Checkout cancelled</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#17271f] dark:text-[#edf2ee]">Your booking is still here.</h1>
          <p className="mt-3 text-sm leading-6 text-[#77827a] dark:text-[#a3b2a7]">Stripe did not complete a payment. Your booking remains unpaid, and you can try checkout again while its payment hold is active.</p>
          <Link className="mt-7 inline-flex rounded-full bg-[#14251e] px-6 py-3 text-sm font-semibold text-white dark:bg-[#244835]" href="/customer/bookings">Return to my bookings</Link>
        </div>
      </section>
    </PublicPageFrame>
  );
}
