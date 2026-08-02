import { ar } from "@/content/ar";

const ratios = {
  "1/1": "aspect-square",
  "4/5": "aspect-[4/5]",
  "3/2": "aspect-[3/2]",
  "16/9": "aspect-video",
} as const;

export function PlaceholderImage({
  label,
  ratio = "4/5",
  className = "",
  dark = false,
}: {
  label?: string;
  ratio?: keyof typeof ratios;
  className?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[var(--radius-lg)] ${ratios[ratio]} ${
        dark
          ? "bg-brand-800 ring-1 ring-gold-500/20"
          : "bg-sand-100 ring-1 ring-sand-200"
      } ${className}`}
      role="img"
      aria-label={label ?? ar.common.imageSoon}
    >
      <div
        className={`absolute inset-0 opacity-40 ${
          dark
            ? "bg-[radial-gradient(ellipse_at_30%_20%,rgba(194,161,91,.25),transparent_55%)]"
            : "bg-[radial-gradient(ellipse_at_70%_30%,rgba(28,107,85,.12),transparent_50%)]"
        }`}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
        <span
          className={`size-12 rounded-full border ${
            dark ? "border-gold-500/40" : "border-brand-100"
          }`}
        />
        <span
          className={`text-body-sm ${dark ? "text-gold-300" : "text-muted"}`}
        >
          {label ?? ar.common.imageSoon}
        </span>
      </div>
    </div>
  );
}
