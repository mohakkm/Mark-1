"use client";

import type { Idea } from "@/types/idea";
import { Lightbulb, Edit3, Users, Sparkles, Plus, Layers } from "lucide-react";

interface IdeaDetailsCardProps {
  idea: Idea | null;
  onEdit: () => void;
  onCreateNew: () => void;
  onManage: () => void;
}

export function IdeaDetailsCard({
  idea,
  onEdit,
  onCreateNew,
  onManage,
}: IdeaDetailsCardProps) {
  if (!idea) {
    return (
      <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/40 p-8 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 mb-4">
          <Lightbulb className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900">No Ideas Found</h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-zinc-600">
          Define your business hypothesis and target customer persona to begin running structured validation outreach.
        </p>
        <button
          onClick={onCreateNew}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-amber-700 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Create Your First Idea
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs transition-all hover:shadow-md">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-200/60">
              <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
              Active Idea
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
              <Users className="h-3.5 w-3.5 text-zinc-400" />
              Target: {idea.target_customer}
            </span>
          </div>

          <div>
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">{idea.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              {idea.description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 border-t md:border-t-0 border-zinc-100 pt-3 md:pt-0">
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-colors cursor-pointer"
          >
            <Edit3 className="h-3.5 w-3.5 text-zinc-400" />
            Edit Idea
          </button>
          <button
            onClick={onManage}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300 transition-colors cursor-pointer"
          >
            <Layers className="h-3.5 w-3.5 text-zinc-400" />
            All Ideas
          </button>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition-colors cursor-pointer shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            + New Idea
          </button>
        </div>
      </div>
    </div>
  );
}
