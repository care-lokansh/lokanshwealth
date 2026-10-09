import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Force play — browsers sometimes skip autoPlay on muted videos in iframes.
  useEffect(() => {
    if (!light) return;
    const video = videoRef.current;
    if (!video) return;
    const play = () => {
      void video.play().catch(() => {});
    };
    video.addEventListener("loadeddata", play);
    play();
    return () => video.removeEventListener("loadeddata", play);
  }, [light]);

  // Footer: animated logo (frames 3–55), no background card.
  if (light) {
    return (
      <video
        ref={videoRef}
        src="/animation_video_for_logo_do.mp4"
        className={cn("block h-full w-auto max-w-none rounded-xl object-contain", className)}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-label="Lokansh Wealth"
      />
    );
  }

  // Header: full company mark — keep it large.
  return (
    <img
      src="/logo-full.png"
      className={cn("h-[5.75rem] w-auto max-w-[min(58vw,17.5rem)] object-contain sm:h-[6.75rem] sm:max-w-[20rem]", className)}
      alt="Lokansh Wealth Private Limited"
    />
  );
}
