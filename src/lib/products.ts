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

const MOCK: ShopProduct[] = [
  {
    id: "mock-bpc-5",
    name: "BPC-157",
    variantGroup: "bpc-157",
    variantLabel: "5mg",
    categorySlug: "tissue-repair",
    priceCents: 3999,
    shortDescription: "Gut-derived healing peptide — joints, tendons, GI tract.",
    purity: "≥99%",
    storeUrl: "https://evlvpeptides.com/shop/bpc-157-5mg/",
    coas: [{ url: "https://evlvpeptides.com/coa/bpc157-5mg.pdf", label: "Latest" }],
  },
  {
    id: "mock-bpc-10",
    name: "BPC-157",
    variantGroup: "bpc-157",
    variantLabel: "10mg",
    categorySlug: "tissue-repair",
    priceCents: 6499,
    shortDescription: "Gut-derived healing peptide — joints, tendons, GI tract.",
    purity: "≥99%",
    storeUrl: "https://evlvpeptides.com/shop/bpc-157-10mg/",
    coas: [{ url: "https://evlvpeptides.com/coa/bpc157-10mg.pdf", label: "Latest" }],
  },
  {
    id: "mock-tb500-2",
    name: "TB-500",
    variantGroup: "tb-500",
    variantLabel: "2mg",
    categorySlug: "tissue-repair",
    priceCents: 2999,
    shortDescription: "Systemic tissue repair and inflammation modulation.",
    purity: "≥99%",
    storeUrl: "https://evlvpeptides.com/shop/tb-500-2mg/",
    coas: [{ url: "https://evlvpeptides.com/coa/tb500-2mg.pdf", label: "Latest" }],
  },
  {
    id: "mock-tb500-5",
    name: "TB-500",
    variantGroup: "tb-500",
    variantLabel: "5mg",
    categorySlug: "tissue-repair",
    priceCents: 5499,
    shortDescription: "Systemic tissue repair and inflammation modulation.",
    purity: "≥99%",
    storeUrl: "https://evlvpeptides.com/shop/tb-500-5mg/",
    coas: [{ url: "https://evlvpeptides.com/coa/tb500-5mg.pdf", label: "Latest" }],
  },
  {
    id: "mock-cjc-2",
    name: "CJC-1295",
    variantGroup: "cjc-1295",
    variantLabel: "2mg",
    categorySlug: "gh-secretagogue",
    priceCents: 3499,
    shortDescription: "Growth hormone releasing hormone analogue.",
    purity: "≥98%",
    storeUrl: "https://evlvpeptides.com/shop/cjc-1295-2mg/",
    coas: [{ url: "https://evlvpeptides.com/coa/cjc1295-2mg.pdf", label: "Latest" }],
  },
  {
    id: "mock-ipa-2",
    name: "Ipamorelin",
    variantGroup: "ipamorelin",
    variantLabel: "2mg",
    categorySlug: "gh-secretagogue",
    priceCents: 2999,
    shortDescription: "Selective GH secretagogue with minimal side effects.",
    purity: "≥99%",
    storeUrl: "https://evlvpeptides.com/shop/ipamorelin-2mg/",
    coas: [{ url: "https://evlvpeptides.com/coa/ipamorelin-2mg.pdf", label: "Latest" }],
  },
  {
    id: "mock-sema-1",
    name: "Semaglutide",
    variantGroup: "semaglutide",
    variantLabel: "1mg",
    categorySlug: "metabolic",
    priceCents: 8999,
    shortDescription: "GLP-1 receptor agonist for metabolic health.",
    purity: "≥99%",
    storeUrl: "https://evlvpeptides.com/shop/semaglutide-1mg/",
    coas: [{ url: "https://evlvpeptides.com/coa/sema-1mg.pdf", label: "Latest" }],
  },
];

export async function fetchProducts(peptideSlug?: string): Promise<ShopProduct[]> {
  // In development, Vite doesn't run Vercel API functions — use mock data directly.
  if (import.meta.env.DEV) {
    return peptideSlug ? MOCK.filter((p) => p.variantGroup === peptideSlug) : MOCK;
  }

  const url = `/api/products${peptideSlug ? `?peptide=${encodeURIComponent(peptideSlug)}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json() as Promise<ShopProduct[]>;
}
