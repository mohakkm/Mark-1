import { createClient } from "@/lib/supabase/server";
import { buildIdeaDashboard } from "@/lib/dashboard";
import { getSelectedIdeaId } from "@/lib/selected-idea";
import { redirect } from "next/navigation";
import { DashboardView } from "@/components/dashboard-view";
import type { Idea } from "@/types/idea";
import type { Lead } from "@/types/lead";
import type { DashboardInsightInput, IdeaDashboardData } from "@/types/dashboard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteFooter, landingFooterLinks } from "@/components/site-footer";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        {/* minimal top bar — brand only, matching the app chrome */}
        <header className="border-b border-border">
          <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-5 md:px-8">
            <div className="flex items-center">
              <img
                src="/verdict-logo.png"
                alt="Verdict"
                className="h-10 w-auto object-contain mix-blend-multiply"
              />
            </div>
            <Link
              href="/login"
              className="rounded-sm px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
          </div>
        </header>

        <main className="mx-auto flex-1 max-w-4xl px-5 md:px-8">
          <section className="animate-rise flex flex-col justify-center py-20">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Idea validation, not sales automation
            </p>

            <h1 className="mt-6 max-w-3xl text-balance font-serif text-5xl leading-[1.05] tracking-tight text-foreground md:text-7xl">
              Know if the idea is <span className="text-primary">worth building</span>{' '}
              before you build the funnel.
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
              Sales tools optimize a pipeline you haven&apos;t earned yet. Verdict
              reads the only thing that matters this early — reply rates, real pain
              points, and honest objections — so you learn whether to keep going in
              days, not quarters.
            </p>

            <div className="mt-10 flex items-center gap-4">
              <Link
                href="/login"
                className="group inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Validate an idea
                <ArrowRight
                  className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
              <span className="text-xs text-muted-foreground">
                No credit card — pre-launch access
              </span>
            </div>

            {/* How it works */}
            <div id="how-it-works" className="mt-16 border-t border-border pt-8 scroll-mt-20">
              <h2 className="font-serif text-2xl text-foreground md:text-3xl">
                How it works
              </h2>
              <div className="mt-6 space-y-6">
                <div className="flex gap-4">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground font-serif text-sm">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Paste a profile → AI drafts your outreach</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground font-serif text-sm">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-foreground">You send it, they reply</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground font-serif text-sm">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Paste their reply → AI extracts the signal</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust/safety statement */}
            <div className="mt-12 border-t border-border pt-8">
              <p className="text-sm text-muted-foreground leading-relaxed">
                No LinkedIn automation, no bots, no ban risk. You paste, you send, you stay in control — Verdict just helps you think and track.
              </p>
            </div>

            {/* single quiet proof line, hairline-divided, no feature grid */}
            <dl className="mt-16 flex flex-wrap items-baseline gap-x-10 gap-y-4 border-t border-border pt-6">
              <div>
                <dt className="text-xs text-muted-foreground">Signal per idea</dt>
                <dd className="mt-1 font-serif text-2xl text-foreground">
                  Reply rate · pain · objections
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Time to a verdict</dt>
                <dd className="mt-1 font-serif text-2xl text-foreground">Days</dd>
              </div>
            </dl>
          </section>
        </main>

        <SiteFooter links={landingFooterLinks} />
      </div>
    );
  }

  const { data: ideasData } = await supabase
    .from("ideas")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const ideas: Idea[] = ideasData ?? [];
  const selectedIdeaId = await getSelectedIdeaId(ideas);

  let leads: Lead[] = [];
  let dashboard: IdeaDashboardData | null = null;
  if (selectedIdeaId) {
    const { data: leadsData, error: leadsError } = await supabase
      .from("leads")
      .select("*")
      .eq("idea_id", selectedIdeaId)
      .order("created_at", { ascending: false });

    if (leadsError) {
      throw new Error(leadsError.message);
    }

    leads = (leadsData as Lead[]) ?? [];

    const leadIds = leads.map((lead) => lead.id);
    if (leadIds.length === 0) {
      dashboard = buildIdeaDashboard([], []);
    } else {
      const { data: insightsData, error: insightsError } = await supabase
        .from("insights")
        .select("id, lead_id, pain_points, objections, interest_level, created_at")
        .in("lead_id", leadIds);

      if (insightsError) {
        throw new Error(insightsError.message);
      }

      dashboard = buildIdeaDashboard(
        leads.map((lead) => ({ id: lead.id, status: lead.status })),
        ((insightsData as DashboardInsightInput[] | null) ?? [])
      );
    }
  }

  return (
    <DashboardView
      userEmail={user.email ?? ""}
      ideas={ideas}
      selectedIdeaId={selectedIdeaId}
      leads={leads}
      dashboard={dashboard}
    />
  );
}
