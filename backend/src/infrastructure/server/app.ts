import express, { Application } from 'express';
import cors from 'cors';
import { 
  createRouteRouter, 
  createHealthRouter, 
  createComplianceRouter, 
  createBankingRouter, 
  createPoolRouter 
} from '../../adapters/inbound/http/index.js';
import { 
  PrismaRouteRepository, 
  PrismaShipComplianceRepository, 
  PrismaBankEntryRepository, 
  PrismaPoolRepository 
} from '../../adapters/outbound/postgres/index.js';
import { prisma } from '../db/index.js';

/**
 * Creates and configures the Express application.
 * All Express-specific setup is isolated in this infrastructure layer.
 */
export function createApp(): Application {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Wire adapters: inject Prisma repositories into HTTP controllers
  const routeRepository = new PrismaRouteRepository(prisma);
  const shipComplianceRepository = new PrismaShipComplianceRepository(prisma);
  const bankEntryRepository = new PrismaBankEntryRepository(prisma);
  const poolRepository = new PrismaPoolRepository(prisma);

  // Mount routes
  app.use('/api/health', createHealthRouter());
  app.use('/api/routes', createRouteRouter(routeRepository));
  app.use('/api/compliance', createComplianceRouter(shipComplianceRepository, poolRepository, bankEntryRepository, routeRepository));
  app.use('/api/banking', createBankingRouter(bankEntryRepository, shipComplianceRepository));
  app.use('/api/pools', createPoolRouter(poolRepository, shipComplianceRepository));

  return app;
}
