import { ShieldCheck, FileText, Scale, MessageCircle } from "lucide-react";
import { home } from "@/content/home";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const { credentials } = home;

const icons = [ShieldCheck, FileText, Scale, MessageCircle] as const;

export function CredentialsStrip() {
  return (
    <section id="credentials" className="section-pad bg-brand-50">
      <Container>
        <SectionHeading
          eyebrow={credentials.eyebrow}
          title={credentials.title}
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {credentials.items.map((item, i) => {
            const Icon = icons[i] ?? ShieldCheck;
            return (
              <article
                key={item.title}
                className="rounded-[var(--radius-lg)] bg-white p-6 ring-1 ring-brand-100"
              >
                <span className="flex size-11 items-center justify-center rounded-[var(--radius-md)] bg-brand-50 text-brand-600">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-h3 text-brand-900">{item.title}</h3>
                <p className="mt-2 text-body-sm text-ink-soft">{item.body}</p>
              </article>
            );
          })}
        </div>

        <p className="mx-auto mt-8 max-w-[42rem] text-center text-body-sm text-muted">
          {credentials.footer}
        </p>
      </Container>
    </section>
  );
}
