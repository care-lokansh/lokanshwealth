import { Star, Quote } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

interface Review {
  quote: string;
  name: string;
  city: string;
  loan: string;
}

const REVIEWS: Review[] = [
  {
    quote:
      "Needed funds fast for a family wedding. My personal loan was approved the same day with barely any paperwork — completely stress-free.",
    name: "Sneha Reddy",
    city: "Hyderabad",
    loan: "Personal Loan",
  },
  {
    quote:
      "As a small business owner, working capital is everything. Their business loan kept my shop running through a tough season.",
    name: "Anand Iyer",
    city: "Chennai",
    loan: "Business Loan",
  },
  {
    quote:
      "Got my home loan approved in a single day at a rate lower than my own bank offered. The relationship manager handled everything.",
    name: "Priya Nair",
    city: "Kochi",
    loan: "Home Loan",
  },
  {
    quote:
      "The education loan covered my daughter's studies abroad with a moratorium till she graduates. Clear, honest guidance throughout.",
    name: "Rajesh Kumar",
    city: "Pune",
    loan: "Education Loan",
  },
  {
    quote:
      "Pledged my gold and walked out with cash the same afternoon. Transparent valuation and zero hidden charges.",
    name: "Meera Joshi",
    city: "Ahmedabad",
    loan: "Gold Loan",
  },
  {
    quote:
      "Financed my first scooter with almost no down payment. The whole process was online and took minutes.",
    name: "Vikram Singh",
    city: "Jaipur",
    loan: "Two-Wheeler Loan",
  },
];

// Brand-coloured avatar backgrounds, cycled per card.
const AVATAR_TONES = [
  "bg-primary text-primary-foreground",
  "bg-accent text-accent-foreground",
  "bg-[hsl(var(--blue-deep))] text-white",
];

export function Testimonials() {
  // Duplicate the list so the marquee can loop seamlessly.
  const row = [...REVIEWS, ...REVIEWS];

  return (
    <section className="relative overflow-hidden py-8 sm:py-10">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Loved across India"
          title={
            <>
              Built on Trust,{" "}
              <span className="text-gradient-gold">Proven by Results</span>
            </>
          }
          subtitle="Real journeys that inspire confidence and growth."
        />
      </div>

      {/* Scrolling review wall */}
      <div className="group relative mt-10 flex w-full overflow-hidden">
        {/* edge fades blend cards into the page background */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent sm:w-28" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent sm:w-28" />

        <div className="flex w-max animate-marquee-slow gap-5 px-5 group-hover:[animation-play-state:paused]">
          {row.map((r, i) => (
            <ReviewCard key={i} review={r} tone={AVATAR_TONES[i % AVATAR_TONES.length]} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ review, tone }: { review: Review; tone: string }) {
  return (
    <figure className="flex w-[300px] shrink-0 flex-col rounded-2xl border border-black/5 bg-white p-6 shadow-lg shadow-black/[0.06] sm:w-[360px]">
      <div className="flex items-center justify-between">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <Quote className="h-7 w-7 text-primary/15" />
      </div>

      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-neutral-800">
        &ldquo;{review.quote}&rdquo;
      </blockquote>

      <figcaption className="mt-6 flex items-center gap-3 border-t border-black/5 pt-4">
        <div
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-full font-display text-base font-semibold ${tone}`}
        >
          {review.name.charAt(0)}
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-neutral-900">{review.name}</p>
          <p className="text-xs text-neutral-500">
            {review.city} · {review.loan}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}
