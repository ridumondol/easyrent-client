"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Brand from "@/components/Brand";
import { useAuth } from "@/components/auth/AuthProvider";
import { getErrorMessage } from "@/lib/api";

function GitHubCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { githubLogin } = useAuth();

  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    const code = searchParams.get("code");

    Promise.resolve().then(() => {
      if (!active) return;

      if (error) {
        const msg = errorDescription || error || "GitHub authentication was cancelled or failed.";
        setStatus("error");
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }

      if (!code) {
        const msg = "No authorization code returned from GitHub.";
        setStatus("error");
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }

      return githubLogin(code)
        .then((user) => {
          if (!active) return;
          setStatus("success");
          const destination =
            user.role === "admin"
              ? "/admin"
              : user.role === "owner"
                ? "/owner"
                : "/customer";
          router.replace(destination);
        })
        .catch((err: unknown) => {
          if (!active) return;
          const msg = getErrorMessage(err);
          setStatus("error");
          setErrorMessage(msg);
          toast.error(msg);
        });
    });

    return () => {
      active = false;
    };
  }, [githubLogin, router, searchParams]);

  return (
    <div className="w-full max-w-md rounded-2xl border border-[#e8ebe7] bg-white p-8 text-center shadow-[0_4px_20px_rgba(27,45,34,0.03)]">
      {status === "processing" && (
        <div className="space-y-4">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#f4f7f4] text-[#14251e]">
            <Loader2 className="animate-spin text-[#14251e]" size={24} />
          </div>
          <h2 className="text-xl font-semibold text-[#17271f]">
            Authenticating with GitHub
          </h2>
          <p className="text-xs text-[#77827a]">
            Verifying your GitHub credentials and setting up your Rentora session…
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="space-y-4">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#edf7ee] text-[#2e7d32]">
            <CheckCircle2 size={24} />
          </div>
          <h2 className="text-xl font-semibold text-[#17271f]">
            Signed in successfully!
          </h2>
          <p className="text-xs text-[#77827a]">Redirecting to your dashboard…</p>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-4">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#fff0ec] text-[#c25439]">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-xl font-semibold text-[#17271f]">
            GitHub Sign-In Failed
          </h2>
          <p className="rounded-xl border border-[#f2d5cb] bg-[#fff7f4] p-3 text-xs leading-5 text-[#a14630]" role="alert">
            {errorMessage}
          </p>
          <div className="pt-2">
            <Link
              className="inline-flex items-center gap-1.5 rounded-full bg-[#14251e] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#263b31]"
              href="/login"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GitHubCallbackPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f8f6] p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Brand />
        </div>
        <Suspense
          fallback={
            <div className="w-full rounded-2xl border border-[#e8ebe7] bg-white p-8 text-center shadow-sm">
              <Loader2 className="mx-auto animate-spin text-[#14251e]" size={24} />
              <p className="mt-3 text-xs text-[#77827a]">Loading GitHub authentication…</p>
            </div>
          }
        >
          <GitHubCallbackContent />
        </Suspense>
      </div>
    </main>
  );
}
