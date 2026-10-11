import { AppHeader } from "@/components/AppHeader";
import { createMaterial } from "../actions";

export default async function NewMaterialPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-paper">
      <AppHeader active="/warehouse" />
      <main className="mx-auto max-w-xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-semibold text-ink">
          Новый материал
        </h1>

        <form
          action={createMaterial}
          className="space-y-4 rounded-xl border border-line bg-card p-6"
        >
          <Field label="Название" name="name" required />
          <Field
            label="Категория"
            name="category"
            placeholder="например, глина, упаковка"
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Единица измерения"
              name="unit"
              placeholder="шт., мл, кг, м"
              required
            />
            <Field
              label="Минимальный остаток"
              name="min_threshold"
              type="number"
              step="0.001"
            />
          </div>

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
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  step?: string;
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
        className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
    </div>
  );
}
