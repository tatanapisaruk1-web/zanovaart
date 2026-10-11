import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { createClient } from "@/lib/supabase/server";

export default async function WarehousePage() {
  const supabase = await createClient();
  const { data: materials } = await supabase
    .from("materials")
    .select("*")
    .order("name");

  return (
    <div className="min-h-screen bg-paper">
      <AppHeader active="/warehouse" />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-ink">Склад</h1>
            <p className="mt-1 text-sm text-ink-soft">
              Пока здесь список материалов — он нужен, чтобы указывать
              расходники в рецепте мастер-класса. Остатки, поставки и
              списания добавим на следующем этапе.
            </p>
          </div>
          <Link
            href="/warehouse/new"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            + Новый материал
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-line bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-ink-soft">
                <th className="px-5 py-3 font-medium">Название</th>
                <th className="px-5 py-3 font-medium">Категория</th>
                <th className="px-5 py-3 font-medium">Ед. изм.</th>
                <th className="px-5 py-3 font-medium">Мин. остаток</th>
              </tr>
            </thead>
            <tbody>
              {(materials ?? []).map((m) => (
                <tr key={m.id} className="border-b border-line last:border-b-0">
                  <td className="px-5 py-3 text-ink">{m.name}</td>
                  <td className="px-5 py-3 text-ink-soft">
                    {m.category ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-ink-soft">{m.unit}</td>
                  <td className="px-5 py-3 text-ink-soft">
                    {m.min_threshold ?? 0}
                  </td>
                </tr>
              ))}
              {(!materials || materials.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-ink-soft">
                    Пока нет ни одного материала — добавьте первый.
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
