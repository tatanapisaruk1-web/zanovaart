import { AppHeader } from "@/components/AppHeader";
import { createInstructor } from "../actions";

export default async function NewInstructorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-paper">
      <AppHeader active="/instructors" />
      <main className="mx-auto max-w-xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-semibold text-ink">
          Новый ведущий
        </h1>

        <form
          action={createInstructor}
          className="space-y-4 rounded-xl border border-line bg-card p-6"
        >
          <Field label="Имя" name="full_name" required />
          <Field label="Телефон" name="phone" />
          <Field
            label="Ставка за МК, BYN"
            name="default_rate"
            type="number"
            step="0.01"
            defaultValue="50"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Создать
          </button>
        </form>
      </main>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  step,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  step?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm text-ink-soft" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        step={step}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
    </div>
  );
}
