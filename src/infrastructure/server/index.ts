import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app.js';
import { prisma } from '../db/index.js';

const PORT = process.env.PORT ?? 3000;

async function startServer(): Promise<void> {
  try {
    // Verify database connection
    await prisma.$connect();
    console.info('✅ Database connected');

    const app = createApp();

    app.listen(PORT, () => {
      console.info(`🚀 Server running on http://localhost:${PORT}`);
      console.info(`📋 Health check: http://localhost:${PORT}/api/health`);
      console.info(`🗺️  Routes API:   http://localhost:${PORT}/api/routes`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.info('\n🛑 Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.info('\n🛑 Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

void startServer();
