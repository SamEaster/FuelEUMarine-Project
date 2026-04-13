import { PrismaClient } from '../../../generated/prisma/client.js';
import { Pool } from '../../../core/domain/Pool.js';
import { PoolMember } from '../../../core/domain/PoolMember.js';
import { PoolRepository } from '../../../core/ports/PoolRepository.js';

/**
 * Prisma implementation of the PoolRepository port.
 */
export class PrismaPoolRepository implements PoolRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<Pool[]> {
    return this.prisma.pool.findMany();
  }

  async findById(id: string): Promise<Pool | null> {
    return this.prisma.pool.findUnique({ where: { id } });
  }

  async findByYear(year: number): Promise<Pool[]> {
    return this.prisma.pool.findMany({ where: { year } });
  }

  async create(pool: Omit<Pool, 'id' | 'createdAt'>): Promise<Pool> {
    return this.prisma.pool.create({ data: pool });
  }

  async addMember(member: PoolMember): Promise<PoolMember> {
    return this.prisma.poolMember.create({ data: member });
  }

  async findMembersByPoolId(poolId: string): Promise<PoolMember[]> {
    return this.prisma.poolMember.findMany({ where: { poolId } });
  }
}
