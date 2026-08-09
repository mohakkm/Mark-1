import type { IdeaDashboardData } from "@/types/dashboard";

interface ValidationDashboardProps {
  dashboard: IdeaDashboardData;
}

function formatPercent(value: number) {
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;
}

function getVerdictTone(replyRate: number, interestedCount: number) {
  if (interestedCount > 0) {
    return "Validation signal present";
  }

  if (replyRate >= 20) {
    return "Replies are coming in";
  }

  return "Validation still weak";
}

function StatCard({
  label,
  value,
  sub,
  index,
}: {
  label: string;
  value: string | number;
  sub: string;
  index: number;
}) {
  return (
    <div
      className="animate-rise border-l border-border pl-4 first:border-l-0 first:pl-0 sm:border-l sm:pl-4 sm:first:border-l"
      style={{ animationDelay: `${60 + index * 50}ms` }}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-serif text-3xl tracking-tight text-foreground tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function RankedPanel({
  title,
  caption,
  items,
  tone,
  delay = 0,
}: {
  title: string;
  caption: string;
  items: Array<{ label: string; count: number; percentage?: number }>;
  tone: "primary" | "muted";
  delay?: number;
}) {
  const max = Math.max(...items.map((i) => i.count), 1);
  const barColor = tone === "primary" ? "bg-primary" : "bg-foreground/35";

  return (
    <section
      className="animate-rise rounded-md border border-border bg-card"
      style={{ animationDelay: `${delay}ms` }}
      aria-label={title}
    >
      <div className="flex items-baseline justify-between border-b border-border px-5 py-3.5">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <span className="text-xs text-muted-foreground">{caption}</span>
      </div>
      <ol className="divide-y divide-border">
        {items.map((item, i) => {
          const pct = (item.count / max) * 100;
          return (
            <li
              key={item.label}
              className="group grid grid-cols-[1.25rem_1fr_2rem] items-center gap-3 px-5 py-3 transition-colors hover:bg-secondary/60"
            >
              <span className="text-xs tabular-nums text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm text-foreground">{item.label}</p>
                <div
                  className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-secondary"
                  role="presentation"
                >
                  <div
                    className={`h-full rounded-full ${barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <span className="text-right text-sm tabular-nums text-foreground">
                {item.count}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function ValidationDashboard({ dashboard }: ValidationDashboardProps) {
  const {
    totalLeads,
    messagedCount,
    repliedCount,
    replyRate,
    interestedCount,
    leadsWithInsightsCount,
    totalInsightsCount,
    interestDistribution,
    painPointFrequency,
    objectionFrequency,
  } = dashboard;

  const replyRatePercent = Math.round((repliedCount / totalLeads) * 100);
  const messagedRate = messagedCount > 0 ? Math.round((messagedCount / totalLeads) * 100) : 0;
  const repliedRate = messagedCount > 0 ? Math.round((repliedCount / messagedCount) * 100) : 0;
  const interestedRate = repliedCount > 0 ? Math.round((interestedCount / repliedCount) * 100) : 0;

  return (
    <section className="space-y-6">
      {/* Verdict Hero */}
      <div className="animate-rise" aria-label="Validation verdict">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Validation · Verdict
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-[1.1] tracking-tight text-balance text-foreground md:text-5xl">
          {repliedCount}/{totalLeads} replied
          <span className="text-muted-foreground"> · </span>
          <span className="text-primary">{replyRatePercent}% reply rate</span>
          <span className="text-muted-foreground"> · </span>
          {interestedCount} interested
        </h1>
        <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
          {getVerdictTone(replyRate, interestedCount)} for this idea based on the current outreach set.
        </p>
      </div>

      {/* Stat Cards */}
      <div
        aria-label="Pipeline stats"
        className="animate-rise grid grid-cols-2 gap-y-6 gap-x-4 rounded-md border border-border bg-card p-5 md:grid-cols-4"
        style={{ animationDelay: "60ms" }}
      >
        <StatCard
          label="Total leads"
          value={totalLeads}
          sub="in this pipeline"
          index={0}
        />
        <StatCard
          label="Messaged"
          value={messagedCount}
          sub={`${messagedRate}% of leads`}
          index={1}
        />
        <StatCard
          label="Replied"
          value={repliedCount}
          sub={`${repliedRate}% of messaged`}
          index={2}
        />
        <StatCard
          label="Interested"
          value={interestedCount}
          sub={`${interestedRate}% of replies`}
          index={3}
        />
      </div>

      {/* Ranked Panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RankedPanel
          title="Top pain points"
          caption="mentions"
          items={painPointFrequency}
          tone="primary"
          delay={180}
        />
        <RankedPanel
          title="Top objections"
          caption="mentions"
          items={objectionFrequency}
          tone="muted"
          delay={220}
        />
      </div>
    </section>
  );
}
