export type EvidenceTier = "clinical" | "preclinical" | "limited";

export type Peptide = {
  name: string;
  slug: string;
  categorySlug: string;
  typicalMcg: number;
  frequency: string;
  evidence: EvidenceTier;
};

export const peptides: Peptide[] = [
  // Tissue Repair & Recovery
  { name: "BPC-157", slug: "bpc-157", categorySlug: "tissue-repair", typicalMcg: 250, frequency: "1-2x daily", evidence: "clinical" },
  { name: "KPV", slug: "kpv", categorySlug: "tissue-repair", typicalMcg: 200, frequency: "1x daily", evidence: "preclinical" },
  { name: "TB-500", slug: "tb-500", categorySlug: "tissue-repair", typicalMcg: 500, frequency: "1x daily", evidence: "preclinical" },

  // Metabolic / Incretin
  { name: "5-Amino-1MQ", slug: "5-amino-1mq", categorySlug: "metabolic", typicalMcg: 2500, frequency: "1x daily", evidence: "preclinical" },
  { name: "Adipotide", slug: "adipotide", categorySlug: "metabolic", typicalMcg: 5000, frequency: "1x daily", evidence: "limited" },
  { name: "AOD-9604", slug: "aod-9604", categorySlug: "metabolic", typicalMcg: 300, frequency: "1x daily", evidence: "clinical" },
  { name: "Cagrilintide", slug: "cagrilintide", categorySlug: "metabolic", typicalMcg: 300, frequency: "1x weekly", evidence: "clinical" },
  { name: "Mazdutide", slug: "mazdutide", categorySlug: "metabolic", typicalMcg: 3000, frequency: "1x weekly", evidence: "clinical" },
  { name: "Retatrutide", slug: "retatrutide", categorySlug: "metabolic", typicalMcg: 1000, frequency: "1x weekly", evidence: "clinical" },
  { name: "Semaglutide", slug: "semaglutide", categorySlug: "metabolic", typicalMcg: 250, frequency: "1x weekly", evidence: "clinical" },
  { name: "SLU-PP-332", slug: "slu-pp-332", categorySlug: "metabolic", typicalMcg: 250, frequency: "1x daily", evidence: "preclinical" },
  { name: "Survodutide", slug: "survodutide", categorySlug: "metabolic", typicalMcg: 600, frequency: "1x weekly", evidence: "clinical" },
  { name: "Tirzepatide", slug: "tirzepatide", categorySlug: "metabolic", typicalMcg: 2500, frequency: "1x weekly", evidence: "clinical" },

  // GH Secretagogue
  { name: "CJC-1295 (no DAC)", slug: "cjc-1295-no-dac", categorySlug: "gh-secretagogue", typicalMcg: 100, frequency: "2-3x daily", evidence: "preclinical" },
  { name: "CJC-1295 DAC", slug: "cjc-1295-dac", categorySlug: "gh-secretagogue", typicalMcg: 1000, frequency: "1x weekly", evidence: "preclinical" },
  { name: "GHRP-2", slug: "ghrp-2", categorySlug: "gh-secretagogue", typicalMcg: 100, frequency: "2-3x daily", evidence: "preclinical" },
  { name: "GHRP-6", slug: "ghrp-6", categorySlug: "gh-secretagogue", typicalMcg: 100, frequency: "2-3x daily", evidence: "preclinical" },
  { name: "Hexarelin", slug: "hexarelin", categorySlug: "gh-secretagogue", typicalMcg: 100, frequency: "1x daily", evidence: "preclinical" },
  { name: "Ipamorelin", slug: "ipamorelin", categorySlug: "gh-secretagogue", typicalMcg: 100, frequency: "2-3x daily", evidence: "preclinical" },
  { name: "Sermorelin", slug: "sermorelin", categorySlug: "gh-secretagogue", typicalMcg: 100, frequency: "1x daily", evidence: "clinical" },
  { name: "Tesamorelin", slug: "tesamorelin", categorySlug: "gh-secretagogue", typicalMcg: 1000, frequency: "1x daily", evidence: "clinical" },

  // Growth Factor
  { name: "IGF-1 DES", slug: "igf-1-des", categorySlug: "growth-factor", typicalMcg: 50, frequency: "1x daily", evidence: "limited" },
  { name: "IGF-1 LR3", slug: "igf-1-lr3", categorySlug: "growth-factor", typicalMcg: 20, frequency: "1x daily", evidence: "limited" },
  { name: "MGF", slug: "mgf", categorySlug: "growth-factor", typicalMcg: 200, frequency: "1x daily", evidence: "preclinical" },
  { name: "PEG-MGF", slug: "peg-mgf", categorySlug: "growth-factor", typicalMcg: 200, frequency: "2x weekly", evidence: "preclinical" },

  // Longevity & Bioregulator
  { name: "Cartalax", slug: "cartalax", categorySlug: "longevity", typicalMcg: 1000, frequency: "1x daily", evidence: "limited" },
  { name: "Chonluten", slug: "chonluten", categorySlug: "longevity", typicalMcg: 1000, frequency: "1x daily", evidence: "limited" },
  { name: "Cortagen", slug: "cortagen", categorySlug: "longevity", typicalMcg: 1000, frequency: "1x daily", evidence: "limited" },
  { name: "Epitalon", slug: "epitalon", categorySlug: "longevity", typicalMcg: 5000, frequency: "1x daily", evidence: "clinical" },
  { name: "FOXO4-DRI", slug: "foxo4-dri", categorySlug: "longevity", typicalMcg: 250, frequency: "1x daily", evidence: "preclinical" },
  { name: "Livagen", slug: "livagen", categorySlug: "longevity", typicalMcg: 1000, frequency: "1x daily", evidence: "limited" },
  { name: "Ovagen", slug: "ovagen", categorySlug: "longevity", typicalMcg: 1000, frequency: "1x daily", evidence: "limited" },
  { name: "Pinealon", slug: "pinealon", categorySlug: "longevity", typicalMcg: 1000, frequency: "1x daily", evidence: "preclinical" },
  { name: "Prostamax", slug: "prostamax", categorySlug: "longevity", typicalMcg: 1000, frequency: "1x daily", evidence: "limited" },
  { name: "Testagen", slug: "testagen", categorySlug: "longevity", typicalMcg: 1000, frequency: "1x daily", evidence: "limited" },
  { name: "Vesugen", slug: "vesugen", categorySlug: "longevity", typicalMcg: 1000, frequency: "1x daily", evidence: "limited" },
  { name: "Vilon", slug: "vilon", categorySlug: "longevity", typicalMcg: 1000, frequency: "1x daily", evidence: "limited" },

  // Mitochondrial
  { name: "Glutathione", slug: "glutathione", categorySlug: "mitochondrial", typicalMcg: 50000, frequency: "2x weekly", evidence: "clinical" },
  { name: "Humanin", slug: "humanin", categorySlug: "mitochondrial", typicalMcg: 500, frequency: "1x daily", evidence: "preclinical" },
  { name: "MOTS-c", slug: "mots-c", categorySlug: "mitochondrial", typicalMcg: 5000, frequency: "1x weekly", evidence: "preclinical" },
  { name: "NAD+", slug: "nad-plus", categorySlug: "mitochondrial", typicalMcg: 50000, frequency: "1x daily", evidence: "preclinical" },
  { name: "SS-31", slug: "ss-31", categorySlug: "mitochondrial", typicalMcg: 1000, frequency: "5x weekly", evidence: "clinical" },

  // Cognitive & Neuro
  { name: "ARA-290", slug: "ara-290", categorySlug: "cognitive", typicalMcg: 1000, frequency: "1x daily", evidence: "clinical" },
  { name: "Cerebrolysin", slug: "cerebrolysin", categorySlug: "cognitive", typicalMcg: 20000, frequency: "1x daily", evidence: "clinical" },
  { name: "DSIP", slug: "dsip", categorySlug: "cognitive", typicalMcg: 100, frequency: "1x daily", evidence: "preclinical" },
  { name: "PE-22-28", slug: "pe-22-28", categorySlug: "cognitive", typicalMcg: 250, frequency: "1x daily", evidence: "preclinical" },
  { name: "Selank", slug: "selank", categorySlug: "cognitive", typicalMcg: 250, frequency: "1x daily", evidence: "preclinical" },
  { name: "Semax", slug: "semax", categorySlug: "cognitive", typicalMcg: 200, frequency: "1x daily", evidence: "preclinical" },

  // Immune & Anti-microbial
  { name: "LL-37", slug: "ll-37", categorySlug: "immune", typicalMcg: 100, frequency: "1x daily", evidence: "preclinical" },
  { name: "PNC-27", slug: "pnc-27", categorySlug: "immune", typicalMcg: 100, frequency: "1x daily", evidence: "preclinical" },
  { name: "Thymosin Alpha-1", slug: "thymosin-alpha-1", categorySlug: "immune", typicalMcg: 800, frequency: "2x weekly", evidence: "clinical" },
  { name: "VIP", slug: "vip", categorySlug: "immune", typicalMcg: 100, frequency: "5x weekly", evidence: "preclinical" },

  // Cosmetic & Dermal
  { name: "AHK-Cu", slug: "ahk-cu", categorySlug: "cosmetic", typicalMcg: 1000, frequency: "1x daily", evidence: "limited" },
  { name: "GHK-Cu", slug: "ghk-cu", categorySlug: "cosmetic", typicalMcg: 1000, frequency: "1x daily", evidence: "preclinical" },
  { name: "Melanotan II", slug: "melanotan-ii", categorySlug: "cosmetic", typicalMcg: 250, frequency: "1x daily", evidence: "clinical" },
  { name: "Melanotan-1", slug: "melanotan-1", categorySlug: "cosmetic", typicalMcg: 500, frequency: "1x daily", evidence: "clinical" },
  { name: "SNAP-8", slug: "snap-8", categorySlug: "cosmetic", typicalMcg: 2000, frequency: "2x daily", evidence: "limited" },

  // Endocrine & Sexual Health
  { name: "Gonadorelin", slug: "gonadorelin", categorySlug: "endocrine", typicalMcg: 100, frequency: "2x weekly", evidence: "clinical" },
  { name: "Kisspeptin-10", slug: "kisspeptin-10", categorySlug: "endocrine", typicalMcg: 100, frequency: "1x daily", evidence: "clinical" },
  { name: "Oxytocin", slug: "oxytocin", categorySlug: "endocrine", typicalMcg: 100, frequency: "1x daily", evidence: "limited" },
  { name: "PT-141", slug: "pt-141", categorySlug: "endocrine", typicalMcg: 1000, frequency: "1x daily", evidence: "clinical" },
  { name: "Teriparatide", slug: "teriparatide", categorySlug: "endocrine", typicalMcg: 20, frequency: "1x daily", evidence: "clinical" },

  // Multi-Compound Blends
  { name: "BPC-157 / KPV Blend", slug: "bpc-157-kpv-blend", categorySlug: "blends", typicalMcg: 500, frequency: "1x daily", evidence: "limited" },
  { name: "CJC-1295 / Ipamorelin Blend", slug: "cjc-1295-ipamorelin-blend", categorySlug: "blends", typicalMcg: 300, frequency: "2-3x daily", evidence: "preclinical" },
  { name: "GLOW Blend", slug: "glow-blend", categorySlug: "blends", typicalMcg: 1500, frequency: "1x daily", evidence: "limited" },
  { name: "KLOW Blend", slug: "klow-blend", categorySlug: "blends", typicalMcg: 1500, frequency: "1x daily", evidence: "limited" },
  { name: "Mito Blend", slug: "mito-blend", categorySlug: "blends", typicalMcg: 50000, frequency: "2x weekly", evidence: "limited" },
  { name: "Retatrutide / Cagrilintide Blend", slug: "retatrutide-cagrilintide-blend", categorySlug: "blends", typicalMcg: 6000, frequency: "1x weekly", evidence: "limited" },
  { name: "Semax / Selank Blend", slug: "semax-selank-blend", categorySlug: "blends", typicalMcg: 500, frequency: "2x daily", evidence: "limited" },
  { name: "TB-500 / BPC-157 / KPV Blend", slug: "tb-500-bpc-157-kpv-blend", categorySlug: "blends", typicalMcg: 2000, frequency: "2x weekly", evidence: "limited" },
  { name: "Tesamorelin / Ipamorelin Blend", slug: "tesamorelin-ipamorelin-blend", categorySlug: "blends", typicalMcg: 1000, frequency: "1x daily", evidence: "limited" },
  { name: "Wolverine Blend", slug: "wolverine-blend", categorySlug: "blends", typicalMcg: 2000, frequency: "2x weekly", evidence: "limited" },
];

export const totalPeptides = peptides.length;

export const evidenceTierMeta: Record<EvidenceTier, { label: string; meaning: string }> = {
  clinical: { label: "Clinical", meaning: "Dosing drawn from published human trials" },
  preclinical: { label: "Preclinical", meaning: "Preclinical research only" },
  limited: { label: "Limited", meaning: "Sparse data or community-reported" },
};
