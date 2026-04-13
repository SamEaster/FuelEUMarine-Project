import { describe, it, expect } from 'vitest';
import { applyBanked } from './ApplyBanked.js';
import { InsufficientBankedAmountError } from '../domain/errors.js';

describe('ApplyBanked', () => {
  it('applies banked amount to a deficit and returns adjusted balance', () => {
    const result = applyBanked({
      shipId: 'SHIP-001',
      availableBanked: 50000,
      amountToApply: 30000,
      currentComplianceBalance: -40000,
    });

    expect(result.shipId).toBe('SHIP-001');
    expect(result.appliedAmount).toBe(30000);
    expect(result.remainingBanked).toBe(20000);
    expect(result.adjustedComplianceBalance).toBe(-10000);
  });

  it('allows applying the full banked amount', () => {
    const result = applyBanked({
      shipId: 'SHIP-001',
      availableBanked: 50000,
      amountToApply: 50000,
      currentComplianceBalance: -50000,
    });

    expect(result.remainingBanked).toBe(0);
    expect(result.adjustedComplianceBalance).toBe(0);
  });

  it('throws InsufficientBankedAmountError when applying more than available', () => {
    expect(() =>
      applyBanked({
        shipId: 'SHIP-001',
        availableBanked: 10000,
        amountToApply: 20000,
        currentComplianceBalance: -30000,
      }),
    ).toThrow(InsufficientBankedAmountError);
  });

  it('throws ValidationError for zero amountToApply', () => {
    expect(() =>
      applyBanked({
        shipId: 'SHIP-001',
        availableBanked: 50000,
        amountToApply: 0,
        currentComplianceBalance: -10000,
      }),
    ).toThrow('amountToApply must be a positive number');
  });

  it('throws ValidationError for negative availableBanked', () => {
    expect(() =>
      applyBanked({
        shipId: 'SHIP-001',
        availableBanked: -100,
        amountToApply: 50,
        currentComplianceBalance: -10000,
      }),
    ).toThrow('availableBanked cannot be negative');
  });

  it('throws ValidationError for empty shipId', () => {
    expect(() =>
      applyBanked({
        shipId: '  ',
        availableBanked: 50000,
        amountToApply: 1000,
        currentComplianceBalance: -10000,
      }),
    ).toThrow('shipId must be a non-empty string');
  });
});
