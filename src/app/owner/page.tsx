"use client";

import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  RefreshCw,
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
import { formatAmount, formatDate, type Booking, type Equipment } from "@/lib/api";
import { useApiResource } from "@/lib/useApiResource";
import { useEquipmentLabels } from "@/lib/useEquipmentLabels";

type BookingList = { bookings: Booking[]; count: number };
type EquipmentList = { equipment: Equipment[]; count: number };

function OwnerMonthlyEarningsChart({ bookings }: { bookings: Booking[] }) {
  const months: { month: string; label: string; earnings: number; count: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const monthKey = d.toISOString().slice(0, 7);
    const label = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
    months.push({ month: monthKey, label, earnings: 0, count: 0 });
  }

  bookings.forEach((b) => {
    const key = (b.createdAt ? new Date(b.createdAt) : new Date(b.startDate)).toISOString().slice(0, 7);
    const m = months.find((item) => item.month === key);
    if (m) {
      m.count += 1;
      if (b.paymentStatus === "paid") {
        m.earnings += b.totalAmount;
      }
    }
  });

  const maxEarnings = Math.max(100, ...months.map((m) => m.earnings));
  const chartHeight = 120;

  return (
    <section className="mt-7 rounded-2xl border border-[#e8ebe7] bg-white p-5 shadow-[0_5px_22px_rgba(27,45,34,0.025)] sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#17271f]">Monthly revenue & rental volume</h2>
          <p className="mt-1 text-xs text-[#818c84]">Earnings and booking requests across your active listings</p>
        </div>
        <span className="rounded-full bg-[#edf3ee] px-3 py-1.5 text-[10px] font-bold text-[#42614b]">
          Last 6 months
        </span>
      </div>

      <div className="mt-5 overflow-x-auto">
        <svg
          aria-label="Owner monthly earnings chart"
          className="h-[180px] min-w-[500px] w-full"
          role="img"
          viewBox="0 0 600 170"
        >
          {[0, 1, 2].map((line) => {
            const y = 20 + (chartHeight / 2) * line;
            return (
              <line
                key={line}
                stroke="#edf0ec"
                strokeDasharray={line === 2 ? undefined : "3 5"}
                x1="20"
                x2="580"
                y1={y}
                y2={y}
              />
            );
          })}
          {months.map((m, idx) => {
            const width = 42;
            const x = 45 + idx * 90;
            const height = m.earnings > 0 ? Math.max(8, (m.earnings / maxEarnings) * chartHeight) : 4;
            const y = 20 + chartHeight - height;
            return (
              <g key={m.month}>
                <text
                  fill="#879188"
                  fontSize="10"
                  textAnchor="middle"
                  x={x + width / 2}
                  y={Math.max(14, y - 6)}
                >
                  ${Math.round(m.earnings)}
                </text>
                <rect
                  fill={idx === months.length - 1 ? "#1b3b2b" : "#4c7856"}
                  height={height}
                  rx="6"
                  width={width}
                  x={x}
                  y={y}
                />
                <text
                  fill="#879188"
                  fontSize="11"
                  textAnchor="middle"
                  x={x + width / 2}
                  y="160"
                >
                  {m.label} ({m.count})
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}

export default function OwnerDashboardPage() {
  const { user, token } = useAuth();
  const equipmentResource = useApiResource<EquipmentList>("/equipment/my", token);
  const bookingsResource = useApiResource<BookingList>("/bookings/owner", token);
  const equipment = equipmentResource.data?.equipment ?? [];
  const bookings = bookingsResource.data?.bookings ?? [];
  const recentBookings = bookings.slice(0, 5);

  const { labels: equipmentNames } = useEquipmentLabels(
    recentBookings.map((b) => b.equipmentId),
    token,
  );

  const earnings = bookings
    .filter((booking) => booking.paymentStatus === "paid")
    .reduce((total, booking) => total + booking.totalAmount, 0);
  const confirmedRentalValue = bookings
    .filter((booking) => booking.bookingStatus === "confirmed" || booking.bookingStatus === "completed")
    .reduce((total, booking) => total + booking.totalAmount, 0);

  const retry = () => {
    equipmentResource.reload();
    bookingsResource.reload();
  };
  const error = [equipmentResource.error, bookingsResource.error].filter(Boolean).join(" ");

  return (
    <>
      <PageIntro
        eyebrow="Your owner workspace"
        title={`Welcome${user?.name ? `, ${user.name.split(" ")[0]}` : ""}.`}
        description="Manage your equipment, respond to rental requests, and track confirmed booking value and payments."
        action={
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              className="inline-flex items-center gap-2 rounded-full border border-[#dfe5df] bg-white px-4 py-3 text-xs font-semibold text-[#34483b] transition hover:bg-[#f4f6f3] disabled:opacity-50"
              disabled={equipmentResource.loading || bookingsResource.loading}
              onClick={retry}
              type="button"
            >
              <RefreshCw size={14} /> Refresh totals
            </button>
            <Link
              className="inline-flex items-center gap-2 rounded-full bg-[#14251e] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#263b31]"
              href="/owner/equipment"
            >
              Manage equipment <ArrowRight size={14} />
            </Link>
          </div>
        }
      />

      {equipmentResource.loading || bookingsResource.loading ? (
        <LoadingState rows={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : (
        <>
          <section aria-label="Owner overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              icon={Boxes}
              label="Total equipment"
              note="Listings in your account"
              value={equipment.length}
            />
            <StatCard
              accent
              delay={0.04}
              icon={Clock3}
              label="Pending equipment"
              note="Awaiting marketplace approval"
              value={equipment.filter((item) => item.approvalStatus === "pending").length}
            />
            <StatCard
              delay={0.08}
              icon={CalendarDays}
              label="Rental requests"
              note="Bookings for your equipment"
              value={bookings.length}
            />
            <StatCard
              delay={0.12}
              icon={CircleDollarSign}
              label="Confirmed rental value"
              note="Confirmed/completed bookings; includes unpaid"
              value={formatAmount(confirmedRentalValue)}
            />
            <StatCard
              accent
              delay={0.16}
              icon={CircleDollarSign}
              label="Paid rental value"
              note="Based on currently paid bookings"
              value={formatAmount(earnings)}
            />
          </section>

          <OwnerMonthlyEarningsChart bookings={bookings} />

          <section className="mt-7">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-[#17271f]">Latest rental requests</h2>
                <p className="mt-1 text-xs text-[#818c84]">New activity from renters</p>
              </div>
              <Link className="text-xs font-bold text-[#d85f3c] hover:underline" href="/owner/requests">
                Manage requests
              </Link>
            </div>
            {bookings.length === 0 ? (
              <EmptyState
                action={
                  <Link
                    className="inline-flex items-center gap-2 rounded-full border border-[#dfe5df] px-4 py-2.5 text-xs font-semibold text-[#34483b]"
                    href="/owner/equipment"
                  >
                    View my equipment <ArrowRight size={14} />
                  </Link>
                }
                description="Rental requests will appear here when someone books your equipment."
                title="No rental requests yet"
              />
            ) : (
              <TableFrame>
                <table className="w-full min-w-[640px] border-collapse text-left">
                  <thead>
                    <tr>
                      <th className={tableHeadClass}>Equipment</th>
                      <th className={tableHeadClass}>Dates</th>
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
