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
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40"
          />
        </>
      ) : null}
      <div className="container-x relative py-16 sm:py-20">
        <p className="eyebrow animate-rise">{eyebrow}</p>
        <h1 className="animate-rise mt-4 max-w-4xl text-3xl font-semibold leading-[1.08] sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="animate-rise mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}