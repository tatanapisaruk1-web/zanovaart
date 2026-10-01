import { AppHeader } from "@/components/AppHeader";
import { createClient } from "@/lib/supabase/server";
import { createBooking } from "../actions";

export default async function NewBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: slots } = await supabase
    .from("slots")
    .select("date, start_time, slot_offerings(id, price, capacity, workshops(name))")
    .eq("status", "open")
    .order("date")
    .order("start_time");

  const options = (slots ?? []).flatMap((slot: any) =>
    (slot.slot_offerings ?? []).map((o: any) => ({
      id: o.id,
      label: `${formatDate(slot.date)} ${slot.start_time?.slice(0, 5)} · ${o.workshops?.name} · ${o.price} BYN`,
    }))
  );

  return (
    <div className="min-h-screen bg-paper">
      <AppHeader active="/bookings" />
      <main className="mx-auto max-w-xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-semibold text-ink">Новая бронь</h1>

        {options.length === 0 ? (
          <div className="rounded-xl border border-line bg-card p-6 text-sm text-ink-soft">
            Нет открытых слотов с видами МК. Сначала создайте{" "}
            <a href="/schedule/new" className="text-accent underline">
              слот
            </a>
            .
          </div>
        ) : (
          <form
            action={createBooking}
            className="space-y-4 rounded-xl border border-line bg-card p-6"
          >
            <div>
              <label
                className="mb-1 block text-sm text-ink-soft"
                htmlFor="slot_offering_id"
              >
                Слот и вид МК
              </label>
              <select
                id="slot_offering_id"
                name="slot_offering_id"
                required
                defaultValue=""
                className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              >
                <option value="" disabled>
                  — выбрать —
                </option>
                {options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <Field label="Имя клиента" name="client_name" />
            <Field
              label="Телефон"
              name="client_phone"
              required
              placeholder="+375..."
            />
            <Field label="Instagram" name="client_instagram" />

            <div>
              <label
                className="mb-1 block text-sm text-ink-soft"
                htmlFor="participants_count"
              >
                Количество участников
              </label>
              <input
                id="participants_count"
                name="participants_count"
                type="number"
                min={1}
                defaultValue={1}
                required
                className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              />
            </div>

            <div>
              <label
                className="mb-1 block text-sm text-ink-soft"
                htmlFor="note_for_instructor"
              >
                Примечание для ведущего
              </label>
              <textarea
                id="note_for_instructor"
                name="note_for_instructor"
                rows={2}
                className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              className="w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Создать бронь
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
}

function Field({
  label,
  name,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm text-ink-soft" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
    </div>
  );
}
