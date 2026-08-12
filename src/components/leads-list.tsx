"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Lead, LeadStatus } from "@/types/lead";
import { updateLeadStatusAction, deleteLeadAction } from "@/app/actions/leads";
import { formatUtcDayMonth } from "@/lib/date-format";
import {
  Search,
  Plus,
  ExternalLink,
  Trash2,
  FileText,
  Loader2,
  X,
  Filter,
  ArrowUpRight,
} from "lucide-react";
import { LEADS_PER_IDEA_LIMIT } from "@/lib/limits";

interface LeadsListProps {
  leads: Lead[];
  ideaId: string;
  ideaName: string;
  onOpenAddModal: () => void;
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

export function LeadsList({
  leads,
  ideaName,
  onOpenAddModal,
}: LeadsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [viewRawLead, setViewRawLead] = useState<Lead | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      searchQuery === "" ||
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.company && lead.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.role && lead.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.headline && lead.headline.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      selectedStatus === "all" || lead.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    setUpdatingId(leadId);
    startTransition(async () => {
      try {
        await updateLeadStatusAction(leadId, newStatus);
      } finally {
        setUpdatingId(null);
      }
    });
  };

  const handleDeleteLead = (leadId: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;

    setDeletingId(leadId);
    startTransition(async () => {
      try {
        await deleteLeadAction(leadId);
      } finally {
        setDeletingId(null);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-zinc-200">
        <div>
          <h3 className="text-base font-semibold text-zinc-900">
            Leads for &quot;{ideaName}&quot; ({leads.length})
          </h3>
          <p className="text-xs text-zinc-500">
            Structured contacts added via pasted LinkedIn profile blobs
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          disabled={leads.length >= LEADS_PER_IDEA_LIMIT}
          title={leads.length >= LEADS_PER_IDEA_LIMIT ? `Lead limit reached (${LEADS_PER_IDEA_LIMIT}/${LEADS_PER_IDEA_LIMIT})` : undefined}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-amber-700 transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          {leads.length >= LEADS_PER_IDEA_LIMIT ? "Limit Reached" : "Add Lead"}
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-50 p-3 rounded-xl border border-zinc-200">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search leads by name, role, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white py-1.5 pl-9 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-zinc-400 shrink-0" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-auto rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-700 focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All Statuses ({leads.length})</option>
            <option value="not_contacted">Not Contacted</option>
            <option value="messaged">Messaged</option>
            <option value="replied">Replied</option>
            <option value="interested">Interested</option>
            <option value="not_interested">Not Interested</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      {filteredLeads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <p className="text-sm text-zinc-500">
            {leads.length === 0
              ? "No leads added for this idea yet. Click 'Add Lead' to paste your first profile blob."
              : "No leads match the active filter criteria."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs text-zinc-600">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Lead / Headline</th>
                <th className="px-4 py-3">Role & Company</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Added</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredLeads.map((lead) => {
                const statusMeta = STATUS_LABELS[lead.status] || STATUS_LABELS.not_contacted;
                const isUpdating = updatingId === lead.id;
                const isDeleting = deletingId === lead.id;

                return (
                  <tr key={lead.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-zinc-900 text-sm flex items-center gap-1.5">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="hover:text-amber-700 transition-colors"
                        >
                          {lead.name}
                        </Link>
                        {lead.linkedin_url && (
                          <a
                            href={lead.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                            title="Open LinkedIn profile"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      {lead.headline && (
                        <div className="text-zinc-500 line-clamp-1 max-w-xs mt-0.5">
                          {lead.headline}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-800">
                        {lead.role || "—"}
                      </div>
                      <div className="text-zinc-500">{lead.company || "—"}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="relative inline-block">
                        <select
                          value={lead.status}
                          disabled={isUpdating || isPending}
                          onChange={(e) =>
                            handleStatusChange(lead.id, e.target.value as LeadStatus)
                          }
                          className={`rounded-md border px-2 py-1 text-xs font-semibold focus:outline-none cursor-pointer ${statusMeta.className}`}
                        >
                          <option value="not_contacted">Not Contacted</option>
                          <option value="messaged">Messaged</option>
                          <option value="replied">Replied</option>
                          <option value="interested">Interested</option>
                          <option value="not_interested">Not Interested</option>
                        </select>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">
                      {formatUtcDayMonth(lead.created_at)}
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                          title="Open lead detail"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setViewRawLead(lead)}
                          className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                          title="View raw profile paste"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          disabled={isDeleting}
                          className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete lead"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Raw profile paste viewer modal */}
      {viewRawLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-xl rounded-xl border border-zinc-200 bg-white p-6 shadow-xl max-h-[80vh] flex flex-col">
            <button
              onClick={() => setViewRawLead(null)}
              className="absolute right-4 top-4 rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-semibold text-zinc-900 mb-1">
              Raw Profile Blob: {viewRawLead.name}
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Stored raw text pasted during lead creation
            </p>

            <div className="flex-1 overflow-y-auto rounded-lg bg-zinc-50 p-4 border border-zinc-200 font-mono text-xs text-zinc-800 whitespace-pre-wrap">
              {viewRawLead.raw_pasted_profile}
            </div>

            {viewRawLead.notes && (
              <div className="mt-4 pt-3 border-t border-zinc-200">
                <div className="text-xs font-semibold text-zinc-700">Notes:</div>
                <p className="text-xs text-zinc-600 mt-0.5">{viewRawLead.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
