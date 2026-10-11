"use client";

import Link from "next/link";
import { useState } from "react";
import { createWorkshop } from "../actions";

type Material = {
  id: string;
  name: string;
  unit: string;
};

export function NewWorkshopForm({
  materials,
  error,
}: {
  materials: Material[];
  error?: string;
}) {
  const [rows, setRows] = useState<number[]>([]);
  const [nextKey, setNextKey] = useState(0);

  const addRow = () => {
    setRows((r) => [...r, nextKey]);
    setNextKey((k) => k + 1);
  };
  const removeRow = (key: number) =>
    setRows((r) => r.filter((k) => k !== key));

  const [priceRows, setPriceRows] = useState<number[]>([]);
  const [nextPriceKey, setNextPriceKey] = useState(0);

  const addPriceRow = () => {
    setPriceRows((r) => [...r, nextPriceKey]);
    setNextPriceKey((k) => k + 1);
  };
  const removePriceRow = (key: number) =>
    setPriceRows((r) => r.filter((k) => k !== key));

  return (
    <form
      action={createWorkshop}
      className="space-y-4 rounded-xl border border-line bg-card p-6"
    >
      <Field label="Название" name="name" required />
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Длительность, мин"
          name="duration_minutes"
          type="number"
          required
        />
        <Field
          label="Цена базовая (групповой), BYN"
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

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-ink">
            Цена для индивидуального формата — по количеству гостей
          </span>
          <button
            type="button"
            onClick={addPriceRow}
            className="text-sm text-accent underline"
          >
            + добавить цену
          </button>
        </div>

        <div className="space-y-3">
          {priceRows.map((rowKey) => (
            <IndividualPriceRow
              key={rowKey}
              onRemove={() => removePriceRow(rowKey)}
            />
          ))}
          {priceRows.length === 0 && (
            <p className="text-sm text-ink-soft">
              Не добавлено — у мастер-класса пока нет индивидуального
              формата. Для каждого количества гостей задайте свою цену,
              она потом подставится автоматически при создании слота.
            </p>
          )}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-ink">
            Оснащение — материалы со склада на одного участника
          </span>
          <button
            type="button"
            onClick={addRow}
            className="text-sm text-accent underline"
          >
            + добавить материал
          </button>
        </div>

        {materials.length === 0 ? (
          <p className="rounded-lg bg-paper p-3 text-sm text-ink-soft">
            На складе ещё нет материалов.{" "}
            <Link href="/warehouse/new" className="text-accent underline">
              Сначала добавьте материал
            </Link>
            , потом вернитесь сюда.
          </p>
        ) : (
          <div className="space-y-3">
            {rows.map((rowKey) => (
              <MaterialRow
                key={rowKey}
                materials={materials}
                onRemove={() => removeRow(rowKey)}
              />
            ))}
            {rows.length === 0 && (
              <p className="text-sm text-ink-soft">
                Материалы не добавлены — оснащение можно заполнить позже.
              </p>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        className="w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Создать
      </button>
    </form>
  );
}

function IndividualPriceRow({ onRemove }: { onRemove: () => void }) {
  return (
    <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-2 rounded-lg bg-paper p-3">
      <div>
        <label className="mb-1 block text-xs text-ink-soft">
          Кол-во гостей
        </label>
        <input
          name="ind_guests_count"
          type="number"
          min={1}
          step="1"
          className="w-full rounded-md border border-line bg-card px-2 py-1.5 text-sm text-ink outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-ink-soft">Цена, BYN</label>
        <input
          name="ind_price"
          type="number"
          step="0.01"
          min={0}
          className="w-full rounded-md border border-line bg-card px-2 py-1.5 text-sm text-ink outline-none focus:border-accent"
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-md border border-line px-2 py-1.5 text-xs text-ink-soft hover:border-red-400 hover:text-red-600"
      >
        убрать
      </button>
    </div>
  );
}

function MaterialRow({
  materials,
  onRemove,
}: {
  materials: Material[];
  onRemove: () => void;
}) {
  const [materialId, setMaterialId] = useState("");
  const selected = materials.find((m) => m.id === materialId);

  return (
    <div className="grid grid-cols-[2fr_1fr_auto] items-end gap-2 rounded-lg bg-paper p-3">
      <div>
        <label className="mb-1 block text-xs text-ink-soft">Материал</label>
        <select
          name="recipe_material_id"
          value={materialId}
          onChange={(e) => setMaterialId(e.target.value)}
          className="w-full rounded-md border border-line bg-card px-2 py-1.5 text-sm text-ink outline-none focus:border-accent"
        >
          <option value="">— выбрать —</option>
          {materials.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-ink-soft">
          Кол-во {selected ? `(${selected.unit})` : ""}
        </label>
        <input
          name="recipe_qty"
          type="number"
          step="0.001"
          min={0}
          placeholder="можно не указывать"
          className="w-full rounded-md border border-line bg-card px-2 py-1.5 text-sm text-ink outline-none focus:border-accent"
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-md border border-line px-2 py-1.5 text-xs text-ink-soft hover:border-red-400 hover:text-red-600"
      >
        убрать
      </button>
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
