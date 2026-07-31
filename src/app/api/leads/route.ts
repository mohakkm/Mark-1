import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { parseLinkedInProfileWithGroq } from "@/lib/groq";
import type { CreateLeadInput } from "@/types/lead";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const ideaId = searchParams.get("idea_id");
  const statusFilter = searchParams.get("status");

  if (!ideaId) {
    return NextResponse.json({ error: "idea_id parameter is required" }, { status: 400 });
  }

  let query = supabase
    .from("leads")
    .select("*")
    .eq("idea_id", ideaId)
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;

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

  let body: CreateLeadInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { idea_id, raw_pasted_profile, linkedin_url, notes } = body;

  if (!idea_id?.trim()) {
    return NextResponse.json({ error: "idea_id is required" }, { status: 400 });
  }

  if (!raw_pasted_profile?.trim()) {
    return NextResponse.json(
      { error: "raw_pasted_profile cannot be empty" },
      { status: 400 }
    );
  }

  // Verify that idea exists and belongs to user
  const { data: idea, error: ideaErr } = await supabase
    .from("ideas")
    .select("id")
    .eq("id", idea_id)
    .single();

  if (ideaErr || !idea) {
    return NextResponse.json({ error: "Selected idea not found" }, { status: 404 });
  }

  // Extract structured lead via Groq API
  let structured;
  try {
    structured = await parseLinkedInProfileWithGroq(raw_pasted_profile.trim());
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to extract lead details";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Insert lead into DB
  const { data: lead, error: insertErr } = await supabase
    .from("leads")
    .insert({
      idea_id,
      name: structured.name,
      company: structured.company,
      role: structured.role,
      headline: structured.headline,
      linkedin_url: linkedin_url?.trim() || null,
      raw_pasted_profile: raw_pasted_profile.trim(),
      status: "not_contacted",
      notes: notes?.trim() || null,
    })
    .select()
    .single();

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json(lead, { status: 201 });
}
