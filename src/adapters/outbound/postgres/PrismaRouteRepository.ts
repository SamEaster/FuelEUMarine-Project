import { PrismaClient } from '../../../generated/prisma/client.js';
import { Route } from '../../../core/domain/Route.js';
import { RouteRepository } from '../../../core/ports/RouteRepository.js';

/**
 * Prisma implementation of the RouteRepository port.
 */
export class PrismaRouteRepository implements RouteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<Route[]> {
    return this.prisma.route.findMany();
  }

  async findById(id: string): Promise<Route | null> {
    return this.prisma.route.findUnique({ where: { id } });
  }

  async findByRouteId(routeId: string): Promise<Route[]> {
    return this.prisma.route.findMany({ where: { routeId } });
  }

  async findByYear(year: number): Promise<Route[]> {
    return this.prisma.route.findMany({ where: { year } });
  }

  async create(route: Omit<Route, 'id'>): Promise<Route> {
    return this.prisma.route.create({ data: route });
  }
}
