import { Quote, ShieldCheck, Sparkles, HandHeart } from "lucide-react";

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Honesty over everything",
    body: "No fine print games. The rate we show is the rate you pay — fees and all, spelled out upfront.",
  },
  {
    icon: Sparkles,
    title: "Effortless by design",
    body: "Aadhaar, PAN and a few taps. We removed every step that didn't need to exist.",
  },
  {
    icon: HandHeart,
    title: "A human in your corner",
    body: "A real relationship manager — not a chatbot — stays with you from application to disbursal.",
  },
];

export function About() {
  return (
    <section id="about" className="relative overflow-hidden py-8 sm:py-10">
      <div className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-5">
        <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          {/* Left — story */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
              About us
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-[2.6rem]">
              About <span className="text-gradient-gold">Lokansh Wealth</span>
            </h2>

            <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
              <p>
                Lokansh Wealth was founded with a simple mission: to make borrowing
                transparent, effortless, and accessible for everyone.
              </p>
              <p>
                We recognized the challenges people faced—complex processes, endless
                paperwork, hidden costs, and conflicting information from multiple
                lenders. To solve this, we created a single platform where customers can
                explore, compare, and secure the right financial solutions with
                confidence.
              </p>
              <p>
                Today, with a network of 40+ trusted lending partners, we help
                individuals and businesses find the best loan options tailored to their
                unique needs. Backed by expert guidance and personalized support, we
                remain committed to delivering a seamless experience from consultation to
                disbursal.
              </p>
              <p>
                Your goals deserve a financial partner you can trust—and that&apos;s
                exactly what we strive to be.
              </p>
            </div>
          </div>

          {/* Right — values */}
          <div className="space-y-8">
            <div className="space-y-4">
              {VALUES.map((v) => (
                <div
                  key={v.title}
                  className="group flex gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <v.icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold text-foreground">
                      {v.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {v.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quotes — full width below */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <figure className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <Quote className="h-8 w-8 fill-accent text-accent" />
            <blockquote className="mt-4 font-display text-2xl font-semibold leading-snug text-primary">
              “Financial solutions, endless possibilities — that&apos;s not a
              tagline. It&apos;s the promise we measure ourselves against every
              single day.”
            </blockquote>
            <figcaption className="mt-5 text-sm font-semibold text-muted-foreground">
              — The Lokansh Wealth team
            </figcaption>
          </figure>

          <figure className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <Quote className="h-8 w-8 fill-accent text-accent" />
            <blockquote className="mt-4 font-display text-2xl font-semibold leading-snug text-primary">
              “We measure our success by the opportunities we create and the
              lives we help build through trusted financial partnerships.”
            </blockquote>
            <figcaption className="mt-5 text-sm font-semibold text-muted-foreground">
              — The Lokansh Wealth team
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
