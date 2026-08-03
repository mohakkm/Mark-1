import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LeadDetailView } from "@/components/lead-detail-view";
import type { Conversation, Insight, Lead } from "@/types/lead";
import type { Idea } from "@/types/idea";

type LeadDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: leadData, error: leadError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (leadError || !leadData) {
    notFound();
  }

  const lead = leadData as Lead;
  const { data: ideaData, error: ideaError } = await supabase
    .from("ideas")
    .select("*")
    .eq("id", lead.idea_id)
    .eq("user_id", user.id)
    .single();

  if (ideaError || !ideaData) {
    notFound();
  }

  const { data: conversationsData, error: conversationsError } = await supabase
    .from("conversations")
    .select("*")
    .eq("lead_id", lead.id)
    .order("created_at", { ascending: false });

  if (conversationsError) {
    throw new Error(conversationsError.message);
  }

  const { data: insightsData, error: insightsError } = await supabase
    .from("insights")
    .select("*")
    .eq("lead_id", lead.id)
    .order("created_at", { ascending: false });

  if (insightsError) {
    throw new Error(insightsError.message);
  }

  return (
    <LeadDetailView
      lead={lead}
      idea={ideaData as Idea}
      conversations={(conversationsData as Conversation[]) ?? []}
      insights={(insightsData as Insight[]) ?? []}
    />
  );
}
