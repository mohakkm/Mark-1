import { cookies } from "next/headers";
import type { Idea } from "@/types/idea";

export const SELECTED_IDEA_COOKIE = "selected_idea_id";

export async function getSelectedIdeaId(
  ideas: Pick<Idea, "id">[]
): Promise<string | null> {
  const cookieStore = await cookies();
  const selectedId = cookieStore.get(SELECTED_IDEA_COOKIE)?.value;

  if (selectedId && ideas.some((idea) => idea.id === selectedId)) {
    return selectedId;
  }

  return ideas[0]?.id ?? null;
}

export async function setSelectedIdeaId(ideaId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SELECTED_IDEA_COOKIE, ideaId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
