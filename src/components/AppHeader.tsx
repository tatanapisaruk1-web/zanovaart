import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";

const NAV = [
  { label: "Дашборд", href: "/" },
  { label: "Расписание", href: "/schedule" },
  { label: "Бронирования", href: "/bookings" },
  { label: "Ведущие", href: "/instructors" },
  { label: "Склад", href: "/warehouse" },
  { label: "Сертификаты", href: "/certificates" },
  { label: "Отчётность", href: "/reports" },
  { label: "Настройки", href: "/settings" },
];

export async function AppHeader({ active }: { active: string }) {
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
    <header className="border-b border-line bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-2 px-6 py-4">
        <Link href="/" className="font-semibold text-ink">
          ЗАНОВО
        </Link>
        <nav className="flex flex-wrap gap-1 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 ${
                active === item.href
                  ? "bg-accent-soft font-medium text-accent"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
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
  );
}
