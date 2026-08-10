import { PageHero } from "@/components/site/PageHero";

export function legalHead(title: string, description: string) {
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}

export function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: { heading: string; body: string }[];
}) {
  return (
    <>
      <PageHero eyebrow="Legal" title={title} subtitle={updated} />
      <section className="container-x max-w-3xl py-14">
        <div className="space-y-8">
          {sections.map((s) => (
            <article key={s.heading}>
              <h2 className="font-display text-lg font-semibold">{s.heading}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}