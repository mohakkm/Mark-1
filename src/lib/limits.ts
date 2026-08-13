import { SupabaseClient } from "@supabase/supabase-js";

export const LEADS_PER_IDEA_LIMIT = Number(
  process.env.LEADS_PER_IDEA_LIMIT || process.env.NEXT_PUBLIC_LEADS_PER_IDEA_LIMIT || 30
);

export const MONTHLY_AI_LIMIT = Number(
  process.env.MONTHLY_AI_LIMIT || process.env.NEXT_PUBLIC_MONTHLY_AI_LIMIT || 150
);

/**
 * Checks if the number of leads for a given idea has reached the limit.
 * Throws a descriptive error if the limit is exceeded.
 */
export async function checkLeadsLimit(supabase: SupabaseClient, ideaId: string): Promise<void> {
  const { count, error } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("idea_id", ideaId);

  if (error) {
    throw new Error(`Failed to verify lead limit: ${error.message}`);
  }

  if (count !== null && count >= LEADS_PER_IDEA_LIMIT) {
    throw new Error(
      `You have reached the limit of ${LEADS_PER_IDEA_LIMIT} leads for this idea. Please delete some leads to add new ones.`
    );
  }
}

/**
 * Checks if the user's monthly AI usage has reached the limit.
 * Throws a descriptive error if the limit is exceeded.
 */
export async function checkAiLimit(supabase: SupabaseClient, userId: string): Promise<void> {
  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from("ai_usage_log")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfMonth.toISOString());

  if (error) {
    // If the table doesn't exist yet (e.g. migration not applied), log warning and bypass to prevent breakage
    if (error.code === "PGRST205" || error.code === "42P01" || error.message.includes("does not exist")) {
      console.warn("WARNING: ai_usage_log table does not exist. Please apply migration 003.");
      return;
    }
    throw new Error(`Failed to verify AI usage limit: ${error.message}`);
  }

  if (count !== null && count >= MONTHLY_AI_LIMIT) {
    throw new Error(
      `You have reached your monthly limit of ${MONTHLY_AI_LIMIT} AI calls. Usage resets at the start of next month.`
    );
  }
}

/**
 * Records an AI action in the usage log table.
 */
export async function recordAiAction(
  supabase: SupabaseClient,
  userId: string,
  actionType: "message_generation" | "insight_extraction"
): Promise<void> {
  const { error } = await supabase.from("ai_usage_log").insert({
    user_id: userId,
    action_type: actionType,
  });

  if (error) {
    // Log error, but don't fail the primary user transaction if logging itself fails
    console.error(`Failed to record AI action '${actionType}':`, error.message);
  }
}
