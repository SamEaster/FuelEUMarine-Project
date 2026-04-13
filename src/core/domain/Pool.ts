/**
 * Pool entity – represents a compliance pool for a given year.
 */
export interface Pool {
  readonly id: string;
  readonly year: number;
  readonly createdAt: Date;
}
