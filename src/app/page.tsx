import { AppHeader } from "@/components/AppHeader";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const today = new Date();
  const toDateStr = (d: Date) => d.toISOString().slice(0, 10);
  const todayStr = toDateStr(today);
  const weekAhead = new Date(today);
  weekAhead.setDate(weekAhead.getDate() + 7);
  const weekAheadStr = toDateStr(weekAhead);

  const [
    { count: slotsToday },
    { count: slotsWeek },
    { count: pendingBookings },
    { count: confirmedBookings },
  ] = await Promise.all([
    supabase
      .from("slots")
      .select("id", { count: "exact", head: true })
      .eq("date", todayStr)
      .neq("status", "cancelled"),
    supabase
      .from("slots")
      .select("id", { count: "exact", head: true })
      .gte("date", todayStr)
      .lte("date", weekAheadStr)
      .neq("status", "cancelled"),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "not_confirmed"),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "confirmed"),
  ]);

  const STATS = [
    { label: "Слотов сегодня", value: slotsToday ?? 0, hint: "не отменённых" },
    { label: "На неделю", value: slotsWeek ?? 0, hint: "ближайшие 7 дней" },
    {
      label: "Ожидают подтверждения",
      value: pendingBookings ?? 0,
      hint: "требуют внимания",
    },
    {
      label: "Подтверждённые",
      value: confirmedBookings ?? 0,
      hint: "активных броней",
    },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <AppHeader active="/" />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-semibold text-ink">Дашборд</h1>

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-line bg-card p-5"
            >
              <p className="text-sm text-ink-soft">{s.label}</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums text-ink">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-ink-soft">{s.hint}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-ink-faint">
          Напоминания по конкретным броням появятся здесь на следующих
          этапах.
        </p>
      </main>
    </div>
  );
}
