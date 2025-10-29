import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  const { checkout_token } = await request.json();
  await supabaseAdmin
    .from("orders")
    .update({ status: "confirmed" })
    .eq("checkout_token", checkout_token);
  return NextResponse.json({ success: true });
}
