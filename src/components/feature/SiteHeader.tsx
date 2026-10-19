import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const navLinks = [
  { label: "Browse by Type", to: "/#browse" },
  { label: "All Peptides", to: "/#peptides" },
  { label: "Methodology", to: "/#methodology" },
  { label: "FAQ", to: "/#faq" },
  { label: "Guides", to: "/#guides" },
  { label: "Sources", to: "/#sources" },
  { label: "VPR Spotlight", to: "/vpr-spotlight" },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkColor = scrolled
    ? "text-foreground-700 hover:text-primary-600"
    : "text-background-50/90 hover:text-background-50";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-background-200 bg-background-50/95 backdrop-blur"
          : "bg-transparent"
      }`}
    >
      <div
        className={`overflow-hidden transition-all duration-300 ${
          scrolled ? "max-h-0 opacity-0" : "max-h-12 opacity-100"
        }`}
      >
        <div className="bg-primary-950">
          <div className="mx-auto w-full max-w-[1440px] px-4 py-2 md:px-8">
            <p className="text-[11px] leading-snug text-primary-100 md:text-xs">
              <strong className="font-semibold text-background-50">For laboratory research only</strong>
              <span className="mx-2 text-primary-300">·</span>
              Dose ranges drawn from published literature
              <span className="mx-2 text-primary-300">·</span>
              <span className="hidden sm:inline">Not for human or veterinary use</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-4 md:px-8">
        <Link
          to="/"
          className={`font-heading text-lg font-semibold tracking-tight md:text-xl ${
            scrolled ? "text-foreground-950" : "text-background-50"
          }`}
        >
          Vial<em className="text-primary-400 not-italic">Calc</em>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`whitespace-nowrap text-sm font-medium transition-colors ${linkColor}`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/start"
            className="whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            Start Here →
          </Link>
        </nav>

        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setMenuOpen((v) => !v)}
          className={`flex h-10 w-10 items-center justify-center rounded-md lg:hidden ${
            scrolled ? "text-foreground-950" : "text-background-50"
          }`}
        >
          <i className={`text-xl ${menuOpen ? "ri-close-line" : "ri-menu-line"}`}></i>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-background-200 bg-background-50 px-4 pb-6 pt-4 lg:hidden">
          <nav className="flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="border-b border-background-100 py-3 text-sm font-medium text-foreground-800"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/start"
              onClick={() => setMenuOpen(false)}
              className="mt-4 rounded-md bg-primary-500 px-4 py-3 text-center text-sm font-semibold text-background-50"
            >
              Start Here →
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}