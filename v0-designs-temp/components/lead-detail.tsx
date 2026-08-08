'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkles, RotateCcw, Copy, Check } from 'lucide-react'
import { type LeadWithIdea, statusMeta } from '@/lib/data'

const toneDot: Record<string, string> = {
  positive: 'bg-positive',
  primary: 'bg-primary',
  warn: 'bg-warn',
  neutral: 'bg-neutral',
}

type Insight = {
  summary: string
  painPoints: string[]
  objections: string[]
  interest: 'High' | 'Medium' | 'Low'
}

function buildFirstMessage(name: string, company: string, idea: string) {
  return `Hi ${name.split(' ')[0]},\n\nNoticed ${company} is scaling fast — teams your size usually feel the pain ${idea} solves before they name it. We turn that scramble into a repeatable, hands-off workflow.\n\nWorth a 15-minute look next week?`
}

function buildFollowUp(name: string) {
  return `Hi ${name.split(' ')[0]},\n\nCircling back on my note — no pressure at all. If the timing is off I'll happily reach out next quarter. If it's worth a quick look, I can keep it to 15 minutes and come with something specific to your stack.`
}

function extractInsight(idea: LeadWithIdea['idea']): Insight {
  return {
    summary: `Engaged after the first touch and asked about integration effort. Signals real interest in ${idea.name.toLowerCase()} but wants proof it won't add operational load. Warm — prioritize a tailored second message.`,
    painPoints: idea.painPoints.slice(0, 3).map((p) => p.label),
    objections: idea.objections.slice(0, 2).map((o) => o.label),
    interest: 'High',
  }
}

function SectionCard({
  children,
  delay,
  className = '',
}: {
  children: React.ReactNode
  delay: number
  className?: string
}) {
  return (
    <section
      className={`animate-rise rounded-md border border-border bg-card ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </section>
  )
}

export function LeadDetail({ data }: { data: LeadWithIdea }) {
  const { lead, idea } = data
  const meta = statusMeta[lead.status]

  const [draft, setDraft] = useState('')
  const [draftKind, setDraftKind] = useState<'first' | 'follow' | null>(null)
  const [copied, setCopied] = useState(false)
  const [reply, setReply] = useState('')
  const [insight, setInsight] = useState<Insight | null>(null)

  function generate(kind: 'first' | 'follow') {
    setDraftKind(kind)
    setCopied(false)
    setDraft(
      kind === 'first'
        ? buildFirstMessage(lead.name, lead.company, idea.tagline)
        : buildFollowUp(lead.name),
    )
  }

  function copyDraft() {
    if (!draft) return
    navigator.clipboard?.writeText(draft)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  function captureReply() {
    if (!reply.trim()) return
    setInsight(extractInsight(idea))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* minimal top bar — brand only, matching the app chrome */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-5 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span
              className="grid size-6 place-items-center rounded-sm bg-primary text-primary-foreground"
              aria-hidden="true"
            >
              <span className="font-serif text-sm leading-none">S</span>
            </span>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Signal
            </span>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back to pipeline
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 pb-20 pt-8 md:px-8 md:pt-12">
        <p
          className="animate-rise text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground"
          style={{ animationDelay: '0ms' }}
        >
          {idea.name} · Lead
        </p>

        {/* Profile header */}
        <div
          className="animate-rise mt-3 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between"
          style={{ animationDelay: '40ms' }}
        >
          <div>
            <h1 className="text-balance font-serif text-4xl leading-[1.05] tracking-tight text-foreground">
              {lead.name}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {lead.role} · {lead.company}
            </p>
            <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-foreground">
              {lead.role} at {lead.company}, evaluating {idea.tagline.toLowerCase()}.
            </p>
          </div>
          <div className="flex items-center gap-2.5 rounded-sm border border-border bg-secondary/50 px-3 py-2">
            <span
              className={`size-2 rounded-full ${toneDot[meta.tone]}`}
              aria-hidden="true"
            />
            <span className="text-sm font-medium text-foreground">
              {meta.label}
            </span>
            <span className="text-xs text-muted-foreground">
              · {lead.lastTouch}
            </span>
          </div>
        </div>

        {/* Outreach section */}
        <SectionCard delay={120} className="mt-6">
          <div className="flex flex-col gap-3 border-b border-border px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold text-foreground">Outreach</h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => generate('first')}
                className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Sparkles className="size-3.5" aria-hidden="true" />
                Generate First Message
              </button>
              <button
                type="button"
                onClick={() => generate('follow')}
                className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
                Generate Follow-up
              </button>
            </div>
          </div>
          <div className="px-5 py-4">
            {draft ? (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {draftKind === 'first' ? 'First message' : 'Follow-up'} draft
                  </span>
                  <button
                    type="button"
                    onClick={copyDraft}
                    className="inline-flex items-center gap-1.5 rounded-sm px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {copied ? (
                      <Check className="size-3.5 text-positive" aria-hidden="true" />
                    ) : (
                      <Copy className="size-3.5" aria-hidden="true" />
                    )}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="whitespace-pre-line rounded-sm border border-border bg-secondary/40 p-4 text-sm leading-relaxed text-foreground">
                  {draft}
                </p>
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Generate a tailored draft to start the conversation.
              </p>
            )}
          </div>
        </SectionCard>

        {/* Paste reply section */}
        <SectionCard delay={180} className="mt-5">
          <div className="border-b border-border px-5 py-3.5">
            <h2 className="text-sm font-semibold text-foreground">Paste their reply</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Drop in what they wrote back and Signal will extract the structured insight.
            </p>
          </div>
          <div className="px-5 py-4">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={5}
              placeholder="Paste the lead's reply here…"
              aria-label="Lead reply"
              className="w-full resize-y rounded-sm border border-border bg-background p-3 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-ring focus:ring-1 focus:ring-ring"
            />
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={captureReply}
                disabled={!reply.trim()}
                className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Sparkles className="size-3.5" aria-hidden="true" />
                Extract insight
              </button>
            </div>
          </div>
        </SectionCard>

        {/* Extracted insight */}
        {insight && (
          <SectionCard delay={0} className="mt-5">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <h2 className="text-sm font-semibold text-foreground">
                Extracted insight
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-secondary/50 px-2 py-0.5 text-xs font-medium text-foreground">
                Interest
                <span
                  className={`size-1.5 rounded-full ${
                    insight.interest === 'High'
                      ? 'bg-positive'
                      : insight.interest === 'Medium'
                        ? 'bg-warn'
                        : 'bg-neutral'
                  }`}
                  aria-hidden="true"
                />
                {insight.interest}
              </span>
            </div>
            <div className="divide-y divide-border">
              <div className="px-5 py-4">
                <h3 className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Summary
                </h3>
                <p className="text-pretty text-sm leading-relaxed text-foreground">
                  {insight.summary}
                </p>
              </div>
              <div className="grid gap-px sm:grid-cols-2">
                <div className="px-5 py-4">
                  <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Pain points
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {insight.painPoints.map((p) => (
                      <li
                        key={p}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <span
                          className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                          aria-hidden="true"
                        />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-t border-border px-5 py-4 sm:border-l sm:border-t-0">
                  <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Objections
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {insight.objections.map((o) => (
                      <li
                        key={o}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <span
                          className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warn"
                          aria-hidden="true"
                        />
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </SectionCard>
        )}
      </main>
    </div>
  )
}
