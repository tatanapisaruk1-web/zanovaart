import { AppHeader } from "@/components/AppHeader";
import { createWorkshop } from "../actions";

export default async function NewWorkshopPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-paper">
      <AppHeader active="/schedule" />
      <main className="mx-auto max-w-xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-semibold text-ink">
          Новый мастер-класс
        </h1>

        <form
          action={createWorkshop}
          className="space-y-4 rounded-xl border border-line bg-card p-6"
        >
          <Field label="Название" name="name" required />
          <Field
            label="Категория"
            name="category"
            placeholder="например, керамика"
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Длительность, мин"
              name="duration_minutes"
              type="number"
              required
            />
            <Field
              label="Базовая цена, BYN"
              name="base_price"
              type="number"
              step="0.01"
              required
            />
          </div>
          <Field
            label="Сумма предоплаты, BYN"
            name="prepayment_amount"
            type="number"
            step="0.01"
            defaultValue="0"
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
  placeholder,
  step,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
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
        placeholder={placeholder}
        step={step}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
    </div>
  );
}
