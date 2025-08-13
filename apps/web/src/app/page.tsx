import Link from "next/link";

// ---- Types ----
type EventDTO = {
  id: string;
  name: string;
  venue?: string | null;
  date: string;
  organiser: { name: string };
};

// ---- Data ----
async function getUpcoming(): Promise<EventDTO[]> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/events/upcoming`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load events");
  return res.json();
}

// ---- UI helpers ----
function dayParts(iso: string) {
  const d = new Date(iso);
  const weekday = d.toLocaleDateString(undefined, { weekday: "long" });
  const day = d.toLocaleDateString(undefined, { day: "2-digit" });
  const month = d.toLocaleDateString(undefined, { month: "short" });
  const year = d.getFullYear();
  return { weekday, day, month, year };
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

// ---- Page ----
export default async function Home() {
  const events = await getUpcoming();

  return (
    <main className="min-h-[100svh] bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-slate-900/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 grid place-items-center rounded-2xl bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900">
              {/* bike glyph */}
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M5.5 17.5l5-10 4 8m-1-6h5"/></svg>
            </div>
            <h1 className="font-semibold text-lg sm:text-xl tracking-tight">Racecraft</h1>
          </div>
          <nav className="text-sm text-slate-600 dark:text-slate-300">
            <span className="hidden sm:inline">Upcoming events</span>
          </nav>
        </div>
      </header>

      {/* Content */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Upcoming Events</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Find your next race day. Click an event to see race details.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-800">Local time</span>
          </div>
        </div>

        {events.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="grid grid-cols-1 gap-4">
            {events.map((e) => {
              const { weekday, day, month } = dayParts(e.date);
              return (
                <li key={e.id} className="group">
                  <Link
                    href={`/events/${e.id}`}
                    className="block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur p-4 sm:p-5 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      {/* Date pill */}
                      <div className="shrink-0 w-16 sm:w-20 grid place-items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 group-hover:bg-slate-100 dark:group-hover:bg-slate-900 transition-colors">
                        <div className="text-center leading-tight">
                          <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">{weekday}</div>
                          <div className="text-xl sm:text-2xl font-semibold tabular-nums">{day}</div>
                          <div className="text-[11px] text-slate-600 dark:text-slate-400">{month}</div>
                        </div>
                      </div>

                      {/* Main */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <h3 className="truncate font-medium text-base sm:text-lg">
                            <span className="mr-2 inline-block align-middle group-hover:underline underline-offset-4 decoration-slate-300">{e.name}</span>
                            <span className="align-middle hidden sm:inline text-xs px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200">{e.venue ?? "TBC"}</span>
                          </h3>
                          {/* organiser chip */}
                          <div className="hidden sm:flex items-center gap-2 shrink-0">
                            <div className="size-7 grid place-items-center rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-[11px] font-semibold">
                              {initials(e.organiser.name)}
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-300 max-w-[12rem] truncate">{e.organiser.name}</span>
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                          {e.organiser.name}
                          {e.venue ? <span> · {e.venue}</span> : null}
                        </p>
                      </div>

                      {/* chevron */}
                      <svg viewBox="0 0 24 24" className="size-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center bg-white/40 dark:bg-slate-900/40">
      <div className="mx-auto size-10 grid place-items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18M3 7h18M3 11h18M3 15h18M3 19h18"/></svg>
      </div>
      <h3 className="mt-3 text-lg font-medium">No upcoming events</h3>
      <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Check back soon or contact your organiser.</p>
    </div>
  );
}
