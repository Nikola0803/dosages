/**
 * GET /api/products?peptide=bpc-157
 *
 * Returns the EVLV research catalog. Proxies to PEPTIDE_SAAS_URL if set,
 * otherwise returns the hardcoded EVLV catalog with real pricing and URLs.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

interface ShopProduct {
  id: string;
  name: string;
  variantGroup: string;
  variantLabel: string;
  categorySlug: string;
  priceCents: number;
  imageUrl?: string;
  shortDescription?: string;
  purity?: string;
  storeUrl: string;
  coas: { url: string; label?: string }[];
}

const BASE = "https://www.evlvpeptides.com";

const CATALOG: ShopProduct[] = [
  { id: "evlv-glp3r-10", name: "Retatrutide (GLP3-R)", variantGroup: "retatrutide", variantLabel: "10mg", categorySlug: "metabolic", priceCents: 7499, shortDescription: "GLP-1 / GLP-2 / glucagon triple agonist. Weekly dosing.", purity: "99.34%", storeUrl: `${BASE}/shop/evlv-3-10mg`, coas: [{ url: `${BASE}/coas`, label: "COA Library" }] },
  { id: "evlv-glp3r-15", name: "Retatrutide (GLP3-R)", variantGroup: "retatrutide", variantLabel: "15mg", categorySlug: "metabolic", priceCents: 12999, shortDescription: "GLP-1 / GLP-2 / glucagon triple agonist. Weekly dosing.", purity: "99.41%", storeUrl: `${BASE}/shop/evlv-3-15mg`, coas: [{ url: `${BASE}/coas`, label: "COA Library" }] },
  { id: "evlv-glp3r-30", name: "Retatrutide (GLP3-R)", variantGroup: "retatrutide", variantLabel: "30mg", categorySlug: "metabolic", priceCents: 18999, shortDescription: "GLP-1 / GLP-2 / glucagon triple agonist. Weekly dosing.", purity: "99.43%", storeUrl: `${BASE}/shop/evlv-3-30mg`, coas: [{ url: `${BASE}/coas`, label: "COA Library" }] },
  { id: "evlv-glp1s-5",  name: "Semaglutide (GLP1-S)",  variantGroup: "semaglutide",  variantLabel: "5mg",  categorySlug: "metabolic", priceCents: 4999,  shortDescription: "GLP-1 receptor agonist. Weekly appetite regulation.", storeUrl: `${BASE}/shop/evlv-1-5mg`,  coas: [{ url: `${BASE}/shop/evlv-1-5mg`,  label: "See product page" }] },
  { id: "evlv-glp1s-10", name: "Semaglutide (GLP1-S)",  variantGroup: "semaglutide",  variantLabel: "10mg", categorySlug: "metabolic", priceCents: 7499,  shortDescription: "GLP-1 receptor agonist. Weekly appetite regulation.", storeUrl: `${BASE}/shop/evlv-1-10mg`, coas: [{ url: `${BASE}/shop/evlv-1-10mg`, label: "See product page" }] },
  { id: "evlv-glp2t-10", name: "Tirzepatide (GLP2-T)",  variantGroup: "tirzepatide",  variantLabel: "10mg", categorySlug: "metabolic", priceCents: 6999,  shortDescription: "GLP-1 / GIP dual agonist. Weekly fat loss injection.", purity: "99.44%", storeUrl: `${BASE}/shop/evlv-2-10mg`, coas: [{ url: `${BASE}/coas`, label: "COA Library" }] },
  { id: "evlv-glp2t-15", name: "Tirzepatide (GLP2-T)",  variantGroup: "tirzepatide",  variantLabel: "15mg", categorySlug: "metabolic", priceCents: 8999,  shortDescription: "GLP-1 / GIP dual agonist. Weekly fat loss injection.", storeUrl: `${BASE}/shop/evlv-2-15mg`, coas: [{ url: `${BASE}/shop/evlv-2-15mg`, label: "See product page" }] },
  { id: "evlv-glp2t-30", name: "Tirzepatide (GLP2-T)",  variantGroup: "tirzepatide",  variantLabel: "30mg", categorySlug: "metabolic", priceCents: 14999, shortDescription: "GLP-1 / GIP dual agonist. Weekly fat loss injection.", purity: "99.29%", storeUrl: `${BASE}/shop/evlv-2-30mg`, coas: [{ url: `${BASE}/coas`, label: "COA Library" }] },
  { id: "evlv-glp2t-60", name: "Tirzepatide (GLP2-T)",  variantGroup: "tirzepatide",  variantLabel: "60mg", categorySlug: "metabolic", priceCents: 27499, shortDescription: "GLP-1 / GIP dual agonist. Weekly fat loss injection.", storeUrl: `${BASE}/shop/evlv-2-60mg`, coas: [{ url: `${BASE}/shop/evlv-2-60mg`, label: "See product page" }] },
  { id: "evlv-bpc157-10", name: "BPC-157",               variantGroup: "bpc-157",      variantLabel: "10mg", categorySlug: "tissue-repair",  priceCents: 7000,  shortDescription: "Gut-derived healing peptide. Joints, tendons, GI recovery.", storeUrl: `${BASE}/shop/bpc-157-10mg`,      coas: [{ url: `${BASE}/shop/bpc-157-10mg`,      label: "See product page" }] },
  { id: "evlv-kpv-10",    name: "KPV",                   variantGroup: "kpv",           variantLabel: "10mg", categorySlug: "tissue-repair",  priceCents: 6999,  shortDescription: "Tripeptide with anti-inflammatory and wound healing properties.", purity: "99.28%", storeUrl: `${BASE}/shop/kpv-10mg`,          coas: [{ url: `${BASE}/coas`, label: "COA Library" }] },
  { id: "evlv-tesa-10",   name: "Tesamorelin",            variantGroup: "tesamorelin",   variantLabel: "10mg", categorySlug: "gh-secretagogue",priceCents: 9499,  shortDescription: "GHRH analogue. Clinically proven to reduce visceral fat.", purity: "99.4%", storeUrl: `${BASE}/shop/tesamorelin-10mg`,   coas: [{ url: `${BASE}/coas`, label: "COA Library" }] },
  { id: "evlv-cjcipa-10", name: "CJC-1295 / Ipamorelin", variantGroup: "cjc-1295-ipamorelin-blend", variantLabel: "10mg", categorySlug: "blends", priceCents: 7500, shortDescription: "GHRH + GHRP blend. Amplifies GH pulses for lean mass.", purity: "99.28% Ipa / 99.36% CJC", storeUrl: `${BASE}/shop/cjc-ipa-blend-10mg`, coas: [{ url: `${BASE}/coas`, label: "COA Library" }] },
  { id: "evlv-cjcipa-20", name: "CJC-1295 / Ipamorelin", variantGroup: "cjc-1295-ipamorelin-blend", variantLabel: "20mg", categorySlug: "blends", priceCents: 13000, shortDescription: "GHRH + GHRP blend. Amplifies GH pulses for lean mass.", storeUrl: `${BASE}/shop/cjc-ipa-blend-20mg`, coas: [{ url: `${BASE}/shop/cjc-ipa-blend-20mg`, label: "See product page" }] },
  { id: "evlv-glow-70",   name: "GLOW Blend",             variantGroup: "glow-blend",    variantLabel: "70mg", categorySlug: "blends",         priceCents: 13999, shortDescription: "BPC-157, TB-500 and GHK-Cu for skin, hair and systemic repair.", purity: "99.45% BPC / 99.16% TB / 99.54% GHK", storeUrl: `${BASE}/shop/glow-70mg`,      coas: [{ url: `${BASE}/coas`, label: "COA Library" }] },
  { id: "evlv-klow-80",   name: "KLOW Blend",             variantGroup: "klow-blend",    variantLabel: "80mg", categorySlug: "blends",         priceCents: 14999, shortDescription: "Multi-peptide blend for comprehensive tissue repair.", storeUrl: `${BASE}/shop/klow-80mg`, coas: [{ url: `${BASE}/coas`, label: "COA Library" }] },
  { id: "evlv-motsc-10",  name: "MOTS-c",                 variantGroup: "mots-c",        variantLabel: "10mg", categorySlug: "mitochondrial",  priceCents: 5999,  shortDescription: "Mitochondrial peptide. Activates AMPK for metabolic regulation.", purity: "99.53%", storeUrl: `${BASE}/shop/mots-c-10mg`,        coas: [{ url: `${BASE}/coas`, label: "COA Library" }] },
  { id: "evlv-motsc-40",  name: "MOTS-c",                 variantGroup: "mots-c",        variantLabel: "40mg", categorySlug: "mitochondrial",  priceCents: 14999, shortDescription: "Mitochondrial peptide. Activates AMPK for metabolic regulation.", storeUrl: `${BASE}/shop/mots-c-40mg`, coas: [{ url: `${BASE}/shop/mots-c-40mg`, label: "See product page" }] },
  { id: "evlv-ss31-10",   name: "SS-31",                  variantGroup: "ss-31",         variantLabel: "10mg", categorySlug: "mitochondrial",  priceCents: 4500,  shortDescription: "Mitochondria-targeting peptide. Reduces oxidative stress.", storeUrl: `${BASE}/shop/ss-31-10mg`,      coas: [{ url: `${BASE}/shop/ss-31-10mg`, label: "See product page" }] },
  { id: "evlv-nad-500",   name: "NAD+",                   variantGroup: "nad-plus",      variantLabel: "500mg",categorySlug: "mitochondrial",  priceCents: 6499,  shortDescription: "Nicotinamide adenine dinucleotide. Cellular energy and repair.", purity: "99.3%", storeUrl: `${BASE}/shop/nad-500mg`,          coas: [{ url: `${BASE}/coas`, label: "COA Library" }] },
  { id: "evlv-ghkcu-50",  name: "GHK-Cu",                 variantGroup: "ghk-cu",        variantLabel: "50mg", categorySlug: "cosmetic",       priceCents: 3999,  shortDescription: "Copper peptide. Collagen synthesis, wound healing, hair follicle support.", purity: "99.4%", storeUrl: `${BASE}/shop/ghk-cu-50mg`,        coas: [{ url: `${BASE}/coas`, label: "COA Library" }] },
  { id: "evlv-selank-10", name: "Selank",                 variantGroup: "selank",        variantLabel: "10mg", categorySlug: "cognitive",      priceCents: 4999,  shortDescription: "Anxiolytic peptide. Reduces anxiety, improves learning.", storeUrl: `${BASE}/shop/selank-10mg`,       coas: [{ url: `${BASE}/shop/selank-10mg`, label: "See product page" }] },
  { id: "evlv-semax-10",  name: "Semax",                  variantGroup: "semax",         variantLabel: "10mg", categorySlug: "cognitive",      priceCents: 4999,  shortDescription: "ACTH analogue. Nootropic, neuroprotective, boosts BDNF.", storeUrl: `${BASE}/shop/semax-10mg`,         coas: [{ url: `${BASE}/shop/semax-10mg`, label: "See product page" }] },
  { id: "evlv-aod-10",    name: "AOD-9604",               variantGroup: "aod-9604",      variantLabel: "10mg", categorySlug: "metabolic",      priceCents: 6499,  shortDescription: "Modified GH fragment. Promotes fat breakdown without affecting IGF-1.", storeUrl: `${BASE}/shop/aod-9604-10mg`,      coas: [{ url: `${BASE}/shop/aod-9604-10mg`, label: "See product page" }] },
  { id: "evlv-cartalax-20",name: "Cartalax",              variantGroup: "cartalax",      variantLabel: "20mg", categorySlug: "longevity",      priceCents: 5999,  shortDescription: "Cartilage bioregulator. Connective tissue and joint longevity.", storeUrl: `${BASE}/shop/cartalax-20mg`,      coas: [{ url: `${BASE}/shop/cartalax-20mg`, label: "See product page" }] },
  { id: "evlv-ta1-5",     name: "Thymosin Alpha-1",       variantGroup: "thymosin-alpha-1",variantLabel:"5mg",  categorySlug: "immune",         priceCents: 4499,  shortDescription: "Thymic peptide. Enhances T-cell development and immune response.", storeUrl: `${BASE}/shop/thymosin-alpha-1-5mg`,coas: [{ url: `${BASE}/shop/thymosin-alpha-1-5mg`, label: "See product page" }] },
  { id: "evlv-oxytocin-10",name: "Oxytocin",              variantGroup: "oxytocin",      variantLabel: "10mg", categorySlug: "endocrine",      priceCents: 3999,  shortDescription: "Neuropeptide. Social bonding, stress regulation and recovery.", storeUrl: `${BASE}/shop/oxytocin-10mg`,      coas: [{ url: `${BASE}/shop/oxytocin-10mg`, label: "See product page" }] },
  { id: "evlv-pt141-10",  name: "PT-141",                 variantGroup: "pt-141",        variantLabel: "10mg", categorySlug: "endocrine",      priceCents: 3999,  shortDescription: "Melanocortin agonist. Clinically studied for sexual health.", purity: "99.1%", storeUrl: `${BASE}/shop/pt-141-10mg`,         coas: [{ url: `${BASE}/coas`, label: "COA Library" }] },
  { id: "evlv-bw-30",     name: "Bacteriostatic Water",   variantGroup: "bacteriostatic-water",variantLabel:"30ml",categorySlug:"tissue-repair",priceCents:2500,  shortDescription: "0.9% benzyl alcohol sterile water for peptide reconstitution.", storeUrl: `${BASE}/shop/bacteriostatic-water-30ml`, coas: [] },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const peptide = typeof req.query.peptide === "string" ? req.query.peptide.toLowerCase() : null;
  const saasUrl = process.env.PEPTIDE_SAAS_URL;

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
      // fall through to catalog
    }
  }

  const filtered = peptide ? CATALOG.filter((p) => p.variantGroup === peptide) : CATALOG;
  res.setHeader("Cache-Control", "public, s-maxage=3600");
  return res.status(200).json(filtered);
}
