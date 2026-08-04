import type { InsightInterestLevel, LeadStatus } from "@/types/lead";

export type DashboardLeadInput = {
  id: string;
  status: LeadStatus;
};

export type DashboardInsightInput = {
  id: string;
  lead_id: string;
  pain_points: string[] | string | null;
  objections: string[] | string | null;
  interest_level: InsightInterestLevel;
  created_at: string;
};

export type DashboardDistributionItem = {
  level: InsightInterestLevel;
  count: number;
  percentage: number;
};

export type DashboardFrequencyItem = {
  label: string;
  count: number;
  percentage: number;
};

export type IdeaDashboardData = {
  totalLeads: number;
  messagedCount: number;
  repliedCount: number;
  replyRate: number;
  interestedCount: number;
  leadsWithInsightsCount: number;
  totalInsightsCount: number;
  interestDistribution: DashboardDistributionItem[];
  painPointFrequency: DashboardFrequencyItem[];
  objectionFrequency: DashboardFrequencyItem[];
};
