"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Lead, LeadStatus, Conversation, Insight } from "@/types/lead";
import type { Idea } from "@/types/idea";
import { updateLeadStatusAction, deleteLeadAction } from "@/app/actions/leads";
import { formatUtcDayMonthYear } from "@/lib/date-format";
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
} from "lucide-react";

interface LeadDetailViewProps {
  lead: Lead;
  idea: Idea | null;
  conversations: Conversation[];
  insights: Insight[];
}

const STATUS_LABELS: Record<LeadStatus, { label: string; className: string }> = {
  not_contacted: {
    label: "Not Contacted",
    className: "bg-zinc-100 text-zinc-700 border-zinc-200",
  },
  messaged: {
    label: "Messaged",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  replied: {
    label: "Replied",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  interested: {
    label: "Interested",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  not_interested: {
    label: "Not Interested",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

export function LeadDetailView({
  lead,
  idea,
  conversations,
  insights,
}: LeadDetailViewProps) {
  const router = useRouter();
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [activeTab, setActiveTab] = useState<"profile" | "conversations" | "insights">("profile");
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [, startTransition] = useTransition();

  const statusMeta = STATUS_LABELS[status] || STATUS_LABELS.not_contacted;

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
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Dashboard
            </Link>

            {idea && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                <span>/</span>
                <span className="flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  <Lightbulb className="h-3 w-3 text-amber-600" />
                  {idea.name}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Delete Lead
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 sm:px-6 space-y-6">
        {/* Lead Profile Hero Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                  <User className="h-3.5 w-3.5 text-zinc-400" />
                  Lead Detail
                </span>

                <div className="relative inline-block">
                  <select
                    value={status}
                    disabled={isUpdatingStatus}
                    onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold focus:outline-none cursor-pointer ${statusMeta.className}`}
                  >
                    <option value="not_contacted">Not Contacted</option>
                    <option value="messaged">Messaged</option>
                    <option value="replied">Replied</option>
                    <option value="interested">Interested</option>
                    <option value="not_interested">Not Interested</option>
                  </select>
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                  {lead.name}
                  {lead.linkedin_url && (
                    <a
                      href={lead.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                      title="Open LinkedIn Profile"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </h1>

                {lead.headline && (
                  <p className="mt-1 text-sm text-zinc-600 font-medium">
                    {lead.headline}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600 pt-1">
                {lead.role && (
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Role: <strong className="text-zinc-800">{lead.role}</strong></span>
                  </div>
                )}

                {lead.company && (
                  <div className="flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Company: <strong className="text-zinc-800">{lead.company}</strong></span>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Added {formatUtcDayMonthYear(lead.created_at)}</span>
                </div>

                {lead.last_contact && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Last Contact {formatUtcDayMonthYear(lead.last_contact)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-zinc-200">
          <nav className="flex space-x-6">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 border-b-2 py-3 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === "profile"
                  ? "border-amber-600 text-amber-800"
                  : "border-transparent text-zinc-500 hover:text-zinc-700"
              }`}
            >
              <FileText className="h-4 w-4" />
              Profile
            </button>

            <button
              onClick={() => setActiveTab("conversations")}
              className={`flex items-center gap-2 border-b-2 py-3 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === "conversations"
                  ? "border-amber-600 text-amber-800"
                  : "border-transparent text-zinc-500 hover:text-zinc-700"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Outreach & Messages ({conversations.length})
            </button>

            <button
              onClick={() => setActiveTab("insights")}
              className={`flex items-center gap-2 border-b-2 py-3 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === "insights"
                  ? "border-amber-600 text-amber-800"
                  : "border-transparent text-zinc-500 hover:text-zinc-700"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Reply Insights ({insights.length})
            </button>
          </nav>
        </div>

        {/* Tab 1: Profile & Notes */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-semibold text-zinc-900 mb-4">Structured Profile</h3>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Name
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-900">{lead.name}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Status
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-900">{statusMeta.label}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Role
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-900">{lead.role || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Company
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-900">{lead.company || "—"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Headline
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-900">{lead.headline || "—"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Notes
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-900 whitespace-pre-wrap">
                    {lead.notes || "—"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">Raw Pasted Profile Text</h3>
                  <p className="text-xs text-zinc-500">The original text block pasted during lead creation</p>
                </div>

                <button
                  onClick={handleCopyRaw}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-zinc-400" />
                      Copy Raw Text
                    </>
                  )}
                </button>
              </div>

              <div className="rounded-lg bg-zinc-900 p-4 font-mono text-xs text-zinc-100 overflow-x-auto whitespace-pre-wrap max-h-96">
                {lead.raw_pasted_profile}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Conversations (Placeholder for Phase 4) */}
        {activeTab === "conversations" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-3">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">Conversation History is Empty</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                Outreach and reply conversation entries will appear here in later phases.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Insights (Placeholder for Phase 5) */}
        {activeTab === "insights" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 mb-3">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">Insight History is Empty</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                Extracted insights will appear here after reply capture is implemented.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
