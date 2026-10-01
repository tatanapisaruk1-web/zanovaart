import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { createClient } from "@/lib/supabase/server";
import { updateBookingStatus } from "./actions";

const STATUS_LABEL: Record<string, string> = {
  not_confirmed: "не подтверждено",
  confirmed: "подтверждено",
  completed: "завершено",
  cancelled: "отменено",
  no_show: "не пришёл",
};

export default async function BookingsPage() {
  const supabase = await createClient();
  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      "*, slot_offerings(price, workshops(name), slots(date, start_time))"
    )
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-paper">
      <AppHeader active="/bookings" />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-ink">Бронирования</h1>
          <Link
            href="/bookings/new"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            + Новая бронь
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-line bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-ink-soft">
                <th className="px-5 py-3 font-medium">Клиент</th>
                <th className="px-5 py-3 font-medium">МК</th>
                <th className="px-5 py-3 font-medium">Дата</th>
                <th className="px-5 py-3 font-medium">Участников</th>
                <th className="px-5 py-3 font-medium">Статус</th>
              </tr>
            </thead>
            <tbody>
              {(bookings ?? []).map((b: any) => (
                <tr key={b.id} className="border-b border-line last:border-b-0">
                  <td className="px-5 py-3 text-ink">
                    {b.client_name || "без имени"}
                    <div className="text-xs text-ink-soft">
                      {b.client_phone}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink-soft">
                    {b.slot_offerings?.workshops?.name ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-ink-soft">
                    {b.slot_offerings?.slots?.date
                      ? `${formatDate(b.slot_offerings.slots.date)} ${b.slot_offerings.slots.start_time?.slice(0, 5)}`
                      : "—"}
                  </td>
                  <td className="px-5 py-3 text-ink-soft">
                    {b.participants_count}
                  </td>
                  <td className="px-5 py-3">
                    <form
                      action={updateBookingStatus}
                      className="flex items-center gap-2"
                    >
                      <input type="hidden" name="id" value={b.id} />
                      <select
                        name="status"
                        defaultValue={b.status}
                        className="rounded border border-line bg-paper px-2 py-1 text-xs text-ink"
                      >
                        {Object.entries(STATUS_LABEL).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="text-xs text-accent underline"
                      >
                        сохранить
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {(!bookings || bookings.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-ink-soft">
                    Пока нет ни одной брони.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
}
