import { describe, it, expect } from 'vitest';
import { bankSurplus } from './BankSurplus.js';
import { NegativeComplianceBalanceError } from '../domain/errors.js';

describe('BankSurplus', () => {
  it('creates a bank entry for a positive compliance balance', () => {
    const result = bankSurplus({
      shipId: 'SHIP-001',
      year: 2025,
      complianceBalance: 50000,
    });

    expect(result.shipId).toBe('SHIP-001');
    expect(result.year).toBe(2025);
    expect(result.amountGco2eq).toBe(50000);
  });

  it('throws NegativeComplianceBalanceError for zero CB', () => {
    expect(() =>
      bankSurplus({
        shipId: 'SHIP-001',
        year: 2025,
        complianceBalance: 0,
      }),
    ).toThrow(NegativeComplianceBalanceError);
  });

  it('throws NegativeComplianceBalanceError for negative CB', () => {
    expect(() =>
      bankSurplus({
        shipId: 'SHIP-001',
        year: 2025,
        complianceBalance: -1000,
      }),
    ).toThrow(NegativeComplianceBalanceError);
  });

  it('throws ValidationError for empty shipId', () => {
    expect(() =>
      bankSurplus({
        shipId: '',
        year: 2025,
        complianceBalance: 5000,
      }),
    ).toThrow('shipId must be a non-empty string');
  });

  it('throws ValidationError for invalid year', () => {
    expect(() =>
      bankSurplus({
        shipId: 'SHIP-001',
        year: -1,
        complianceBalance: 5000,
      }),
    ).toThrow('year must be a positive integer');
  });

  it('throws ValidationError for non-integer year', () => {
    expect(() =>
      bankSurplus({
        shipId: 'SHIP-001',
        year: 2025.5,
        complianceBalance: 5000,
      }),
    ).toThrow('year must be a positive integer');
  });
});
