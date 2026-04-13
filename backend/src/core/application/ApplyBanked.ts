/**
 * Use-case: ApplyBanked
 *
 * Applies a previously banked amount to offset a compliance deficit.
 * Cannot exceed the total available banked amount.
 *
 * Pure function — no DB, no Express, no side effects.
 */
import { InsufficientBankedAmountError } from '../domain/errors.js';
import { ValidationError } from '../../shared/errors.js';

export interface ApplyBankedInput {
  /** Ship identifier */
  readonly shipId: string;
  /** Total available banked amount in gCO2eq */
  readonly availableBanked: number;
  /** Amount to apply from the bank in gCO2eq */
  readonly amountToApply: number;
  /** Current compliance balance (typically negative / deficit) */
  readonly currentComplianceBalance: number;
}

export interface ApplyBankedResult {
  /** Ship identifier */
  readonly shipId: string;
  /** The amount actually applied from the bank */
  readonly appliedAmount: number;
  /** Remaining banked amount after application */
  readonly remainingBanked: number;
  /** Adjusted compliance balance after applying the banked amount */
  readonly adjustedComplianceBalance: number;
}

/**
 * Applies a banked amount to a ship's compliance balance.
 *
 * @throws InsufficientBankedAmountError if amountToApply > availableBanked
 * @throws ValidationError if inputs are invalid
 */
export function applyBanked(input: ApplyBankedInput): ApplyBankedResult {
  const { shipId, availableBanked, amountToApply, currentComplianceBalance } =
    input;

  if (!shipId || shipId.trim().length === 0) {
    throw new ValidationError('shipId must be a non-empty string');
  }
  if (amountToApply <= 0) {
    throw new ValidationError('amountToApply must be a positive number');
  }
  if (availableBanked < 0) {
    throw new ValidationError('availableBanked cannot be negative');
  }

  if (amountToApply > availableBanked) {
    throw new InsufficientBankedAmountError(
      shipId,
      availableBanked,
      amountToApply,
    );
  }

  return {
    shipId,
    appliedAmount: amountToApply,
    remainingBanked: availableBanked - amountToApply,
    adjustedComplianceBalance: currentComplianceBalance + amountToApply,
  };
}
