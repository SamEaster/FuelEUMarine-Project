import { describe, it, expect } from 'vitest';
import { compareRoutes } from './CompareRoutes.js';
import { FUELEU_GHG_TARGET } from '../domain/constants.js';

describe('CompareRoutes', () => {
  it('returns zero percentDiff when intensities are equal', () => {
    const result = compareRoutes({
      baselineGhgIntensity: 85,
      comparisonGhgIntensity: 85,
    });

    expect(result.percentDiff).toBeCloseTo(0, 10);
  });

  it('returns negative percentDiff when comparison is better (lower intensity)', () => {
    const result = compareRoutes({
      baselineGhgIntensity: 90,
      comparisonGhgIntensity: 81,
    });

    expect(result.percentDiff).toBeLessThan(0);
    expect(result.percentDiff).toBeCloseTo(-10, 2);
  });

  it('returns positive percentDiff when comparison is worse (higher intensity)', () => {
    const result = compareRoutes({
      baselineGhgIntensity: 80,
      comparisonGhgIntensity: 96,
    });

    expect(result.percentDiff).toBeGreaterThan(0);
    expect(result.percentDiff).toBeCloseTo(20, 2);
  });

  it('marks compliant when comparison intensity ≤ target', () => {
    const result = compareRoutes({
      baselineGhgIntensity: 90,
      comparisonGhgIntensity: FUELEU_GHG_TARGET,
    });

    expect(result.compliant).toBe(true);
  });

  it('marks non-compliant when comparison intensity > target', () => {
    const result = compareRoutes({
      baselineGhgIntensity: 80,
      comparisonGhgIntensity: 95,
    });

    expect(result.compliant).toBe(false);
  });

  it('includes the GHG target in results', () => {
    const result = compareRoutes({
      baselineGhgIntensity: 85,
      comparisonGhgIntensity: 80,
    });

    expect(result.ghgTarget).toBe(FUELEU_GHG_TARGET);
  });

  it('throws for zero baseline intensity', () => {
    expect(() =>
      compareRoutes({
        baselineGhgIntensity: 0,
        comparisonGhgIntensity: 80,
      }),
    ).toThrow('baselineGhgIntensity must be a positive number');
  });

  it('throws for negative comparison intensity', () => {
    expect(() =>
      compareRoutes({
        baselineGhgIntensity: 80,
        comparisonGhgIntensity: -5,
      }),
    ).toThrow('comparisonGhgIntensity must be a positive number');
  });
});
