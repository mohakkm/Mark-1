"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const successParam = searchParams.get("success");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
    const accessToken = params.get("access_token");
    const type = params.get("type");

    async function recoverSession() {
      if (accessToken && type === "recovery") {
        const supabase = createClient();
        const refreshToken = params.get("refresh_token") ?? "";
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          setError("This reset link is invalid or has expired.");
          setReady(false);
          return;
        }
      }

      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setReady(true);
      } else if (!accessToken) {
        setError(
          "No active reset session. Please request a new password reset link from the login page."
        );
        setReady(false);
      }
    }

    recoverSession();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (
      password.length < 6 ||
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      setError(
        "Password must include at least one lowercase letter, one uppercase letter, and one number."
      );
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await supabase.auth.signOut();
    router.push("/login?reset=success");
    router.refresh();
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-zinc-900">Set new password</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {successParam === "true"
            ? "Your password has been updated. Please sign in."
            : "Enter a new password for your account."}
        </p>

        {!ready && !error && (
          <p className="mt-6 text-sm text-zinc-500">Verifying reset link…</p>
        )}

        {ready && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-700"
              >
                New password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 caret-zinc-900 selection:bg-zinc-200 selection:text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-zinc-700"
              >
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 caret-zinc-900 selection:bg-zinc-200 selection:text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {loading ? "Please wait…" : "Save new password"}
            </button>
          </form>
        )}

        {!ready && error && (
          <>
            <p className="mt-6 text-sm text-red-600" role="alert">
              {error}
            </p>
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="mt-4 w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Back to sign in
            </button>
          </>
        )}

        {ready && (
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-4 w-full text-sm text-zinc-500 hover:text-zinc-700"
          >
            Cancel and return to sign in
          </button>
        )}
      </div>
    </div>
  );
}
