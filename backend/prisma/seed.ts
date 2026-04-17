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


  // Seed ship_compliance records — exactly mapping to the 5 routes.
  // CB = (89.3368 - ghgIntensity) * (fuelConsumption * 41000)
  
  const baseShips = [
    { shipId: 'SHIP-R001', ghgIntensity: 91.0, fuelConsumption: 5000 },
    { shipId: 'SHIP-R002', ghgIntensity: 88.0, fuelConsumption: 4800 },
    { shipId: 'SHIP-R003', ghgIntensity: 93.5, fuelConsumption: 5100 },
    { shipId: 'SHIP-R004', ghgIntensity: 89.2, fuelConsumption: 4900 },
    { shipId: 'SHIP-R005', ghgIntensity: 90.5, fuelConsumption: 4950 },
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
      update: { 
        ghgIntensity: ship.ghgIntensity, 
        fuelConsumption: ship.fuelConsumption, 
        cbGco2eq: cb 
      },
      create: { 
        shipId: ship.shipId, 
        year: ship.year, 
        ghgIntensity: ship.ghgIntensity, 
        fuelConsumption: ship.fuelConsumption, 
        cbGco2eq: cb 
      },
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
