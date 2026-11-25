"use client";

import Link from "next/link";
import { useState } from "react";
import { notifications } from "@/lib/notifications";
import { ArrowRight, CalendarRange, CreditCard, XCircle } from "lucide-react";
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

  async function startCheckout(booking: Booking) {
    setBusyId(booking._id);
    setActionError("");
    try {
      const checkout = await apiRequest<{ checkoutUrl: string }>("/payments/checkout", {
        method: "POST",
        token,
        body: { bookingId: booking._id },
      });
      window.location.assign(checkout.checkoutUrl);
    } catch (requestError) {
      const message = getErrorMessage(requestError);
      setActionError(message);
      notifications.error(message);
      setBusyId(null);
    }
  }

  async function cancelBooking(booking: Booking) {
    if (!(await notifications.confirm("Cancel this booking? Any paid amount is handled according to the booking's refund status."))) {
      return;
    }
    setBusyId(booking._id);
    setActionError("");
    try {
      await apiRequest(`/bookings/${booking._id}/cancel`, {
        method: "PATCH",
        token,
      });
      notifications.success("Booking cancelled.");
      reload();
    } catch (requestError) {
      const message = getErrorMessage(requestError);
      setActionError(message);
      notifications.error(message);
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
                            onClick={() => void startCheckout(booking)}
                            type="button"
                          >
                            <CreditCard size={12} />
                            {busyId === booking._id ? "Opening…" : "Pay now"}
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


    </>
  );
}
