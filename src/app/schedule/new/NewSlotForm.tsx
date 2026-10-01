"use client";

import { useState } from "react";
import { createSlot } from "../actions";

type Workshop = {
  id: string;
  name: string;
  base_price: number;
  prepayment_amount: number;
};

export function NewSlotForm({
  workshops,
  error,
}: {
  workshops: Workshop[];
  error?: string;
}) {
  const [rows, setRows] = useState([0]);
  const [nextKey, setNextKey] = useState(1);

  const addRow = () => {
    setRows((r) => [...r, nextKey]);
    setNextKey((k) => k + 1);
  };
  const removeRow = (key: number) =>
    setRows((r) => (r.length > 1 ? r.filter((k) => k !== key) : r));

  return (
    <form
      action={createSlot}
      className="space-y-6 rounded-xl border border-line bg-card p-6"
    >
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1 block text-sm text-ink-soft" htmlFor="date">
            Дата
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
        </div>
        <div>
          <label
            className="mb-1 block text-sm text-ink-soft"
            htmlFor="start_time"
          >
            Начало
          </label>
          <input
            id="start_time"
            name="start_time"
            type="time"
            required
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
        </div>
        <div>
          <label
            className="mb-1 block text-sm text-ink-soft"
            htmlFor="end_time"
          >
            Окончание
          </label>
          <input
            id="end_time"
            name="end_time"
            type="time"
            required
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-ink-soft" htmlFor="location">
          Место
        </label>
        <input
          id="location"
          name="location"
          className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-ink">
            Виды мастер-классов в этом слоте
          </span>
          <button
            type="button"
            onClick={addRow}
            className="text-sm text-accent underline"
          >
            + добавить ещё вид МК
          </button>
        </div>

        <div className="space-y-3">
          {rows.map((rowKey) => (
            <OfferingRow
              key={rowKey}
              workshops={workshops}
              onRemove={rows.length > 1 ? () => removeRow(rowKey) : undefined}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-ink-soft" htmlFor="note">
          Примечание
        </label>
        <textarea
          id="note"
          name="note"
          rows={2}
          className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        className="w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Создать слот
      </button>
    </form>
  );
}

function OfferingRow({
  workshops,
  onRemove,
}: {
  workshops: Workshop[];
  onRemove?: () => void;
}) {
  const [workshopId, setWorkshopId] = useState("");
  const selected = workshops.find((w) => w.id === workshopId);

  return (
    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-end gap-2 rounded-lg bg-paper p-3">
      <div>
        <label className="mb-1 block text-xs text-ink-soft">Вид МК</label>
        <select
          name="offering_workshop_id"
          value={workshopId}
          onChange={(e) => setWorkshopId(e.target.value)}
          className="w-full rounded-md border border-line bg-card px-2 py-1.5 text-sm text-ink outline-none focus:border-accent"
        >
          <option value="">— выбрать —</option>
          {workshops.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-ink-soft">Мест</label>
        <input
          name="offering_capacity"
          type="number"
          min={1}
          defaultValue={6}
          className="w-full rounded-md border border-line bg-card px-2 py-1.5 text-sm text-ink outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-ink-soft">
          Цена, BYN
        </label>
        <input
          key={"price-" + (selected?.id ?? "none")}
          name="offering_price"
          type="number"
          step="0.01"
          defaultValue={selected?.base_price ?? ""}
          className="w-full rounded-md border border-line bg-card px-2 py-1.5 text-sm text-ink outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-ink-soft">
          Предоплата
        </label>
        <input
          key={"prepay-" + (selected?.id ?? "none")}
          name="offering_prepayment"
          type="number"
          step="0.01"
          defaultValue={selected?.prepayment_amount ?? 0}
          className="w-full rounded-md border border-line bg-card px-2 py-1.5 text-sm text-ink outline-none focus:border-accent"
        />
      </div>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md border border-line px-2 py-1.5 text-xs text-ink-soft hover:border-red-400 hover:text-red-600"
        >
          убрать
        </button>
      ) : (
        <span />
      )}
    </div>
  );
}
