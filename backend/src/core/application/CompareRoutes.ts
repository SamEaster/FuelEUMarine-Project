/**
 * Use-case: CompareRoutes
 *
 * Compares a comparison route's GHG intensity against a baseline route.
 *
 * Formula:
 *   percentDiff = ((comparison / baseline) − 1) × 100
 *   compliant   = ghgIntensity ≤ 89.3368
 *
 * Pure function — no DB, no Express, no side effects.
 */
import { FUELEU_GHG_TARGET } from '../domain/constants.js';
import { ValidationError } from '../../shared/errors.js';

export interface CompareRoutesInput {
  /** GHG intensity of the baseline route (gCO2eq/MJ) */
  readonly baselineGhgIntensity: number;
  /** GHG intensity of the comparison route (gCO2eq/MJ) */
  readonly comparisonGhgIntensity: number;
}

export interface CompareRoutesResult {
  /** Percentage difference: positive = worse, negative = better */
  readonly percentDiff: number;
  /** Whether the comparison route is compliant with the FuelEU target */
  readonly compliant: boolean;
  /** The baseline GHG intensity used */
  readonly baselineGhgIntensity: number;
  /** The comparison GHG intensity used */
  readonly comparisonGhgIntensity: number;
  /** The FuelEU GHG target used for compliance check */
  readonly ghgTarget: number;
}

/**
 * Compares two routes and evaluates compliance.
 *
 * @throws ValidationError if baseline intensity is zero or inputs are non-positive
 */
export function compareRoutes(input: CompareRoutesInput): CompareRoutesResult {
  const { baselineGhgIntensity, comparisonGhgIntensity } = input;

  if (baselineGhgIntensity <= 0) {
    throw new ValidationError(
      'baselineGhgIntensity must be a positive number',
    );
  }
  if (comparisonGhgIntensity <= 0) {
    throw new ValidationError(
      'comparisonGhgIntensity must be a positive number',
    );
  }

  const percentDiff =
    (comparisonGhgIntensity / baselineGhgIntensity - 1) * 100;
  const compliant = comparisonGhgIntensity <= FUELEU_GHG_TARGET;

  return {
    percentDiff,
    compliant,
    baselineGhgIntensity,
    comparisonGhgIntensity,
    ghgTarget: FUELEU_GHG_TARGET,
  };
}
