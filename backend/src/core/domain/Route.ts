/**
 * Route entity – represents a single voyage record with GHG data.
 */
export interface Route {
  readonly id: string;
  readonly routeId: string;
  readonly vesselType: string;
  readonly fuelType: string;
  readonly year: number;
  readonly ghgIntensity: number;
  readonly fuelConsumption: number;
  readonly distance: number;
  readonly totalEmissions: number;
  readonly isBaseline: boolean;
}
