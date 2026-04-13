import { PrismaClient } from '../../../generated/prisma/client.js';
import { ShipCompliance } from '../../../core/domain/ShipCompliance.js';
import { ShipComplianceRepository } from '../../../core/ports/ShipComplianceRepository.js';

/**
 * Prisma implementation of the ShipComplianceRepository port.
 */
export class PrismaShipComplianceRepository implements ShipComplianceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<ShipCompliance[]> {
    return this.prisma.shipCompliance.findMany();
  }

  async findById(id: string): Promise<ShipCompliance | null> {
    return this.prisma.shipCompliance.findUnique({ where: { id } });
  }

  async findByShipId(shipId: string): Promise<ShipCompliance[]> {
    return this.prisma.shipCompliance.findMany({ where: { shipId } });
  }

  async findByYear(year: number): Promise<ShipCompliance[]> {
    return this.prisma.shipCompliance.findMany({ where: { year } });
  }

  async create(compliance: Omit<ShipCompliance, 'id'>): Promise<ShipCompliance> {
    return this.prisma.shipCompliance.create({ data: compliance });
  }
}
