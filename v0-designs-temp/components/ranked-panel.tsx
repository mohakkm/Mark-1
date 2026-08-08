import type { RankedItem } from '@/lib/data'

export function RankedPanel({
  title,
  caption,
  items,
  tone,
  delay = 0,
}: {
  title: string
  caption: string
  items: RankedItem[]
  tone: 'primary' | 'muted'
  delay?: number
}) {
  const max = Math.max(...items.map((i) => i.count), 1)
  const barColor = tone === 'primary' ? 'bg-primary' : 'bg-foreground/35'

  return (
    <section
      className="animate-rise rounded-md border border-border bg-card"
      style={{ animationDelay: `${delay}ms` }}
      aria-label={title}
    >
      <div className="flex items-baseline justify-between border-b border-border px-5 py-3.5">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <span className="text-xs text-muted-foreground">{caption}</span>
      </div>
      <ol className="divide-y divide-border">
        {items.map((item, i) => {
          const pct = (item.count / max) * 100
          return (
            <li
              key={item.label}
              className="group grid grid-cols-[1.25rem_1fr_2rem] items-center gap-3 px-5 py-3 transition-colors hover:bg-secondary/60"
            >
              <span className="text-xs tabular-nums text-muted-foreground">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm text-foreground">{item.label}</p>
                <div
                  className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-secondary"
                  role="presentation"
                >
                  <div
                    className={`h-full rounded-full ${barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <span className="text-right text-sm tabular-nums text-foreground">
                {item.count}
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
