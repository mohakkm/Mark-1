"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

type AuthMode = "signin" | "signup" | "forgot";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authError = searchParams.get("error");
  const resetSuccess = searchParams.get("reset");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<AuthMode>("signin");
  const [error, setError] = useState<string | null>(
    authError === "auth_callback_failed"
      ? "Authentication failed. Please try again."
      : null
  );
  const [successMsg, setSuccessMsg] = useState<string | null>(
    resetSuccess === "success"
      ? "Password updated. Please sign in with your new password."
      : null
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const supabase = createClient();

    if (mode === "forgot") {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${origin}/auth/callback?type=recovery`,
        }
      );
      setLoading(false);
      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccessMsg(
          "If an account exists with that email, a reset link has been sent. Please check your inbox."
        );
        setEmail("");
      }
      return;
    }

    const { error: authErrorResult } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (authErrorResult) {
      setError(authErrorResult.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  const heading =
    mode === "signin"
      ? "Sign in to continue"
      : mode === "signup"
        ? "Create your account"
        : "Reset your password";

  const submitLabel =
    mode === "signin"
      ? "Sign in"
      : mode === "signup"
        ? "Sign up"
        : "Send reset link";

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-zinc-900">
          Idea Validation CRM
        </h1>
        <p className="mt-2 text-sm text-zinc-500">{heading}</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            />
          </div>

          {mode !== "forgot" && (
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-zinc-700"
                >
                  Password
                </label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setError(null);
                      setSuccessMsg(null);
                      setPassword("");
                    }}
                    className="text-xs font-medium text-zinc-500 hover:text-zinc-700"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
            </div>
          )}

          {error && (
            <p className="pt-1 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          {successMsg && (
            <p className="pt-1 text-sm text-emerald-600" role="status">
              {successMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? "Please wait…" : submitLabel}
          </button>
        </form>

        <div className="mt-6 space-y-2">
          {mode !== "forgot" && (
            <button
              type="button"
              onClick={() => {
                setMode((m) => (m === "signin" ? "signup" : "signin"));
                setError(null);
                setSuccessMsg(null);
              }}
              className="w-full text-sm text-zinc-500 hover:text-zinc-700"
            >
              {mode === "signin"
                ? "Need an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          )}
          {mode === "forgot" && (
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
                setSuccessMsg(null);
              }}
              className="w-full text-sm text-zinc-500 hover:text-zinc-700"
            >
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
