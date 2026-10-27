export type VendorBadge = "coa-live" | "third-party" | "qr-verify";

export type Vendor = {
  slug: string;
  name: string;
  country: "United States" | "Canada";
  score: number;
  reviews: number;
  badges: VendorBadge[];
  storeUrl: string;
  vprUrl: string;
  featured?: true;
  /** Short tagline shown on the featured card only */
  tagline?: string;
};

export const vendors: Vendor[] = [
  {
    slug: "evlv-peptides",
    name: "EVLV Peptides",
    country: "United States",
    score: 4.9,
    reviews: 748,
    badges: ["coa-live", "third-party", "qr-verify"],
    storeUrl: "https://evlvpeptides.com",
    vprUrl: "https://www.verifiedpeptidereviews.com/vendors/evlv-peptides",
    featured: true,
    tagline:
      "Independent HPLC + mass-spec certificates on every lot. QR-verified COAs link directly to the lab report — not a vendor-hosted copy.",
  },
  {
    slug: "valkyrie-peptides",
    name: "Valkyrie Peptides",
    country: "United States",
    score: 4.9,
    reviews: 694,
    badges: ["coa-live", "third-party", "qr-verify"],
    storeUrl: "https://valkyriepeps.com",
    vprUrl: "https://www.verifiedpeptidereviews.com/vendors/valkyrie-peptides",
  },
  {
    slug: "certified-peps",
    name: "Certified Peptides",
    country: "United States",
    score: 4.8,
    reviews: 483,
    badges: ["coa-live", "third-party", "qr-verify"],
    storeUrl: "https://certified-pep.com",
    vprUrl: "https://www.verifiedpeptidereviews.com/vendors/certified-peps",
  },
  {
    slug: "align-peptides",
    name: "Align Peptides",
    country: "Canada",
    score: 4.8,
    reviews: 418,
    badges: ["coa-live", "third-party", "qr-verify"],
    storeUrl: "https://alignpeptides.com",
    vprUrl: "https://www.verifiedpeptidereviews.com/vendors/align-peptides",
  },
  {
    slug: "ion-peptide",
    name: "Ion Peptide",
    country: "United States",
    score: 4.8,
    reviews: 406,
    badges: ["coa-live", "third-party", "qr-verify"],
    storeUrl: "https://ionpeptide.com",
    vprUrl: "https://www.verifiedpeptidereviews.com/vendors/ion-peptide",
  },
  {
    slug: "zoonetics",
    name: "Zoonetics",
    country: "United States",
    score: 4.8,
    reviews: 31,
    badges: ["coa-live", "third-party"],
    storeUrl: "https://zoonetics.co",
    vprUrl: "https://www.verifiedpeptidereviews.com/vendors/zoonetics",
  },
  {
    slug: "optimal-peps",
    name: "Optimal Peptides",
    country: "United States",
    score: 4.7,
    reviews: 31,
    badges: ["coa-live", "third-party", "qr-verify"],
    storeUrl: "https://optimal-pep.com",
    vprUrl: "https://www.verifiedpeptidereviews.com/vendors/optimal-peps",
  },
  {
    slug: "us-peptides",
    name: "US Peptides",
    country: "United States",
    score: 4.7,
    reviews: 27,
    badges: ["coa-live", "third-party", "qr-verify"],
    storeUrl: "https://uspeptides.com",
    vprUrl: "https://www.verifiedpeptidereviews.com/vendors/us-peptides",
  },
  {
    slug: "limitless-peptides",
    name: "Limitless Peptides",
    country: "United States",
    score: 4.6,
    reviews: 174,
    badges: ["coa-live", "third-party", "qr-verify"],
    storeUrl: "https://limitlesspeptides.com",
    vprUrl: "https://www.verifiedpeptidereviews.com/vendors/limitless-peptides",
  },
  {
    slug: "warrior-distributions",
    name: "Warrior Distributions",
    country: "United States",
    score: 4.6,
    reviews: 61,
    badges: ["coa-live", "third-party"],
    storeUrl: "https://warriordistributions.com",
    vprUrl: "https://www.verifiedpeptidereviews.com/vendors/warrior-distributions",
  },
  {
    slug: "pure-peptides",
    name: "Pure Peptides",
    country: "United States",
    score: 4.6,
    reviews: 29,
    badges: ["coa-live", "third-party", "qr-verify"],
    storeUrl: "https://purepeptides.com",
    vprUrl: "https://www.verifiedpeptidereviews.com/vendors/pure-peptides",
  },
  {
    slug: "aera-peptides",
    name: "Aera Peptides",
    country: "Canada",
    score: 4.6,
    reviews: 14,
    badges: ["coa-live", "third-party"],
    storeUrl: "https://aerapeptides.com",
    vprUrl: "https://www.verifiedpeptidereviews.com/vendors/aera-peptides",
  },
];

export const BADGE_META: Record<VendorBadge, { label: string; icon: string; title: string }> = {
  "coa-live": {
    label: "COA Live",
    icon: "ri-file-text-line",
    title: "Batch certificate publicly linked from the product page",
  },
  "third-party": {
    label: "3rd-Party Lab",
    icon: "ri-flask-2-line",
    title: "Certificate issued by an independent laboratory, not the vendor",
  },
  "qr-verify": {
    label: "QR Verify",
    icon: "ri-qr-code-line",
    title: "QR code on the vial links directly to the lab report",
  },
};
