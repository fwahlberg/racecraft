import Link from "next/link";

// ---- Types ----
type RaceDTO = {
  id: string;
  name: string;
  discipline: string;
  startTime?: string | null;
  laps?: number | null;
  capacity?: number | null;
  categories: { open: string[]; women: string[] };
};

type EventDTO = {
  id: string;
  name: string;
  venue?: string | null;
  date: string;
  organiser: { name: string };
};

const API = process.env.NEXT_PUBLIC_API_URL!;

// ---- Data ----
async function getEvent(id: string): Promise<EventDTO> {
  const res = await fetch(`${API}/events/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Event not found");
  return res.json();
}

async function getRaces(id: string): Promise<RaceDTO[]> {
  const res = await fetch(`${API}/events/${id}/races`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

// ---- UI helpers ----
function dateParts(iso: string) {
  const d = new Date(iso);
  const weekday = d.toLocaleDateString(undefined, { weekday: "long" });
  const day = d.toLocaleDateString(undefined, { day: "2-digit" });
  const month = d.toLocaleDateString(undefined, { month: "short" });
  const year = d.getFullYear();
  return { weekday, day, month, year };
}

function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${className}`}>
      {children}
    </span>
  );
}

// ---- Page ----
export default async function EventPage({ params }: { params: { id: string } }) {
  const [evt, races] = await Promise.all([getEvent(params.id), getRaces(params.id)]);
  const { weekday, day, month, year } = dateParts(evt.date);

  return (
    <main className="min-h-[100svh] bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-slate-900/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="rounded-xl border border-slate-200 dark:border-slate-800 px-2.5 py-1 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
              ← Back
            </Link>
            <span className="text-sm text-slate-600 dark:text-slate-300 hidden sm:inline">Event details</span>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300">Racecraft</div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex items-start gap-5">
          {/* Date pill */}
          <div className="shrink-0 w-20 sm:w-24 grid place-items-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <div className="text-center leading-tight py-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">{weekday}</div>
              <div className="text-2xl sm:text-3xl font-semibold tabular-nums">{day}</div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400">{month} {year}</div>
            </div>
          </div>

          {/* Title + meta */}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{evt.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <Badge className="border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60">{evt.organiser.name}</Badge>
              {evt.venue && (
                <Badge className="border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60">{evt.venue}</Badge>
              )}
              <Badge className="border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60">{weekday}</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Races */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-3">Races on the day</h2>
        {races.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center bg-white/40 dark:bg-slate-900/40">
            <h3 className="text-lg font-medium">No races yet</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">The organiser hasn’t added individual races for this event.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4">
            {races.map((r) => (
              <li key={r.id} className="group">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur p-4 sm:p-5 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: name + meta */}
                    <div className="min-w-0">
                      <div className="font-medium text-base sm:text-lg">{r.name}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                        {r.discipline}
                        {r.startTime ? ` · ${r.startTime}` : ""}
                        {typeof r.laps === "number" ? ` · ${r.laps} laps` : ""}
                        {typeof r.capacity === "number" ? ` · Cap ${r.capacity}` : ""}
                      </div>

                      {/* Category chips */}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {r.categories.open.map((c) => (
                          <Badge key={`o-${c}`} className="border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200">{c}</Badge>
                        ))}
                        {r.categories.women.map((c) => (
                          <Badge key={`w-${c}`} className="border-rose-200 bg-rose-50/80 text-rose-700 dark:border-rose-300/20 dark:bg-rose-300/10 dark:text-rose-300">
                            W {c}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Right: action */}
                    <div className="shrink-0 grid gap-2 text-right">
                      <Link href={`/races/${r.id}/enter`} className="inline-flex items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                        Enter
                        <svg viewBox="0 0 24 24" className="ml-1.5 size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                      </Link>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Limited places</div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
