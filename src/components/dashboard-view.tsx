"use client";

import { useState } from "react";
import type { Idea } from "@/types/idea";
import type { Lead } from "@/types/lead";
import { IdeaSwitcher } from "@/components/idea-switcher";
import { IdeaDetailsCard } from "@/components/idea-details-card";
import { IdeaModal } from "@/components/idea-modal";
import { IdeasManagerModal } from "@/components/ideas-manager-modal";
import { AddLeadModal } from "@/components/add-lead-modal";
import { LeadsList } from "@/components/leads-list";
import { ValidationDashboard } from "@/components/validation-dashboard";
import { LogOut } from "lucide-react";
import type { IdeaDashboardData } from "@/types/dashboard";

interface DashboardViewProps {
  userEmail: string;
  ideas: Idea[];
  selectedIdeaId: string | null;
  leads: Lead[];
  dashboard: IdeaDashboardData | null;
}

export function DashboardView({
  userEmail,
  ideas,
  selectedIdeaId,
  leads,
  dashboard,
}: DashboardViewProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [ideaToEdit, setIdeaToEdit] = useState<Idea | null>(null);

  const selectedIdea = ideas.find((i) => i.id === selectedIdeaId) ?? ideas[0] ?? null;

  const handleOpenEdit = (idea: Idea) => {
    setIdeaToEdit(idea);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setIdeaToEdit(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans antialiased">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600 text-white font-bold text-base shadow-xs">
                M
              </div>
              <span className="font-bold text-zinc-900 text-base tracking-tight hidden sm:inline">
                Mark-1 CRM
              </span>
            </div>

            <div className="h-5 w-px bg-zinc-200 hidden sm:block" />

            <IdeaSwitcher
              ideas={ideas}
              selectedIdeaId={selectedIdea?.id ?? null}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              onOpenManageModal={() => setIsManageModalOpen(true)}
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 hidden md:inline truncate max-w-[180px]">
              {userEmail}
            </span>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5 text-zinc-400" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6 space-y-8">
        {/* Selected Idea Section */}
        <section>
          <IdeaDetailsCard
            idea={selectedIdea}
            onEdit={() => selectedIdea && handleOpenEdit(selectedIdea)}
            onCreateNew={() => setIsCreateModalOpen(true)}
            onManage={() => setIsManageModalOpen(true)}
          />
        </section>

        {selectedIdea && dashboard && <ValidationDashboard dashboard={dashboard} />}

        {/* Leads List Section */}
        {selectedIdea && (
          <section className="space-y-4">
            <LeadsList
              leads={leads}
              ideaId={selectedIdea.id}
              ideaName={selectedIdea.name}
              onOpenAddModal={() => setIsAddLeadModalOpen(true)}
            />
          </section>
        )}
      </main>

      {/* Modals */}
      <IdeaModal
        isOpen={isCreateModalOpen || Boolean(ideaToEdit)}
        onClose={handleCloseModal}
        ideaToEdit={ideaToEdit}
      />

      <IdeasManagerModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        ideas={ideas}
        selectedIdeaId={selectedIdea?.id ?? null}
        onEditIdea={handleOpenEdit}
        onCreateIdea={() => setIsCreateModalOpen(true)}
      />

      {selectedIdea && (
        <AddLeadModal
          isOpen={isAddLeadModalOpen}
          onClose={() => setIsAddLeadModalOpen(false)}
          ideaId={selectedIdea.id}
          ideaName={selectedIdea.name}
        />
      )}
    </div>
  );
}
