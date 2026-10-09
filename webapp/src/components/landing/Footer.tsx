import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { LOAN_TYPES } from "./loans";

export function Footer() {
  return (
    <footer className="border-t border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo light className="h-[7.2rem]" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-sidebar-foreground/60">
              Financial solutions, endless possibilities. Every loan available in India,
              brought together under one trusted roof.
            </p>
            <div className="mt-6 space-y-2.5 text-sm">
              <a
                href="tel:+917053231846"
                className="flex items-center gap-2.5 text-sidebar-foreground/70 transition-colors hover:text-accent"
              >
                <Phone className="h-4 w-4 text-accent" /> +91 70532 31846
              </a>
              <a
                href="mailto:care@lokanshwealth.in"
                className="flex items-center gap-2.5 text-sidebar-foreground/70 transition-colors hover:text-accent"
              >
                <Mail className="h-4 w-4 text-accent" /> care@lokanshwealth.in
              </a>
              <p className="flex items-center gap-2.5 text-sidebar-foreground/70">
                <MapPin className="h-4 w-4 text-accent" /> Delhi
              </p>
            </div>
          </div>

          <FooterCol
            title="Loans"
            links={LOAN_TYPES.slice(0, 5).map((l) => ({
              label: l.title,
              href: `/apply/${l.code}`,
            }))}
          />
          <FooterCol
            title="Company"
            links={[
              { label: "Track your application", href: "/track" },
              { label: "About us", href: "/about" },
              { label: "Careers", href: "/careers" },
              { label: "Partners", href: "/partners" },
              { label: "Contact", href: "/contact" },
              { label: "Blog", href: "/blog" },
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              { label: "Privacy policy", href: "/privacy" },
              { label: "Terms of use", href: "/terms" },
              { label: "Fair practice code", href: "/fair-practice" },
              { label: "Grievance", href: "/grievance" },
            ]}
          />
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-sidebar-border pt-8 text-xs text-sidebar-foreground/50 sm:flex-row sm:items-center">
          <p>© 2026 Lokansh Wealth. All rights reserved.</p>
          <p className="max-w-xl sm:text-right">
            Lokansh Wealth is a loan facilitation platform. Loans are subject to lender
            approval and applicable terms. Please read all documents carefully.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="font-display text-sm font-semibold text-sidebar-foreground">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <a
              href={l.href}
              className="text-sm text-sidebar-foreground/80 transition-colors hover:text-accent"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
