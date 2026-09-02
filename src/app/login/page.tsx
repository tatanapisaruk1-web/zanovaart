import { signIn } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm rounded-xl border border-line bg-card p-8">
        <h1 className="mb-1 text-xl font-semibold text-ink">ЗАНОВО</h1>
        <p className="mb-6 text-sm text-ink-soft">Вход в админ-панель</p>

        <form action={signIn} className="space-y-4">
          <div>
            <label
              className="mb-1 block text-sm text-ink-soft"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm text-ink-soft"
              htmlFor="password"
            >
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  );
}
