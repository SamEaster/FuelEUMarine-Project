import { Pool } from '../domain/Pool';
import { PoolMember } from '../domain/PoolMember';

/**
 * Port: PoolRepository
 * Defines the contract for pool and pool member data access.
 */
export interface PoolRepository {
  findAll(): Promise<Pool[]>;
  findById(id: string): Promise<Pool | null>;
  findByYear(year: number): Promise<Pool[]>;
  create(pool: Omit<Pool, 'id' | 'createdAt'>): Promise<Pool>;
  addMember(member: PoolMember): Promise<PoolMember>;
  findMembersByPoolId(poolId: string): Promise<PoolMember[]>;
}
