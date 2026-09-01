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
      <div className="container-x relative py-6 sm:py-10 lg:py-12">
        <p className="eyebrow animate-rise">{eyebrow}</p>
        <h1 className="animate-rise mt-2 max-w-3xl text-xl font-semibold leading-[1.12] sm:mt-3 sm:text-3xl lg:text-4xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="animate-rise mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mt-3 sm:text-[0.95rem]">
            {subtitle}
          </p>
        ) : null}
        {children ? <div className="mt-4 sm:mt-5">{children}</div> : null}
      </div>
    </section>
  );
}