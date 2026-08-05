import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { IdeaInput } from "@/types/idea";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: IdeaInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, description, target_customer } = body;

  if (!name?.trim() || !description?.trim() || !target_customer?.trim()) {
    return NextResponse.json(
      { error: "name, description, and target_customer are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("ideas")
    .insert({
      name: name.trim(),
      description: description.trim(),
      target_customer: target_customer.trim(),
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
