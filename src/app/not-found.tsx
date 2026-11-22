import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f8f6] p-6">
      <section className="max-w-md text-center">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#ed7049]">404 · Page not found</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#17271f]">Looks like this gear is out of place.</h1>
        <p className="mt-4 text-sm leading-6 text-[#77827a]">The page may have moved or the address may be incorrect.</p>
        <Link className="mt-7 inline-flex rounded-full bg-[#14251e] px-6 py-3 text-sm font-semibold text-white" href="/">Back to Rentora</Link>
      </section>
    </main>
  );
}
