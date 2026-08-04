"use client";

import { useState, useTransition } from "react";
import type { Idea, IdeaInput } from "@/types/idea";
import { createIdeaAction, updateIdeaAction } from "@/app/actions/ideas";
import { X, Lightbulb, Loader2, Sparkles } from "lucide-react";

interface IdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  ideaToEdit?: Idea | null;
}

export function IdeaModal({ isOpen, onClose, ideaToEdit }: IdeaModalProps) {
  if (!isOpen) return null;

  return (
    <IdeaModalContent
      key={ideaToEdit?.id ?? "new-idea"}
      onClose={onClose}
      ideaToEdit={ideaToEdit}
    />
  );
}

interface IdeaModalContentProps {
  onClose: () => void;
  ideaToEdit?: Idea | null;
}

function IdeaModalContent({ onClose, ideaToEdit }: IdeaModalContentProps) {
  const [name, setName] = useState(() => ideaToEdit?.name ?? "");
  const [description, setDescription] = useState(() => ideaToEdit?.description ?? "");
  const [targetCustomer, setTargetCustomer] = useState(
    () => ideaToEdit?.target_customer ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEditMode = Boolean(ideaToEdit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !targetCustomer.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const payload: IdeaInput = {
          name: name.trim(),
          description: description.trim(),
          target_customer: targetCustomer.trim(),
        };

        if (isEditMode && ideaToEdit) {
          await updateIdeaAction(ideaToEdit.id, payload);
        } else {
          await createIdeaAction(payload);
        }

        onClose();
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred.");
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl transition-all">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              {isEditMode ? "Edit Idea" : "Create New Idea"}
            </h2>
            <p className="text-xs text-zinc-500">
              {isEditMode
                ? "Update your idea pitch and target validation persona."
                : "Define your business hypothesis to scope your validation outreach."}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Idea Name <span className="text-amber-600">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Founder CRM, Micro-SaaS Analytics"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Target Customer Persona <span className="text-amber-600">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Solo SaaS Founders, B2B Sales Reps, Marketing Agencies"
              value={targetCustomer}
              onChange={(e) => setTargetCustomer(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Pitch / Problem Statement <span className="text-amber-600">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="What core problem are you solving and how does your solution work?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
              required
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-zinc-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {isEditMode ? "Save Changes" : "Create Idea"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
