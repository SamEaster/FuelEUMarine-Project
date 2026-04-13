/**
 * BankEntry entity – represents a banked surplus or deficit for a ship.
 */
export interface BankEntry {
  readonly id: string;
  readonly shipId: string;
  readonly year: number;
  readonly amountGco2eq: number;
}
