import { home } from "@/content/home";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const { comparison } = home;

export function ComparisonTable() {
  return (
    <section id="comparison" className="section-pad bg-ivory">
      <Container>
        <SectionHeading
          eyebrow={comparison.eyebrow}
          title={comparison.title}
          sub={comparison.sub}
        />

        <div className="mt-10 overflow-x-auto rounded-[var(--radius-lg)] ring-1 ring-sand-200">
          <table className="w-full min-w-[46rem] border-collapse bg-white text-start">
            <caption className="sr-only">{comparison.title}</caption>
            <thead>
              <tr>
                <th scope="col" className="w-40 bg-sand-100 p-4 text-start" />
                {comparison.columns.map((col, i) => (
                  <th
                    key={col}
                    scope="col"
                    className={`p-4 text-start text-body font-medium ${
                      i === 0
                        ? "bg-brand-900 text-ivory"
                        : "bg-sand-100 text-ink-soft"
                    }`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.rows.map((row) => (
                <tr key={row.label} className="border-t border-sand-200">
                  <th
                    scope="row"
                    className="bg-sand-100/60 p-4 text-start text-body-sm font-medium text-brand-900"
                  >
                    {row.label}
                  </th>
                  {row.values.map((value, i) => (
                    <td
                      key={`${row.label}-${i}`}
                      className={`p-4 align-top text-body-sm ${
                        i === 0
                          ? "bg-brand-50 font-medium text-brand-900"
                          : "text-ink-soft"
                      }`}
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mx-auto mt-6 max-w-[42rem] rounded-[var(--radius-lg)] border border-gold-500/40 bg-gold-100 p-5 text-body text-ink-soft">
          {comparison.honestNote}
        </p>
      </Container>
    </section>
  );
}
