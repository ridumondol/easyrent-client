export default function Loading() {
  return (
    <main aria-label="Loading page" className="min-h-screen bg-[#f7f8f6] p-6 sm:p-10">
      <div className="mx-auto max-w-6xl animate-pulse space-y-6">
        <div className="h-12 w-full rounded-2xl bg-white" />
        <div className="h-56 rounded-3xl bg-[#e8ebe7]" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((item) => <div className="h-72 rounded-2xl bg-white" key={item} />)}
        </div>
      </div>
    </main>
  );
}
