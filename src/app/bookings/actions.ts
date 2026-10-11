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
  const participantNames = String(formData.get("participant_names") ?? "")
    .split("\n")
    .map((n) => n.trim())
    .filter(Boolean);

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
    .select("price, prepayment_amount, capacity, slots(type)")
    .eq("id", slot_offering_id)
    .single();

  if (!offering) {
    redirect(
      "/bookings/new?error=" + encodeURIComponent("Слот с этим видом МК не найден")
    );
  }

  const slotType = (offering as any)?.slots?.type ?? "group";

  const { data: existingBookings } = await supabase
    .from("bookings")
    .select("participants_count, status")
    .eq("slot_offering_id", slot_offering_id)
    .neq("status", "cancelled");

  const alreadyBooked = (existingBookings ?? []).reduce(
    (sum, b) => sum + (b.participants_count ?? 0),
    0
  );

  if (slotType === "individual") {
    if ((existingBookings ?? []).length > 0) {
      redirect(
        "/bookings/new?error=" +
          encodeURIComponent(
            "На индивидуальный слот можно добавить только одну бронь — сюда уже кто-то записан"
          )
      );
    }
  } else {
    const capacity = offering?.capacity ?? 0;
    if (alreadyBooked + participants_count > capacity) {
      const free = Math.max(capacity - alreadyBooked, 0);
      redirect(
        "/bookings/new?error=" +
          encodeURIComponent(
            `Недостаточно свободных мест: осталось ${free} из ${capacity}`
          )
      );
    }
  }

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

  const participants = Array.from({ length: participants_count }).map(
    (_, i) => ({
      booking_id: booking!.id,
      participant_name: participantNames[i] ?? null,
      price_share: offering?.price ?? 0,
      prepayment_amount: offering?.prepayment_amount ?? 0,
      paid_amount: 0,
      status: "unpaid",
    })
  );

  await supabase.from("booking_participants").insert(participants);

  revalidatePath("/bookings");
  revalidatePath("/schedule");
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
