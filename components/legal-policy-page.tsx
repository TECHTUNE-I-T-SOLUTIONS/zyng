'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

type LegalSection = {
  title: string;
  lead?: string;
  items?: string[];
};

type LegalPolicyPageProps = {
  eyebrow: string;
  title: string;
  summary: string;
  effectiveDate: string;
  sections: LegalSection[];
};

const legalLinks = [
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/cookies', label: 'Cookies' },
  { href: '/contact', label: 'Contact' },
];

export function LegalPolicyPage({ eyebrow, title, summary, effectiveDate, sections }: LegalPolicyPageProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-muted/10 px-6 py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="space-y-6">
            <div className="text-xs font-black uppercase tracking-[0.24em] text-accent">{eyebrow}</div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">{title}</h1>
            <p className="max-w-2xl text-base leading-8 text-foreground/70">{summary}</p>
            <div className="rounded-md border border-border bg-background p-4 text-sm text-foreground/60">
              <div className="font-bold text-foreground">Effective date</div>
              <div>{effectiveDate}</div>
            </div>
          </div>

          <aside className="rounded-lg border border-border bg-background p-5">
            <div className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-foreground/40">Legal Center</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {legalLinks.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-md border border-border px-4 py-3 text-sm font-bold text-foreground/70 transition-colors hover:border-accent/50 hover:text-accent">
                  {link.label}
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-[260px_1fr]">
        <nav className="hidden self-start rounded-lg border border-border bg-muted/10 p-4 lg:sticky lg:top-28 lg:block">
          <div className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-foreground/40">Contents</div>
          <div className="space-y-1">
            {sections.map((section, index) => (
              <a key={section.title} href={`#section-${index + 1}`} className="block rounded px-3 py-2 text-sm font-medium text-foreground/60 transition-colors hover:bg-muted hover:text-foreground">
                {index + 1}. {section.title}
              </a>
            ))}
          </div>
        </nav>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.section
              id={`section-${index + 1}`}
              key={section.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              className="scroll-mt-28 rounded-lg border border-border bg-background p-6 md:p-8"
            >
              <div className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-accent">Section {index + 1}</div>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{section.title}</h2>
              {section.lead && <p className="mt-4 text-base leading-8 text-foreground/70">{section.lead}</p>}
              {!!section.items?.length && (
                <ul className="mt-5 space-y-3">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-7 text-foreground/70">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.section>
          ))}
        </div>
      </main>
    </div>
  );
}
