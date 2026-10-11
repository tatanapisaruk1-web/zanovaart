"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createSlot } from "../actions";

type Workshop = {
  id: string;
  name: string;
  duration_minutes: number;
  base_price: number;
  prepayment_amount: number;
  workshop_individual_prices?: { guests_count: number; price: number }[];
};

type Instructor = {
  id: string;
  full_name: string;
};

function addMinutes(time: string, minutes: number) {
  if (!time || !Number.isFinite(minutes)) return "";
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return "";
  const total = h * 60 + m + minutes;
  const normalized = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const hh = String(Math.floor(normalized / 60)).padStart(2, "0");
  const mm = String(normalized % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function NewSlotForm({
  workshops,
  instructors,
  error,
}: {
  workshops: Workshop[];
  instructors: Instructor[];
  error?: string;
}) {
  const [rows, setRows] = useState([0]);
  const [nextKey, setNextKey] = useState(1);
  const [type, setType] = useState<"group" | "individual">("group");
  const [offeringWorkshopIds, setOfferingWorkshopIds] = useState<
    Record<number, string>
  >({});

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [endTimeTouched, setEndTimeTouched] = useState(false);

  const addRow = () => {
    setRows((r) => [...r, nextKey]);
    setNextKey((k) => k + 1);
  };
  const removeRow = (key: number) => {
    setRows((r) => (r.length > 1 ? r.filter((k) => k !== key) : r));
    setOfferingWorkshopIds((m) => {
      const next = { ...m };
      delete next[key];
      return next;
    });
  };

  const maxDuration = useMemo(() => {
    const durations = Object.values(offeringWorkshopIds)
      .map((id) => workshops.find((w) => w.id === id)?.duration_minutes)
      .filter((d): d is number => typeof d === "number");
    return durations.length > 0 ? Math.max(...durations) : null;
  }, [offeringWorkshopIds, workshops]);

  useEffect(() => {
    if (endTimeTouched) return;
    if (!startTime || maxDuration == null) return;
    setEndTime(addMinutes(startTime, maxDuration));
  }, [startTime, maxDuration, endTimeTouched]);

  return (
    <form
      action={createSlot}
      className="space-y-6 rounded-xl border border-line bg-card p-6"
    >
      <div>
        <label className="mb-1 block text-sm text-ink-soft" htmlFor="type">
          Тип
        </label>
        <select
          id="type"
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value as "group" | "individual")}
          className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
        >
          <option value="group">Групповой</option>
          <option value="individual">Индивидуальный</option>
        </select>
      </div>

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
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
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
            value={endTime}
            onChange={(e) => {
              setEndTime(e.target.value);
              setEndTimeTouched(true);
            }}
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
          <p className="mt-1 text-xs text-ink-soft">
            По умолчанию из длительности МК, можно изменить вручную
          </p>
        </div>
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium text-ink">
          Ведущие
        </span>
        {instructors.length === 0 ? (
          <p className="rounded-lg bg-paper p-3 text-sm text-ink-soft">
            Пока нет ни одного ведущего.{" "}
            <Link href="/instructors/new" className="text-accent underline">
              Добавьте ведущего
            </Link>
            , потом вернитесь сюда.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-paper p-3 sm:grid-cols-3">
            {instructors.map((i) => (
              <label
                key={i.id}
                className="flex items-center gap-2 text-sm text-ink"
              >
                <input type="checkbox" name="instructor_id" value={i.id} />
                {i.full_name}
              </label>
            ))}
          </div>
        )}
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
              type={type}
              onWorkshopChange={(workshopId) =>
                setOfferingWorkshopIds((m) => ({ ...m, [rowKey]: workshopId }))
              }
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
  type,
  onWorkshopChange,
  onRemove,
}: {
  workshops: Workshop[];
  type: "group" | "individual";
  onWorkshopChange: (workshopId: string) => void;
  onRemove?: () => void;
}) {
  const [workshopId, setWorkshopId] = useState("");
  const [capacity, setCapacity] = useState(type === "individual" ? 1 : 6);
  const selected = workshops.find((w) => w.id === workshopId);

  const individualPrice = selected?.workshop_individual_prices?.find(
    (p) => p.guests_count === capacity
  )?.price;

  const defaultPrice =
    type === "individual" ? individualPrice ?? "" : selected?.base_price ?? "";

  return (
    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-end gap-2 rounded-lg bg-paper p-3">
      <div>
        <label className="mb-1 block text-xs text-ink-soft">Вид МК</label>
        <select
          name="offering_workshop_id"
          value={workshopId}
          onChange={(e) => {
            setWorkshopId(e.target.value);
            onWorkshopChange(e.target.value);
          }}
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
        <label className="mb-1 block text-xs text-ink-soft">
          {type === "individual" ? "Гостей" : "Мест"}
        </label>
        <input
          name="offering_capacity"
          type="number"
          min={1}
          value={capacity}
          onChange={(e) => setCapacity(Number(e.target.value) || 1)}
          className="w-full rounded-md border border-line bg-card px-2 py-1.5 text-sm text-ink outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-ink-soft">
          Цена, BYN
          {type === "individual" && individualPrice === undefined && selected && (
            <span className="ml-1 text-amber-600">нет цены на это кол-во</span>
          )}
        </label>
        <input
          key={"price-" + type + "-" + (selected?.id ?? "none") + "-" + capacity}
          name="offering_price"
          type="number"
          step="0.01"
          defaultValue={defaultPrice}
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
