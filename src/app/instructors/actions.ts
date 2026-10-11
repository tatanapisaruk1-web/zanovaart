"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createInstructor(formData: FormData) {
  const supabase = await createClient();

  const full_name = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const rateRaw = String(formData.get("default_rate") ?? "").trim();
  const default_rate = rateRaw ? Number(rateRaw) : 50;

  if (!full_name) {
    redirect(
      "/instructors/new?error=" + encodeURIComponent("Заполните имя ведущего")
    );
  }

  const { error } = await supabase.from("instructors").insert({
    full_name,
    phone,
    default_rate,
  });

  if (error) {
    redirect("/instructors/new?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/instructors");
  revalidatePath("/schedule/new");
  redirect("/instructors");
}

export async function toggleInstructorActive(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const isActive = formData.get("is_active") === "true";
  await supabase
    .from("instructors")
    .update({ is_active: !isActive })
    .eq("id", id);
  revalidatePath("/instructors");
  revalidatePath("/schedule/new");
}
