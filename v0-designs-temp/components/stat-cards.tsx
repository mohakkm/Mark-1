import type { Idea } from '@/lib/data'

function StatCard({
  label,
  value,
  sub,
  index,
}: {
  label: string
  value: string | number
  sub: string
  index: number
}) {
  return (
    <div
      className="animate-rise border-l border-border pl-4 first:border-l-0 first:pl-0 sm:border-l sm:pl-4 sm:first:border-l"
      style={{ animationDelay: `${60 + index * 50}ms` }}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-serif text-3xl tracking-tight text-foreground tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  )
}

export function StatCards({ idea }: { idea: Idea }) {
  const { totalLeads, messaged, replied, interested } = idea.metrics
  const cards = [
    {
      label: 'Total leads',
      value: totalLeads,
      sub: 'in this pipeline',
    },
    {
      label: 'Messaged',
      value: messaged,
      sub: `${Math.round((messaged / totalLeads) * 100)}% of leads`,
    },
    {
      label: 'Replied',
      value: replied,
      sub: `${Math.round((replied / messaged) * 100)}% of messaged`,
    },
    {
      label: 'Interested',
      value: interested,
      sub: `${Math.round((interested / replied) * 100)}% of replies`,
    },
  ]

  return (
    <section
      aria-label="Pipeline stats"
      className="grid grid-cols-2 gap-y-6 gap-x-4 rounded-md border border-border bg-card p-5 md:grid-cols-4"
    >
      {cards.map((c, i) => (
        <StatCard key={c.label} {...c} index={i} />
      ))}
    </section>
  )
}
