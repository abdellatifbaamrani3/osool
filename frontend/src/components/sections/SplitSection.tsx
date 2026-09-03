import { Container } from "@/components/layout/Container";
import Image from "next/image";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

/**
 * Alternating split: default = text at start (right in RTL), image at end.
 * reverse = image at start, text at end. Mobile always media-first.
 */
export function SplitSection({
  reverse = false,
  eyebrow,
  title,
  children,
  imageLabel,
  imageSrc,
  imageAlt,
  dark = false,
  id,
  className = "",
}: {
  reverse?: boolean;
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
  imageLabel?: string;
  imageSrc?: string;
  imageAlt?: string;
  dark?: boolean;
  id?: string;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`section-pad ${className || (dark ? "bg-brand-900" : "bg-ivory")}`}
    >
      <Container>
        <div
          className={`grid items-center gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-16 ${
            reverse ? "lg:[&>*:first-child]:order-2" : ""
          }`}
        >
          <div className="order-1 lg:order-none lg:h-full">
            {imageSrc ? (
              <div className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-[var(--radius-lg)] bg-sand-100 ring-1 ring-sand-200 lg:h-full lg:max-w-none lg:aspect-auto lg:min-h-[28rem]">
                <Image
                  src={imageSrc}
                  alt={imageAlt ?? imageLabel ?? ""}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <PlaceholderImage
                label={imageLabel}
                ratio="4/5"
                dark={dark}
                className="mx-auto max-w-md lg:max-w-none"
              />
            )}
          </div>

          <div className="order-2 lg:order-none lg:flex lg:flex-col lg:justify-center">
            {eyebrow ? (
              <p
                className={`mb-3 text-label font-medium tracking-wide ${
                  dark ? "text-gold-300" : "text-gold-600"
                }`}
              >
                {eyebrow}
              </p>
            ) : null}
            <h2
              className={`text-h2 text-balance ${
                dark ? "text-ivory" : "text-brand-900"
              }`}
            >
              {title}
            </h2>
            <div
              className={`mt-6 space-y-4 text-body-lg ${
                dark ? "text-gold-200" : "text-ink-soft"
              }`}
            >
              {children}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
