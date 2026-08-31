import Image from "next/image";
import type { Product } from "@/content/products";

const ratios = {
  "1/1": "aspect-square",
  "4/5": "aspect-[4/5]",
} as const;

export function ProductImage({
  product,
  ratio = "1/1",
  className = "",
  priority = false,
  sizes = "(min-width: 1024px) 50vw, 100vw",
}: {
  product: Pick<Product, "imageSrc" | "imageAlt" | "name">;
  ratio?: keyof typeof ratios;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[var(--radius-lg)] bg-white ring-1 ring-sand-200 ${ratios[ratio]} ${className}`}
    >
      <Image
        src={product.imageSrc}
        alt={product.imageAlt || product.name}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover"
      />
    </div>
  );
}
