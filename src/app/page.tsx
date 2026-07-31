import { createClient } from "@/lib/supabase/server";
import { getSelectedIdeaId } from "@/lib/selected-idea";
import { redirect } from "next/navigation";
import { DashboardView } from "@/components/dashboard-view";
import type { Idea } from "@/types/idea";
import type { Lead } from "@/types/lead";

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

  let leads: Lead[] = [];
  if (selectedIdeaId) {
    const { data: leadsData } = await supabase
      .from("leads")
      .select("*")
      .eq("idea_id", selectedIdeaId)
      .order("created_at", { ascending: false });

    leads = (leadsData as Lead[]) ?? [];
  }

  return (
    <DashboardView
      userEmail={user.email ?? ""}
      ideas={ideas}
      selectedIdeaId={selectedIdeaId}
      leads={leads}
    />
  );
}
