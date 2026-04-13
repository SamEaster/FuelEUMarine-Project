/**
 * Use-case: CreatePool
 *
 * Creates a compliance pool from a set of ships using a greedy algorithm.
 *
 * Business rules:
 *   1. The sum of all CBs in the pool must be ≥ 0
 *   2. Deficit ships must not worsen (their CB can only improve or stay the same)
 *   3. Surplus ships must not go negative (they can donate surplus but keep CB ≥ 0)
 *
 * Greedy algorithm:
 *   - Sort surplus ships descending by CB
 *   - Sort deficit ships ascending by CB (most deficit first)
 *   - Iterate: each surplus ship donates the minimum of its surplus and the
 *     absolute value of the current deficit ship's remaining deficit
 *   - Continue until all deficits are covered or surplus is exhausted
 *
 * Pure function — no DB, no Express, no side effects.
 */
import type { PoolMember } from '../domain/PoolMember.js';
import { PoolValidationError } from '../domain/errors.js';
import { ValidationError } from '../../shared/errors.js';

export interface PoolShipInput {
  /** Ship identifier */
  readonly shipId: string;
  /** Current compliance balance in gCO2eq */
  readonly complianceBalance: number;
}

export interface CreatePoolInput {
  /** Pool identifier (generated externally, e.g., UUID) */
  readonly poolId: string;
  /** Ships to include in the pool */
  readonly ships: readonly PoolShipInput[];
}

export interface CreatePoolResult {
  /** Pool identifier */
  readonly poolId: string;
  /** Pool members with before/after balances */
  readonly members: readonly PoolMember[];
  /** Total pool balance (sum of all cbAfter values) */
  readonly totalBalance: number;
}

/**
 * Creates a compliance pool using a greedy surplus-redistribution algorithm.
 *
 * @throws PoolValidationError if pool-level constraints are violated
 * @throws ValidationError if inputs are invalid
 */
export function createPool(input: CreatePoolInput): CreatePoolResult {
  const { poolId, ships } = input;

  if (!poolId || poolId.trim().length === 0) {
    throw new ValidationError('poolId must be a non-empty string');
  }
  if (ships.length < 2) {
    throw new ValidationError('A pool requires at least 2 ships');
  }

  // Validate ship IDs are unique
  const shipIds = new Set(ships.map((s) => s.shipId));
  if (shipIds.size !== ships.length) {
    throw new ValidationError('Duplicate shipId entries are not allowed');
  }

  // Rule 1: Sum of all CBs must be ≥ 0
  const totalCb = ships.reduce((sum, s) => sum + s.complianceBalance, 0);
  if (totalCb < 0) {
    throw new PoolValidationError(
      `Pool total compliance balance is negative (${totalCb} gCO2eq). ` +
        `The pool cannot be formed — aggregate surplus is insufficient.`,
    );
  }

  // Separate surplus and deficit ships
  const surplusShips = ships
    .filter((s) => s.complianceBalance > 0)
    .map((s) => ({ ...s, remaining: s.complianceBalance }))
    .sort((a, b) => b.remaining - a.remaining); // Largest surplus first

  const deficitShips = ships
    .filter((s) => s.complianceBalance < 0)
    .map((s) => ({ ...s, remaining: s.complianceBalance }))
    .sort((a, b) => a.remaining - b.remaining); // Most deficit first

  const neutralShips = ships.filter((s) => s.complianceBalance === 0);

  // Greedy redistribution: surplus ships donate to deficit ships
  for (const deficit of deficitShips) {
    for (const surplus of surplusShips) {
      if (deficit.remaining >= 0) break; // Deficit covered
      if (surplus.remaining <= 0) continue; // Surplus exhausted

      // Transfer the minimum of available surplus and needed deficit
      const transfer = Math.min(surplus.remaining, Math.abs(deficit.remaining));
      surplus.remaining -= transfer;
      deficit.remaining += transfer;
    }
  }

  // Build pool members
  const members: PoolMember[] = [];

  for (const s of surplusShips) {
    // Rule 3: Surplus ships must not go negative
    if (s.remaining < 0) {
      throw new PoolValidationError(
        `Surplus ship '${s.shipId}' would go negative (${s.remaining} gCO2eq). ` +
          `This violates pool constraints.`,
      );
    }
    members.push({
      poolId,
      shipId: s.shipId,
      cbBefore: s.complianceBalance,
      cbAfter: s.remaining,
    });
  }

  for (const s of deficitShips) {
    // Rule 2: Deficit ships must not worsen
    if (s.remaining < s.complianceBalance) {
      throw new PoolValidationError(
        `Deficit ship '${s.shipId}' would worsen from ${s.complianceBalance} ` +
          `to ${s.remaining} gCO2eq. This violates pool constraints.`,
      );
    }
    members.push({
      poolId,
      shipId: s.shipId,
      cbBefore: s.complianceBalance,
      cbAfter: s.remaining,
    });
  }

  for (const s of neutralShips) {
    members.push({
      poolId,
      shipId: s.shipId,
      cbBefore: s.complianceBalance,
      cbAfter: s.complianceBalance,
    });
  }

  const totalBalance = members.reduce((sum, m) => sum + m.cbAfter, 0);

  return {
    poolId,
    members,
    totalBalance,
  };
}
