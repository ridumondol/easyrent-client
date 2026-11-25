"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import PublicPageFrame from "@/components/PublicPageFrame";
import { apiRequest, getErrorMessage } from "@/lib/api";
import { notifications } from "@/lib/notifications";

type Verification = {
  bookingStatus: string;
  paymentStatus: string;
  stripeSessionStatus: string | null;
  stripePaymentStatus: string | null;
};

export default function PaymentSuccessPage() {
  const { token, loading: authLoading } = useAuth();
  const [verification, setVerification] = useState<Verification | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get("booking_id");
    const sessionId = params.get("session_id");
    if (!token || !bookingId || !sessionId) {
      const message = !token ? "Sign in to verify this payment." : "The payment return link is incomplete.";
      void Promise.resolve().then(() => {
        if (!active) return;
        setError(message);
        setLoading(false);
      });
      return () => { active = false; };
    }

    async function verify() {
      try {
        let result: Verification | null = null;
        for (let attempt = 0; attempt < 5; attempt += 1) {
          result = await apiRequest<Verification>(
            `/payments/verify/${encodeURIComponent(bookingId!)}?session_id=${encodeURIComponent(sessionId!)}`,
            { token },
          );
          if (result.paymentStatus === "paid" || result.paymentStatus === "refunded") break;
          if (attempt < 4) await new Promise((resolve) => setTimeout(resolve, 2000));
        }
        if (active) {
          setVerification(result);
          if (result?.paymentStatus === "paid") {
            notifications.success("Payment confirmed successfully.");
          } else if (result?.stripePaymentStatus === "failed") {
            notifications.error("The Stripe payment failed.");
          }
        }
      } catch (requestError) {
        if (active) {
          const message = getErrorMessage(requestError);
          setError(message);
          notifications.error(message);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void verify();
    return () => { active = false; };
  }, [authLoading, token]);

  const paid = verification?.paymentStatus === "paid";

  return (
    <PublicPageFrame>
      <section className="section-wrap grid min-h-[60vh] place-items-center py-16">
        <div className="w-full max-w-lg rounded-3xl border border-[#e8ebe7] bg-white p-8 text-center shadow-sm dark:border-[#29382d] dark:bg-[#16221a] sm:p-10">
          {loading ? (
            <LoaderCircle className="mx-auto animate-spin text-[#4c7856]" size={34} aria-label="Verifying payment" />
          ) : (
            <span className={`mx-auto grid size-14 place-items-center rounded-full ${paid ? "bg-[#e9f5ec] text-[#357148]" : "bg-[#fff3ee] text-[#ae523b]"}`}>
              <CheckCircle2 size={28} />
            </span>
          )}
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[#4c7856]">Stripe Checkout</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#17271f] dark:text-[#edf2ee]">
            {loading
              ? "Verifying your payment…"
              : error
                ? "We couldn’t verify this payment"
                : paid
                  ? "Payment confirmed"
                  : verification?.paymentStatus === "refunded"
                    ? "Payment refunded"
                    : verification?.stripePaymentStatus === "failed" ||
                        verification?.stripeSessionStatus === "expired"
                      ? "Payment not completed"
                      : "Payment is still processing"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#77827a] dark:text-[#a3b2a7]">
            {error || (paid
              ? "Your payment is confirmed. The owner will review your rental request next."
              : verification?.paymentStatus === "refunded"
                ? "This payment was refunded and the booking is not awaiting owner confirmation."
                : verification?.stripePaymentStatus === "failed" ||
                    verification?.stripeSessionStatus === "expired"
                  ? "The Checkout payment was not completed. Your booking remains unpaid; you can start a new payment from My bookings."
                  : verification?.stripePaymentStatus === "paid"
                    ? "Stripe reports a successful charge, but Rentora has not confirmed the booking. Do not pay again; contact support for help."
                    : "Stripe has not confirmed a completed payment yet. The booking will remain unpaid until payment is verified." )}
          </p>
          <Link className="mt-7 inline-flex rounded-full bg-[#14251e] px-6 py-3 text-sm font-semibold text-white dark:bg-[#244835]" href="/customer/bookings">
            View my bookings
          </Link>
        </div>
      </section>
    </PublicPageFrame>
  );
}
