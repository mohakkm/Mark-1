import type {
  DashboardFrequencyItem,
  DashboardInsightInput,
  DashboardLeadInput,
  IdeaDashboardData,
} from "@/types/dashboard";
import type { InsightInterestLevel } from "@/types/lead";

const INTEREST_LEVELS: InsightInterestLevel[] = ["low", "medium", "high"];

function roundPercentage(value: number) {
  return Math.round(value * 10) / 10;
}

function normalizeList(value: string[] | string | null): string[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  return [];
}

function aggregateFrequency(
  insights: DashboardInsightInput[],
  pickItems: (insight: DashboardInsightInput) => string[] | string | null
): DashboardFrequencyItem[] {
  if (insights.length === 0) {
    return [];
  }

  const counts = new Map<string, { label: string; count: number }>();

  for (const insight of insights) {
    const uniqueItems = new Set(
      normalizeList(pickItems(insight)).map((item) => item.replace(/\s+/g, " ").trim())
    );

    for (const item of uniqueItems) {
      const key = item.toLocaleLowerCase();
      const existing = counts.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(key, { label: item, count: 1 });
      }
    }
  }

  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .map((item) => ({
      label: item.label,
      count: item.count,
      percentage: roundPercentage((item.count / insights.length) * 100),
    }));
}

export function buildIdeaDashboard(
  leads: DashboardLeadInput[],
  insights: DashboardInsightInput[]
): IdeaDashboardData {
  const totalLeads = leads.length;
  const messagedCount = leads.filter((lead) => lead.status !== "not_contacted").length;

  const latestInsightByLead = new Map<string, DashboardInsightInput>();
  const sortedInsights = [...insights].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  for (const insight of sortedInsights) {
    if (!latestInsightByLead.has(insight.lead_id)) {
      latestInsightByLead.set(insight.lead_id, insight);
    }
  }

  const repliedLeadIds = new Set(
    leads
      .filter(
        (lead) =>
          lead.status === "replied" ||
          lead.status === "interested" ||
          lead.status === "not_interested"
      )
      .map((lead) => lead.id)
  );

  for (const leadId of latestInsightByLead.keys()) {
    repliedLeadIds.add(leadId);
  }

  const repliedCount = repliedLeadIds.size;
  const replyRate =
    messagedCount === 0 ? 0 : roundPercentage((repliedCount / messagedCount) * 100);
  const interestedCount = leads.filter((lead) => lead.status === "interested").length;
  const leadsWithInsightsCount = latestInsightByLead.size;
  const latestInsights = Array.from(latestInsightByLead.values());

  return {
    totalLeads,
    messagedCount,
    repliedCount,
    replyRate,
    interestedCount,
    leadsWithInsightsCount,
    totalInsightsCount: insights.length,
    interestDistribution: INTEREST_LEVELS.map((level) => {
      const count = latestInsights.filter((insight) => insight.interest_level === level).length;

      return {
        level,
        count,
        percentage:
          leadsWithInsightsCount === 0
            ? 0
            : roundPercentage((count / leadsWithInsightsCount) * 100),
      };
    }),
    painPointFrequency: aggregateFrequency(insights, (insight) => insight.pain_points),
    objectionFrequency: aggregateFrequency(insights, (insight) => insight.objections),
  };
}
