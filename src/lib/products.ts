export interface ShopProduct {
  id: string;
  name: string;
  variantGroup: string;  // normalized slug, e.g. "bpc-157"
  variantLabel: string;  // size, e.g. "5mg"
  categorySlug: string;  // for VialIcon cap colour
  priceCents: number;
  imageUrl?: string;
  shortDescription?: string;
  purity?: string;
  storeUrl: string;
  coas: { url: string; label?: string }[];
}

const BASE = "https://www.evlvpeptides.com";

const MOCK: ShopProduct[] = [
  // ── GLP-1/GLP-2/Glucagon tri-agonist (Retatrutide) ──
  {
    id: "evlv-glp3r-10",
    name: "Retatrutide (GLP3-R)",
    variantGroup: "retatrutide",
    variantLabel: "10mg",
    categorySlug: "metabolic",
    priceCents: 7499,
    shortDescription: "GLP-1 / GLP-2 / glucagon triple agonist. Weekly dosing for metabolic and body composition goals.",
    purity: "99.34%",
    storeUrl: `${BASE}/shop/evlv-3-10mg`,
    coas: [{ url: `${BASE}/coas`, label: "COA Library" }],
  },
  {
    id: "evlv-glp3r-15",
    name: "Retatrutide (GLP3-R)",
    variantGroup: "retatrutide",
    variantLabel: "15mg",
    categorySlug: "metabolic",
    priceCents: 12999,
    shortDescription: "GLP-1 / GLP-2 / glucagon triple agonist. Weekly dosing for metabolic and body composition goals.",
    purity: "99.41%",
    storeUrl: `${BASE}/shop/evlv-3-15mg`,
    coas: [{ url: `${BASE}/coas`, label: "COA Library" }],
  },
  {
    id: "evlv-glp3r-30",
    name: "Retatrutide (GLP3-R)",
    variantGroup: "retatrutide",
    variantLabel: "30mg",
    categorySlug: "metabolic",
    priceCents: 18999,
    shortDescription: "GLP-1 / GLP-2 / glucagon triple agonist. Weekly dosing for metabolic and body composition goals.",
    purity: "99.43%",
    storeUrl: `${BASE}/shop/evlv-3-30mg`,
    coas: [{ url: `${BASE}/coas`, label: "COA Library" }],
  },

  // ── GLP-1 agonist (Semaglutide) ──
  {
    id: "evlv-glp1s-5",
    name: "Semaglutide (GLP1-S)",
    variantGroup: "semaglutide",
    variantLabel: "5mg",
    categorySlug: "metabolic",
    priceCents: 4999,
    shortDescription: "GLP-1 receptor agonist. Weekly dosing for appetite regulation and metabolic health.",
    storeUrl: `${BASE}/shop/evlv-1-5mg`,
    coas: [{ url: `${BASE}/shop/evlv-1-5mg`, label: "See product page" }],
  },
  {
    id: "evlv-glp1s-10",
    name: "Semaglutide (GLP1-S)",
    variantGroup: "semaglutide",
    variantLabel: "10mg",
    categorySlug: "metabolic",
    priceCents: 7499,
    shortDescription: "GLP-1 receptor agonist. Weekly dosing for appetite regulation and metabolic health.",
    storeUrl: `${BASE}/shop/evlv-1-10mg`,
    coas: [{ url: `${BASE}/shop/evlv-1-10mg`, label: "See product page" }],
  },

  // ── GLP-1/GIP dual agonist (Tirzepatide) ──
  {
    id: "evlv-glp2t-10",
    name: "Tirzepatide (GLP2-T)",
    variantGroup: "tirzepatide",
    variantLabel: "10mg",
    categorySlug: "metabolic",
    priceCents: 6999,
    shortDescription: "GLP-1 and GIP dual agonist. Weekly injection for fat loss and insulin sensitisation.",
    purity: "99.44%",
    storeUrl: `${BASE}/shop/evlv-2-10mg`,
    coas: [{ url: `${BASE}/coas`, label: "COA Library" }],
  },
  {
    id: "evlv-glp2t-15",
    name: "Tirzepatide (GLP2-T)",
    variantGroup: "tirzepatide",
    variantLabel: "15mg",
    categorySlug: "metabolic",
    priceCents: 8999,
    shortDescription: "GLP-1 and GIP dual agonist. Weekly injection for fat loss and insulin sensitisation.",
    storeUrl: `${BASE}/shop/evlv-2-15mg`,
    coas: [{ url: `${BASE}/shop/evlv-2-15mg`, label: "See product page" }],
  },
  {
    id: "evlv-glp2t-30",
    name: "Tirzepatide (GLP2-T)",
    variantGroup: "tirzepatide",
    variantLabel: "30mg",
    categorySlug: "metabolic",
    priceCents: 14999,
    shortDescription: "GLP-1 and GIP dual agonist. Weekly injection for fat loss and insulin sensitisation.",
    purity: "99.29%",
    storeUrl: `${BASE}/shop/evlv-2-30mg`,
    coas: [{ url: `${BASE}/coas`, label: "COA Library" }],
  },
  {
    id: "evlv-glp2t-60",
    name: "Tirzepatide (GLP2-T)",
    variantGroup: "tirzepatide",
    variantLabel: "60mg",
    categorySlug: "metabolic",
    priceCents: 27499,
    shortDescription: "GLP-1 and GIP dual agonist. Weekly injection for fat loss and insulin sensitisation.",
    storeUrl: `${BASE}/shop/evlv-2-60mg`,
    coas: [{ url: `${BASE}/shop/evlv-2-60mg`, label: "See product page" }],
  },

  // ── Tissue Repair ──
  {
    id: "evlv-bpc157-10",
    name: "BPC-157",
    variantGroup: "bpc-157",
    variantLabel: "10mg",
    categorySlug: "tissue-repair",
    priceCents: 7000,
    shortDescription: "Gut-derived healing peptide. Joint, tendon, ligament and GI tract recovery.",
    storeUrl: `${BASE}/shop/bpc-157-10mg`,
    coas: [{ url: `${BASE}/shop/bpc-157-10mg`, label: "See product page" }],
  },
  {
    id: "evlv-kpv-10",
    name: "KPV",
    variantGroup: "kpv",
    variantLabel: "10mg",
    categorySlug: "tissue-repair",
    priceCents: 6999,
    shortDescription: "Tripeptide with potent anti-inflammatory and wound healing properties.",
    purity: "99.28%",
    storeUrl: `${BASE}/shop/kpv-10mg`,
    coas: [{ url: `${BASE}/coas`, label: "COA Library" }],
  },

  // ── GH Secretagogue ──
  {
    id: "evlv-tesa-10",
    name: "Tesamorelin",
    variantGroup: "tesamorelin",
    variantLabel: "10mg",
    categorySlug: "gh-secretagogue",
    priceCents: 9499,
    shortDescription: "GHRH analogue. Clinically proven to reduce visceral fat and stimulate GH release.",
    purity: "99.4%",
    storeUrl: `${BASE}/shop/tesamorelin-10mg`,
    coas: [{ url: `${BASE}/coas`, label: "COA Library" }],
  },
  {
    id: "evlv-cjcipa-10",
    name: "CJC-1295 / Ipamorelin",
    variantGroup: "cjc-1295-ipamorelin-blend",
    variantLabel: "10mg",
    categorySlug: "blends",
    priceCents: 7500,
    shortDescription: "GHRH + GHRP combination. Amplifies GH pulses for lean mass and recovery.",
    purity: "99.28% Ipa / 99.36% CJC",
    storeUrl: `${BASE}/shop/cjc-ipa-blend-10mg`,
    coas: [{ url: `${BASE}/coas`, label: "COA Library" }],
  },
  {
    id: "evlv-cjcipa-20",
    name: "CJC-1295 / Ipamorelin",
    variantGroup: "cjc-1295-ipamorelin-blend",
    variantLabel: "20mg",
    categorySlug: "blends",
    priceCents: 13000,
    shortDescription: "GHRH + GHRP combination. Amplifies GH pulses for lean mass and recovery.",
    storeUrl: `${BASE}/shop/cjc-ipa-blend-20mg`,
    coas: [{ url: `${BASE}/shop/cjc-ipa-blend-20mg`, label: "See product page" }],
  },

  // ── Blends ──
  {
    id: "evlv-glow-70",
    name: "GLOW Blend",
    variantGroup: "glow-blend",
    variantLabel: "70mg",
    categorySlug: "blends",
    priceCents: 13999,
    shortDescription: "BPC-157, TB-500 and GHK-Cu for skin, hair, collagen and systemic repair.",
    purity: "99.45% BPC / 99.16% TB-500 / 99.54% GHK-Cu",
    storeUrl: `${BASE}/shop/glow-70mg`,
    coas: [{ url: `${BASE}/coas`, label: "COA Library" }],
  },
  {
    id: "evlv-klow-80",
    name: "KLOW Blend",
    variantGroup: "klow-blend",
    variantLabel: "80mg",
    categorySlug: "blends",
    priceCents: 14999,
    shortDescription: "KLOW multi-peptide blend for comprehensive tissue repair and recovery.",
    storeUrl: `${BASE}/shop/klow-80mg`,
    coas: [{ url: `${BASE}/coas`, label: "COA Library" }],
  },

  // ── Mitochondrial ──
  {
    id: "evlv-motsc-10",
    name: "MOTS-c",
    variantGroup: "mots-c",
    variantLabel: "10mg",
    categorySlug: "mitochondrial",
    priceCents: 5999,
    shortDescription: "Mitochondrial-derived peptide. Activates AMPK for metabolic regulation and longevity.",
    purity: "99.53%",
    storeUrl: `${BASE}/shop/mots-c-10mg`,
    coas: [{ url: `${BASE}/coas`, label: "COA Library" }],
  },
  {
    id: "evlv-motsc-40",
    name: "MOTS-c",
    variantGroup: "mots-c",
    variantLabel: "40mg",
    categorySlug: "mitochondrial",
    priceCents: 14999,
    shortDescription: "Mitochondrial-derived peptide. Activates AMPK for metabolic regulation and longevity.",
    storeUrl: `${BASE}/shop/mots-c-40mg`,
    coas: [{ url: `${BASE}/shop/mots-c-40mg`, label: "See product page" }],
  },
  {
    id: "evlv-ss31-10",
    name: "SS-31",
    variantGroup: "ss-31",
    variantLabel: "10mg",
    categorySlug: "mitochondrial",
    priceCents: 4500,
    shortDescription: "Mitochondria-targeting peptide. Reduces oxidative stress and supports cardiac health.",
    storeUrl: `${BASE}/shop/ss-31-10mg`,
    coas: [{ url: `${BASE}/shop/ss-31-10mg`, label: "See product page" }],
  },
  {
    id: "evlv-nad-500",
    name: "NAD+",
    variantGroup: "nad-plus",
    variantLabel: "500mg",
    categorySlug: "mitochondrial",
    priceCents: 6499,
    shortDescription: "Nicotinamide adenine dinucleotide. Supports energy metabolism and cellular repair.",
    purity: "99.3%",
    storeUrl: `${BASE}/shop/nad-500mg`,
    coas: [{ url: `${BASE}/coas`, label: "COA Library" }],
  },

  // ── Cosmetic ──
  {
    id: "evlv-ghkcu-50",
    name: "GHK-Cu",
    variantGroup: "ghk-cu",
    variantLabel: "50mg",
    categorySlug: "cosmetic",
    priceCents: 3999,
    shortDescription: "Copper peptide. Promotes collagen synthesis, wound healing and hair follicle activation.",
    purity: "99.4%",
    storeUrl: `${BASE}/shop/ghk-cu-50mg`,
    coas: [{ url: `${BASE}/coas`, label: "COA Library" }],
  },

  // ── Cognitive ──
  {
    id: "evlv-selank-10",
    name: "Selank",
    variantGroup: "selank",
    variantLabel: "10mg",
    categorySlug: "cognitive",
    priceCents: 4999,
    shortDescription: "Anxiolytic peptide analogue. Reduces anxiety, improves learning and memory.",
    storeUrl: `${BASE}/shop/selank-10mg`,
    coas: [{ url: `${BASE}/shop/selank-10mg`, label: "See product page" }],
  },
  {
    id: "evlv-semax-10",
    name: "Semax",
    variantGroup: "semax",
    variantLabel: "10mg",
    categorySlug: "cognitive",
    priceCents: 4999,
    shortDescription: "ACTH analogue. Nootropic and neuroprotective peptide, boosts BDNF and focus.",
    storeUrl: `${BASE}/shop/semax-10mg`,
    coas: [{ url: `${BASE}/shop/semax-10mg`, label: "See product page" }],
  },

  // ── Metabolic / AOD ──
  {
    id: "evlv-aod-10",
    name: "AOD-9604",
    variantGroup: "aod-9604",
    variantLabel: "10mg",
    categorySlug: "metabolic",
    priceCents: 6499,
    shortDescription: "Modified GH fragment. Promotes fat breakdown without affecting IGF-1 or blood sugar.",
    storeUrl: `${BASE}/shop/aod-9604-10mg`,
    coas: [{ url: `${BASE}/shop/aod-9604-10mg`, label: "See product page" }],
  },

  // ── Longevity / Bioregulator ──
  {
    id: "evlv-cartalax-20",
    name: "Cartalax",
    variantGroup: "cartalax",
    variantLabel: "20mg",
    categorySlug: "longevity",
    priceCents: 5999,
    shortDescription: "Russian cartilage bioregulator. Supports connective tissue and joint longevity.",
    storeUrl: `${BASE}/shop/cartalax-20mg`,
    coas: [{ url: `${BASE}/shop/cartalax-20mg`, label: "See product page" }],
  },

  // ── Immune ──
  {
    id: "evlv-ta1-5",
    name: "Thymosin Alpha-1",
    variantGroup: "thymosin-alpha-1",
    variantLabel: "5mg",
    categorySlug: "immune",
    priceCents: 4499,
    shortDescription: "Thymic peptide. Enhances T-cell development and immune surveillance.",
    storeUrl: `${BASE}/shop/thymosin-alpha-1-5mg`,
    coas: [{ url: `${BASE}/shop/thymosin-alpha-1-5mg`, label: "See product page" }],
  },

  // ── Endocrine & Sexual Health ──
  {
    id: "evlv-oxytocin-10",
    name: "Oxytocin",
    variantGroup: "oxytocin",
    variantLabel: "10mg",
    categorySlug: "endocrine",
    priceCents: 3999,
    shortDescription: "Neuropeptide hormone supporting social bonding, stress regulation and recovery.",
    storeUrl: `${BASE}/shop/oxytocin-10mg`,
    coas: [{ url: `${BASE}/shop/oxytocin-10mg`, label: "See product page" }],
  },
  {
    id: "evlv-pt141-10",
    name: "PT-141",
    variantGroup: "pt-141",
    variantLabel: "10mg",
    categorySlug: "endocrine",
    priceCents: 3999,
    shortDescription: "Melanocortin receptor agonist. Clinically studied for sexual health in men and women.",
    purity: "99.1%",
    storeUrl: `${BASE}/shop/pt-141-10mg`,
    coas: [{ url: `${BASE}/coas`, label: "COA Library" }],
  },

  // ── Ancillaries ──
  {
    id: "evlv-bw-30",
    name: "Bacteriostatic Water",
    variantGroup: "bacteriostatic-water",
    variantLabel: "30ml",
    categorySlug: "tissue-repair",
    priceCents: 2500,
    shortDescription: "0.9% benzyl alcohol sterile water for peptide reconstitution. H-BRAND 30ml.",
    storeUrl: `${BASE}/shop/bacteriostatic-water-30ml`,
    coas: [],
  },
];

export async function fetchProducts(peptideSlug?: string): Promise<ShopProduct[]> {
  if (import.meta.env.DEV) {
    return peptideSlug ? MOCK.filter((p) => p.variantGroup === peptideSlug) : MOCK;
  }

  const url = `/api/products${peptideSlug ? `?peptide=${encodeURIComponent(peptideSlug)}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json() as Promise<ShopProduct[]>;
}
