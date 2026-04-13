/**
 * PoolMember entity – represents a ship's membership in a compliance pool.
 */
export interface PoolMember {
  readonly poolId: string;
  readonly shipId: string;
  readonly cbBefore: number;
  readonly cbAfter: number;
}
