import { useState } from "react";
import { cn } from "@/lib/utils";

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const safe = images.length ? images : [""];

  return (
    <div className="space-y-3">
      <div className="glass-panel overflow-hidden rounded-xl">
        <img
          src={safe[active]}
          alt={alt}
          decoding="async"
          className="aspect-[16/10] w-full object-cover"
        />
      </div>
      {safe.length > 1 ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {safe.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "overflow-hidden rounded-lg border-2 transition-colors",
                active === i ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <img src={src} alt={`${alt} ${i + 1}`} loading="lazy" className="aspect-square w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
