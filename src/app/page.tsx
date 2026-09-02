import { createClient } from "@/lib/supabase/server";
import { signOut } from "./login/actions";

const NAV = [
  "Дашборд",
  "Расписание",
  "Бронирования",
  "Ведущие",
  "Склад",
  "Сертификаты",
  "Отчёты и Финансы",
  "Настройки",
];

// Пример данных — до подключения Supabase дашборд показывает
// заглушку такой же формы, какая будет у реальных чисел.
const STATS = [
  { label: "Слотов сегодня", value: "1", hint: "4 записей" },
  { label: "На неделю", value: "11", hint: "ближайшие 7 дней" },
  { label: "Ожидают подтверждения", value: "7", hint: "требуют внимания" },
  { label: "Подтверждённые", value: "76", hint: "активных броней" },
];

const REMINDERS = [
  { date: "12.08", title: "Напомнить про МК", detail: "Бронь #440 · Людмила · Арт-ваза" },
  { date: "22.08", title: "Ссылка на оплату", detail: "Бронь #504 · Радюк Ольга · Арт-борд «Луна»" },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let staffName = user?.email ?? "";
  if (user) {
    const { data: staff } = await supabase
      .from("staff")
      .select("full_name")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    if (staff?.full_name) staffName = staff.full_name;
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-semibold text-ink">ЗАНОВО</span>
          <nav className="flex gap-1 text-sm">
            {NAV.map((item, i) => (
              <span
                key={item}
                className={`rounded-md px-3 py-1.5 ${
                  i === 0
                    ? "bg-accent-soft font-medium text-accent"
                    : "text-ink-soft"
                }`}
              >
                {item}
              </span>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-ink-soft">{staffName}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md border border-line px-3 py-1.5 text-ink-soft transition hover:border-accent hover:text-accent"
              >
                Выйти
              </button>
            </form>
          </div>
        </div>
      </header>

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

        <div className="rounded-xl border border-line bg-card">
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-medium text-ink">Напоминания</h2>
          </div>
          <ul>
            {REMINDERS.map((r, i) => (
              <li
                key={i}
                className="flex items-center gap-4 border-b border-line px-5 py-3 last:border-b-0"
              >
                <span className="w-14 shrink-0 rounded bg-accent-soft px-2 py-1 text-center text-xs font-medium text-accent">
                  {r.date}
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">{r.title}</p>
                  <p className="text-xs text-ink-soft">{r.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-xs text-ink-faint">
          Пример данных — реальные значения появятся после подключения
          Supabase.
        </p>
      </main>
    </div>
  );
}
