export type PeptideCategory = {
  slug: string;
  name: string;
  members: string;
};

export const peptideCategories: PeptideCategory[] = [
  { slug: "tissue-repair", name: "Tissue Repair & Recovery", members: "BPC-157, TB-500, KPV" },
  { slug: "metabolic", name: "Metabolic / Incretin", members: "Semaglutide, Tirzepatide, Retatrutide, Cagrilintide, +6 more" },
  { slug: "gh-secretagogue", name: "GH Secretagogue", members: "Ipamorelin, CJC-1295 (no DAC), CJC-1295 DAC, Sermorelin, +4 more" },
  { slug: "growth-factor", name: "Growth Factor", members: "IGF-1 LR3, IGF-1 DES, MGF, PEG-MGF" },
  { slug: "longevity", name: "Longevity & Bioregulator", members: "Epitalon, Pinealon, Vilon, Livagen, +8 more" },
  { slug: "mitochondrial", name: "Mitochondrial", members: "NAD+, MOTS-c, SS-31, Glutathione, Humanin" },
  { slug: "cognitive", name: "Cognitive & Neuro", members: "Semax, Selank, Cerebrolysin, DSIP, +2 more" },
  { slug: "immune", name: "Immune & Anti-microbial", members: "LL-37, Thymosin Alpha-1, VIP, PNC-27" },
  { slug: "cosmetic", name: "Cosmetic & Dermal", members: "GHK-Cu, Melanotan II, SNAP-8, AHK-Cu, Melanotan-1" },
  { slug: "endocrine", name: "Endocrine & Sexual Health", members: "PT-141, Kisspeptin-10, Gonadorelin, Oxytocin, Teriparatide" },
  { slug: "blends", name: "Multi-Compound Blends", members: "GLOW Blend, KLOW Blend, Wolverine Blend, +7 more" },
];