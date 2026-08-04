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

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
        <div className="space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Validation Verdict
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
            {repliedCount}/{totalLeads} leads replied ({formatPercent(replyRate)}),{" "}
            {interestedCount} marked interested
          </h2>
          <p className="text-sm text-zinc-600">
            {getVerdictTone(replyRate, interestedCount)} for this idea based on the current outreach set.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Total Leads
          </div>
          <div className="mt-2 text-2xl font-semibold text-zinc-950">{totalLeads}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Messaged
          </div>
          <div className="mt-2 text-2xl font-semibold text-zinc-950">{messagedCount}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Replied
          </div>
          <div className="mt-2 text-2xl font-semibold text-zinc-950">{repliedCount}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Reply Rate
          </div>
          <div className="mt-2 text-2xl font-semibold text-zinc-950">{formatPercent(replyRate)}</div>
          <div className="mt-1 text-xs text-zinc-500">Replied / messaged</div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs xl:col-span-1">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-950">Interest distribution</h3>
            <p className="text-xs text-zinc-500">
              Based on the latest insight for each replied lead. {leadsWithInsightsCount} leads with insight, {totalInsightsCount} total insight records.
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {interestDistribution.map((item) => (
              <div key={item.level} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm text-zinc-700">
                  <span className="capitalize">{item.level}</span>
                  <span>
                    {item.count} ({formatPercent(item.percentage)})
                  </span>
                </div>
                <div className="h-2 rounded-full bg-zinc-100">
                  <div
                    className="h-2 rounded-full bg-amber-600"
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600">
            {leadsWithInsightsCount === 0
              ? "No reply insights yet. Capture replies before reading validation signal."
              : interestDistribution[2].count > interestDistribution[0].count
                ? "High-interest replies currently outnumber low-interest replies."
                : interestDistribution[2].count === 0
                  ? "No high-interest replies captured yet."
                  : "High-interest replies exist, but low-interest replies are still larger or tied."}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-950">Recurring pain points</h3>
            <p className="text-xs text-zinc-500">
              Most-mentioned themes across all insight records for this idea.
            </p>
          </div>

          <div className="mt-4">
            {painPointFrequency.length === 0 ? (
              <p className="text-sm text-zinc-500">No pain points extracted yet.</p>
            ) : (
              <ul className="space-y-2">
                {painPointFrequency.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-2 text-sm last:border-b-0 last:pb-0"
                  >
                    <span className="text-zinc-800">{item.label}</span>
                    <span className="shrink-0 text-xs text-zinc-500">
                      {item.count} mentions ({formatPercent(item.percentage)})
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-950">Recurring objections</h3>
            <p className="text-xs text-zinc-500">
              Most-mentioned pushbacks across all insight records for this idea.
            </p>
          </div>

          <div className="mt-4">
            {objectionFrequency.length === 0 ? (
              <p className="text-sm text-zinc-500">No objections extracted yet.</p>
            ) : (
              <ul className="space-y-2">
                {objectionFrequency.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-2 text-sm last:border-b-0 last:pb-0"
                  >
                    <span className="text-zinc-800">{item.label}</span>
                    <span className="shrink-0 text-xs text-zinc-500">
                      {item.count} mentions ({formatPercent(item.percentage)})
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
