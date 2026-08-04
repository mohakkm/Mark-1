import { createClient } from "@/lib/supabase/server";
import { buildIdeaDashboard } from "@/lib/dashboard";
import { NextResponse } from "next/server";
import type { DashboardInsightInput, DashboardLeadInput } from "@/types/dashboard";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: idea, error: ideaError } = await supabase
    .from("ideas")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (ideaError) {
    return NextResponse.json({ error: ideaError.message }, { status: 500 });
  }

  if (!idea) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  }

  const { data: leadsData, error: leadsError } = await supabase
    .from("leads")
    .select("id, status")
    .eq("idea_id", id);

  if (leadsError) {
    return NextResponse.json({ error: leadsError.message }, { status: 500 });
  }

  const leads = (leadsData as DashboardLeadInput[] | null) ?? [];
  const leadIds = leads.map((lead) => lead.id);

  let insights: DashboardInsightInput[] = [];
  if (leadIds.length > 0) {
    const { data: insightsData, error: insightsError } = await supabase
      .from("insights")
      .select("id, lead_id, pain_points, objections, interest_level, created_at")
      .in("lead_id", leadIds);

    if (insightsError) {
      return NextResponse.json({ error: insightsError.message }, { status: 500 });
    }

    insights = (insightsData as DashboardInsightInput[] | null) ?? [];
  }

  return NextResponse.json(buildIdeaDashboard(leads, insights));
}
