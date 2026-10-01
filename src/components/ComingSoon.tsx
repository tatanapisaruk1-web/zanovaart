import { AppHeader } from "./AppHeader";

export function ComingSoonPage({
  title,
  active,
}: {
  title: string;
  active: string;
}) {
  return (
    <div className="min-h-screen bg-paper">
      <AppHeader active={active} />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="mb-4 text-2xl font-semibold text-ink">{title}</h1>
        <div className="rounded-xl border border-dashed border-line bg-card p-10 text-center text-ink-soft">
          Этот раздел ещё в разработке — доберёмся до него на следующих
          этапах.
        </div>
      </main>
    </div>
  );
}
