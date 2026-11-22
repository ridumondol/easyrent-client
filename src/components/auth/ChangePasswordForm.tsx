"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import PasswordInput from "@/components/auth/PasswordInput";
import { apiRequest, getErrorMessage } from "@/lib/api";

type ChangePasswordResponse = { token: string };

export default function ChangePasswordForm() {
  const { user, token, rotateToken } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaved(false);

    if (newPassword.length < 6 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword)) {
      setError("New password must be at least 6 characters and include an uppercase and a lowercase letter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setSaving(true);
    try {
      const result = await apiRequest<ChangePasswordResponse>("/auth/change-password", {
        method: "POST",
        token,
        body: { currentPassword, newPassword, confirmPassword },
      });
      rotateToken(result.token);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSaved(true);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="max-w-5xl rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
      <div className="mb-6 border-b border-neutral-100 pb-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-900">
          <KeyRound size={18} className="text-emerald-800" />
          Change Password
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          Changing your password signs out other active sessions.
        </p>
      </div>

      {user?.authProvider && user.authProvider !== "email" ? (
        <p className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600" role="status">
          This account uses {user.authProvider} sign-in and does not have a password to change.
        </p>
      ) : (
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => void changePassword(event)}>
          <PasswordInput
            id="current-password"
            label="Current Password"
            autoComplete="current-password"
            onChange={(event) => setCurrentPassword(event.target.value)}
            value={currentPassword}
          />
          <div className="hidden sm:block" />
          <PasswordInput
            id="new-password"
            label="New Password"
            autoComplete="new-password"
            onChange={(event) => setNewPassword(event.target.value)}
            value={newPassword}
          />
          <PasswordInput
            id="confirm-new-password"
            label="Confirm New Password"
            autoComplete="new-password"
            onChange={(event) => setConfirmPassword(event.target.value)}
            value={confirmPassword}
          />

          <p className="text-[11px] leading-5 text-neutral-500 sm:col-span-2">
            Use at least 6 characters with one uppercase and one lowercase letter.
          </p>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 sm:col-span-2" role="alert">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {saved && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800 sm:col-span-2" role="status">
              <CheckCircle2 size={15} className="shrink-0" />
              <span>Password changed. This device remains signed in; other sessions were signed out.</span>
            </div>
          )}

          <div className="flex justify-end sm:col-span-2">
            <button
              className="rounded-full bg-emerald-800 px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={saving}
              type="submit"
            >
              {saving ? "Updating password…" : "Update Password"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
