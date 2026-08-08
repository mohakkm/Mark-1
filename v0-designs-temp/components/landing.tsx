import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* minimal top bar — brand only, matching the app chrome */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-2">
            <span
              className="grid size-6 place-items-center rounded-sm bg-primary text-primary-foreground"
              aria-hidden="true"
            >
              <span className="font-serif text-sm leading-none">S</span>
            </span>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Signal
            </span>
          </div>
          <Link
            href="/dashboard"
            className="rounded-sm px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 md:px-8">
        <section className="animate-rise flex min-h-[calc(100vh-3.5rem)] flex-col justify-center py-20">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Idea validation, not sales automation
          </p>

          <h1 className="mt-6 max-w-3xl text-balance font-serif text-5xl leading-[1.05] tracking-tight text-foreground md:text-7xl">
            Know if the idea is <span className="text-primary">worth building</span>{' '}
            before you build the funnel.
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            Sales tools optimize a pipeline you haven&apos;t earned yet. Signal
            reads the only thing that matters this early — reply rates, real pain
            points, and honest objections — so you learn whether to keep going in
            days, not quarters.
          </p>

          <div className="mt-10 flex items-center gap-4">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Validate an idea
              <ArrowRight
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <span className="text-xs text-muted-foreground">
              No credit card — pre-launch access
            </span>
          </div>

          {/* single quiet proof line, hairline-divided, no feature grid */}
          <dl className="mt-16 flex flex-wrap items-baseline gap-x-10 gap-y-4 border-t border-border pt-6">
            <div>
              <dt className="text-xs text-muted-foreground">Signal per idea</dt>
              <dd className="mt-1 font-serif text-2xl text-foreground">
                Reply rate · pain · objections
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Time to a verdict</dt>
              <dd className="mt-1 font-serif text-2xl text-foreground">Days</dd>
            </div>
          </dl>
        </section>
      </main>
    </div>
  )
}
