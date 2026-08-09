"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

type AuthMode = "signin" | "signup" | "forgot";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.22V7.04H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

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
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleSignIn() {
    setError(null);
    setSuccessMsg(null);
    setGoogleLoading(true);

    const supabase = createClient();
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });

    setGoogleLoading(false);
    if (oauthError) {
      setError(oauthError.message);
    }
  }

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

    if (
      mode === "signup" &&
      (password.length < 6 ||
        !/[a-z]/.test(password) ||
        !/[A-Z]/.test(password) ||
        !/[0-9]/.test(password))
    ) {
      setLoading(false);
      setError(
        "Password must include at least one lowercase letter, one uppercase letter, and one number."
      );
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

  const heroH1 =
    mode === "signin"
      ? "Welcome back"
      : mode === "signup"
        ? "Create your account"
        : "Reset your password";

  const heroSub =
    mode === "signin"
      ? "Sign in to pick up where your ideas left off."
      : mode === "signup"
        ? "Start running structured validation outreach in minutes."
        : "Enter your email and we&apos;ll send you a reset link.";

  const submitLabel =
    mode === "signin"
      ? "Sign in"
      : mode === "signup"
        ? "Sign up"
        : "Send reset link";

  const footerLabel =
    mode === "signin"
      ? "Need an account?"
      : mode === "signup"
        ? "Already have an account?"
        : "Remembered it?";

  const footerCta =
    mode === "signin"
      ? "Sign up"
      : mode === "signup"
        ? "Sign in"
        : "Back to sign in";

  const switchMode = () => {
    setError(null);
    setSuccessMsg(null);
    setPassword("");
    if (mode === "forgot") {
      setMode("signin");
    } else {
      setMode((m) => (m === "signin" ? "signup" : "signin"));
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-5 md:px-8">
          <Link href="/" className="flex items-center">
            <img
              src="/verdict-logo.png"
              alt="Verdict"
              className="h-10 w-auto object-contain mix-blend-multiply"
            />
          </Link>
          <Link
            href="/"
            className="rounded-sm px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-16 md:px-8">
        <div className="animate-rise w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-balance font-serif text-4xl leading-[1.1] tracking-tight text-foreground">
              {heroH1}
            </h1>
            <p
              className="mt-3 text-sm leading-relaxed text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: heroSub }}
            />
          </div>

          <div className="rounded-sm border border-border bg-card p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-medium text-foreground"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 rounded-sm border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-ring focus:ring-1 focus:ring-ring"
                />
              </div>

              {mode !== "forgot" && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between">
                    <label
                      htmlFor="password"
                      className="text-xs font-medium text-foreground"
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
                        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <input
                    id="password"
                    type="password"
                    minLength={6}
                    autoComplete={
                      mode === "signin" ? "current-password" : "new-password"
                    }
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-9 rounded-sm border border-border bg-background px-3 text-sm text-foreground caret-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-ring focus:ring-1 focus:ring-ring"
                  />
                </div>
              )}

              {error && (
                <p className="pt-1 text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}

              {successMsg && (
                <p
                  className="pt-1 text-sm text-positive"
                  role="status"
                >
                  {successMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 inline-flex h-9 items-center justify-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "Please wait…" : submitLabel}
              </button>
            </form>

            {mode !== "forgot" && (
              <>
                <div className="my-5 flex items-center gap-3">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                    or
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </div>

                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading || loading}
                    className="inline-flex h-9 items-center justify-center gap-2.5 rounded-sm border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    <GoogleMark />
                    {googleLoading ? "Connecting…" : "Sign in with Google"}
                  </button>
                </div>
              </>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {footerLabel}{" "}
            <button
              type="button"
              onClick={switchMode}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {footerCta}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
