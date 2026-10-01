import { AppHeader } from "@/components/AppHeader";
import { createClient } from "@/lib/supabase/server";
import { NewSlotForm } from "./NewSlotForm";

export default async function NewSlotPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: workshops } = await supabase
    .from("workshops")
    .select("id, name, base_price, prepayment_amount")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="min-h-screen bg-paper">
      <AppHeader active="/schedule" />
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-1 text-2xl font-semibold text-ink">Новый слот</h1>
        <p className="mb-6 text-sm text-ink-soft">
          Слот — это время и место. Добавьте один вид мастер-класса для
          обычного слота или несколько — для мультитипового, каждый со своей
          ценой и вместимостью.
        </p>

        {!workshops || workshops.length === 0 ? (
          <div className="rounded-xl border border-line bg-card p-6 text-sm text-ink-soft">
            Сначала добавьте хотя бы один{" "}
            <a href="/workshops/new" className="text-accent underline">
              мастер-класс
            </a>
            , чтобы можно было создать слот.
          </div>
        ) : (
          <NewSlotForm workshops={workshops} error={error} />
        )}
      </main>
    </div>
  );
}
