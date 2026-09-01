import Link from "next/link";
import Image from "next/image";
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
  const markSrc = inverse ? "/brand/osool-mark-light.png" : "/brand/osool-mark-dark.png";

  const tile = (
    <span
      className={`relative block size-10 shrink-0 overflow-hidden rounded-[14px] ring-1 lg:size-11 lg:rounded-2xl ${
        inverse ? "ring-gold-500/30" : "shadow-[var(--shadow-sm)] ring-gold-500/25"
      }`}
      aria-hidden="true"
    >
      <Image
        src={markSrc}
        alt=""
        fill
        sizes="44px"
        className="object-cover"
        priority
      />
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
    <Link href={href} className="inline-flex items-center gap-3">
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
