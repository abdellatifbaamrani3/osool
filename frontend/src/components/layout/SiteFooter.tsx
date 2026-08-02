"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { ar } from "@/content/ar";
import { Logo } from "@/components/ui/Logo";
import { Container } from "./Container";

type FooterGroup = {
  id: string;
  title: string;
  links: { href: string; label: string }[];
};

const groups: FooterGroup[] = [
  {
    id: "shop",
    title: ar.footer.shop,
    links: [
      { href: "/collection", label: ar.nav.collection },
      { href: "/#how", label: ar.nav.protocol },
      { href: "/#proof", label: ar.nav.science },
    ],
  },
  {
    id: "help",
    title: ar.footer.help,
    links: [
      { href: "/#faq", label: ar.footer.faq },
      { href: "/#guarantee", label: ar.nav.guarantee },
      { href: "/contact", label: ar.nav.contact },
    ],
  },
  {
    id: "policies",
    title: ar.footer.legal,
    links: [
      { href: "/privacy", label: ar.footer.privacy },
      { href: "/shipping", label: ar.footer.shipping },
      { href: "/returns", label: ar.footer.returns },
      { href: "/terms", label: ar.footer.terms },
    ],
  },
];

function FooterAccordion({ group }: { group: FooterGroup }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/10 last:border-b-0 md:border-0">
      <button
        type="button"
        className="flex w-full items-center justify-between py-4 text-start md:pointer-events-none md:cursor-default md:py-0 md:pb-4"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-label font-medium tracking-wide text-gold-300">
          {group.title}
        </span>
        <ChevronDown
          aria-hidden
          className={`size-5 text-gold-300 transition-transform duration-[var(--dur-base)] md:hidden ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <ul
        className={`space-y-3 pb-4 text-body-sm text-gold-200 md:block md:pb-0 ${
          open ? "block" : "hidden"
        }`}
      >
        {group.links.map((l) => (
          <li key={l.href + l.label}>
            <Link href={l.href} className="block py-0.5 hover:text-ivory">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-brand-900 text-ivory">
      <Container className="section-pad grid gap-0 md:grid-cols-2 md:gap-10 lg:grid-cols-4">
        <div className="mb-6 md:mb-0 lg:col-span-1">
          <Logo variant="inverse" />
          <p className="mt-5 max-w-xs text-body-sm text-gold-200">
            {ar.footer.blurb}
          </p>
        </div>

        {groups.map((group) => (
          <FooterAccordion key={group.id} group={group} />
        ))}
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-2 py-5 text-body-sm text-gold-300 md:flex-row md:items-center md:justify-between">
          <p>{ar.footer.copyright}</p>
          <p>
            {ar.footer.vat} · {ar.footer.crPlaceholder}
          </p>
        </Container>
      </div>
    </footer>
  );
}
