import { Star } from "lucide-react";
import { LTR } from "./LTR";

export function Rating({
  value,
  count,
  size = "md",
}: {
  value: number;
  count?: number;
  size?: "sm" | "md";
}) {
  const starSize = size === "sm" ? "size-3.5" : "size-4";
  return (
    <div className="inline-flex items-center gap-2">
      <span className="inline-flex gap-0.5" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`${starSize} ${
              i < Math.round(value)
                ? "fill-gold-500 text-gold-500"
                : "text-sand-200"
            }`}
          />
        ))}
      </span>
      <span className="text-body-sm text-ink-soft">
        <LTR>{value.toFixed(1)}</LTR>
        {typeof count === "number" ? (
          <>
            {" "}
            · <LTR>{count}</LTR>
          </>
        ) : null}
      </span>
    </div>
  );
}
