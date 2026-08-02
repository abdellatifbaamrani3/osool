export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "center",
  tone = "light",
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  align?: "center" | "start";
  tone?: "light" | "dark";
  as?: "h1" | "h2" | "h3";
}) {
  const alignCls = align === "center" ? "text-center mx-auto" : "text-start";
  const eye = tone === "dark" ? "text-gold-300" : "text-gold-600";
  const titleCls = tone === "dark" ? "text-ivory" : "text-brand-900";
  const subCls = tone === "dark" ? "text-gold-200" : "text-ink-soft";

  return (
    <div className={`max-w-[38rem] ${alignCls}`}>
      {eyebrow ? (
        <p className={`mb-3 text-label font-medium tracking-wide ${eye}`}>
          {eyebrow}
        </p>
      ) : null}
      <Tag className={`text-h2 text-balance ${titleCls}`}>{title}</Tag>
      {sub ? (
        <p className={`mt-4 text-body-lg ${subCls}`}>{sub}</p>
      ) : null}
    </div>
  );
}
