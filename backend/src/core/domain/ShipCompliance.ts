/**
 * ShipCompliance entity – tracks a ship's compliance balance for a given year.
 */
export interface ShipCompliance {
  readonly id: string;
  readonly shipId: string;
  readonly year: number;
  readonly ghgIntensity: number;
  readonly fuelConsumption: number;
  readonly cbGco2eq: number;
}
