import Link from "next/link";
import { ar } from "@/content/ar";
import { singlePriceSar, type Product } from "@/content/products";
import { Badge } from "@/components/ui/Badge";
import { LTR } from "@/components/ui/LTR";
import { ProductImage } from "@/components/commerce/ProductImage";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-[var(--radius-lg)] bg-white ring-1 ring-sand-200 transition-[box-shadow,transform] duration-[var(--dur-base)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
      data-cta={`product-card-${product.slug}`}
    >
      <div className="relative">
        <ProductImage
          product={product}
          ratio="1/1"
          className="rounded-none ring-0"
          sizes="(min-width: 768px) 33vw, 100vw"
        />
        <div className="absolute start-3 top-3">
          <Badge>
            {ar.common.causeOf} {["", "①", "②", "③"][product.causeNumber]}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-label font-medium text-gold-600">
          {product.causeName}
        </p>
        <h3 className="text-h3 text-brand-900 group-hover:text-brand-700">
          {product.shortName}
        </h3>
        <p className="text-body-sm text-ink-soft">{product.subtitle}</p>
        <p className="text-body-sm text-muted">{product.hook}</p>

        <div className="mt-auto flex items-baseline justify-between pt-4">
          <p className="text-body font-medium text-brand-900">
            {ar.common.from} <LTR>{singlePriceSar(product)}</LTR>{" "}
            {ar.common.sar}
          </p>
          <span className="text-body-sm font-medium text-brand-700 group-hover:underline">
            {ar.common.learnMore} ←
          </span>
        </div>
      </div>
    </Link>
  );
}
