export function CreateShowHeader() {
  return (
    <nav className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Create event
        </h1>
        <p className="mt-2 max-w-xl text-base text-slate-600">
          Add a concert or show to the catalog. Configure venue, schedule, optional artwork, and seating zones with
          pricing.
        </p>
      </div>
    </nav>
  );
}
