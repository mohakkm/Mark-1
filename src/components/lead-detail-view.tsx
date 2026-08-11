"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Lead, LeadStatus, Conversation, Insight } from "@/types/lead";
import type { Idea } from "@/types/idea";
import { updateLeadStatusAction, deleteLeadAction } from "@/app/actions/leads";
import { SiteFooter, appFooterLinks } from "@/components/site-footer";
import { formatUtcDayMonthYear, formatUtcDayMonthYearTime } from "@/lib/date-format";
import {
  ArrowLeft,
  ExternalLink,
  Trash2,
  FileText,
  MessageSquare,
  Sparkles,
  Lightbulb,
  Calendar,
  Building,
  Briefcase,
  User,
  Check,
  Loader2,
  Copy,
  Clock,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

interface LeadDetailViewProps {
  lead: Lead;
  idea: Idea | null;
  conversations: Conversation[];
  insights: Insight[];
}

const STATUS_LABELS: Record<LeadStatus, { label: string; className: string; tone: string }> = {
  not_contacted: {
    label: "Not Contacted",
    className: "bg-secondary text-secondary-foreground border-border",
    tone: "neutral",
  },
  messaged: {
    label: "Messaged",
    className: "bg-secondary text-secondary-foreground border-border",
    tone: "primary",
  },
  replied: {
    label: "Replied",
    className: "bg-secondary text-secondary-foreground border-border",
    tone: "primary",
  },
  interested: {
    label: "Interested",
    className: "bg-secondary text-secondary-foreground border-border",
    tone: "positive",
  },
  not_interested: {
    label: "Not Interested",
    className: "bg-secondary text-secondary-foreground border-border",
    tone: "warn",
  },
};

const toneDot: Record<string, string> = {
  positive: "bg-positive",
  primary: "bg-primary",
  warn: "bg-warn",
  neutral: "bg-neutral",
};

export function LeadDetailView({
  lead,
  idea,
  conversations,
  insights,
}: LeadDetailViewProps) {
  const router = useRouter();
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [lastContactAt, setLastContactAt] = useState<string | null>(lead.last_contact);
  const [conversationItems, setConversationItems] = useState<Conversation[]>(conversations);
  const [insightItems, setInsightItems] = useState<Insight[]>(insights);
  const [activeTab, setActiveTab] = useState<"profile" | "conversations" | "insights">("profile");
  const [rawCopied, setRawCopied] = useState(false);
  const [generatedCopied, setGeneratedCopied] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [messageError, setMessageError] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyError, setReplyError] = useState<string | null>(null);
  const [isGeneratingType, setIsGeneratingType] = useState<"first" | "followup" | null>(null);
  const [isCapturingReply, setIsCapturingReply] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [, startTransition] = useTransition();

  const statusMeta = STATUS_LABELS[status] || STATUS_LABELS.not_contacted;
  const hasOutgoingMessage = conversationItems.some((item) => item.type === "outgoing");
  const canGenerateFollowup = hasOutgoingMessage;

  const handleStatusChange = (newStatus: LeadStatus) => {
    setStatus(newStatus);
    setIsUpdatingStatus(true);
    startTransition(async () => {
      try {
        await updateLeadStatusAction(lead.id, newStatus);
      } finally {
        setIsUpdatingStatus(false);
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this lead? This action cannot be undone.")) return;

    setIsDeleting(true);
    startTransition(async () => {
      try {
        await deleteLeadAction(lead.id);
        router.push("/");
      } catch {
        setIsDeleting(false);
      }
    });
  };

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(lead.raw_pasted_profile);
    setRawCopied(true);
    setTimeout(() => setRawCopied(false), 2000);
  };

  const handleCopyGenerated = () => {
    if (!generatedMessage) return;
    navigator.clipboard.writeText(generatedMessage);
    setGeneratedCopied(true);
    setTimeout(() => setGeneratedCopied(false), 2000);
  };

  const handleGenerateMessage = async (type: "first" | "followup") => {
    if (type === "first" && hasOutgoingMessage) {
      setMessageError("First message already exists for this lead. Use Generate Follow-up.");
      return;
    }

    setMessageError(null);
    setGeneratedCopied(false);
    setIsGeneratingType(type);
    try {
      const response = await fetch(`/api/leads/${lead.id}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      });

      const data = (await response.json().catch(() => null)) as
        | { message?: string; conversation?: Conversation; error?: string }
        | null;

      if (!response.ok) {
        throw new Error(data?.error || "Failed to generate message.");
      }

      if (!data?.message || !data.conversation) {
        throw new Error("Message generation response was incomplete.");
      }

      setGeneratedMessage(data.message);
      setConversationItems((current) => [data.conversation as Conversation, ...current]);
      setLastContactAt(new Date().toISOString());
      if (status === "not_contacted") {
        setStatus("messaged");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to generate message.";
      setMessageError(message);
    } finally {
      setIsGeneratingType(null);
    }
  };

  const handleCaptureReply = async () => {
    if (!replyText.trim()) {
      setReplyError("Please paste the reply text before extracting insights.");
      return;
    }

    setReplyError(null);
    setIsCapturingReply(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reply_text: replyText.trim() }),
      });

      const data = (await response.json().catch(() => null)) as
        | {
            insight?: Insight;
            conversation?: Conversation;
            lead_status?: LeadStatus;
            last_contact?: string | null;
            error?: string;
          }
        | null;

      if (!response.ok) {
        throw new Error(data?.error || "Failed to capture reply.");
      }

      if (!data?.insight || !data.conversation || !data.lead_status) {
        throw new Error("Reply capture response was incomplete.");
      }

      setConversationItems((current) => [data.conversation as Conversation, ...current]);
      setInsightItems((current) => [data.insight as Insight, ...current]);
      setStatus(data.lead_status);
      setLastContactAt(data.last_contact ?? new Date().toISOString());
      setReplyText("");
      setActiveTab("insights");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to capture reply.";
      setReplyError(message);
    } finally {
      setIsCapturingReply(false);
    }
  };

  const normalizeInsightList = (value: Insight["pain_points"]): string[] => {
    if (!value) {
      return [];
    }
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === "string" && item.trim() !== "");
    }
    if (typeof value === "string" && value.trim()) {
      return [value.trim()];
    }
    return [];
  };

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans antialiased">
      {/* minimal top bar — brand only, matching the app chrome */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-5 md:px-8">
          <Link href="/" className="flex items-center">
            <img
              src="/verdict-logo.png"
              alt="Verdict"
              className="h-10 w-auto object-contain mix-blend-multiply"
            />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              Back to pipeline
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 rounded-sm border border-destructive/50 bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
              Delete
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 pb-20 pt-8 md:px-8 md:pt-12">
        <p
          className="animate-rise text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground"
          style={{ animationDelay: "0ms" }}
        >
          {idea?.name} · Lead
        </p>

        {/* Profile header */}
        <div
          className="animate-rise mt-3 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between"
          style={{ animationDelay: "40ms" }}
        >
          <div>
            <h1 className="text-balance font-serif text-4xl leading-[1.05] tracking-tight text-foreground">
              {lead.name}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {lead.role} · {lead.company}
            </p>
            <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-foreground">
              {lead.headline || `${lead.role} at ${lead.company}, evaluating ${idea?.description || "this idea"}.`}
            </p>
          </div>
          <div className="flex items-center gap-2.5 rounded-sm border border-border bg-secondary/50 px-3 py-2">
            <span
              className={`size-2 rounded-full ${toneDot[statusMeta.tone]}`}
              aria-hidden="true"
            />
            <span className="text-sm font-medium text-foreground">
              {statusMeta.label}
            </span>
            <span className="text-xs text-muted-foreground">
              · {lastContactAt ? formatUtcDayMonthYear(lastContactAt) : "No contact yet"}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-border mt-6">
          <nav className="flex space-x-6">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 border-b-2 py-3 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === "profile"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="h-4 w-4" />
              Profile
            </button>

            <button
              onClick={() => setActiveTab("conversations")}
              className={`flex items-center gap-2 border-b-2 py-3 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === "conversations"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Outreach & Messages ({conversationItems.length})
            </button>

            <button
              onClick={() => setActiveTab("insights")}
              className={`flex items-center gap-2 border-b-2 py-3 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === "insights"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Reply Insights ({insightItems.length})
            </button>
          </nav>
        </div>

        {/* Tab 1: Profile & Notes */}
        {activeTab === "profile" && (
          <div className="space-y-6 mt-6">
            <div className="rounded-md border border-border bg-card p-5 shadow-xs">
              <h3 className="text-sm font-semibold text-foreground mb-4">Structured Profile</h3>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Name
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">{lead.name}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">{statusMeta.label}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Role
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">{lead.role || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Company
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">{lead.company || "—"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Headline
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">{lead.headline || "—"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Notes
                  </dt>
                  <dd className="mt-1 text-sm text-foreground whitespace-pre-wrap">
                    {lead.notes || "—"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-md border border-border bg-card p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Raw Pasted Profile Text</h3>
                  <p className="text-xs text-muted-foreground">The original text block pasted during lead creation</p>
                </div>

                <button
                  onClick={handleCopyRaw}
                  className="flex items-center gap-1.5 rounded-sm border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                >
                  {rawCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-positive" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      Copy Raw Text
                    </>
                  )}
                </button>
              </div>

              <div className="rounded-sm bg-secondary p-4 font-mono text-xs text-foreground overflow-x-auto whitespace-pre-wrap max-h-96">
                {lead.raw_pasted_profile}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Conversations (Placeholder for Phase 4) */}
        {activeTab === "conversations" && (
          <div className="space-y-5 mt-6">
            <div className="rounded-md border border-border bg-card p-5 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleGenerateMessage("first")}
                  disabled={isGeneratingType !== null || !idea || hasOutgoingMessage}
                  className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {isGeneratingType === "first" ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Generating...
                    </>
                  ) : hasOutgoingMessage ? (
                    "First Message Already Generated"
                  ) : (
                    <>
                      <Sparkles className="size-3.5" />
                      Generate First Message
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleGenerateMessage("followup")}
                  disabled={isGeneratingType !== null || !canGenerateFollowup || !idea}
                  className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                  {isGeneratingType === "followup" ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Follow-up"
                  )}
                </button>
              </div>

              {messageError && (
                <div className="flex items-start gap-2 rounded-sm border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{messageError}</span>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Generated Message</h3>
                  <button
                    onClick={handleCopyGenerated}
                    disabled={!generatedMessage}
                    className="flex items-center gap-1.5 rounded-sm border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    {generatedCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-positive" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        Copy Message
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  value={generatedMessage}
                  readOnly
                  rows={5}
                  placeholder="Generate a message to preview it here. This app never sends anything to LinkedIn automatically."
                  className="w-full rounded-sm border border-border bg-secondary/40 p-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <p className="text-[11px] text-muted-foreground">
                  Manual flow only: copy this text and paste it into LinkedIn yourself.
                </p>
              </div>

              <div className="space-y-2 border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-foreground">Paste Reply</h3>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={5}
                  placeholder="Paste the lead's LinkedIn reply text here..."
                  className="w-full rounded-sm border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                {replyError && (
                  <div className="flex items-start gap-2 rounded-sm border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{replyError}</span>
                  </div>
                )}
                <button
                  onClick={handleCaptureReply}
                  disabled={isCapturingReply || !replyText.trim()}
                  className="rounded-sm bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
                >
                  {isCapturingReply ? "Extracting Insight..." : "Capture Reply & Extract Insight"}
                </button>
              </div>
            </div>

            {conversationItems.length === 0 ? (
              <div className="rounded-md border border-dashed border-border bg-card p-8 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">No Messages Yet</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Generate your first outreach message above. Messages are saved to history after generation.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {conversationItems.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-sm border p-4 ${
                      msg.type === "outgoing"
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-secondary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className={msg.type === "outgoing" ? "text-primary" : "text-foreground"}>
                        {msg.type === "outgoing" ? "Outgoing Message" : "Incoming Reply"}
                      </span>
                      <span className="text-muted-foreground">
                        {formatUtcDayMonthYearTime(msg.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-foreground whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Insights (Placeholder for Phase 5) */}
        {activeTab === "insights" && (
          <div className="space-y-4 mt-6">
            {insightItems.length === 0 ? (
              <div className="rounded-md border border-dashed border-border bg-card p-8 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Insight History is Empty</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Capture a pasted reply to generate and store the first insight.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {insightItems.map((ins) => {
                  const painPoints = normalizeInsightList(ins.pain_points);
                  const objections = normalizeInsightList(ins.objections);
                  return (
                  <div key={ins.id} className="rounded-md border border-border bg-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">Insight Summary</span>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-sm bg-primary/10 text-primary">
                        Interest: {ins.interest_level}
                      </span>
                    </div>
                    <p className="text-xs text-foreground whitespace-pre-wrap">{ins.summary}</p>

                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Pain Points
                      </div>
                      {painPoints.length === 0 ? (
                        <p className="text-xs text-muted-foreground">—</p>
                      ) : (
                        <ul className="list-disc pl-4 text-xs text-foreground space-y-1">
                          {painPoints.map((point, index) => (
                            <li key={`${ins.id}-pain-${index}`}>{point}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Objections
                      </div>
                      {objections.length === 0 ? (
                        <p className="text-xs text-muted-foreground">—</p>
                      ) : (
                        <ul className="list-disc pl-4 text-xs text-foreground space-y-1">
                          {objections.map((point, index) => (
                            <li key={`${ins.id}-obj-${index}`}>{point}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>
        )}
      </main>

      <SiteFooter links={appFooterLinks} />
    </div>
  );
}
