import { createClient } from "@/lib/supabase/server";
import { getSelectedIdeaId } from "@/lib/selected-idea";
import { redirect } from "next/navigation";
import { DashboardView } from "@/components/dashboard-view";
import type { Idea } from "@/types/idea";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: ideasData } = await supabase
    .from("ideas")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const ideas: Idea[] = ideasData ?? [];
  const selectedIdeaId = await getSelectedIdeaId(ideas);

  return (
    <DashboardView
      userEmail={user.email ?? ""}
      ideas={ideas}
      selectedIdeaId={selectedIdeaId}
    />
  );
}
