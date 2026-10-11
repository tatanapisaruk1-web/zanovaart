import { AppHeader } from "@/components/AppHeader";
import { createClient } from "@/lib/supabase/server";
import { NewWorkshopForm } from "./NewWorkshopForm";

export default async function NewWorkshopPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: materials } = await supabase
    .from("materials")
    .select("id, name, unit")
    .order("name");

  return (
    <div className="min-h-screen bg-paper">
      <AppHeader active="/schedule" />
      <main className="mx-auto max-w-xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-semibold text-ink">
          Новый мастер-класс
        </h1>
        <NewWorkshopForm materials={materials ?? []} error={error} />
      </main>
    </div>
  );
}
