import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { createClient } from "@/lib/supabase/server";
import { toggleWorkshopActive } from "./actions";

export default async function WorkshopsPage() {
  const supabase = await createClient();
  const { data: workshops } = await supabase
    .from("workshops")
    .select("*")
    .order("name");

  return (
    <div className="min-h-screen bg-paper">
      <AppHeader active="/schedule" />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link href="/schedule" className="text-sm text-ink-soft hover:text-accent">
              ← Расписание
            </Link>
            <h1 className="mt-1 text-2xl font-semibold text-ink">
              Мастер-классы
            </h1>
          </div>
          <Link
            href="/workshops/new"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            + Новый мастер-класс
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-line bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-ink-soft">
                <th className="px-5 py-3 font-medium">Название</th>
                <th className="px-5 py-3 font-medium">Категория</th>
                <th className="px-5 py-3 font-medium">Длительность</th>
                <th className="px-5 py-3 font-medium">Цена</th>
                <th className="px-5 py-3 font-medium">Предоплата</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {(workshops ?? []).map((w) => (
                <tr key={w.id} className="border-b border-line last:border-b-0">
                  <td className="px-5 py-3 text-ink">
                    {w.name}
                    {!w.is_active && (
                      <span className="ml-2 rounded bg-line px-2 py-0.5 text-xs text-ink-soft">
                        архив
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-ink-soft">
                    {w.category ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-ink-soft">
                    {w.duration_minutes} мин
                  </td>
                  <td className="px-5 py-3 text-ink-soft">
                    {w.base_price} BYN
                  </td>
                  <td className="px-5 py-3 text-ink-soft">
                    {w.prepayment_amount} BYN
                  </td>
                  <td className="px-5 py-3 text-right">
                    <form action={toggleWorkshopActive}>
                      <input type="hidden" name="id" value={w.id} />
                      <input
                        type="hidden"
                        name="is_active"
                        value={String(w.is_active)}
                      />
                      <button
                        type="submit"
                        className="text-xs text-ink-soft underline hover:text-accent"
                      >
                        {w.is_active ? "в архив" : "вернуть"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {(!workshops || workshops.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-ink-soft">
                    Пока нет ни одного мастер-класса — добавьте первый.
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
