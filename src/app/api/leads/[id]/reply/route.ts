import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractReplyInsightWithGroq } from "@/lib/groq";
import type { Lead, Insight } from "@/types/lead";
import { checkAiLimit, recordAiAction } from "@/lib/limits";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check usage limits
  try {
    await checkAiLimit(supabase, user.id);
  } catch (limitErr: unknown) {
    const message = limitErr instanceof Error ? limitErr.message : "AI usage limit reached";
    return NextResponse.json({ error: message }, { status: 403 });
  }

  let body: { reply_text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const replyText = body.reply_text?.trim();
  if (!replyText) {
    return NextResponse.json({ error: "reply_text is required" }, { status: 400 });
  }

  const { data: leadData, error: leadError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (leadError || !leadData) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const lead = leadData as Lead;
  const { data: ideaData, error: ideaError } = await supabase
    .from("ideas")
    .select("id")
    .eq("id", lead.idea_id)
    .eq("user_id", user.id)
    .single();

  if (ideaError || !ideaData) {
    return NextResponse.json({ error: "Idea not found for this lead" }, { status: 404 });
  }

  let extracted;
  try {
    extracted = await extractReplyInsightWithGroq(replyText);
    // Record AI usage log
    await recordAiAction(supabase, user.id, "insight_extraction");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to extract insight.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { data: incomingConversation, error: incomingError } = await supabase
    .from("conversations")
    .insert({
      lead_id: id,
      type: "incoming",
      content: replyText,
    })
    .select()
    .single();

  if (incomingError || !incomingConversation) {
    return NextResponse.json(
      { error: incomingError?.message ?? "Failed to save incoming reply." },
      { status: 500 }
    );
  }

  const suggestions = [
    ...extracted.current_solution.map((item) => `Current solution: ${item}`),
    ...extracted.feature_requests.map((item) => `Feature request: ${item}`),
    ...extracted.buying_signals.map((item) => `Buying signal: ${item}`),
  ];

  const { data: insightData, error: insightError } = await supabase
    .from("insights")
    .insert({
      lead_id: id,
      summary: extracted.summary,
      pain_points: extracted.pain_points,
      objections: extracted.objections,
      suggestions,
      interest_level: extracted.interest_level,
    })
    .select()
    .single();

  if (insightError || !insightData) {
    return NextResponse.json(
      { error: insightError?.message ?? "Failed to save extracted insight." },
      { status: 500 }
    );
  }

  let updatedStatus: Lead["status"] = lead.status;
  if (lead.status !== "interested" && lead.status !== "not_interested") {
    updatedStatus = "replied";
  }

  const { data: updatedLeadData, error: leadUpdateError } = await supabase
    .from("leads")
    .update({
      status: updatedStatus,
      last_contact: new Date().toISOString(),
    })
    .eq("id", id)
    .select("status,last_contact")
    .single();

  if (leadUpdateError || !updatedLeadData) {
    return NextResponse.json(
      { error: leadUpdateError?.message ?? "Failed to update lead status." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      insight: insightData as Insight,
      conversation: incomingConversation,
      lead_status: updatedLeadData.status as Lead["status"],
      last_contact: updatedLeadData.last_contact as string | null,
    },
    { status: 201 }
  );
}
