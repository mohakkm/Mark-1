import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-lg font-semibold text-zinc-900">
            Idea Validation CRM
          </h1>
          <form action="/auth/signout" method="post">
            <SignOutButton />
          </form>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-12">
        <p className="text-sm text-zinc-500">Signed in as {user.email}</p>
        <h2 className="mt-4 text-2xl font-semibold text-zinc-900">Dashboard</h2>
        <p className="mt-2 max-w-xl text-zinc-600">
          Phase 1 setup complete. Next up: Ideas CRUD (Phase 2) — create ideas,
          then add leads scoped to each idea.
        </p>
      </main>
    </div>
  );
}

function SignOutButton() {
  return (
    <button
      type="submit"
      className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
    >
      Sign out
    </button>
  );
}
