"use server";

import { isEmailAllowed } from "@/lib/invite-check";

/**
 * Called by the signup form before supabase.auth.signUp().
 * Returns { allowed: true } or { allowed: false, message: "..." }.
 */
export async function checkInviteAction(
  email: string
): Promise<{ allowed: boolean; message?: string }> {
  const allowed = await isEmailAllowed(email);
  if (!allowed) {
    return {
      allowed: false,
      message:
        "Verdict is currently invite-only. Request access and we'll add you.",
    };
  }
  return { allowed: true };
}
