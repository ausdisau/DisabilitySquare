import { Link } from "wouter";
import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background" role="contentinfo">
      <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <img src="/logo.png" alt="DisabilitySquare Logo" className="h-6 w-auto" />
            DisabilitySquare
          </div>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <Link href="/safety">
              <span className="hover:text-primary cursor-pointer underline underline-offset-2" data-testid="link-footer-safety">
                Safety Centre
              </span>
            </Link>
            <Link href="/terms">
              <span className="hover:text-primary cursor-pointer underline underline-offset-2" data-testid="link-footer-terms">
                Terms of Service
              </span>
            </Link>
            <Link href="/privacy">
              <span className="hover:text-primary cursor-pointer underline underline-offset-2" data-testid="link-footer-privacy">
                Privacy Policy
              </span>
            </Link>
            <a
              href="https://esafety.gov.au"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary underline underline-offset-2"
              data-testid="link-footer-esafety"
            >
              eSafety.gov.au
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
          <span>🇦🇺 Australian eSafety compliant · 16+ · WCAG AAA · Disability-led platform</span>
        </div>
      </div>
    </footer>
  );
}
