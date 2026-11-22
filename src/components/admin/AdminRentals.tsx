"use client";

import { CalendarDays } from "lucide-react";
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
import { formatAmount, formatDate, type Booking } from "@/lib/api";
import { useApiResource } from "@/lib/useApiResource";

type RentalsResponse = { bookings: Booking[]; count: number };

function Contact({ name, email }: { name?: string; email?: string }) {
  return (
    <span className="block min-w-[140px]">
      <span className="block font-semibold text-[#26352c]">{name ?? "Account unavailable"}</span>
      {email && <span className="mt-1 block max-w-[170px] truncate text-[10px] text-[#909a92]">{email}</span>}
    </span>
  );
}

export default function AdminRentals() {
  const { token } = useAuth();
  const { data, error, loading, reload } = useApiResource<RentalsResponse>("/admin/bookings", token);

  return (
    <>
      <PageIntro
        description="View customers, equipment owners, rental periods, payment, and booking status."
        eyebrow="Marketplace activity"
        title="All rentals"
      />
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data?.bookings.length ? (
        <EmptyState
          description="Rental records will appear here as customers book equipment."
          icon={CalendarDays}
          title="No rentals yet"
        />
      ) : (
        <TableFrame>
          <table className="w-full min-w-[1100px] border-collapse text-left">
            <thead>
              <tr>
                <th className={tableHeadClass}>Customer</th>
                <th className={tableHeadClass}>Owner</th>
                <th className={tableHeadClass}>Equipment</th>
                <th className={tableHeadClass}>Rental period</th>
                <th className={tableHeadClass}>Amount</th>
                <th className={tableHeadClass}>Payment</th>
                <th className={tableHeadClass}>Booking</th>
              </tr>
            </thead>
            <tbody>
              {data.bookings.map((booking) => (
                <tr key={booking._id}>
                  <td className={tableCellClass}>
                    <Contact email={booking.renter?.email} name={booking.renter?.name} />
                  </td>
                  <td className={tableCellClass}>
                    <Contact email={booking.owner?.email} name={booking.owner?.name} />
                  </td>
                  <td className={`${tableCellClass} font-semibold text-[#26352c]`}>
                    {booking.equipment?.title ?? "Equipment unavailable"}
                  </td>
                  <td className={tableCellClass}>
                    <span className="block">
                      {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
                    </span>
                    <span className="mt-1 block text-[10px] text-[#909a92]">
                      {booking.totalDays} days · {booking.quantity} unit{booking.quantity === 1 ? "" : "s"}
                    </span>
                  </td>
                  <td className={`${tableCellClass} font-semibold text-[#26352c]`}>
                    {formatAmount(booking.totalAmount)}
                  </td>
                  <td className={tableCellClass}><StatusBadge status={booking.paymentStatus} /></td>
                  <td className={tableCellClass}><StatusBadge status={booking.bookingStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableFrame>
      )}
    </>
  );
}
