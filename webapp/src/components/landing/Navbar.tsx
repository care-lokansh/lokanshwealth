import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { useLoanApplication } from "./application/LoanApplicationContext";

const LINKS = [
  { label: "Loans", href: "/#loans" },
  { label: "Calculator", href: "/calculator" },
  { label: "Track application", href: "/track" },
  { label: "About us", href: "/#about" },
  { label: "FAQ", href: "/#faq" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { open: openApplication } = useLoanApplication();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 bg-white transition-all duration-300",
        scrolled ? "border-b border-border shadow-sm" : "border-b border-border/60",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="/" className="shrink-0">
          <Logo />
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[1.05rem] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="tel:+917053231846"
            className="flex items-center gap-1.5 text-[1.05rem] font-semibold text-foreground"
          >
            <Phone className="h-4 w-4 text-accent" />
            +91 70532 31846
          </a>
          <Button size="sm" className="rounded-full px-5 text-[1.05rem]" onClick={() => openApplication()}>
            Apply Now
          </Button>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-lg text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border bg-white px-5 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-[1.05rem] font-medium text-foreground hover:bg-secondary"
              >
                {l.label}
              </a>
            ))}
            <a
              href="tel:+917053231846"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[1.05rem] font-medium text-foreground hover:bg-secondary"
            >
              <Phone className="h-4 w-4 text-accent" />
              +91 70532 31846
            </a>
            <Button
              className="mt-2 rounded-full"
              onClick={() => {
                setOpen(false);
                openApplication();
              }}
            >
              Apply Now
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
