import { BankEntry } from '../domain/BankEntry';

/**
 * Port: BankEntryRepository
 * Defines the contract for bank entry data access.
 */
export interface BankEntryRepository {
  findAll(): Promise<BankEntry[]>;
  findById(id: string): Promise<BankEntry | null>;
  findByShipId(shipId: string): Promise<BankEntry[]>;
  findByShipIdAndYear(shipId: string, year: number): Promise<BankEntry[]>;
  findByYear(year: number): Promise<BankEntry[]>;
  create(entry: Omit<BankEntry, 'id'>): Promise<BankEntry>;
}
