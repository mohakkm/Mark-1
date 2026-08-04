import { createClient } from "@/lib/supabase/server";
import { buildIdeaDashboard } from "@/lib/dashboard";
import { getSelectedIdeaId } from "@/lib/selected-idea";
import { redirect } from "next/navigation";
import { DashboardView } from "@/components/dashboard-view";
import type { Idea } from "@/types/idea";
import type { Lead } from "@/types/lead";
import type { DashboardInsightInput, IdeaDashboardData } from "@/types/dashboard";

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
  let dashboard: IdeaDashboardData | null = null;
  if (selectedIdeaId) {
    const { data: leadsData, error: leadsError } = await supabase
      .from("leads")
      .select("*")
      .eq("idea_id", selectedIdeaId)
      .order("created_at", { ascending: false });

    if (leadsError) {
      throw new Error(leadsError.message);
    }

    leads = (leadsData as Lead[]) ?? [];

    const leadIds = leads.map((lead) => lead.id);
    if (leadIds.length === 0) {
      dashboard = buildIdeaDashboard([], []);
    } else {
      const { data: insightsData, error: insightsError } = await supabase
        .from("insights")
        .select("id, lead_id, pain_points, objections, interest_level, created_at")
        .in("lead_id", leadIds);

      if (insightsError) {
        throw new Error(insightsError.message);
      }

      dashboard = buildIdeaDashboard(
        leads.map((lead) => ({ id: lead.id, status: lead.status })),
        ((insightsData as DashboardInsightInput[] | null) ?? [])
      );
    }
  }

  return (
    <DashboardView
      userEmail={user.email ?? ""}
      ideas={ideas}
      selectedIdeaId={selectedIdeaId}
      leads={leads}
      dashboard={dashboard}
    />
  );
}
