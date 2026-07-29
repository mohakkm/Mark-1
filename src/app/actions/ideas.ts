"use server";

import { setSelectedIdeaId } from "@/lib/selected-idea";
import { revalidatePath } from "next/cache";

export async function selectIdea(ideaId: string) {
  await setSelectedIdeaId(ideaId);
  revalidatePath("/", "layout");
}
