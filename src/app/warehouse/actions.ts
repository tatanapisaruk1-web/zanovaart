"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createMaterial(formData: FormData) {
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const unit = String(formData.get("unit") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim() || null;
  const min_threshold_raw = String(formData.get("min_threshold") ?? "").trim();
  const min_threshold = min_threshold_raw ? Number(min_threshold_raw) : 0;

  if (!name || !unit) {
    redirect(
      "/warehouse/new?error=" +
        encodeURIComponent("Заполните название и единицу измерения")
    );
  }

  const { error } = await supabase.from("materials").insert({
    name,
    unit,
    category,
    min_threshold,
  });

  if (error) {
    redirect("/warehouse/new?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/warehouse");
  revalidatePath("/workshops/new");
  redirect("/warehouse");
}
