import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { createClient } from "@/lib/supabase/server";
import { cancelSlot } from "./actions";

const STATUS_LABEL: Record<string, string> = {
  open: "открыт",
  completed: "завершён",
  cancelled: "отменён",
};

export default async function SchedulePage() {
  const supabase = await createClient();
  const { data: slots } = await supabase
    .from("slots")
    .select("*, slot_offerings(*, workshops(name))")
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  return (
    <div className="min-h-screen bg-paper">
      <AppHeader active="/schedule" />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-ink">
            Расписание и слоты
          </h1>
          <div className="flex gap-2">
            <Link
              href="/workshops"
              className="rounded-md border border-line px-4 py-2 text-sm text-ink-soft hover:border-accent hover:text-accent"
            >
              Мастер-классы
            </Link>
            <Link
              href="/schedule/new"
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              + Новый слот
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          {(slots ?? []).map((slot: any) => (
            <div
              key={slot.id}
              className="rounded-xl border border-line bg-card p-5"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-medium text-ink">
                    {formatDate(slot.date)} ·{" "}
                    {slot.start_time?.slice(0, 5)}–
                    {slot.end_time?.slice(0, 5)}
                  </span>
                  {slot.location && (
                    <span className="ml-2 text-sm text-ink-soft">
                      · {slot.location}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
                    {STATUS_LABEL[slot.status] ?? slot.status}
                  </span>
                  {slot.status === "open" && (
                    <form action={cancelSlot}>
                      <input type="hidden" name="id" value={slot.id} />
                      <button
                        type="submit"
                        className="text-xs text-ink-soft underline hover:text-red-600"
                      >
                        отменить
                      </button>
                    </form>
                  )}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {(slot.slot_offerings ?? []).map((o: any) => (
                  <div key={o.id} className="rounded-lg bg-paper px-3 py-2 text-sm">
                    <span className="font-medium text-ink">
                      {o.workshops?.name}
                    </span>
                    <span className="ml-2 text-ink-soft">
                      до {o.capacity} чел · {o.price} BYN
                    </span>
                  </div>
                ))}
                {(!slot.slot_offerings || slot.slot_offerings.length === 0) && (
                  <p className="text-sm text-ink-soft">
                    Нет видов МК в этом слоте
                  </p>
                )}
              </div>

              {slot.note && (
                <p className="mt-3 text-sm text-ink-soft">{slot.note}</p>
              )}
            </div>
          ))}

          {(!slots || slots.length === 0) && (
            <div className="rounded-xl border border-line bg-card p-8 text-center text-ink-soft">
              Пока нет ни одного слота — создайте первый.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    weekday: "short",
  });
}
