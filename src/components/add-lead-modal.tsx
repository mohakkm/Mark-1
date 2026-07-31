"use client";

import { useState, useTransition } from "react";
import { createLeadAction } from "@/app/actions/leads";
import { X, Sparkles, Loader2, AlertCircle } from "lucide-react";

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  ideaId: string;
  ideaName: string;
}

export function AddLeadModal({
  isOpen,
  onClose,
  ideaId,
  ideaName,
}: AddLeadModalProps) {
  const [rawText, setRawText] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) {
      setError("Please paste profile text before submitting.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await createLeadAction({
          idea_id: ideaId,
          raw_pasted_profile: rawText.trim(),
          linkedin_url: linkedinUrl.trim() || undefined,
          notes: notes.trim() || undefined,
        });

        // Reset & close on success
        setRawText("");
        setLinkedinUrl("");
        setNotes("");
        onClose();
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to extract lead details from profile text.");
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-xl rounded-xl border border-zinc-200 bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          disabled={isPending}
          className="absolute right-4 top-4 rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-zinc-900">Add Lead</h2>
          <p className="text-xs text-zinc-500">
            Paste raw LinkedIn profile content. AI will extract structured fields for{" "}
            <span className="font-semibold text-zinc-800">&quot;{ideaName}&quot;</span>.
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
              Raw Profile Blob <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={6}
              placeholder="Select all profile text on LinkedIn (Name, Headline, About, Experience) and paste it here..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                LinkedIn URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/..."
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                Initial Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Met on Twitter, Mutual connection"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !rawText.trim()}
              className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Extracting with Groq...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Extract & Save Lead
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
