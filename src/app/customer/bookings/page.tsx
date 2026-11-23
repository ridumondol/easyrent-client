"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CalendarRange, CreditCard, X, XCircle } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageIntro,
  StatusBadge,
  TableFrame,
  tableCellClass,
  tableHeadClass,
} from "@/components/dashboard/DashboardUI";
import {
  apiRequest,
  formatAmount,
  formatDate,
  getErrorMessage,
  type Booking,
} from "@/lib/api";
import { useApiResource } from "@/lib/useApiResource";
import { useEquipmentLabels } from "@/lib/useEquipmentLabels";

type BookingList = {
  bookings: Booking[];
  count: number;
  pagination: { currentPage: number; totalPages: number; totalItems: number };
};

function PaymentDialog({
  booking,
  equipmentName,
  onClose,
  token,
  onComplete,
}: {
  booking: Booking;
  equipmentName: string;
  onClose: () => void;
  onComplete: () => void;
  token: string | null;
}) {
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"demo_card" | "bkash_demo" | "nagad_demo">("demo_card");
  const [outcome, setOutcome] = useState<"success" | "failed" | "cancelled">("success");

  async function startCheckout() {
    setPaying(true);
    setError("");
    try {
      const { transaction } = await apiRequest<{ transaction: { status: string } }>("/payments/checkout", {
        method: "POST",
        token,
        body: { bookingId: booking._id, paymentMethod, outcome },
      });

      if (transaction.status === "success") {
        onComplete();
        return;
      }

      setError(
        transaction.status === "failed"
          ? "Demo payment failed. Your booking is still unpaid. You can try again."
          : "Demo payment was cancelled. Your booking is still unpaid.",
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#101b15]/55 p-4 backdrop-blur-sm">
      <section
        aria-labelledby="payment-dialog-title"
        aria-modal="true"
        className="my-auto w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-7"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#ec7047]">
              Demo payment
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#17271f]" id="payment-dialog-title">
              Complete payment
            </h2>
          </div>
          <button
            aria-label="Close payment dialog"
            className="grid size-9 place-items-center rounded-full bg-[#f3f5f2] text-[#647168]"
            onClick={onClose}
            type="button"
          >
            <X size={17} />
          </button>
        </div>

        <div className="mt-5 rounded-2xl bg-[#f7f8f6] p-4 text-xs">
          <p className="font-semibold text-[#17271f]">{equipmentName}</p>
          <div className="mt-2 flex justify-between text-[#77827a]">
            <span>Rental duration:</span>
            <span>{booking.totalDays} day{booking.totalDays === 1 ? "" : "s"} ({booking.quantity} unit{booking.quantity === 1 ? "" : "s"})</span>
          </div>
          <div className="mt-1 flex justify-between text-[#77827a]">
            <span>Dates:</span>
            <span>{formatDate(booking.startDate)} – {formatDate(booking.endDate)}</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-[#e8ebe7] pt-2 text-sm font-semibold text-[#17271f]">
            <span>Total amount:</span>
            <span>{formatAmount(booking.totalAmount)}</span>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <label className="block text-xs font-semibold text-[#536159]">
            Payment method
            <select
              className="mt-1.5 w-full rounded-xl border border-[#dfe5df] bg-white px-3 py-3 text-sm font-normal text-[#26352c] outline-none focus:border-[#78917f]"
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value as typeof paymentMethod)}
              disabled={paying}
            >
              <option value="demo_card">Demo Card</option>
              <option value="bkash_demo">bKash Demo</option>
              <option value="nagad_demo">Nagad Demo</option>
            </select>
          </label>
          <label className="block text-xs font-semibold text-[#536159]">
            Simulated result
            <select
              className="mt-1.5 w-full rounded-xl border border-[#dfe5df] bg-white px-3 py-3 text-sm font-normal text-[#26352c] outline-none focus:border-[#78917f]"
              value={outcome}
              onChange={(event) => setOutcome(event.target.value as typeof outcome)}
              disabled={paying}
            >
              <option value="success">Successful payment</option>
              <option value="failed">Failed payment</option>
              <option value="cancelled">Cancelled payment</option>
            </select>
          </label>
          <p className="rounded-xl bg-[#fff8e9] p-3 text-xs leading-5 text-[#85652b]">
            Demo only: no real money or bank/card details are used.
          </p>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-[#f2d5cb] bg-[#fff7f4] px-4 py-3 text-xs leading-5 text-[#a14630]" role="alert">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            className="rounded-full border border-[#dfe5df] px-4 py-2.5 text-xs font-semibold text-[#536159]"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-full bg-[#14251e] px-5 py-2.5 text-xs font-semibold text-white disabled:opacity-50"
            disabled={paying}
            onClick={() => void startCheckout()}
            type="button"
          >
            {paying ? "Processing…" : `Run demo · ${formatAmount(booking.totalAmount)}`}
          </button>
        </div>
      </section>
    </div>
  );
}

export default function CustomerBookingsPage() {
  const { token } = useAuth();
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useApiResource<BookingList>(`/bookings/my?page=${page}&limit=10`, token);
  const bookings = data?.bookings ?? [];
  const { labels: equipmentNames, error: equipmentError } = useEquipmentLabels(
    bookings.map((booking) => booking.equipmentId),
    token,
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [payingBooking, setPayingBooking] = useState<Booking | null>(null);

  async function cancelBooking(booking: Booking) {
    if (!window.confirm("Cancel this booking? Any paid amount is handled according to the booking's refund status.")) {
      return;
    }
    setBusyId(booking._id);
    setActionError("");
    try {
      await apiRequest(`/bookings/${booking._id}/cancel`, {
        method: "PATCH",
        token,
      });
      reload();
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <PageIntro
        eyebrow="Rental activity"
        title="My bookings"
        description="Review your rental dates, quantities, totals, and payment status."
        action={
          <Link
            className="inline-flex items-center gap-2 self-start rounded-full bg-[#14251e] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#263b31] sm:self-auto"
            href="/equipment"
          >
            Rent more equipment <ArrowRight size={14} />
          </Link>
        }
      />
      {actionError && (
        <div className="mb-4">
          <ErrorState message={actionError} />
        </div>
      )}
      {!loading && equipmentError && (
        <div className="mb-4">
          <ErrorState message={`Some equipment names could not be loaded. ${equipmentError}`} />
        </div>
      )}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : bookings.length === 0 ? (
        <EmptyState
          description="Your equipment bookings will show up here once you request a rental."
          icon={CalendarRange}
          title="No bookings yet"
          action={
            <Link
              className="inline-flex items-center gap-2 rounded-full bg-[#14251e] px-4 py-2.5 text-xs font-semibold text-white"
              href="/equipment"
            >
              Browse marketplace <ArrowRight size={14} />
            </Link>
          }
        />
      ) : (
        <TableFrame>
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead>
              <tr>
                <th className={tableHeadClass}>Equipment</th>
                <th className={tableHeadClass}>Rental dates</th>
                <th className={tableHeadClass}>Qty</th>
                <th className={tableHeadClass}>Total amount</th>
                <th className={tableHeadClass}>Booking</th>
                <th className={tableHeadClass}>Payment</th>
                <th className={tableHeadClass}>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const canCancel =
                  booking.bookingStatus === "pending" || booking.bookingStatus === "confirmed";
                const canPay =
                  booking.bookingStatus === "pending" && booking.paymentStatus === "unpaid";
                const eqName =
                  equipmentNames[booking.equipmentId] ?? `Equipment ${booking.equipmentId.slice(-6)}`;

                return (
                  <tr key={booking._id}>
                    <td className={tableCellClass}>
                      <p className="max-w-[200px] truncate font-semibold text-[#26352c]">
                        {eqName}
                      </p>
                      <p className="mt-1 text-[10px] text-[#909a92]">Booking #{booking._id.slice(-6)}</p>
                    </td>
                    <td className={tableCellClass}>
                      <span className="block">{formatDate(booking.startDate)}</span>
                      <span className="mt-1 block text-[10px] text-[#909a92]">to {formatDate(booking.endDate)}</span>
                    </td>
                    <td className={tableCellClass}>{booking.quantity}</td>
                    <td className={`${tableCellClass} font-semibold text-[#26352c]`}>
                      {formatAmount(booking.totalAmount)}
                    </td>
                    <td className={tableCellClass}>
                      <StatusBadge status={booking.bookingStatus} />
                    </td>
                    <td className={tableCellClass}>
                      <StatusBadge status={booking.paymentStatus} />
                    </td>
                    <td className={tableCellClass}>
                      <div className="flex items-center gap-2">
                        {canPay && (
                          <button
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#14251e] px-3 py-1.5 text-[10px] font-bold text-white transition hover:bg-[#263b31] disabled:opacity-50"
                            disabled={busyId === booking._id}
                            onClick={() => setPayingBooking(booking)}
                            type="button"
                          >
                            <CreditCard size={12} />
                            Pay now
                          </button>
                        )}
                        {canCancel && (
                          <button
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#f1d8d0] px-3 py-1.5 text-[10px] font-bold text-[#ae523b] transition hover:bg-[#fff5f1] disabled:opacity-50"
                            disabled={busyId === booking._id}
                            onClick={() => void cancelBooking(booking)}
                            type="button"
                          >
                            <XCircle size={12} />
                            {busyId === booking._id ? "Cancelling…" : "Cancel"}
                          </button>
                        )}
                        {!canPay && !canCancel && (
                          <span className="text-[10px] text-[#a0a9a2]">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableFrame>
      )}
      {!loading && !error && (data?.pagination.totalPages ?? 0) > 1 && (
        <nav aria-label="Booking history pages" className="mt-5 flex items-center justify-center gap-3">
          <button className="rounded-full border border-[#dfe5df] px-4 py-2 text-xs font-semibold disabled:opacity-40" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} type="button">Previous</button>
          <span className="text-xs text-[#68756d]">Page {page} of {data?.pagination.totalPages}</span>
          <button className="rounded-full border border-[#dfe5df] px-4 py-2 text-xs font-semibold disabled:opacity-40" disabled={page >= (data?.pagination.totalPages ?? 1)} onClick={() => setPage((current) => current + 1)} type="button">Next</button>
        </nav>
      )}

      {payingBooking && (
        <PaymentDialog
          booking={payingBooking}
          equipmentName={
            equipmentNames[payingBooking.equipmentId] ?? `Equipment ${payingBooking.equipmentId.slice(-6)}`
          }
          onClose={() => setPayingBooking(null)}
          onComplete={() => {
            setPayingBooking(null);
            reload();
          }}
          token={token}
        />
      )}
    </>
  );
}
