"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createWorkshop(formData: FormData) {
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim() || null;
  const duration_minutes = Number(formData.get("duration_minutes") ?? 0);
  const base_price = Number(formData.get("base_price") ?? 0);
  const prepayment_amount = Number(formData.get("prepayment_amount") ?? 0);

  if (!name || !duration_minutes || !base_price) {
    redirect(
      "/workshops/new?error=" +
        encodeURIComponent("Заполните название, длительность и цену")
    );
  }

  const { data: workshop, error } = await supabase
    .from("workshops")
    .insert({
      name,
      category,
      duration_minutes,
      base_price,
      prepayment_amount,
    })
    .select("id")
    .single();

  if (error || !workshop) {
    redirect(
      "/workshops/new?error=" + encodeURIComponent(error?.message ?? "Не удалось создать мастер-класс")
    );
  }

  const materialIds = formData.getAll("recipe_material_id") as string[];
  const qtys = formData.getAll("recipe_qty") as string[];

  const recipeRows = materialIds
    .map((materialId, i) => ({
      workshop_id: workshop!.id,
      material_id: materialId,
      qty_per_participant: qtys[i]?.trim() ? Number(qtys[i]) : null,
    }))
    .filter((r) => r.material_id);

  if (recipeRows.length > 0) {
    const { error: recipeError } = await supabase
      .from("workshop_materials")
      .insert(recipeRows);

    if (recipeError) {
      redirect(
        "/workshops/new?error=" + encodeURIComponent(recipeError.message)
      );
    }
  }

  revalidatePath("/workshops");
  revalidatePath("/schedule/new");
  redirect("/workshops");
}

export async function toggleWorkshopActive(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const isActive = formData.get("is_active") === "true";
  await supabase.from("workshops").update({ is_active: !isActive }).eq("id", id);
  revalidatePath("/workshops");
  revalidatePath("/schedule/new");
}
