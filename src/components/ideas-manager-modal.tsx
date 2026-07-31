"use client";

import { useState, useTransition } from "react";
import type { Idea } from "@/types/idea";
import { selectIdea, deleteIdeaAction } from "@/app/actions/ideas";
import { X, Search, Check, Edit2, Trash2, Plus, Users, Lightbulb, Loader2 } from "lucide-react";

interface IdeasManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  ideas: Idea[];
  selectedIdeaId: string | null;
  onEditIdea: (idea: Idea) => void;
  onCreateIdea: () => void;
}

export function IdeasManagerModal({
  isOpen,
  onClose,
  ideas,
  selectedIdeaId,
  onEditIdea,
  onCreateIdea,
}: IdeasManagerModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const filteredIdeas = ideas.filter(
    (idea) =>
      idea.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.target_customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (ideaId: string) => {
    startTransition(async () => {
      await selectIdea(ideaId);
      onClose();
    });
  };

  const handleDelete = (ideaId: string) => {
    if (!confirm("Are you sure you want to delete this idea? All associated leads will be lost.")) {
      return;
    }
    setDeletingId(ideaId);
    startTransition(async () => {
      try {
        await deleteIdeaAction(ideaId);
      } finally {
        setDeletingId(null);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-zinc-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900">Manage Ideas</h2>
              <p className="text-xs text-zinc-500">Switch active idea or update your project list</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-zinc-100 px-6 py-3 bg-zinc-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Filter ideas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white py-1.5 pl-9 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <button
            onClick={() => {
              onClose();
              onCreateIdea();
            }}
            className="flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            New Idea
          </button>
        </div>

        {/* Ideas List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredIdeas.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-500">
              {searchTerm ? "No matching ideas found." : "No ideas created yet."}
            </div>
          ) : (
            filteredIdeas.map((idea) => {
              const isSelected = idea.id === selectedIdeaId;
              const isDeleting = deletingId === idea.id;

              return (
                <div
                  key={idea.id}
                  className={`group relative rounded-xl border p-4 transition-all ${
                    isSelected
                      ? "border-amber-400 bg-amber-50/40 ring-1 ring-amber-400/30"
                      : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-zinc-900 text-sm">{idea.name}</h3>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                            <Check className="h-3 w-3" /> Active
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                        <Users className="h-3.5 w-3.5 text-zinc-400" />
                        Target: {idea.target_customer}
                      </div>

                      <p className="text-xs text-zinc-600 line-clamp-2 mt-1">
                        {idea.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isSelected && (
                        <button
                          onClick={() => handleSelect(idea.id)}
                          disabled={isPending}
                          className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                        >
                          Select
                        </button>
                      )}
                      <button
                        onClick={() => {
                          onClose();
                          onEditIdea(idea);
                        }}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors cursor-pointer"
                        title="Edit Idea"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(idea.id)}
                        disabled={isDeleting}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50"
                        title="Delete Idea"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-red-600" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
