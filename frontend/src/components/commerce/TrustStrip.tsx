import { Banknote, Package, ShieldCheck, Truck } from "lucide-react";
import { ar } from "@/content/ar";
import { Container } from "@/components/layout/Container";

const items = [
  { icon: Banknote, ...ar.trust.cod },
  { icon: Truck, ...ar.trust.delivery },
  { icon: Package, ...ar.trust.discreet },
  { icon: ShieldCheck, ...ar.trust.guarantee },
];

export function TrustStrip({ tinted = true }: { tinted?: boolean }) {
  return (
    <section className={tinted ? "bg-brand-50" : "bg-ivory"}>
      <Container className="py-6">
        <ul className="flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:pb-0">
          {items.map(({ icon: Icon, label, sub }) => (
            <li
              key={label}
              className="flex min-w-[70%] items-start gap-3 rounded-[var(--radius-lg)] bg-white/70 px-4 py-3 ring-1 ring-brand-100/60 md:min-w-0"
            >
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <Icon className="size-4" aria-hidden strokeWidth={1.75} />
              </span>
              <span>
                <span className="block text-body-sm font-medium text-brand-900">
                  {label}
                </span>
                <span className="mt-0.5 block text-body-sm text-muted">
                  {sub}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
