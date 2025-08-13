'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Availability = { capacity: number | null; taken: number; remaining: number | null };

const API = process.env.NEXT_PUBLIC_API_URL!;

export default function EnterRaceClient({ raceId }: { raceId: string }) {
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [done, setDone] = useState<{ entryId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [riderName, setRiderName] = useState("");
  const [email, setEmail] = useState("");
  const [club, setClub] = useState("");
  const [bcId, setBcId] = useState("");
  const [emName, setEmName] = useState("");
  const [emPhone, setEmPhone] = useState("");
  // Dev card inputs (separate field group)
  const [cardNumber, setCardNumber] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  useEffect(() => {
    fetch(`${API}/races/${raceId}/availability`, { cache: "no-store" })
      .then((r) => r.json())
      .then(setAvailability)
      .catch(() => {});
  }, [raceId]);

  const capacityText = useMemo(() => {
    if (!availability) return "";
    if (availability.capacity == null) return "No capacity set";
    return `${availability.remaining} of ${availability.capacity} places left`;
  }, [availability]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Create entry for this race
      const res = await fetch(`${API}/races/${raceId}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          riderName,
          email,
          club,
          bcId: bcId || undefined,
          emergencyName: emName,
          emergencyPhone: emPhone,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { entryId: string; payment: { clientSecret: string } };

      // Simulate payment
      const pay = await fetch(`${API}/payments/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId: data.entryId }),
      });
      if (!pay.ok) throw new Error(await pay.text());

      setDone({ entryId: data.entryId });
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <main className="max-w-xl mx-auto p-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-6">
          <h1 className="text-xl font-semibold">You’re in! ✅</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Entry reference:{" "}
            <span className="font-mono text-slate-800 dark:text-slate-200">{done.entryId}</span>
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center rounded-xl border px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            >
              Back to events
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100svh] bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href={`/`}
            className="rounded-xl border px-2.5 py-1 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/60"
          >
            ← Back
          </Link>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            {availability ? capacityText : "Checking capacity…"}
          </div>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-6 sm:p-8">
          <h1 className="text-2xl font-semibold">Enter race</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Fill in your details. Payment is simulated in dev.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium">Rider name</label>
              <input
                required
                value={riderName}
                onChange={(e) => setRiderName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Club (or “Privateer”)</label>
              <input
                value={club}
                onChange={(e) => setClub(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">BC ID (optional)</label>
              <input
                value={bcId}
                onChange={(e) => setBcId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700"
              />
            </div>

            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Emergency contact name</label>
                <input
                  required
                  value={emName}
                  onChange={(e) => setEmName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Emergency contact number</label>
                <input
                  required
                  value={emPhone}
                  onChange={(e) => setEmPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700"
                />
              </div>
            </div>

            <div className="sm:col-span-2 border-t border-slate-200 dark:border-slate-800 pt-4 mt-2">
              <h2 className="text-sm font-medium mb-2">Card details (dev simulator)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  placeholder="Card number (e.g., 4242 4242 4242 4242)"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700"
                />
                <input
                  placeholder="MM/YY"
                  value={cardExp}
                  onChange={(e) => setCardExp(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700"
                />
                <input
                  placeholder="CVC"
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Payments are simulated in dev. We’ll swap to Stripe Elements later.
              </p>
            </div>

            {error && (
              <div className="sm:col-span-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-sm p-3">
                {error}
              </div>
            )}

            <div className="sm:col-span-2 flex items-center justify-between mt-2">
              <div className="text-xs text-slate-500">{availability ? capacityText : "Checking capacity…"}</div>
              <button
                disabled={loading}
                type="submit"
                className="inline-flex items-center rounded-xl bg-slate-900 text-white px-4 py-2 hover:opacity-95 disabled:opacity-60"
              >
                {loading ? "Processing…" : "Pay & enter"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
