import type { ReactNode } from "react";
import type { Photo } from "@/lib/photos";

export function PageHero({
  eyebrow,
  title,
  subtitle,
  photo,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  photo?: Photo;
  children?: ReactNode;
}) {
  return (
    <section className="hero-veil relative overflow-hidden border-b border-border/60">
      {photo ? (
        <>
          <img
            src={photo.src}
            alt={photo.alt}
            loading="eager"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover opacity-20 sm:opacity-25"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40"
          />
        </>
      ) : null}
      <div className="container-x relative py-8 sm:py-16 lg:py-20">
        <p className="eyebrow animate-rise">{eyebrow}</p>
        <h1 className="animate-rise mt-3 max-w-4xl text-2xl font-semibold leading-[1.1] sm:mt-4 sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="animate-rise mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-base">
            {subtitle}
          </p>
        ) : null}
        {children ? <div className="mt-6 sm:mt-8">{children}</div> : null}
      </div>
    </section>
  );
}