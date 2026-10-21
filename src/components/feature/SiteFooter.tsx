import { Link } from "react-router-dom";

const columns = [
  {
    heading: "Tools",
    links: [
      { label: "Reconstitution Wizard", to: "/#start" },
      { label: "Browse by Type", to: "/#browse" },
      { label: "Full Peptide Index", to: "/#peptides" },
    ],
  },
  {
    heading: "Guides",
    links: [
      { label: "How to mix a vial", to: "/#guides" },
      { label: "Reading Your Syringe", to: "/#guides" },
      { label: "Storage & Stability", to: "/#guides" },
    ],
  },
  {
    heading: "Site",
    links: [
      { label: "Home", to: "/" },
      { label: "Methodology", to: "/#methodology" },
      { label: "Common Questions", to: "/#faq" },
    ],
  },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-primary-950 text-primary-100">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-600 to-transparent" />
      <div className="mx-auto w-full max-w-[1440px] px-4 py-14 md:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="font-heading text-xl font-semibold text-background-50">
              Vial<span className="text-primary-400">Calc</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-primary-200">
              A reference library for peptide reconstitution maths and dose ranges taken from
              published research. Nothing is sold here.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="font-label text-xs uppercase tracking-wider text-primary-300">
                {col.heading}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-primary-100 transition-colors hover:text-background-50"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-primary-800 pt-8">
          <p className="text-xs leading-relaxed text-primary-200">
            <strong className="text-background-50">Research use only.</strong> Everything here is
            published for laboratory and educational reference. It is not medical advice, it is not
            a prescription, and it is not a recommendation to give any compound to a person or an
            animal. No statement on this site has been reviewed by the U.S. Food and Drug
            Administration, and nothing here is meant to diagnose, treat, cure, or prevent any
            disease.
          </p>
          <p className="mt-4 text-xs leading-relaxed text-primary-300">
            A number of the compounds indexed here are unapproved investigational substances. Dose
            figures are reproduced from published literature as bibliographic reference only and
            imply nothing about whether any dose is safe, effective, or appropriate outside a
            controlled research setting. Before acting on anything you read here, speak to a
            qualified clinician.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-primary-800 pt-6 text-xs text-primary-300 sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} VialCalc · peptidedosingcalculator.co</span>
          <span>Dose ranges compiled from peer-reviewed and preclinical literature</span>
        </div>
      </div>
    </footer>

  );
}