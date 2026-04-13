/**
 * Use-case: ComputeComplianceBalance
 *
 * Calculates the FuelEU Maritime compliance balance for a voyage.
 *
 * Formula:
 *   energy = fuelConsumption × 41,000 MJ/t
 *   CB     = (89.3368 − ghgIntensity) × energy
 *
 * Pure function — no DB, no Express, no side effects.
 */
import type { ComplianceBalance } from '../domain/ComplianceBalance.js';
import {
  FUELEU_GHG_TARGET,
  DEFAULT_LCV_MJ_PER_TONNE,
} from '../domain/constants.js';
import { ValidationError } from '../../shared/errors.js';

export interface ComputeComplianceBalanceInput {
  /** GHG intensity of the fuel in gCO2eq/MJ */
  readonly ghgIntensity: number;
  /** Fuel consumption in metric tonnes */
  readonly fuelConsumption: number;
}

/**
 * Computes the compliance balance for a single voyage.
 *
 * @throws ValidationError if inputs are non-positive
 */
export function computeComplianceBalance(
  input: ComputeComplianceBalanceInput,
): ComplianceBalance {
  const { ghgIntensity, fuelConsumption } = input;

  if (ghgIntensity <= 0) {
    throw new ValidationError('ghgIntensity must be a positive number');
  }
  if (fuelConsumption <= 0) {
    throw new ValidationError('fuelConsumption must be a positive number');
  }

  const energy = fuelConsumption * DEFAULT_LCV_MJ_PER_TONNE;
  const complianceBalance = (FUELEU_GHG_TARGET - ghgIntensity) * energy;

  return {
    ghgIntensity,
    fuelConsumption,
    energy,
    complianceBalance,
    isCompliant: complianceBalance >= 0,
  };
}
