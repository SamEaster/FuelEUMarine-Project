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

  async findByShipIdAndYear(shipId: string, year: number): Promise<ShipCompliance | null> {
    return this.prisma.shipCompliance.findUnique({
      where: { shipId_year: { shipId, year } },
    });
  }

  async findByYear(year: number): Promise<ShipCompliance[]> {
    return this.prisma.shipCompliance.findMany({ where: { year } });
  }

  async create(compliance: Omit<ShipCompliance, 'id'>): Promise<ShipCompliance> {
    return this.prisma.shipCompliance.create({ data: compliance });
  }

  /**
   * Upsert: update if record exists for (shipId, year), create otherwise.
   * Safe because ship_compliance has a unique constraint on (ship_id, year).
   */
  async upsert(shipId: string, year: number, cbGco2eq: number): Promise<ShipCompliance> {
    return this.prisma.shipCompliance.upsert({
      where: { shipId_year: { shipId, year } },
      update: { cbGco2eq },
      create: { shipId, year, cbGco2eq },
    });
  }
}
