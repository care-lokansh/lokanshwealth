import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { LoanApplicationProvider } from "./application/LoanApplicationContext";

export function ContentPage({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <LoanApplicationProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-28 pb-20 sm:pt-32 sm:pb-28">
          <article className="mx-auto max-w-3xl px-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h1>
            <div className="mt-8 space-y-4 text-base leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
              {children}
            </div>
          </article>
        </main>
        <Footer />
      </div>
    </LoanApplicationProvider>
  );
}
