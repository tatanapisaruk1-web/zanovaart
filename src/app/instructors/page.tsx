import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { createClient } from "@/lib/supabase/server";
import { toggleInstructorActive } from "./actions";

export default async function InstructorsPage() {
  const supabase = await createClient();
  const { data: instructors } = await supabase
    .from("instructors")
    .select("*")
    .order("full_name");

  return (
    <div className="min-h-screen bg-paper">
      <AppHeader active="/instructors" />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-ink">Ведущие</h1>
          <Link
            href="/instructors/new"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            + Новый ведущий
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-line bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-ink-soft">
                <th className="px-5 py-3 font-medium">Имя</th>
                <th className="px-5 py-3 font-medium">Телефон</th>
                <th className="px-5 py-3 font-medium">Ставка за МК</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {(instructors ?? []).map((i) => (
                <tr key={i.id} className="border-b border-line last:border-b-0">
                  <td className="px-5 py-3 text-ink">
                    {i.full_name}
                    {!i.is_active && (
                      <span className="ml-2 rounded bg-line px-2 py-0.5 text-xs text-ink-soft">
                        архив
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-ink-soft">{i.phone ?? "—"}</td>
                  <td className="px-5 py-3 text-ink-soft">
                    {i.default_rate} BYN
                  </td>
                  <td className="px-5 py-3 text-right">
                    <form action={toggleInstructorActive}>
                      <input type="hidden" name="id" value={i.id} />
                      <input
                        type="hidden"
                        name="is_active"
                        value={String(i.is_active)}
                      />
                      <button
                        type="submit"
                        className="text-xs text-ink-soft underline hover:text-accent"
                      >
                        {i.is_active ? "в архив" : "вернуть"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {(!instructors || instructors.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-ink-soft">
                    Пока нет ни одного ведущего — добавьте первого.
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
