export function Badge({
  children,
  tone = "gold",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "gold" | "green" | "neutral";
  className?: string;
}) {
  const tones = {
    gold: "bg-gold-500 text-brand-900",
    green: "bg-brand-50 text-brand-700 border border-brand-100",
    neutral: "bg-sand-100 text-ink-soft",
  };

  return (
    <span
      className={`inline-flex items-center rounded-[var(--radius-pill)] px-2.5 py-1 text-label font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
