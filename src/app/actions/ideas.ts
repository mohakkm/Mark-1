"use server";

import { setSelectedIdeaId } from "@/lib/selected-idea";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { IdeaInput } from "@/types/idea";

export async function selectIdea(ideaId: string) {
  await setSelectedIdeaId(ideaId);
  revalidatePath("/", "layout");
}

export async function createIdeaAction(input: IdeaInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!input.name?.trim() || !input.description?.trim() || !input.target_customer?.trim()) {
    throw new Error("Name, description, and target customer are required");
  }

  const { data, error } = await supabase
    .from("ideas")
    .insert({
      name: input.name.trim(),
      description: input.description.trim(),
      target_customer: input.target_customer.trim(),
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await setSelectedIdeaId(data.id);
  revalidatePath("/", "layout");
  return data;
}

export async function updateIdeaAction(id: string, input: Partial<IdeaInput>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const updates: Partial<IdeaInput> = {};
  if (input.name !== undefined) {
    if (!input.name.trim()) throw new Error("Name cannot be empty");
    updates.name = input.name.trim();
  }
  if (input.description !== undefined) {
    if (!input.description.trim()) throw new Error("Description cannot be empty");
    updates.description = input.description.trim();
  }
  if (input.target_customer !== undefined) {
    if (!input.target_customer.trim()) throw new Error("Target customer cannot be empty");
    updates.target_customer = input.target_customer.trim();
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("No fields to update");
  }

  const { data, error } = await supabase
    .from("ideas")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/", "layout");
  return data;
}

export async function deleteIdeaAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("ideas")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/", "layout");
  return { success: true };
}
