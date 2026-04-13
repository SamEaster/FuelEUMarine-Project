import { PrismaClient } from '../../../generated/prisma/client.js';
import { BankEntry } from '../../../core/domain/BankEntry.js';
import { BankEntryRepository } from '../../../core/ports/BankEntryRepository.js';

/**
 * Prisma implementation of the BankEntryRepository port.
 */
export class PrismaBankEntryRepository implements BankEntryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<BankEntry[]> {
    return this.prisma.bankEntry.findMany();
  }

  async findById(id: string): Promise<BankEntry | null> {
    return this.prisma.bankEntry.findUnique({ where: { id } });
  }

  async findByShipId(shipId: string): Promise<BankEntry[]> {
    return this.prisma.bankEntry.findMany({ where: { shipId } });
  }

  async findByYear(year: number): Promise<BankEntry[]> {
    return this.prisma.bankEntry.findMany({ where: { year } });
  }

  async create(entry: Omit<BankEntry, 'id'>): Promise<BankEntry> {
    return this.prisma.bankEntry.create({ data: entry });
  }
}
