import { describe, it, expect } from 'vitest';
import { computeComplianceBalance } from './ComputeComplianceBalance.js';
import { FUELEU_GHG_TARGET, DEFAULT_LCV_MJ_PER_TONNE } from '../domain/constants.js';

describe('ComputeComplianceBalance', () => {
  it('computes a positive CB when ghgIntensity is below the target', () => {
    const result = computeComplianceBalance({
      ghgIntensity: 80,
      fuelConsumption: 1000,
    });

    const expectedEnergy = 1000 * DEFAULT_LCV_MJ_PER_TONNE;
    const expectedCb = (FUELEU_GHG_TARGET - 80) * expectedEnergy;

    expect(result.energy).toBe(expectedEnergy);
    expect(result.complianceBalance).toBeCloseTo(expectedCb, 2);
    expect(result.isCompliant).toBe(true);
  });

  it('computes a negative CB when ghgIntensity exceeds the target', () => {
    const result = computeComplianceBalance({
      ghgIntensity: 95,
      fuelConsumption: 500,
    });

    expect(result.complianceBalance).toBeLessThan(0);
    expect(result.isCompliant).toBe(false);
  });

  it('computes exactly zero CB when ghgIntensity equals the target', () => {
    const result = computeComplianceBalance({
      ghgIntensity: FUELEU_GHG_TARGET,
      fuelConsumption: 1000,
    });

    expect(result.complianceBalance).toBeCloseTo(0, 10);
    expect(result.isCompliant).toBe(true);
  });

  it('preserves input values in the output', () => {
    const result = computeComplianceBalance({
      ghgIntensity: 72.5,
      fuelConsumption: 1250,
    });

    expect(result.ghgIntensity).toBe(72.5);
    expect(result.fuelConsumption).toBe(1250);
  });

  it('throws ValidationError for zero ghgIntensity', () => {
    expect(() =>
      computeComplianceBalance({ ghgIntensity: 0, fuelConsumption: 100 }),
    ).toThrow('ghgIntensity must be a positive number');
  });

  it('throws ValidationError for negative fuelConsumption', () => {
    expect(() =>
      computeComplianceBalance({ ghgIntensity: 80, fuelConsumption: -10 }),
    ).toThrow('fuelConsumption must be a positive number');
  });
});
