"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import type { Idea } from "@/types/idea";
import { selectIdea } from "@/app/actions/ideas";
import { ChevronDown, Check } from "lucide-react";

interface IdeaSwitcherProps {
  ideas: Idea[];
  selectedIdeaId: string | null;
  onOpenCreateModal: () => void;
  onOpenManageModal: () => void;
}

export function IdeaSwitcher({
  ideas,
  selectedIdeaId,
  onOpenCreateModal,
  onOpenManageModal,
}: IdeaSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedIdea = ideas.find((i) => i.id === selectedIdeaId) ?? ideas[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (ideaId: string) => {
    if (ideaId === selectedIdeaId) {
      setIsOpen(false);
      return;
    }
    startTransition(async () => {
      await selectIdea(ideaId);
      setIsOpen(false);
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-2.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm font-medium text-zinc-900 shadow-xs hover:bg-zinc-100 hover:border-zinc-300 transition-all cursor-pointer disabled:opacity-50"
        aria-expanded={isOpen}
      >
        <div className="flex flex-col items-start text-left">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 leading-none">
            Active Idea
          </span>
          <span className="font-semibold text-zinc-800 text-sm truncate max-w-[160px] sm:max-w-[220px]">
            {selectedIdea ? selectedIdea.name : "Select an Idea"}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 origin-top-left rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Your Ideas ({ideas.length})
          </div>

          {ideas.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-zinc-500">
              No ideas created yet.
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-0.5">
              {ideas.map((idea) => {
                const isSelected = idea.id === selectedIdeaId;
                return (
                  <button
                    key={idea.id}
                    onClick={() => handleSelect(idea.id)}
                    className={`flex w-full items-start justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-amber-50 text-amber-900 font-medium"
                        : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                    }`}
                  >
                    <div className="flex-1 pr-2 truncate">
                      <div className="font-medium text-sm truncate">{idea.name}</div>
                      <div className="text-xs text-zinc-400 truncate">{idea.target_customer}</div>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-1.5 border-t border-zinc-100 pt-1.5 space-y-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenCreateModal();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
            >
              Create New Idea
            </button>
            {ideas.length > 0 && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenManageModal();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                Manage All Ideas
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
