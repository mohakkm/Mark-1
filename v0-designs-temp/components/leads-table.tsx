'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { type Idea, statusMeta } from '@/lib/data'

const toneDot: Record<string, string> = {
  positive: 'bg-positive',
  primary: 'bg-primary',
  warn: 'bg-warn',
  neutral: 'bg-neutral',
}

export function LeadsTable({ idea }: { idea: Idea }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return idea.leads
    return idea.leads.filter((l) =>
      [l.name, l.role, l.company, statusMeta[l.status].label]
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [idea.leads, query])

  return (
    <section
      className="animate-rise rounded-md border border-border bg-card"
      style={{ animationDelay: '260ms' }}
      aria-label="Leads"
    >
      <div className="flex flex-col gap-3 border-b border-border px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-2.5">
          <h2 className="text-sm font-semibold text-foreground">Leads</h2>
          <span className="text-xs text-muted-foreground">
            {filtered.length} of {idea.leads.length}
          </span>
        </div>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leads…"
            aria-label="Search leads"
            className="w-full rounded-sm border border-border bg-background py-1.5 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-ring focus:outline-none sm:w-56"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <th scope="col" className="px-5 py-2.5 font-medium">
                Name
              </th>
              <th scope="col" className="px-5 py-2.5 font-medium">
                Company
              </th>
              <th scope="col" className="px-5 py-2.5 font-medium">
                Status
              </th>
              <th scope="col" className="px-5 py-2.5 text-right font-medium">
                Last touch
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => {
              const meta = statusMeta[lead.status]
              return (
                <tr
                  key={lead.id}
                  className="border-t border-border transition-colors hover:bg-secondary/60"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/lead/${lead.id}`}
                      className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {lead.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {lead.role}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-foreground">
                    {lead.company}
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-2 text-sm text-foreground">
                      <span
                        className={`size-1.5 rounded-full ${toneDot[meta.tone]}`}
                        aria-hidden="true"
                      />
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-sm tabular-nums text-muted-foreground">
                    {lead.lastTouch}
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr className="border-t border-border">
                <td
                  colSpan={4}
                  className="px-5 py-10 text-center text-sm text-muted-foreground"
                >
                  No leads match &ldquo;{query}&rdquo;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
