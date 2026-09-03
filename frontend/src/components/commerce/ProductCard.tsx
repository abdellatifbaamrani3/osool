import Link from "next/link";
import { Banknote, Truck } from "lucide-react";
import { ar } from "@/content/ar";
import { singlePriceSar, type Product } from "@/content/products";
import { Badge } from "@/components/ui/Badge";
import { LTR } from "@/components/ui/LTR";
import { ProductImage } from "@/components/commerce/ProductImage";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-[var(--radius-xl)] bg-white ring-1 ring-sand-200 transform-gpu transition-[transform,box-shadow] duration-[var(--dur-base)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
      data-cta={`product-card-${product.slug}`}
    >
      <div className="relative">
        <ProductImage
          product={product}
          ratio="1/1"
          className="rounded-none ring-0"
          sizes="(min-width: 768px) 33vw, 100vw"
        />
        <div className="absolute start-3 top-3 flex flex-col gap-1.5">
          <Badge className="bg-brand-900 text-ivory">
            {ar.common.causeOf} {["", "①", "②", "③"][product.causeNumber]} — {product.causeName}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-5 lg:p-6">
        <h3 className="text-h3 font-bold text-brand-900 group-hover:text-brand-700 transition-colors">
          {product.shortName}
        </h3>
        <p className="text-body-sm font-medium text-brand-700">{product.subtitle}</p>
        <p className="text-body-sm text-ink-soft leading-relaxed">{product.hook}</p>

        {/* Quick Trust Pill */}
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted">
          <span className="inline-flex items-center gap-1 rounded-md bg-sand-100 px-2 py-0.5">
            <Banknote className="size-3 text-brand-600" /> الدفع عند الاستلام
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-sand-100 px-2 py-0.5">
            <Truck className="size-3 text-brand-600" /> شحن مجاني
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-sand-200 pt-4">
          <div>
            <span className="block text-xs text-muted">بداية من</span>
            <p className="text-body-lg font-bold text-brand-900">
              <LTR>{singlePriceSar(product)}</LTR> {ar.common.sar}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-[var(--radius-md)] bg-brand-50 px-3 py-2 text-body-sm font-semibold text-brand-700 transition-colors group-hover:bg-brand-700 group-hover:text-ivory">
            {ar.common.learnMore} ←
          </span>
        </div>
      </div>
    </Link>
  );
}
