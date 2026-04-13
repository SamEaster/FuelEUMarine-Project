import { describe, it, expect } from 'vitest';
import { createPool } from './CreatePool.js';
import { PoolValidationError } from '../domain/errors.js';

describe('CreatePool', () => {
  it('redistributes surplus to cover deficits using greedy algorithm', () => {
    const result = createPool({
      poolId: 'POOL-001',
      ships: [
        { shipId: 'SURPLUS-A', complianceBalance: 100 },
        { shipId: 'DEFICIT-B', complianceBalance: -60 },
      ],
    });

    expect(result.poolId).toBe('POOL-001');
    expect(result.members).toHaveLength(2);

    const surplusA = result.members.find((m) => m.shipId === 'SURPLUS-A');
    const deficitB = result.members.find((m) => m.shipId === 'DEFICIT-B');

    expect(surplusA).toBeDefined();
    expect(deficitB).toBeDefined();

    // Surplus-A donated 60 to Deficit-B
    expect(surplusA!.cbBefore).toBe(100);
    expect(surplusA!.cbAfter).toBe(40);

    // Deficit-B fully covered
    expect(deficitB!.cbBefore).toBe(-60);
    expect(deficitB!.cbAfter).toBe(0);

    // Total balance is preserved
    expect(result.totalBalance).toBeCloseTo(40, 10);
  });

  it('handles multiple surplus and deficit ships', () => {
    const result = createPool({
      poolId: 'POOL-002',
      ships: [
        { shipId: 'S1', complianceBalance: 200 },
        { shipId: 'S2', complianceBalance: 150 },
        { shipId: 'D1', complianceBalance: -100 },
        { shipId: 'D2', complianceBalance: -80 },
        { shipId: 'D3', complianceBalance: -50 },
      ],
    });

    expect(result.members).toHaveLength(5);

    // All deficits should be covered (total surplus: 350, total deficit: -230)
    for (const member of result.members) {
      if (member.cbBefore < 0) {
        // Deficits should not worsen
        expect(member.cbAfter).toBeGreaterThanOrEqual(member.cbBefore);
      }
      if (member.cbBefore > 0) {
        // Surpluses should not go negative
        expect(member.cbAfter).toBeGreaterThanOrEqual(0);
      }
    }

    // Total is preserved
    expect(result.totalBalance).toBeCloseTo(120, 10);
  });

  it('handles neutral ships (CB = 0)', () => {
    const result = createPool({
      poolId: 'POOL-003',
      ships: [
        { shipId: 'S1', complianceBalance: 100 },
        { shipId: 'N1', complianceBalance: 0 },
        { shipId: 'D1', complianceBalance: -50 },
      ],
    });

    const neutral = result.members.find((m) => m.shipId === 'N1');
    expect(neutral!.cbBefore).toBe(0);
    expect(neutral!.cbAfter).toBe(0);
  });

  it('partially covers deficits when surplus is limited', () => {
    const result = createPool({
      poolId: 'POOL-004',
      ships: [
        { shipId: 'S1', complianceBalance: 30 },
        { shipId: 'D1', complianceBalance: -20 },
        { shipId: 'D2', complianceBalance: -5 },
      ],
    });

    // Total = 30 - 20 - 5 = 5 ≥ 0, valid pool
    expect(result.totalBalance).toBeCloseTo(5, 10);

    // Deficits should not worsen
    for (const m of result.members) {
      if (m.cbBefore < 0) {
        expect(m.cbAfter).toBeGreaterThanOrEqual(m.cbBefore);
      }
    }
  });

  it('throws PoolValidationError when total CB < 0', () => {
    expect(() =>
      createPool({
        poolId: 'POOL-FAIL',
        ships: [
          { shipId: 'S1', complianceBalance: 10 },
          { shipId: 'D1', complianceBalance: -50 },
        ],
      }),
    ).toThrow(PoolValidationError);
  });

  it('throws ValidationError for fewer than 2 ships', () => {
    expect(() =>
      createPool({
        poolId: 'POOL-SOLO',
        ships: [{ shipId: 'S1', complianceBalance: 100 }],
      }),
    ).toThrow('A pool requires at least 2 ships');
  });

  it('throws ValidationError for duplicate ship IDs', () => {
    expect(() =>
      createPool({
        poolId: 'POOL-DUP',
        ships: [
          { shipId: 'SAME', complianceBalance: 100 },
          { shipId: 'SAME', complianceBalance: -50 },
        ],
      }),
    ).toThrow('Duplicate shipId entries are not allowed');
  });

  it('throws ValidationError for empty poolId', () => {
    expect(() =>
      createPool({
        poolId: '',
        ships: [
          { shipId: 'S1', complianceBalance: 100 },
          { shipId: 'D1', complianceBalance: -50 },
        ],
      }),
    ).toThrow('poolId must be a non-empty string');
  });

  it('preserves total balance (conservation of CB)', () => {
    const ships = [
      { shipId: 'A', complianceBalance: 500 },
      { shipId: 'B', complianceBalance: -300 },
      { shipId: 'C', complianceBalance: 200 },
      { shipId: 'D', complianceBalance: -150 },
    ];
    const inputTotal = ships.reduce((s, sh) => s + sh.complianceBalance, 0);

    const result = createPool({ poolId: 'POOL-CONSERVE', ships });

    expect(result.totalBalance).toBeCloseTo(inputTotal, 10);
  });
});
