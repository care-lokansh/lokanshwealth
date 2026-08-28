import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Slide {
  src: string;
  alt: string;
  href: string;
}

// Promotional banner slides. Add more entries here to grow the carousel.
const SLIDES: Slide[] = [
  {
    src: "/carousel/personal-loan.png",
    alt: "Personal Loan for every important moment",
    href: "/apply/SALARIED_PERSONAL",
  },
  {
    src: "/carousel/home-loan.png",
    alt: "Home Loan for a better tomorrow",
    href: "/apply/HOME",
  },
  {
    src: "/carousel/business-loan.png",
    alt: "Business Loan to fuel your business growth",
    href: "/apply/BUSINESS",
  },
];

const INTERVAL = 4500;

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (SLIDES.length < 2) return;
    const id = window.setInterval(
      () => setIndex((p) => (p + 1) % SLIDES.length),
      INTERVAL,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <div>
      <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[1.6rem] shadow-2xl shadow-primary/5">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => navigate(slide.href)}
            aria-label={slide.alt}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              i === index ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            <img src={slide.src} alt={slide.alt} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      {SLIDES.length > 1 ? (
        <div className="mt-4 flex justify-center gap-2">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "h-2 rounded-full transition-all",
                i === index ? "w-6 bg-primary" : "w-2 bg-foreground/25 hover:bg-foreground/40",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
