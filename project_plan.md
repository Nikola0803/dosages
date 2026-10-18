# OptimalDosages — Peptide Reconstitution & Dosing Reference

## 1. Project Description
A reference website for peptide reconstitution arithmetic and published research dosing. It helps a visitor answer three questions — which compound, what vial size, and how much bacteriostatic water — and then shows exactly what number to draw to on a syringe, along with pooled dose ranges reported in literature.

Positioning: independent, educational/laboratory reference material. No products are sold directly on the site. The tone is calm, precise and evidence-led.

Target users: laboratory and research-community users looking up reconstitution maths, dose ranges, evidence tiers and week-by-week plans for a catalogue of compounds.

Core value: an interactive reconstitution calculator/dosing wizard plus a structured, citation-backed compound library — so no one has to work the arithmetic out by hand.

## 2. Page Structure
- `/` — Home (hero + start-here wizard, browse-by-type, methodology, full compound index, FAQ, guides)
- `/calculator` — Full peptide reconstitution calculator
- `/peptides` — All peptides listing (filterable catalogue)
- `/peptides/:slug` — Individual compound page (prefilled calculator, dose ranges, plan, citations)
- `/compare` — Compare compounds side by side
- `/dosage-chart` — Master dosage chart by category
- `/research-library` — Every citation / evidence tier breakdown
- `/guides` — Reconstitution, syringe reading, storage guides
- `/start` — Guided walkthrough (three questions)
- `/editorial-policy`, `/privacy`, `/terms` — Policy pages

## 3. Core Features
- [ ] Age / research-use confirmation gate
- [ ] Hero three-question reconstitution wizard (peptide → vial size → water → draw-to readout)
- [ ] Browse-by-type category grid with compound counts
- [ ] Evidence-tier methodology explainer
- [ ] Full compound index grouped by category (72 compounds, 11 categories)
- [ ] FAQ accordion
- [ ] Guides entry cards
- [ ] Full calculator page with syringe visual + dose table
- [ ] Compound detail pages
- [ ] Master dosage chart / comparison

## 4. Data Model Design
No database required. All calculator maths run client-side; compound reference data lives in typed mock/data modules under `src/mocks/`.
If user accounts, saved calculations or submitted content are later required, connect Readdy Backend or SaaS Supabase at that point.

## 5. Backend / Third-party Integration Plan
- Database: not now — all reference data is static and calculator logic is client-side
- Shopify: not needed
- Stripe / Toss / PayPal / Square: not needed
- Others: plain outbound retailer links (no affiliate program), no integration

## 6. Development Phase Plan

### Phase 1: Home page
- Goal: Deliver the full home experience — age gate, header/footer, hero with working reconstitution wizard, browse-by-type, methodology + evidence tiers, full compound index, FAQ, guides.
- Deliverable: A polished, responsive home page with real reference content and a functioning wizard.

### Phase 2: Calculator page
- Goal: Full reconstitution calculator — compound picker, vial size, water volume, syringe visual, dose table, doses-per-vial.
- Deliverable: `/calculator` fully interactive.

### Phase 3: Compound catalogue & detail pages
- Goal: `/peptides` listing with search/filter, and `/peptides/:slug` detail pages with prefilled calculator and dose ranges.
- Deliverable: Browsable, searchable compound library.

### Phase 4: Dosage chart, compare & research library
- Goal: `/dosage-chart`, `/compare`, `/research-library` with tier breakdowns and citations.
- Deliverable: Reference tools for cross-compound comparison.

### Phase 5: Guides & policy pages
- Goal: `/guides` long-form guides plus editorial, privacy and terms pages.
- Deliverable: Complete, publishable site.

### Phase 6: Polish
- Goal: SEO metadata per page, scroll animations, accessibility passes, final QA.
- Deliverable: Production-ready website.