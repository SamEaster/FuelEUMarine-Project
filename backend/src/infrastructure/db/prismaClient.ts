import 'dotenv/config';
import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Singleton PrismaClient instance using PrismaPg driver adapter.
 * Keeps database connection management in the infrastructure layer.
 *
 * NOTE: `dotenv/config` is imported here (not just in server entry point)
 * because ES module imports are hoisted — this module is evaluated before
 * any imperative dotenv.config() call in index.ts would execute.
 */
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export default prisma;
