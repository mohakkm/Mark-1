"use server";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Checks whether an email is on the invite list.
 * Uses the service-role admin client so it can bypass RLS on allowed_emails.
 * Safe to call from Server Actions — never exposed to the client directly.
 */
export async function isEmailAllowed(email: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("allowed_emails")
    .select("email")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  if (error) {
    // Fail open on unexpected DB errors to avoid locking out users due to
    // infrastructure issues. Log for visibility.
    console.error("[invite-check] allowed_emails query error:", error.message);
    return false;
  }

  return data !== null;
}
