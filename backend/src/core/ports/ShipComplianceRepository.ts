import { ShipCompliance } from '../domain/ShipCompliance';

/**
 * Port: ShipComplianceRepository
 * Defines the contract for ship compliance data access.
 */
export interface ShipComplianceRepository {
  findAll(): Promise<ShipCompliance[]>;
  findById(id: string): Promise<ShipCompliance | null>;
  findByShipId(shipId: string): Promise<ShipCompliance[]>;
  findByShipIdAndYear(shipId: string, year: number): Promise<ShipCompliance | null>;
  findByYear(year: number): Promise<ShipCompliance[]>;
  create(compliance: Omit<ShipCompliance, 'id'>): Promise<ShipCompliance>;
  upsert(shipId: string, year: number, ghgIntensity: number, fuelConsumption: number, cbGco2eq: number): Promise<ShipCompliance>;
}
