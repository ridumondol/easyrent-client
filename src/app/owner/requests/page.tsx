"use client";

import { useState } from "react";
import { ClipboardList, Check, XCircle, CheckCircle2 } from "lucide-react";
import { notifications } from "@/lib/notifications";
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

type BookingList = { bookings: Booking[]; count: number };
type FilterTab = "all" | "pending" | "confirmed" | "completed" | "cancelled";

export default function OwnerRequestsPage() {
  const { token } = useAuth();
  const { data, error, loading, reload } = useApiResource<BookingList>("/bookings/owner", token);
  const bookings = data?.bookings ?? [];
  const { labels: equipmentNames, error: equipmentError } = useEquipmentLabels(
    bookings.map((booking) => booking.equipmentId),
    token,
  );
  const [filter, setFilter] = useState<FilterTab>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    return booking.bookingStatus === filter;
  });

  async function updateBooking(booking: Booking, bookingStatus: Booking["bookingStatus"]) {
    const confirmation =
      bookingStatus === "cancelled"
        ? booking.bookingStatus === "pending"
          ? "Reject this rental request?"
          : "Cancel this confirmed rental?"
        : bookingStatus === "completed"
          ? "Mark this rental as completed?"
          : "Confirm this rental request?";
    if (!(await notifications.confirm(confirmation))) return;

    setBusyId(booking._id);
    setActionError("");
    try {
      await apiRequest(`/bookings/${booking._id}/status`, {
        method: "PATCH",
        token,
        body: { bookingStatus },
      });
      notifications.success(
        bookingStatus === "confirmed"
          ? "Booking confirmed"
          : bookingStatus === "completed"
            ? "Rental completed"
            : "Booking cancelled",
      );
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
        eyebrow="Manage incoming rentals"
        title="Rental requests"
        description="Review renter contact details and move each request through its eligible booking states."
      />
      {actionError && (
        <div className="mb-4"><ErrorState message={actionError} /></div>
      )}
      {!loading && equipmentError && (
        <div className="mb-4">
          <ErrorState message={`Some equipment names could not be loaded. ${equipmentError}`} />
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", "pending", "confirmed", "completed", "cancelled"] as FilterTab[]).map((tab) => {
          const count =
            tab === "all"
              ? bookings.length
              : bookings.filter((b) => b.bookingStatus === tab).length;
          const isActive = filter === tab;
          return (
            <button
              className={`rounded-full px-4 py-2 text-xs font-semibold capitalize transition ${
                isActive
                  ? "bg-[#14251e] text-white shadow-sm"
                  : "border border-[#e1e7e1] bg-white text-[#536159] hover:bg-[#f4f6f3]"
              }`}
              key={tab}
              onClick={() => setFilter(tab)}
              type="button"
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          description={
            filter === "all"
              ? "Requests from renters will appear here when someone books your equipment."
              : `No ${filter} rental requests found.`
          }
          icon={ClipboardList}
          title={filter === "all" ? "No rental requests" : `No ${filter} requests`}
        />
      ) : (
        <TableFrame>
          <table className="w-full min-w-[1120px] border-collapse text-left">
            <thead>
              <tr>
                <th className={tableHeadClass}>Renter & equipment</th>
                <th className={tableHeadClass}>Rental dates</th>
                <th className={tableHeadClass}>Qty / amount</th>
                <th className={tableHeadClass}>Booking</th>
                <th className={tableHeadClass}>Payment</th>
                <th className={tableHeadClass}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking._id}>
                  <td className={tableCellClass}>
                    <p className="max-w-[240px] truncate font-semibold text-[#26352c]">
                      {equipmentNames[booking.equipmentId] ?? `Equipment ${booking.equipmentId.slice(-6)}`}
                    </p>
                    <p className="mt-1 text-[10px] text-[#909a92]">Renter #{booking.renterId.slice(-8)}</p>
                    <p className="mt-1 text-[10px] text-[#647168]">{booking.phone}</p>
                    <p className="mt-1 max-w-[240px] truncate text-[10px] text-[#818c84]">{booking.address}</p>
                    {booking.notes && (
                      <p className="mt-1 max-w-[240px] truncate italic text-[10px] text-[#818c84]">
                        &quot;{booking.notes}&quot;
                      </p>
                    )}
                  </td>
                  <td className={tableCellClass}>
                    <span className="block">{formatDate(booking.startDate)}</span>
                    <span className="mt-1 block text-[10px] text-[#909a92]">to {formatDate(booking.endDate)}</span>
                  </td>
                  <td className={tableCellClass}>
                    <span className="block">{booking.quantity} item{booking.quantity === 1 ? "" : "s"}</span>
                    <span className="mt-1 block font-semibold text-[#26352c]">{formatAmount(booking.totalAmount)}</span>
                  </td>
                  <td className={tableCellClass}>
                    <StatusBadge status={booking.bookingStatus} />
                  </td>
                  <td className={tableCellClass}>
                    <StatusBadge status={booking.paymentStatus} />
                  </td>
                  <td className={tableCellClass}>
                    {booking.bookingStatus === "pending" ? (
                      <div className="flex items-center gap-2">
                        <button
                          className="inline-flex items-center gap-1 rounded-full bg-[#e9f5ec] px-3 py-1.5 text-[10px] font-bold text-[#357148] transition hover:bg-[#d5eedb] disabled:opacity-50"
                          disabled={busyId === booking._id}
                          onClick={() => void updateBooking(booking, "confirmed")}
                          type="button"
                        >
                          <Check size={12} /> Confirm
                        </button>
                        <button
                          className="inline-flex items-center gap-1 rounded-full bg-[#fff0ec] px-3 py-1.5 text-[10px] font-bold text-[#b74e34] transition hover:bg-[#ffe3dc] disabled:opacity-50"
                          disabled={busyId === booking._id}
                          onClick={() => void updateBooking(booking, "cancelled")}
                          type="button"
                        >
                          <XCircle size={12} /> Reject
                        </button>
                      </div>
                    ) : booking.bookingStatus === "confirmed" ? (
                      <div className="flex items-center gap-2">
                        <button
                          className="inline-flex items-center gap-1 rounded-full bg-[#edf3ee] px-3 py-1.5 text-[10px] font-bold text-[#31513c] transition hover:bg-[#dbe7dc] disabled:opacity-50"
                          disabled={busyId === booking._id}
                          onClick={() => void updateBooking(booking, "completed")}
                          type="button"
                        >
                          <CheckCircle2 size={12} /> Complete
                        </button>
                        <button
                          className="inline-flex items-center gap-1 rounded-full border border-[#f1d8d0] px-3 py-1.5 text-[10px] font-bold text-[#ae523b] transition hover:bg-[#fff5f1] disabled:opacity-50"
                          disabled={busyId === booking._id}
                          onClick={() => void updateBooking(booking, "cancelled")}
                          type="button"
                        >
                          <XCircle size={12} /> Cancel
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-[#a0a9a2]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableFrame>
      )}
    </>
  );
}
