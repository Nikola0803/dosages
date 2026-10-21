/**
 * Reconstitution maths for U-100 insulin syringes.
 * 1 unit = 0.01 mL, so `units = millilitres * 100`.
 */

export const UNITS_PER_ML = 100;

/** Recommended bacteriostatic water volume (mL) so a typical dose lands mid-barrel.
 *  Targets ~12.5 units on a U-100 syringe, bounded so concentration never exceeds
 *  10 mg/mL (practical max for subq injection) and never exceeds 10 mL total. */
export function suggestWaterMl(vialMg: number, doseMcg: number): number {
  if (!vialMg || !doseMcg) return 0;
  const raw = (125 * vialMg) / doseMcg; // solve for 12.5 units
  // Keep concentration ≤ 10 mg/mL — floor grows with vial size
  const floorMl = Math.max(0.5, vialMg / 10); // e.g. 10 mg vial → min 1 mL
  const bounded = Math.min(10, Math.max(floorMl, raw));
  return Math.round(bounded * 2) / 2; // nearest 0.5 mL
}

/** Concentration in mcg per mL. */
export function concentration(vialMg: number, waterMl: number): number {
  if (!vialMg || !waterMl) return 0;
  return (vialMg * 1000) / waterMl;
}

/** Units to draw for a given dose. */
export function unitsForDose(vialMg: number, waterMl: number, doseMcg: number): number {
  const conc = concentration(vialMg, waterMl);
  if (!conc) return 0;
  const volumeMl = doseMcg / conc;
  return volumeMl * UNITS_PER_ML;
}

/** Total doses available from the vial at a given dose. */
export function dosesPerVial(vialMg: number, doseMcg: number): number {
  if (!vialMg || !doseMcg) return 0;
  return Math.floor((vialMg * 1000) / doseMcg);
}

export function formatUnits(units: number): string {
  if (!units) return "—";
  const rounded = Math.round(units * 10) / 10;
  return `${rounded} units`;
}

export function formatDose(mcg: number): string {
  if (mcg >= 1000) {
    const mg = mcg / 1000;
    return `${Number.isInteger(mg) ? mg : mg.toFixed(1)} mg`;
  }
  return `${mcg} mcg`;
}

/** Three dose levels around the reported typical dose, for the results table. */
export function doseLevels(typicalMcg: number): { level: string; mcg: number }[] {
  return [
    { level: "Low", mcg: Math.round(typicalMcg * 0.5) },
    { level: "Typical", mcg: typicalMcg },
    { level: "High", mcg: Math.round(typicalMcg * 1.5) },
  ];
}