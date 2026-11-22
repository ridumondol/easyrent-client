"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f8f6] p-6">
      <section className="max-w-md rounded-3xl border border-[#e8ebe7] bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ed7049]">Something went wrong</p>
        <h1 className="mt-3 text-2xl font-semibold text-[#17271f]">This page hit an unexpected error.</h1>
        <p className="mt-2 text-sm leading-6 text-[#77827a]">Try loading the page again. Your account and saved information are unchanged.</p>
        <button className="mt-6 rounded-full bg-[#14251e] px-5 py-3 text-sm font-semibold text-white" onClick={reset} type="button">Try again</button>
      </section>
    </main>
  );
}
