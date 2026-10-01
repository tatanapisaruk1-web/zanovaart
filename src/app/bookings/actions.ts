"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createBooking(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let staffId: string | null = null;
  if (user) {
    const { data: staff } = await supabase
      .from("staff")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    staffId = staff?.id ?? null;
  }

  const slot_offering_id = String(formData.get("slot_offering_id") ?? "");
  const client_name = String(formData.get("client_name") ?? "").trim() || null;
  const client_phone = String(formData.get("client_phone") ?? "").trim();
  const client_instagram =
    String(formData.get("client_instagram") ?? "").trim() || null;
  const participants_count = Number(formData.get("participants_count") ?? 1);
  const note_for_instructor =
    String(formData.get("note_for_instructor") ?? "").trim() || null;

  if (!slot_offering_id || !client_phone || !participants_count) {
    redirect(
      "/bookings/new?error=" +
        encodeURIComponent(
          "Заполните слот, телефон клиента и число участников"
        )
    );
  }

  const { data: offering } = await supabase
    .from("slot_offerings")
    .select("price, prepayment_amount")
    .eq("id", slot_offering_id)
    .single();

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      slot_offering_id,
      client_name,
      client_phone,
      client_instagram,
      participants_count,
      note_for_instructor,
      created_by: staffId,
    })
    .select("id")
    .single();

  if (bookingError || !booking) {
    redirect(
      "/bookings/new?error=" +
        encodeURIComponent(bookingError?.message ?? "Не удалось создать бронь")
    );
  }

  const participants = Array.from({ length: participants_count }).map(() => ({
    booking_id: booking!.id,
    price_share: offering?.price ?? 0,
    prepayment_amount: offering?.prepayment_amount ?? 0,
    paid_amount: 0,
    status: "unpaid",
  }));

  await supabase.from("booking_participants").insert(participants);

  revalidatePath("/bookings");
  revalidatePath("/");
  redirect("/bookings");
}

export async function updateBookingStatus(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  await supabase.from("bookings").update({ status }).eq("id", id);
  revalidatePath("/bookings");
  revalidatePath("/");
}
