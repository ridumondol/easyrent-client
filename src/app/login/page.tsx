"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Brand from "@/components/Brand";
import { useAuth } from "@/components/auth/AuthProvider";
import { getErrorMessage } from "@/lib/api";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import GitHubSignInButton from "@/components/auth/GitHubSignInButton";
import PasswordInput from "@/components/auth/PasswordInput";

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [{ loginReason, nextPath }] = useState(() => {
    if (typeof window === "undefined") return { loginReason: "", nextPath: "" };
    const params = new URLSearchParams(window.location.search);
    return {
      loginReason: params.get("reason") === "equipment" ? "Sign in to view equipment details and make a rental booking." : "",
      nextPath: params.get("next") ?? "",
    };
  });

  useEffect(() => {
    if (!loading && user) {
      const rolePath = user.role === "admin" ? "/admin" : user.role === "owner" ? "/owner" : user.role === "renter" ? "/customer" : "/";
      router.replace(nextPath.startsWith("/") ? nextPath : rolePath);
    }
  }, [loading, nextPath, router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const signedInUser = await login({ email, password });
      const rolePath = signedInUser.role === "admin" ? "/admin" : signedInUser.role === "owner" ? "/owner" : signedInUser.role === "renter" ? "/customer" : "/";
      router.replace(nextPath.startsWith("/") ? nextPath : rolePath);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main id="main-content" className="grid min-h-screen bg-[#f7f8f6] lg:grid-cols-[1fr_0.85fr]">
      <section className="flex flex-col justify-between bg-[#14251e] px-6 py-7 text-white sm:px-12 lg:px-16 lg:py-12">
        <Brand light />
        <div className="my-12 max-w-xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#f58a66]">
            Good gear. Good work.
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.06em] sm:text-6xl">
            Make room for your next big idea.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/60 sm:text-base">
            Sign in to manage your rentals, equipment, and everything moving your work forward.
          </p>
        </div>
        <Link className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white" href="/">
          <ArrowLeft size={16} /> Back to marketplace
        </Link>
      </section>

      <section className="grid place-items-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-[420px] min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#ec7047]">
            Welcome back
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#17271f]">
            Sign in to Rentora
          </h2>
          <p className="mt-2 text-sm text-[#77827a]">
            Use the account you registered with Rentora.
          </p>
          {loginReason && (
            <p className="mt-5 rounded-xl border border-[#f2d5cb] bg-[#fff7f4] px-4 py-3 text-sm leading-6 text-[#713a2c]" role="status">
              {loginReason}
            </p>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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
            <div>
              <div className="mb-[-18px] flex justify-end">
                <Link className="relative z-10 text-xs font-semibold text-[#d85f3c] hover:underline" href="/forgot-password">
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="login-password"
                label="Password"
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                value={password}
              />
            </div>
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
              {submitting ? "Signing in…" : "Sign in"}
              {!submitting && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-[#9aa39c]"><span className="h-px flex-1 bg-[#e8ebe7]" />or continue with<span className="h-px flex-1 bg-[#e8ebe7]" /></div>
          <div className="space-y-3">
            <GoogleSignInButton />
            <GitHubSignInButton />
          </div>

          <p className="mt-6 text-center text-sm text-[#77827a]">
            New to Rentora?{" "}
            <Link className="font-semibold text-[#d85f3c] hover:underline" href="/register">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
