'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import type { Idea } from '@/lib/data'

function IdeaSwitcher({
  ideas,
  activeId,
  onSelect,
}: {
  ideas: Idea[]
  activeId: string
  onSelect: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const active = ideas.find((i) => i.id === activeId)!

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="group flex items-center gap-2 rounded-sm border border-border bg-card px-2.5 py-1.5 text-left transition-colors hover:border-foreground/30"
      >
        <span
          className="size-1.5 rounded-full bg-primary"
          aria-hidden="true"
        />
        <span className="text-sm font-medium leading-none text-foreground">
          {active.name}
        </span>
        <ChevronDown
          className={`size-3.5 text-muted-foreground transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      <div
        className="absolute left-0 top-[calc(100%+6px)] z-20 w-72 origin-top overflow-hidden rounded-md border border-border bg-popover shadow-sm transition-all duration-200 ease-out"
        style={{
          maxHeight: open ? 320 : 0,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transform: open ? 'translateY(0)' : 'translateY(-4px)',
        }}
        role="listbox"
      >
        <div className="border-b border-border px-3 py-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Switch idea
          </p>
        </div>
        <ul className="p-1">
          {ideas.map((idea) => {
            const isActive = idea.id === activeId
            return (
              <li key={idea.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    onSelect(idea.id)
                    setOpen(false)
                  }}
                  className="flex w-full items-start gap-2.5 rounded-sm px-2.5 py-2 text-left transition-colors hover:bg-secondary"
                >
                  <span
                    className={`mt-1 size-1.5 shrink-0 rounded-full ${
                      isActive ? 'bg-primary' : 'bg-border'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-foreground">
                      {idea.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {idea.tagline}
                    </span>
                  </span>
                  {isActive && (
                    <Check
                      className="mt-0.5 size-3.5 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export function TopNav({
  ideas,
  activeId,
  onSelect,
  email,
}: {
  ideas: Idea[]
  activeId: string
  onSelect: (id: string) => void
  email: string
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 md:px-8">
        <div className="flex items-center gap-5">
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
          <div className="hidden h-4 w-px bg-border sm:block" aria-hidden="true" />
          <div className="hidden sm:block">
            <IdeaSwitcher ideas={ideas} activeId={activeId} onSelect={onSelect} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-muted-foreground md:inline">
            {email}
          </span>
          <div className="hidden h-4 w-px bg-border md:block" aria-hidden="true" />
          <button
            type="button"
            className="rounded-sm px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </div>
      <div className="border-t border-border px-5 py-2 sm:hidden">
        <IdeaSwitcher ideas={ideas} activeId={activeId} onSelect={onSelect} />
      </div>
    </header>
  )
}
