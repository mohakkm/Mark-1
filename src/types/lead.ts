export type LeadStatus =
  | "not_contacted"
  | "messaged"
  | "replied"
  | "interested"
  | "not_interested";

export type Lead = {
  id: string;
  idea_id: string;
  name: string;
  company: string | null;
  role: string | null;
  headline: string | null;
  linkedin_url: string | null;
  raw_pasted_profile: string;
  status: LeadStatus;
  notes: string | null;
  last_contact: string | null;
  created_at: string;
};

export type CreateLeadInput = {
  idea_id: string;
  raw_pasted_profile: string;
  linkedin_url?: string;
  notes?: string;
};

export type GroqStructuredLead = {
  name: string;
  company: string | null;
  role: string | null;
  headline: string | null;
};

export type ConversationType = "outgoing" | "incoming";

export type Conversation = {
  id: string;
  lead_id: string;
  type: ConversationType;
  content: string;
  created_at: string;
};

export type InsightInterestLevel = "low" | "medium" | "high";

export type Insight = {
  id: string;
  lead_id: string;
  summary: string;
  pain_points: string[] | string | null;
  objections: string[] | string | null;
  suggestions: string[] | string | null;
  interest_level: InsightInterestLevel;
  created_at: string;
};
