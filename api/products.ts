/**
 * GET /api/products?peptide=bpc-157
 *
 * Proxies to the peptide-saas public catalog.
 * Falls back to static mock data when PEPTIDE_SAAS_URL is not set,
 * so the Shop tab works immediately in development / before the saas
 * endpoint is deployed.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

interface ShopProduct {
  id: string;
  name: string;
  variantGroup: string;
  variantLabel: string;
  priceCents: number;
  imageUrl?: string;
  shortDescription?: string;
  purity?: string;
  storeUrl: string;
  coas: { url: string; label?: string }[];
}

// ── Static fallback catalog ───────────────────────────────────────────────

const MOCK: ShopProduct[] = [
  {
    id: "mock-bpc-5",
    name: "BPC-157",
    variantGroup: "bpc-157",
    variantLabel: "5mg",
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
    priceCents: 8999,
    shortDescription: "GLP-1 receptor agonist for metabolic health.",
    purity: "≥99%",
    storeUrl: "https://evlvpeptides.com/shop/semaglutide-1mg/",
    coas: [{ url: "https://evlvpeptides.com/coa/sema-1mg.pdf", label: "Latest" }],
  },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const peptide  = typeof req.query.peptide === "string" ? req.query.peptide.toLowerCase() : null;
  const saasUrl  = process.env.PEPTIDE_SAAS_URL;

  // Try real backend first
  if (saasUrl) {
    try {
      const upstream = await fetch(
        `${saasUrl}/api/public/products${peptide ? `?peptide=${encodeURIComponent(peptide)}` : ""}`,
        { headers: { "x-vialcalc": "1" } }
      );
      if (upstream.ok) {
        const data = await upstream.json();
        res.setHeader("Cache-Control", "public, s-maxage=300");
        return res.status(200).json(data);
      }
    } catch {
      // fall through to mock
    }
  }

  // Fallback mock
  const filtered = peptide
    ? MOCK.filter((p) => p.variantGroup === peptide)
    : MOCK;

  res.setHeader("Cache-Control", "public, s-maxage=60");
  return res.status(200).json(filtered);
}
