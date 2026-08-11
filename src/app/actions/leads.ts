"use server";

import { createClient } from "@/lib/supabase/server";
import { parseLinkedInProfileWithGroq } from "@/lib/groq";
import { revalidatePath } from "next/cache";
import type { CreateLeadInput, LeadStatus } from "@/types/lead";
import { checkLeadsLimit } from "@/lib/limits";

const VALID_STATUSES: LeadStatus[] = [
  "not_contacted",
  "messaged",
  "replied",
  "interested",
  "not_interested",
];

export async function createLeadAction(input: CreateLeadInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!input.idea_id?.trim()) {
    throw new Error("idea_id is required");
  }

  if (!input.raw_pasted_profile?.trim()) {
    throw new Error("Pasted profile text cannot be empty");
  }

  const { data: idea, error: ideaError } = await supabase
    .from("ideas")
    .select("id")
    .eq("id", input.idea_id)
    .eq("user_id", user.id)
    .single();

  if (ideaError || !idea) {
    throw new Error("Selected idea not found");
  }

  // Check usage limits
  await checkLeadsLimit(supabase, input.idea_id);

  // Parse with Groq API
  const structured = await parseLinkedInProfileWithGroq(
    input.raw_pasted_profile.trim()
  );

  // Insert lead
  const { data, error } = await supabase
    .from("leads")
    .insert({
      idea_id: input.idea_id,
      name: structured.name,
      company: structured.company,
      role: structured.role,
      headline: structured.headline,
      linkedin_url: input.linkedin_url?.trim() || null,
      raw_pasted_profile: input.raw_pasted_profile.trim(),
      status: "not_contacted",
      notes: input.notes?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/", "layout");
  return data;
}

export async function updateLeadStatusAction(id: string, status: LeadStatus) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  const updates: Record<string, unknown> = { status };
  if (status === "messaged") {
    updates.last_contact = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("leads")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/", "layout");
  return data;
}

export async function deleteLeadAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase.from("leads").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/", "layout");
  return { success: true };
}
