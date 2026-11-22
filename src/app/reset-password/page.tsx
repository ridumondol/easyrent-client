"use client";

import Link from "next/link";
import { useState, useSyncExternalStore, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Brand from "@/components/Brand";
import PasswordInput from "@/components/auth/PasswordInput";
import { apiRequest, getErrorMessage } from "@/lib/api";

function subscribeToResetToken(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function getResetToken() {
  return new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "";
}

function getServerResetToken() {
  return null;
}

export default function ResetPasswordPage() {
  const token = useSyncExternalStore(subscribeToResetToken, getResetToken, getServerResetToken);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);

  async function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 6 || !/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
      setError("Password must be at least 6 characters and include an uppercase and a lowercase letter.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password and confirmation do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest("/auth/reset-password", {
        method: "POST",
        body: { token, password, confirmPassword },
      });
      window.history.replaceState(window.history.state, "", window.location.pathname);
      setPassword("");
      setConfirmPassword("");
      setCompleted(true);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f8f6] px-5 py-12">
      <section className="w-full max-w-[440px] rounded-3xl border border-[#e8ebe7] bg-white p-6 shadow-sm sm:p-9">
        <Brand />
        <p className="mt-10 text-[11px] font-bold uppercase tracking-[0.16em] text-[#ec7047]">
          Account security
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#17271f]">
          Reset your password
        </h1>

        {completed ? (
          <div className="mt-7">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900" role="status">
              <p className="flex items-center gap-2 font-semibold">
                <CheckCircle2 size={17} /> Password updated
              </p>
              <p className="mt-1 text-emerald-800">Sign in with your new password to continue.</p>
            </div>
            <Link className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#14251e] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#263b31]" href="/login">
              Go to sign in
            </Link>
          </div>
        ) : token === null ? (
          <p className="mt-7 text-sm text-[#77827a]" role="status">Checking your reset link…</p>
        ) : !token ? (
          <div className="mt-7">
            <p className="rounded-xl border border-[#f2d5cb] bg-[#fff7f4] px-4 py-3 text-sm leading-6 text-[#a14630]" role="alert">
              This reset link is invalid or has expired. Request a new link to continue.
            </p>
            <Link className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#d85f3c] hover:underline" href="/forgot-password">
              Request another link
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm leading-6 text-[#77827a]">
              Choose a new password. It must include at least one uppercase and one lowercase letter.
            </p>
            <form className="mt-7 space-y-5" onSubmit={(event) => void resetPassword(event)}>
              <PasswordInput
                id="reset-new-password"
                label="New Password"
                autoComplete="new-password"
                onChange={(event) => setPassword(event.target.value)}
                value={password}
              />
              <PasswordInput
                id="reset-confirm-password"
                label="Confirm New Password"
                autoComplete="new-password"
                onChange={(event) => setConfirmPassword(event.target.value)}
                value={confirmPassword}
              />

              {error && (
                <p className="rounded-xl border border-[#f2d5cb] bg-[#fff7f4] px-4 py-3 text-xs leading-5 text-[#a14630]" role="alert">
                  {error}
                </p>
              )}

              <button
                className="w-full rounded-xl bg-[#14251e] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#263b31] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={submitting}
                type="submit"
              >
                {submitting ? "Updating password…" : "Update password"}
              </button>
            </form>
          </>
        )}

        {!completed && (
          <Link className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-[#647168] hover:text-[#14251e]" href="/login">
            <ArrowLeft size={15} /> Back to sign in
          </Link>
        )}
      </section>
    </main>
  );
}
