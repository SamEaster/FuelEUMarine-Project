import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  console.info('🌱 Seeding database...');

  // Clear all data respecting FK order
  await prisma.poolMember.deleteMany();
  await prisma.pool.deleteMany();
  await prisma.bankEntry.deleteMany();
  await prisma.shipCompliance.deleteMany();
  await prisma.route.deleteMany();

  // Seed the EXACT 5 routes from the assignment KPIs dataset
  const routes = await prisma.route.createMany({
    data: [
      {
        routeId: 'R001',
        vesselType: 'Container',
        fuelType: 'HFO',
        year: 2024,
        ghgIntensity: 91.0,
        fuelConsumption: 5000,
        distance: 12000,
        totalEmissions: 4500,
        isBaseline: true, // R001 set as baseline
      },
      {
        routeId: 'R002',
        vesselType: 'BulkCarrier',
        fuelType: 'LNG',
        year: 2024,
        ghgIntensity: 88.0,
        fuelConsumption: 4800,
        distance: 11500,
        totalEmissions: 4200,
        isBaseline: false,
      },
      {
        routeId: 'R003',
        vesselType: 'Tanker',
        fuelType: 'MGO',
        year: 2024,
        ghgIntensity: 93.5,
        fuelConsumption: 5100,
        distance: 12500,
        totalEmissions: 4700,
        isBaseline: false,
      },
      {
        routeId: 'R004',
        vesselType: 'RoRo',
        fuelType: 'HFO',
        year: 2025,
        ghgIntensity: 89.2,
        fuelConsumption: 4900,
        distance: 11800,
        totalEmissions: 4300,
        isBaseline: false,
      },
      {
        routeId: 'R005',
        vesselType: 'Container',
        fuelType: 'LNG',
        year: 2025,
        ghgIntensity: 90.5,
        fuelConsumption: 4950,
        distance: 11900,
        totalEmissions: 4400,
        isBaseline: false,
      },
    ],
  });

  console.info(`✅ Seeded ${routes.count} routes`);

  // Seed ship_compliance records — varied GHG intensities give a mix of surplus (+) and deficit (-)
  // CB = (89.3368 - ghgIntensity) * (fuelConsumption * 41000)
  
  const baseShips = [
    { shipId: 'SHIP-001', ghgIntensity: 91.0, fuelConsumption: 5000 }, // Deficit
    { shipId: 'SHIP-002', ghgIntensity: 88.0, fuelConsumption: 4800 }, // Surplus
    { shipId: 'SHIP-003', ghgIntensity: 93.5, fuelConsumption: 5100 }, // Deficit
    { shipId: 'SHIP-004', ghgIntensity: 86.5, fuelConsumption: 4600 }, // Surplus
    { shipId: 'SHIP-005', ghgIntensity: 87.2, fuelConsumption: 4750 }, // Surplus
    { shipId: 'SHIP-006', ghgIntensity: 89.2, fuelConsumption: 4900 }, // Surplus
    { shipId: 'SHIP-007', ghgIntensity: 90.5, fuelConsumption: 4950 }, // Deficit
    { shipId: 'SHIP-008', ghgIntensity: 85.0, fuelConsumption: 5200 }, // Strong Surplus
  ];

  // We want all ships available in both 2024 and 2025
  const shipData = [];
  for (const year of [2024, 2025]) {
    for (const ship of baseShips) {
      shipData.push({ ...ship, year });
    }
  }

  for (const ship of shipData) {
    const energy = ship.fuelConsumption * 41000;
    const cb = (89.3368 - ship.ghgIntensity) * energy;
    await prisma.shipCompliance.upsert({
      where: { shipId_year: { shipId: ship.shipId, year: ship.year } },
      update: { cbGco2eq: cb },
      create: { shipId: ship.shipId, year: ship.year, cbGco2eq: cb },
    });
  }

  console.info(`✅ Seeded ${shipData.length} ship compliance records`);
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
