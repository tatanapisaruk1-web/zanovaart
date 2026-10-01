"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createSlot(formData: FormData) {
  const supabase = await createClient();

  const date = String(formData.get("date") ?? "");
  const start_time = String(formData.get("start_time") ?? "");
  const end_time = String(formData.get("end_time") ?? "");
  const location = String(formData.get("location") ?? "").trim() || null;
  const note = String(formData.get("note") ?? "").trim() || null;

  const workshopIds = formData.getAll("offering_workshop_id") as string[];
  const capacities = formData.getAll("offering_capacity") as string[];
  const prices = formData.getAll("offering_price") as string[];
  const prepayments = formData.getAll("offering_prepayment") as string[];

  const hasOffering = workshopIds.some((id) => id);

  if (!date || !start_time || !end_time || !hasOffering) {
    redirect(
      "/schedule/new?error=" +
        encodeURIComponent(
          "Заполните дату, время и хотя бы один вид мастер-класса"
        )
    );
  }

  const { data: slot, error: slotError } = await supabase
    .from("slots")
    .insert({ date, start_time, end_time, location, note })
    .select("id")
    .single();

  if (slotError || !slot) {
    redirect(
      "/schedule/new?error=" +
        encodeURIComponent(slotError?.message ?? "Не удалось создать слот")
    );
  }

  const offerings = workshopIds
    .map((workshopId, i) => ({
      slot_id: slot!.id,
      workshop_id: workshopId,
      capacity: Number(capacities[i] ?? 0) || 1,
      price: Number(prices[i] ?? 0) || 0,
      prepayment_amount: Number(prepayments[i] ?? 0) || 0,
    }))
    .filter((o) => o.workshop_id);

  const { error: offeringsError } = await supabase
    .from("slot_offerings")
    .insert(offerings);

  if (offeringsError) {
    redirect("/schedule/new?error=" + encodeURIComponent(offeringsError.message));
  }

  revalidatePath("/schedule");
  revalidatePath("/");
  redirect("/schedule");
}

export async function cancelSlot(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  await supabase.from("slots").update({ status: "cancelled" }).eq("id", id);
  revalidatePath("/schedule");
  revalidatePath("/");
}
