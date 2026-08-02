import Link from "next/link";
import { ar } from "@/content/ar";

type Variant = "default" | "inverse" | "mark";

export function Logo({
  variant = "default",
  href = "/",
}: {
  variant?: Variant;
  href?: string;
}) {
  const inverse = variant === "inverse";
  const markOnly = variant === "mark";

  const tile = (
    <span
      className={`relative flex size-10 shrink-0 items-center justify-center rounded-full lg:size-11 ${
        inverse ? "bg-gold-500" : "bg-brand-700"
      }`}
      aria-hidden="true"
    >
      <span
        className={`translate-y-px text-[1.1rem] font-semibold leading-none ${
          inverse ? "text-brand-900" : "text-gold-500"
        }`}
      >
        O
      </span>
    </span>
  );

  if (markOnly) {
    return (
      <Link href={href} aria-label={ar.brand.nameAr}>
        {tile}
      </Link>
    );
  }

  return (
    <Link href={href} className="inline-flex items-center gap-2.5">
      {tile}
      <span className="flex flex-col leading-none">
        <span
          className={`font-[family-name:var(--font-aref)] text-[22px] font-bold lg:text-[26px] ${
            inverse ? "text-ivory" : "text-brand-900"
          }`}
        >
          {ar.brand.nameAr}
        </span>
        <span
          className={`mt-0.5 text-[10px] font-normal tracking-[0.22em] uppercase lg:text-[11px] ${
            inverse ? "text-gold-200" : "text-muted"
          }`}
        >
          {ar.brand.nameEn}
        </span>
      </span>
    </Link>
  );
}
