"use client";

import { CreditCard } from "lucide-react";
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
import { formatAmount, formatDate, type PaymentTransaction } from "@/lib/api";
import { useApiResource } from "@/lib/useApiResource";

type PaymentList = { payments: PaymentTransaction[]; count: number };

export default function CustomerPaymentsPage() {
  const { token } = useAuth();
  const { data, error, loading, reload } = useApiResource<PaymentList>("/payments/my", token);
  const payments = data?.payments ?? [];

  return (
    <>
      <PageIntro
        eyebrow="Transactions"
        title="Payment history"
        description="Review payment transactions tied to your equipment bookings."
      />
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : payments.length === 0 ? (
        <EmptyState
          description="Completed and pending Stripe Checkout transactions will appear here."
          icon={CreditCard}
          title="No payment transactions"
        />
      ) : (
        <TableFrame>
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr>
                <th className={tableHeadClass}>Transaction</th>
                <th className={tableHeadClass}>Booking</th>
                <th className={tableHeadClass}>Amount</th>
                <th className={tableHeadClass}>Provider</th>
                <th className={tableHeadClass}>Status</th>
                <th className={tableHeadClass}>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.transactionId}>
                  <td className={`${tableCellClass} font-mono text-[10px]`}>
                    {payment.transactionId}
                  </td>
                  <td className={tableCellClass}>#{payment.bookingId.slice(-8)}</td>
                  <td className={`${tableCellClass} font-semibold text-[#26352c]`}>
                    {formatAmount(payment.amount)}
                  </td>
                  <td className={tableCellClass}>{payment.paymentMethod ?? "Stripe Checkout"}</td>
                  <td className={tableCellClass}>
                    <StatusBadge status={payment.status} />
                  </td>
                  <td className={tableCellClass}>{formatDate(payment.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableFrame>
      )}
      <p className="mt-4 rounded-xl bg-[#f7f8f6] px-4 py-3 text-xs leading-5 text-[#68756d]">
        Payments are processed through Stripe Checkout. Use test-mode credentials
        locally; Stripe test payments do not charge a real card.
      </p>
    </>
  );
}
