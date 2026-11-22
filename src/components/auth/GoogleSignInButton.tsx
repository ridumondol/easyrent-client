"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { getErrorMessage } from "@/lib/api";

type GoogleCredentialResponse = { credential: string };
type GoogleButtonOptions = {
  theme: "outline";
  size: "large";
  text: "continue_with";
  shape: "rectangular";
  width: number;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (element: HTMLElement, options: GoogleButtonOptions) => void;
        };
      };
    };
  }
}

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

/** Official Google 'G' logo */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      height="18"
      viewBox="0 0 24 24"
      width="18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function GoogleSignInButton() {
  const { googleLogin } = useAuth();
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!scriptReady || !clientId || !buttonRef.current || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        setLoading(true);
        void googleLogin(response.credential)
          .then((user) => {
            router.replace(
              user.role === "owner"
                ? "/owner"
                : user.role === "admin"
                  ? "/admin"
                  : "/customer",
            );
          })
          .catch((error: unknown) => {
            toast.error(getErrorMessage(error));
          })
          .finally(() => {
            setLoading(false);
          });
      },
    });
    buttonRef.current.replaceChildren();
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      width: Math.min(420, Math.floor(buttonRef.current.clientWidth || 360)),
    });
  }, [googleLogin, router, scriptReady]);

  if (!clientId) {
    return (
      <button
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#dfe5df] bg-white px-4 py-3 text-sm font-medium text-[#3c4043] transition hover:bg-[#f8f9fa]"
        onClick={() =>
          toast.error(
            "Google sign-in is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local.",
          )
        }
        type="button"
      >
        <GoogleIcon className="shrink-0" />
        Continue with Google
      </button>
    );
  }

  return (
    <div className="w-full">
      <Script
        onLoad={() => setScriptReady(true)}
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
      />
      {loading ? (
        <div className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[#dfe5df] bg-white text-xs text-[#66736a]">
          <span className="size-4 animate-spin rounded-full border-2 border-[#14251e] border-t-transparent" />
          Signing in with Google…
        </div>
      ) : (
        <div className="flex min-h-[44px] w-full justify-center overflow-hidden rounded-xl [&>div]:w-full" ref={buttonRef}>
          {!scriptReady && (
            <button
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#dfe5df] bg-white px-4 py-3 text-sm font-medium text-[#3c4043] opacity-75"
              disabled
              type="button"
            >
              <GoogleIcon className="shrink-0" />
              Continue with Google
            </button>
          )}
        </div>
      )}
    </div>
  );
}
