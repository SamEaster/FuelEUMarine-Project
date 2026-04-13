/**
 * Domain-specific error classes for FuelEU compliance business rules.
 * These extend the shared error infrastructure with domain semantics.
 */
import { ValidationError } from '../../shared/errors.js';

export class InsufficientSurplusError extends ValidationError {
  constructor(shipId: string, available: number, requested: number) {
    super(
      `Ship '${shipId}' has insufficient surplus to bank: ` +
        `available=${available} gCO2eq, requested=${requested} gCO2eq`,
    );
    this.name = 'InsufficientSurplusError';
    Object.setPrototypeOf(this, InsufficientSurplusError.prototype);
  }
}

export class NegativeComplianceBalanceError extends ValidationError {
  constructor(message: string) {
    super(message);
    this.name = 'NegativeComplianceBalanceError';
    Object.setPrototypeOf(this, NegativeComplianceBalanceError.prototype);
  }
}

export class InsufficientBankedAmountError extends ValidationError {
  constructor(shipId: string, available: number, requested: number) {
    super(
      `Ship '${shipId}' cannot apply banked amount: ` +
        `available=${available} gCO2eq, requested=${requested} gCO2eq`,
    );
    this.name = 'InsufficientBankedAmountError';
    Object.setPrototypeOf(this, InsufficientBankedAmountError.prototype);
  }
}

export class PoolValidationError extends ValidationError {
  constructor(message: string) {
    super(message);
    this.name = 'PoolValidationError';
    Object.setPrototypeOf(this, PoolValidationError.prototype);
  }
}
