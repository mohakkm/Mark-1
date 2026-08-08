import type { Idea } from '@/lib/data'

export function VerdictHero({ idea }: { idea: Idea }) {
  const { replied, totalLeads, interested } = idea.metrics
  const replyRate = Math.round((replied / totalLeads) * 100)

  return (
    <section className="animate-rise" aria-label="Validation verdict">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {idea.name} · Verdict
      </p>
      <h1 className="mt-3 font-serif text-4xl leading-[1.1] tracking-tight text-balance text-foreground md:text-5xl">
        {replied}/{totalLeads} replied
        <span className="text-muted-foreground"> · </span>
        <span className="text-primary">{replyRate}% reply rate</span>
        <span className="text-muted-foreground"> · </span>
        {interested} interested
      </h1>
      <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
        {idea.tagline}.
      </p>
    </section>
  )
}
