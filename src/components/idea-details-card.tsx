"use client";

import type { Idea } from "@/types/idea";
import { Plus } from "lucide-react";

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
      <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-8 text-center">
        <h3 className="text-lg font-semibold text-foreground">No Ideas Found</h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Define your business hypothesis and target customer persona to begin running structured validation outreach.
        </p>
        <button
          onClick={onCreateNew}
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Create Your First Idea
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-card p-5">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary border border-primary/20">
              Active Idea
            </span>
            <span className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
              Target: {idea.target_customer}
            </span>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">{idea.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {idea.description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 border-t md:border-t-0 border-border pt-3 md:pt-0">
          <button
            onClick={onEdit}
            className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            Edit Idea
          </button>
          <button
            onClick={onManage}
            className="inline-flex items-center rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            All Ideas
          </button>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
          >
            + New Idea
          </button>
        </div>
      </div>
    </div>
  );
}
