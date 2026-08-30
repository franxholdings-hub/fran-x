import { PHOTOS } from "@/lib/photos";

/**
 * Full-site city skyline backdrop rendered behind all content.
 * Fixed to the viewport so it stays visible from the top of the page
 * all the way down to the footer — including the marketplace — while
 * leaving the existing spliced hero background untouched on top of it.
 */
export function CitySkylineBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <img
        src={PHOTOS.capital.src}
        alt=""
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      {/* Veil that keeps text legible while letting the lit skyline read through */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background/75" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_15%,transparent,background_70%)]" />
    </div>
  );
}
