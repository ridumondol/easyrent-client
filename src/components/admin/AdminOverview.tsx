"use client";

import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CalendarDays,
  CircleDollarSign,
  ClipboardCheck,
  UsersRound,
} from "lucide-react";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageIntro,
  StatCard,
} from "@/components/dashboard/DashboardUI";
import { useAuth } from "@/components/auth/AuthProvider";
import { formatAmount, type AdminOverview as OverviewData } from "@/lib/api";
import { useApiResource } from "@/lib/useApiResource";

type OverviewResponse = { overview: OverviewData };

function MonthlyBookingsChart({
  values,
}: {
  values: OverviewData["monthlyBookings"];
}) {
  const maximum = Math.max(1, ...values.map((item) => item.bookings));
  const chartHeight = 142;
  const chartTop = 18;
  const chartBottom = chartTop + chartHeight;

  return (
    <section className="rounded-2xl border border-[#e8ebe7] bg-white p-5 shadow-[0_5px_22px_rgba(27,45,34,0.025)] sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#17271f]">Booking activity</h2>
          <p className="mt-1 text-xs text-[#818c84]">Monthly bookings over the last 12 months</p>
        </div>
        <span className="rounded-full bg-[#edf3ee] px-3 py-1.5 text-[10px] font-bold text-[#42614b]">
          Last 12 months
        </span>
      </div>

      {values.length === 0 ? (
        <EmptyState
          description="Monthly booking activity will appear here as rentals are created."
          title="No booking data yet"
        />
      ) : (
        <div className="mt-5 overflow-x-auto">
          <svg
            aria-label="Monthly booking activity chart"
            className="h-[230px] min-w-[660px] w-full"
            role="img"
            viewBox="0 0 720 210"
          >
            <desc>Bar chart showing the number of bookings for each of the last 12 months. The following table provides the same values.</desc>
            {[0, 1, 2, 3].map((line) => {
              const y = chartTop + (chartHeight / 3) * line;
              return (
                <line
                  key={line}
                  stroke="#edf0ec"
                  strokeDasharray={line === 3 ? undefined : "3 5"}
                  x1="20"
                  x2="700"
                  y1={y}
                  y2={y}
                />
              );
            })}
            {values.map((item, index) => {
              const width = 32;
              const x = 30 + index * 56;
              const height = item.bookings > 0
                ? Math.max(5, (item.bookings / maximum) * chartHeight)
                : 2;
              const monthName = new Intl.DateTimeFormat(undefined, { month: "short" })
                .format(new Date(`${item.month}-01T00:00:00Z`));
              return (
                <g key={item.month}>
                  <text
                    fill="#879188"
                    fontSize="10"
                    textAnchor="middle"
                    x={x + width / 2}
                    y={Math.max(12, chartBottom - height - 7)}
                  >
                    {item.bookings}
                  </text>
                  <rect
                    fill={index === values.length - 1 ? "#ed7049" : "#b9cbbd"}
                    height={height}
                    rx="6"
                    width={width}
                    x={x}
                    y={chartBottom - height}
                  />
                  <text
                    fill="#879188"
                    fontSize="10"
                    textAnchor="middle"
                    x={x + width / 2}
                    y="190"
                  >
                    {monthName}
                  </text>
                </g>
              );
            })}
          </svg>
          <table className="mt-4 w-full text-left text-sm">
            <caption className="sr-only">Monthly booking values</caption>
            <thead>
              <tr>
                <th className="border-b border-[#e8ebe7] px-3 py-2" scope="col">Month</th>
                <th className="border-b border-[#e8ebe7] px-3 py-2" scope="col">Bookings</th>
              </tr>
            </thead>
            <tbody>
              {values.map((item) => (
                <tr key={item.month}>
                  <td className="border-b border-[#edf0ec] px-3 py-2">{item.month}</td>
                  <td className="border-b border-[#edf0ec] px-3 py-2">{item.bookings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function AdminOverview() {
  const { user, token } = useAuth();
  const { data, error, loading, reload } = useApiResource<OverviewResponse>(
    "/admin/overview",
    token,
  );
  const overview = data?.overview;

  return (
    <>
      <PageIntro
        description="A clear view of marketplace activity, inventory approvals, and rental revenue."
        eyebrow="EasyRent administration"
        title={`Welcome${user?.name ? `, ${user.name.split(" ")[0]}` : ""}.`}
        action={
          <Link
            className="inline-flex items-center gap-2 self-start rounded-full bg-[#14251e] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#263b31] sm:self-auto"
            href="/admin/equipment"
          >
            Review equipment <ArrowRight size={14} />
          </Link>
        }
      />

      {loading ? (
        <LoadingState rows={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : overview ? (
        <>
          <section aria-label="Marketplace overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={UsersRound}
              label="Total users"
              note="Registered marketplace accounts"
              value={overview.totalUsers}
            />
            <StatCard
              delay={0.04}
              icon={Boxes}
              label="Total equipment"
              note="All submitted listings"
              value={overview.totalEquipment}
            />
            <StatCard
              delay={0.08}
              icon={CalendarDays}
              label="Total bookings"
              note="All rental requests"
              value={overview.totalBookings}
            />
            <StatCard
              accent
              delay={0.12}
              icon={ClipboardCheck}
              label="Pending approvals"
              note="Equipment waiting for review"
              value={overview.pendingEquipmentApprovals}
            />
            <StatCard
              delay={0.16}
              icon={CalendarDays}
              label="Completed rentals"
              note="Successfully completed bookings"
              value={overview.completedRentals}
            />
            <StatCard
              delay={0.2}
              icon={CircleDollarSign}
              label="Confirmed booking value"
              note="Confirmed/completed bookings; includes unpaid"
              value={formatAmount(overview.confirmedBookingValue)}
            />
            <StatCard
              accent
              delay={0.24}
              icon={CircleDollarSign}
              label="Total revenue"
              note="Successful paid bookings only"
              value={formatAmount(overview.totalRevenue)}
            />
          </section>
          <div className="mt-6">
            <MonthlyBookingsChart values={overview.monthlyBookings} />
          </div>
        </>
      ) : (
        <ErrorState message="The server returned an incomplete admin overview." onRetry={reload} />
      )}
    </>
  );
}
