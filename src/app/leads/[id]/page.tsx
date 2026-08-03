import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LeadDetailView } from "@/components/lead-detail-view";
import type { Lead } from "@/types/lead";
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

  return (
    <LeadDetailView
      lead={lead}
      idea={ideaData as Idea}
      conversations={[]}
      insights={[]}
    />
  );
}
