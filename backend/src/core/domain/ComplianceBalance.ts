/**
 * ComplianceBalance value object – the computed compliance balance
 * for a voyage based on FuelEU Maritime regulations.
 *
 * Pure domain concept: no DB, no framework dependencies.
 */
export interface ComplianceBalance {
  /** GHG intensity of the fuel used (gCO2eq/MJ) */
  readonly ghgIntensity: number;
  /** Fuel consumption in metric tonnes */
  readonly fuelConsumption: number;
  /** Energy content in MJ (fuelConsumption × 41,000 MJ/t) */
  readonly energy: number;
  /** Compliance balance in gCO2eq: (target − ghgIntensity) × energy */
  readonly complianceBalance: number;
  /** Whether the voyage is compliant (CB ≥ 0) */
  readonly isCompliant: boolean;
}
