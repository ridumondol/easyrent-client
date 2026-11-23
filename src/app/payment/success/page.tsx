import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import PublicPageFrame from "@/components/PublicPageFrame";

export default function PaymentSuccessPage() {
  return (
    <PublicPageFrame>
      <section className="section-wrap grid min-h-[60vh] place-items-center py-16">
        <div className="max-w-lg rounded-3xl border border-[#e8ebe7] bg-white p-8 text-center shadow-sm sm:p-10">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#e9f5ec] text-[#357148]"><CheckCircle2 size={28} /></span>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[#4c7856]">Stripe Checkout returned</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#17271f]">Thanks for booking with Rentora.</h1>
          <p className="mt-3 text-sm leading-6 text-[#77827a]">Stripe is confirming your payment. Check your bookings dashboard for the latest status; your booking will only be marked paid after the server verifies the payment.</p>
          <Link className="mt-7 inline-flex rounded-full bg-[#14251e] px-6 py-3 text-sm font-semibold text-white" href="/customer/bookings">View my bookings</Link>
        </div>
      </section>
    </PublicPageFrame>
  );
}
