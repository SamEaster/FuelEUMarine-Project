import { Route } from '../domain/Route';

/**
 * Port: RouteRepository
 * Defines the contract for route data access.
 * Implemented by outbound adapters (e.g., Postgres/Prisma).
 */
export interface RouteRepository {
  findAll(): Promise<Route[]>;
  findById(id: string): Promise<Route | null>;
  findByRouteId(routeId: string): Promise<Route[]>;
  findByYear(year: number): Promise<Route[]>;
  create(route: Omit<Route, 'id'>): Promise<Route>;
  setBaseline(id: string): Promise<Route>;
}
