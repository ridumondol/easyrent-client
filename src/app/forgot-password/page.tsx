"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import Brand from "@/components/Brand";
import { ApiError, apiRequest, getErrorMessage } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function requestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: { email },
      });
      setSubmitted(true);
    } catch (requestError) {
      const message = getErrorMessage(requestError);
      setError(
        requestError instanceof ApiError && requestError.status === 503
          ? `${message} No reset email was sent.`
          : message,
      );
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
          Forgot your password?
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#77827a]">
          Enter your account email and we’ll send a secure link if an account is eligible for password reset.
        </p>

        {submitted ? (
          <div className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900" role="status">
            <p className="flex items-center gap-2 font-semibold">
              <CheckCircle2 size={17} /> Check your inbox
            </p>
            <p className="mt-1 text-emerald-800">
              If an account exists for that email, a password reset link will be sent. The link expires in 15 minutes.
            </p>
          </div>
        ) : (
          <form className="mt-7 space-y-5" onSubmit={(event) => void requestReset(event)}>
            <label className="block">
              <span className="text-xs font-semibold text-[#34483b]">Email address</span>
              <input
                autoComplete="email"
                className="mt-2 w-full rounded-xl border border-[#dfe5df] bg-white px-4 py-3.5 text-sm text-[#17271f] outline-none transition focus:border-[#718b78]"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </label>

            {error && (
              <p className="rounded-xl border border-[#f2d5cb] bg-[#fff7f4] px-4 py-3 text-xs leading-5 text-[#a14630]" role="alert">
                {error}
              </p>
            )}

            <button
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#14251e] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#263b31] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={submitting}
              type="submit"
            >
              {submitting ? "Sending…" : "Send reset link"}
              {!submitting && <ArrowRight size={16} />}
            </button>
          </form>
        )}

        <Link className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-[#647168] hover:text-[#14251e]" href="/login">
          <ArrowLeft size={15} /> Back to sign in
        </Link>
      </section>
    </main>
  );
}
