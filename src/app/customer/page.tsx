"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageIntro,
  StatCard,
  StatusBadge,
  TableFrame,
  tableCellClass,
  tableHeadClass,
} from "@/components/dashboard/DashboardUI";
import { BOOKING_STATUS, formatAmount, formatDate, type Booking, type PaymentTransaction } from "@/lib/api";
import { useApiResource } from "@/lib/useApiResource";
import { useEquipmentLabels } from "@/lib/useEquipmentLabels";

type BookingList = { bookings: Booking[]; count: number };
type PaymentList = { payments: PaymentTransaction[]; count: number };

export default function CustomerDashboardPage() {
  const { user, token } = useAuth();
  const bookingsResource = useApiResource<BookingList>("/bookings/my", token);
  const paymentsResource = useApiResource<PaymentList>("/payments/my", token);
  const bookings = bookingsResource.data?.bookings ?? [];
  const payments = paymentsResource.data?.payments ?? [];
  const recentBookings = bookings.slice(0, 5);

  const { labels: equipmentNames } = useEquipmentLabels(
    recentBookings.map((b) => b.equipmentId),
    token,
  );

  const paidTotal = bookings
    .filter((booking) => booking.paymentStatus === "paid")
    .reduce((total, booking) => total + booking.totalAmount, 0);

  const hasError = bookingsResource.error || paymentsResource.error;
  const retry = () => {
    bookingsResource.reload();
    paymentsResource.reload();
  };

  return (
    <>
      <PageIntro
        eyebrow="Your rental workspace"
        title={`Good to see you${user?.name ? `, ${user.name.split(" ")[0]}` : ""}.`}
        description="Keep an eye on your bookings, payments, and the gear you've rented."
        action={
          <Link
            className="inline-flex items-center gap-2 self-start rounded-full bg-[#14251e] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#263b31] sm:self-auto"
            href="/#featured"
          >
            Find equipment <ArrowRight size={14} />
          </Link>
        }
      />

      {bookingsResource.loading || paymentsResource.loading ? (
        <LoadingState rows={3} />
      ) : hasError ? (
        <ErrorState
          message={[bookingsResource.error, paymentsResource.error].filter(Boolean).join(" ")}
          onRetry={retry}
        />
      ) : (
        <>
          <section aria-label="Booking overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              delay={0}
              icon={CalendarDays}
              label="Total bookings"
              note="All your rental requests"
              value={bookings.length}
            />
            <StatCard
              accent
              delay={0.04}
              icon={Clock3}
              label="Pending bookings"
              note="Waiting for an owner response"
              value={bookings.filter((booking) => booking.bookingStatus === BOOKING_STATUS.PENDING).length}
            />
            <StatCard
              delay={0.08}
              icon={CheckCircle2}
              label="Completed"
              note="Rentals completed"
              value={bookings.filter((booking) => booking.bookingStatus === BOOKING_STATUS.COMPLETED).length}
            />
            <StatCard
              accent
              delay={0.12}
              icon={CreditCard}
              label="Successful payments"
              note={`Total paid ${formatAmount(paidTotal)}`}
              value={payments.filter((payment) => payment.status === "success").length}
            />
          </section>

          <section className="mt-7">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-[#17271f]">Recent bookings</h2>
                <p className="mt-1 text-xs text-[#818c84]">Your latest rental activity</p>
              </div>
              <Link className="text-xs font-bold text-[#d85f3c] hover:underline" href="/customer/bookings">
                View all
              </Link>
            </div>
            {bookings.length === 0 ? (
              <EmptyState
                description="When you request equipment, your booking status and dates will appear here."
                title="No bookings yet"
                action={
                  <Link className="inline-flex items-center gap-2 rounded-full bg-[#14251e] px-4 py-2.5 text-xs font-semibold text-white" href="/#featured">
                    Browse equipment <ArrowRight size={14} />
                  </Link>
                }
              />
            ) : (
              <TableFrame>
                <table className="w-full min-w-[640px] border-collapse text-left">
                  <thead>
                    <tr>
                      <th className={tableHeadClass}>Equipment</th>
                      <th className={tableHeadClass}>Rental period</th>
                      <th className={tableHeadClass}>Amount</th>
                      <th className={tableHeadClass}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => {
                      const eqName =
                        equipmentNames[booking.equipmentId] ??
                        `Equipment ${booking.equipmentId.slice(-6)}`;
                      return (
                        <tr key={booking._id}>
                          <td className={tableCellClass}>
                            <span className="font-semibold text-[#26352c]">
                              {eqName}
                            </span>
                          </td>
                          <td className={tableCellClass}>
                            {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
                          </td>
                          <td className={`${tableCellClass} font-semibold text-[#26352c]`}>
                            {formatAmount(booking.totalAmount)}
                          </td>
                          <td className={tableCellClass}>
                            <StatusBadge status={booking.bookingStatus} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </TableFrame>
            )}
          </section>
        </>
      )}
    </>
  );
}
