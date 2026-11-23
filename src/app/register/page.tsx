"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle } from "lucide-react";
import toast from "react-hot-toast";
import Brand from "@/components/Brand";
import { useAuth } from "@/components/auth/AuthProvider";
import { getErrorMessage } from "@/lib/api";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import GitHubSignInButton from "@/components/auth/GitHubSignInButton";
import PasswordInput from "@/components/auth/PasswordInput";
import Image from "next/image";

export default function RegisterPage() {
  const { user, loading, register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"renter" | "owner">("renter");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace(
        user.role === "admin"
          ? "/admin"
          : user.role === "owner"
            ? "/owner"
            : user.role === "renter"
              ? "/customer"
              : "/",
      );
    }
  }, [loading, router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 6 || !/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
      const message = "Password must be at least 6 characters and include an uppercase and a lowercase letter.";
      setError(message);
      toast.error(message);
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const createdUser = await register({ name, email, password, role, image: image.trim() });
      router.replace(
        createdUser.role === "admin"
          ? "/admin"
          : createdUser.role === "owner"
            ? "/owner"
            : createdUser.role === "renter"
              ? "/customer"
              : "/",
      );
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
            A better way to get equipped
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.06em] sm:text-6xl">
            Rent what you need. Share what you own.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/60 sm:text-base">
            Join a local equipment community built for people who make things happen.
          </p>
        </div>
        <Link className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white" href="/">
          <ArrowLeft size={16} /> Back to marketplace
        </Link>
      </section>

      <section className="grid place-items-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-[420px] min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#ec7047]">
            Get started
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#17271f]">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-[#77827a]">
            Choose how you’d like to use the marketplace.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-xs font-semibold text-[#34483b]">Profile photo URL <span className="font-normal text-[#909a92]">(optional)</span></span>
              <input
                autoComplete="url"
                className="mt-2 w-full rounded-xl border border-[#dfe5df] bg-white px-4 py-3.5 text-sm text-[#17271f] outline-none focus:border-[#718b78]"
                onChange={(event) => setImage(event.target.value)}
                placeholder="https://example.com/photo.jpg"
                type="url"
                value={image}
              />
              {image.trim() && (
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#e2e7e2] p-2">
                  <div className="relative size-12 overflow-hidden rounded-full bg-[#edf0ec]">
                    <Image alt="Profile photo preview" fill sizes="48px" src={image.trim()} unoptimized />
                  </div>
                  <p className="text-xs text-[#68756d]">Profile photo preview</p>
                </div>
              )}
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-[#34483b]">Full name</span>
              <input
                autoComplete="name"
                className="mt-2 w-full rounded-xl border border-[#dfe5df] bg-white px-4 py-3.5 text-sm text-[#17271f] outline-none focus:border-[#718b78]"
                minLength={2}
                onChange={(event) => setName(event.target.value)}
                required
                value={name}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-[#34483b]">Email address</span>
              <input
                autoComplete="email"
                className="mt-2 w-full rounded-xl border border-[#dfe5df] bg-white px-4 py-3.5 text-sm text-[#17271f] outline-none focus:border-[#718b78]"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </label>
            <PasswordInput
              id="register-password"
              label="Password"
              autoComplete="new-password"
              onChange={(event) => setPassword(event.target.value)}
              value={password}
            />
            <div aria-live="polite" className="grid gap-1 rounded-xl border border-[#e2e7e2] p-3 text-xs">
              {[
                { met: /[A-Z]/.test(password), text: "One uppercase letter" },
                { met: /[a-z]/.test(password), text: "One lowercase letter" },
                { met: password.length >= 6, text: "At least 6 characters" },
              ].map((rule) => (
                <p className={rule.met ? "flex items-center gap-2 text-[#24673a]" : "flex items-center gap-2 text-[#68756d]"} key={rule.text}>
                  {rule.met ? <CheckCircle2 aria-hidden="true" size={14} /> : <Circle aria-hidden="true" size={14} />}
                  {rule.text}
                </p>
              ))}
            </div>
            <fieldset>
              <legend className="text-xs font-semibold text-[#34483b]">I want to…</legend>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {(["renter", "owner"] as const).map((value) => (
                  <button
                    aria-pressed={role === value}
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold capitalize transition ${
                      role === value
                        ? "border-[#14251e] bg-[#edf3ee] text-[#14251e]"
                        : "border-[#dfe5df] bg-white text-[#77827a]"
                    }`}
                    key={value}
                    onClick={() => setRole(value)}
                    type="button"
                  >
                    {value === "renter" ? "Rent equipment" : "List equipment"}
                  </button>
                ))}
              </div>
            </fieldset>
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
              {submitting ? "Creating account…" : "Create account"}
              {!submitting && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-[#9aa39c]"><span className="h-px flex-1 bg-[#e8ebe7]" />or continue with<span className="h-px flex-1 bg-[#e8ebe7]" /></div>
          <div className="space-y-3">
            <GoogleSignInButton />
            <GitHubSignInButton />
          </div>

          <p className="mt-6 text-center text-sm text-[#77827a]">
            Already a member?{" "}
            <Link className="font-semibold text-[#d85f3c] hover:underline" href="/login">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
