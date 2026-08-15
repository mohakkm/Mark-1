import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isEmailAllowed } from "@/lib/invite-check";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // --- Invite gate for OAuth paths (Google, and any future provider) ---
      // email/password signup is checked earlier (in the Server Action), but
      // OAuth users arrive here after Supabase has already created the account.
      // We must verify invite status post-session and delete uninvited users.
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Only gate newly-created OAuth users — identified by the provider not
      // being "email". Email/password signups were already gated pre-creation.
      const isOAuthUser =
        user?.app_metadata?.provider &&
        user.app_metadata.provider !== "email";

      if (user && isOAuthUser) {
        const allowed = await isEmailAllowed(user.email ?? "");
        if (!allowed) {
          // Sign out the session cookie first, then delete the auth account so
          // there's no dangling user record in auth.users.
          await supabase.auth.signOut();
          const admin = createAdminClient();
          await admin.auth.admin.deleteUser(user.id);
          return NextResponse.redirect(
            `${origin}/login?error=not_invited`
          );
        }
      }

      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
