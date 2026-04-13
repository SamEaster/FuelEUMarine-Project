/**
 * Use-case: BankSurplus
 *
 * Banks a positive compliance balance (surplus) for future use.
 * Only allows banking when the compliance balance is strictly positive.
 *
 * Pure function — no DB, no Express, no side effects.
 */
import type { BankEntry } from '../domain/BankEntry.js';
import { NegativeComplianceBalanceError } from '../domain/errors.js';
import { ValidationError } from '../../shared/errors.js';

export interface BankSurplusInput {
  /** Ship identifier */
  readonly shipId: string;
  /** Year of the compliance period */
  readonly year: number;
  /** Compliance balance to bank (must be > 0) */
  readonly complianceBalance: number;
}

export type BankSurplusResult = Omit<BankEntry, 'id'>;

/**
 * Creates a bank entry from a surplus compliance balance.
 *
 * @throws NegativeComplianceBalanceError if complianceBalance ≤ 0
 * @throws ValidationError if shipId is empty or year is invalid
 */
export function bankSurplus(input: BankSurplusInput): BankSurplusResult {
  const { shipId, year, complianceBalance } = input;

  if (!shipId || shipId.trim().length === 0) {
    throw new ValidationError('shipId must be a non-empty string');
  }
  if (year <= 0 || !Number.isInteger(year)) {
    throw new ValidationError('year must be a positive integer');
  }
  if (complianceBalance <= 0) {
    throw new NegativeComplianceBalanceError(
      `Cannot bank a non-positive compliance balance: ${complianceBalance} gCO2eq. ` +
        `Only surpluses (CB > 0) can be banked.`,
    );
  }

  return {
    shipId,
    year,
    amountGco2eq: complianceBalance,
  };
}
