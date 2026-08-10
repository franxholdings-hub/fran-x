export function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">{title}</h2>
      {subtitle ? <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}