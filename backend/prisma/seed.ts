import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  console.info('🌱 Seeding database...');

  // Clear existing data
  await prisma.poolMember.deleteMany();
  await prisma.pool.deleteMany();
  await prisma.bankEntry.deleteMany();
  await prisma.shipCompliance.deleteMany();
  await prisma.route.deleteMany();

  // Seed 5 routes
  const routes = await prisma.route.createMany({
    data: [
      {
        routeId: 'RT-001',
        year: 2025,
        ghgIntensity: 91.16,
        fuelConsumption: 1250.5,
        distance: 3200.0,
        totalEmissions: 3945.0,
        isBaseline: true,
      },
      {
        routeId: 'RT-002',
        year: 2025,
        ghgIntensity: 85.43,
        fuelConsumption: 980.0,
        distance: 2750.0,
        totalEmissions: 3120.0,
        isBaseline: false,
      },
      {
        routeId: 'RT-003',
        year: 2025,
        ghgIntensity: 78.92,
        fuelConsumption: 1430.0,
        distance: 4100.0,
        totalEmissions: 4650.0,
        isBaseline: false,
      },
      {
        routeId: 'RT-004',
        year: 2026,
        ghgIntensity: 72.58,
        fuelConsumption: 870.0,
        distance: 2100.0,
        totalEmissions: 2580.0,
        isBaseline: true,
      },
      {
        routeId: 'RT-005',
        year: 2026,
        ghgIntensity: 68.21,
        fuelConsumption: 1100.0,
        distance: 3600.0,
        totalEmissions: 3210.0,
        isBaseline: false,
      },
    ],
  });

  console.info(`✅ Seeded ${routes.count} routes`);
  console.info('🌱 Seeding complete!');
}

main()
  .catch((e: Error) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
