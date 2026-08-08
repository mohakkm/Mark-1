'use client'

import { useState } from 'react'
import { ideas } from '@/lib/data'
import { TopNav } from '@/components/top-nav'
import { VerdictHero } from '@/components/verdict-hero'
import { StatCards } from '@/components/stat-cards'
import { RankedPanel } from '@/components/ranked-panel'
import { LeadsTable } from '@/components/leads-table'

export function Dashboard() {
  const [activeId, setActiveId] = useState(ideas[0].id)
  const idea = ideas.find((i) => i.id === activeId)!

  return (
    <div className="min-h-screen bg-background">
      <TopNav
        ideas={ideas}
        activeId={activeId}
        onSelect={setActiveId}
        email="founder@signal.co"
      />

      {/* key forces the entrance animation to replay when switching ideas */}
      <main
        key={activeId}
        className="mx-auto max-w-6xl bg-muted/40 px-5 pb-20 pt-10 md:px-8 md:pt-14"
      >
        <VerdictHero idea={idea} />

        <div className="mt-10">
          <StatCards idea={idea} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <RankedPanel
            title="Top pain points"
            caption="mentions"
            items={idea.painPoints}
            tone="primary"
            delay={180}
          />
          <RankedPanel
            title="Top objections"
            caption="mentions"
            items={idea.objections}
            tone="muted"
            delay={220}
          />
        </div>

        <div className="mt-6">
          <LeadsTable idea={idea} />
        </div>
      </main>
    </div>
  )
}
