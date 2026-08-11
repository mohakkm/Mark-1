import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateOutreachMessageWithGroq } from "@/lib/groq";
import type { Lead, Conversation } from "@/types/lead";
import type { Idea } from "@/types/idea";
import { checkAiLimit, recordAiAction } from "@/lib/limits";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type MessageType = "first" | "followup";

function calculateDaysElapsed(anchorDate: string | null): number {
  if (!anchorDate) {
    return 0;
  }
  const timestamp = new Date(anchorDate).getTime();
  if (Number.isNaN(timestamp)) {
    return 0;
  }
  const elapsedMs = Date.now() - timestamp;
  if (elapsedMs <= 0) {
    return 0;
  }
  return Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
}

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

  let body: { type?: MessageType };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.type !== "first" && body.type !== "followup") {
    return NextResponse.json(
      { error: "type must be either 'first' or 'followup'" },
      { status: 400 }
    );
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
    .select("*")
    .eq("id", lead.idea_id)
    .eq("user_id", user.id)
    .single();

  if (ideaError || !ideaData) {
    return NextResponse.json({ error: "Idea not found for this lead" }, { status: 404 });
  }

  const idea = ideaData as Idea;
  const { data: latestOutgoingData, error: latestOutgoingError } = await supabase
    .from("conversations")
    .select("*")
    .eq("lead_id", id)
    .eq("type", "outgoing")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestOutgoingError) {
    return NextResponse.json({ error: latestOutgoingError.message }, { status: 500 });
  }

  const latestOutgoing = latestOutgoingData as Conversation | null;

  if (body.type === "first" && latestOutgoing) {
    return NextResponse.json(
      { error: "A first message already exists for this lead. Use Generate Follow-up." },
      { status: 400 }
    );
  }

  if (body.type === "followup" && !latestOutgoing) {
    return NextResponse.json(
      { error: "Generate a first message before creating a follow-up." },
      { status: 400 }
    );
  }

  const previousOutgoingMessage =
    body.type === "followup" ? latestOutgoing?.content : undefined;
  const daysElapsedAnchor =
    body.type === "followup"
      ? lead.last_contact ?? latestOutgoing?.created_at ?? null
      : lead.last_contact;
  const daysElapsed = calculateDaysElapsed(daysElapsedAnchor);

  let generatedMessage: string;
  try {
    generatedMessage = await generateOutreachMessageWithGroq({
      type: body.type,
      idea: {
        name: idea.name,
        description: idea.description,
        target_customer: idea.target_customer,
      },
      lead: {
        name: lead.name,
        role: lead.role,
        company: lead.company,
        headline: lead.headline,
      },
      previousMessage: previousOutgoingMessage,
      daysElapsed,
    });
    // Record AI usage log
    await recordAiAction(supabase, user.id, "message_generation");
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to generate outreach message.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .insert({
      lead_id: id,
      type: "outgoing",
      content: generatedMessage,
    })
    .select()
    .single();

  if (conversationError || !conversation) {
    return NextResponse.json(
      { error: conversationError?.message ?? "Failed to save generated message." },
      { status: 500 }
    );
  }

  const nowIso = new Date().toISOString();
  const leadUpdates: { last_contact: string; status?: Lead["status"] } = {
    last_contact: nowIso,
  };

  if (lead.status === "not_contacted") {
    leadUpdates.status = "messaged";
  }

  const { error: leadUpdateError } = await supabase
    .from("leads")
    .update(leadUpdates)
    .eq("id", id);

  if (leadUpdateError) {
    return NextResponse.json({ error: leadUpdateError.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      message: generatedMessage,
      conversation,
      type: body.type,
    },
    { status: 201 }
  );
}
