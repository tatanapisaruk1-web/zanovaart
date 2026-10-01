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

  const { error } = await supabase.from("workshops").insert({
    name,
    category,
    duration_minutes,
    base_price,
    prepayment_amount,
  });

  if (error) {
    redirect("/workshops/new?error=" + encodeURIComponent(error.message));
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
