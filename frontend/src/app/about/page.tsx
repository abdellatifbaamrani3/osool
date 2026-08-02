import type { Metadata } from "next";
import { home } from "@/content/home";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "من نحن",
};

export default function AboutPage() {
  return (
    <section className="section-pad">
      <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <PlaceholderImage label={home.founder.imageLabel} ratio="4/5" />
        <div>
          <SectionHeading
            align="start"
            eyebrow={home.founder.eyebrow}
            title={home.founder.title}
          />
          <div className="mt-6 max-w-[38rem] space-y-4 text-body-lg text-ink-soft">
            {home.founder.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <ButtonLink href="/collection" className="mt-8">
            شوف المنتجات
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
