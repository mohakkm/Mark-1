import Link from "next/link";

export type SiteFooterLink = {
  label: string;
  href: string;
};

type SiteFooterProps = {
  links?: SiteFooterLink[];
};

export function SiteFooter({ links }: SiteFooterProps) {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto max-w-4xl px-5 py-8 md:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-serif text-sm text-foreground">Verdict</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Idea validation, not sales automation.
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground/80">
              Built for founders who&apos;d rather know than hope.
            </p>
          </div>

          {links && links.length > 0 && (
            <nav
              aria-label="Footer"
              className="flex flex-wrap items-center gap-x-5 gap-y-1"
            >
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="mt-6 border-t border-border pt-4 space-y-1.5">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Verdict doesn&apos;t automate LinkedIn or send anything on your behalf. Your data stays yours.
          </p>
          <p className="text-[11px] text-muted-foreground">
            Questions?{" "}
            <a
              href="mailto:mohakkmalvankar1104@gmail.com"
              className="underline underline-offset-2 transition-colors hover:text-foreground"
            >
              mohakkmalvankar1104@gmail.com
            </a>
          </p>
          <p className="text-[11px] text-muted-foreground/60">© 2026 Verdict.</p>
        </div>
      </div>
    </footer>
  );
}

export const landingFooterLinks: SiteFooterLink[] = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Sign in", href: "/login" },
];

export const appFooterLinks: SiteFooterLink[] = [
  { label: "Dashboard", href: "/" },
];
