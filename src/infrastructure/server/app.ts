import express, { Application } from 'express';
import cors from 'cors';
import { createRouteRouter, createHealthRouter } from '../../adapters/inbound/http/index.js';
import { PrismaRouteRepository } from '../../adapters/outbound/postgres/index.js';
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

  // Mount routes
  app.use('/api/health', createHealthRouter());
  app.use('/api/routes', createRouteRouter(routeRepository));

  return app;
}
