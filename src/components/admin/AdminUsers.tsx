"use client";

import { useState } from "react";
import { ShieldCheck, UsersRound } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageIntro,
  TableFrame,
  tableCellClass,
  tableHeadClass,
} from "@/components/dashboard/DashboardUI";
import {
  apiRequest,
  formatDate,
  getErrorMessage,
  type User,
  type UserRole,
} from "@/lib/api";
import { useApiResource } from "@/lib/useApiResource";

type UsersResponse = { users: User[]; count: number };
const roles: UserRole[] = ["renter", "owner", "admin"];

export default function AdminUsers() {
  const { user: currentUser, token } = useAuth();
  const { data, error, loading, reload } = useApiResource<UsersResponse>("/admin/users", token);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  async function changeRole(target: User, role: UserRole) {
    if (target.role === role) return;
    setSavingId(target._id);
    setActionError("");
    try {
      await apiRequest(`/admin/users/${target._id}/role`, {
        method: "PATCH",
        token,
        body: { role },
      });
      reload();
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <>
      <PageIntro
        description="Review registered accounts and manage marketplace access levels."
        eyebrow="Marketplace accounts"
        title="All users"
      />
      {actionError && <div className="mb-4"><ErrorState message={actionError} /></div>}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data?.users.length ? (
        <EmptyState
          description="Registered users will appear here when they create an account."
          icon={UsersRound}
          title="No users found"
        />
      ) : (
        <TableFrame>
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead>
              <tr>
                <th className={tableHeadClass}>User</th>
                <th className={tableHeadClass}>Role</th>
                <th className={tableHeadClass}>Registered</th>
                <th className={tableHeadClass}>Access</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((account) => {
                const isCurrentUser = account._id === currentUser?._id;
                return (
                  <tr key={account._id}>
                    <td className={tableCellClass}>
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#edf3ee] text-sm font-bold text-[#42614b]">
                          {account.name.slice(0, 1).toUpperCase()}
                        </span>
                        <span className="min-w-0">
                          <span className="block max-w-[220px] truncate font-semibold text-[#26352c]">
                            {account.name}{isCurrentUser ? " (you)" : ""}
                          </span>
                          <span className="mt-1 block max-w-[260px] truncate text-[11px] text-[#909a92]">
                            {account.email}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className={`${tableCellClass} capitalize`}>{account.role}</td>
                    <td className={tableCellClass}>
                      {account.createdAt ? formatDate(account.createdAt) : "—"}
                    </td>
                    <td className={tableCellClass}>
                      <label className="flex items-center gap-2">
                        <span className="sr-only">Role for {account.name}</span>
                        <ShieldCheck aria-hidden="true" className="text-[#879188]" size={15} />
                        <select
                          aria-label={`Role for ${account.name}`}
                          className="rounded-lg border border-[#dfe5df] bg-white px-2.5 py-2 text-xs capitalize text-[#34483b] outline-none focus:border-[#718b78] disabled:cursor-not-allowed disabled:bg-[#f5f6f4] disabled:opacity-60"
                          disabled={isCurrentUser || savingId === account._id}
                          onChange={(event) => void changeRole(account, event.target.value as UserRole)}
                          value={account.role}
                        >
                          {roles.map((role) => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                        {savingId === account._id && (
                          <span aria-live="polite" className="text-[10px] text-[#879188]">Saving</span>
                        )}
                      </label>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableFrame>
      )}
    </>
  );
}
