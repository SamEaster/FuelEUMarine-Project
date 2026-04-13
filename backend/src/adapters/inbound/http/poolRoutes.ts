import { Router, RequestHandler } from 'express';
import { PoolRepository } from '../../../core/ports/PoolRepository.js';
import { ShipComplianceRepository } from '../../../core/ports/ShipComplianceRepository.js';
import { createPool, PoolShipInput } from '../../../core/application/index.js';
import { AppError } from '../../../shared/errors.js';

export function createPoolRouter(
  poolRepo: PoolRepository,
  shipComplianceRepo: ShipComplianceRepository
): Router {
  const router = Router();

  const createPoolEndpoint: RequestHandler = async (req, res) => {
    try {
      const { year, shipIds } = req.body;

      if (typeof year !== 'number' || !Array.isArray(shipIds) || shipIds.length < 2) {
        res.status(400).json({ success: false, error: 'Valid year and an array of at least 2 shipIds are required' });
        return;
      }

      // Gather CB for all requested ships
      const ships: PoolShipInput[] = [];
      for (const shipId of shipIds) {
        const compliances = await shipComplianceRepo.findByShipId(shipId);
        const comp = compliances.find(c => c.year === year);
        if (!comp) {
          res.status(404).json({ success: false, error: `Compliance record not found for ship '${shipId}' in year ${year}` });
          return;
        }
        ships.push({
          shipId,
          complianceBalance: comp.cbGco2eq
        });
      }

      // Run business logic (with dummy ID since DB generates final ID)
      const result = createPool({ poolId: 'temp_id', ships });

      // Save pool to DB if rules pass
      const pool = await poolRepo.create({ year });

      // Save members
      const savedMembers = await Promise.all(
        result.members.map(m => poolRepo.addMember({ ...m, poolId: pool.id }))
      );

      res.json({ success: true, data: { poolId: pool.id, members: savedMembers, totalBalance: result.totalBalance } });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, error: error.message, code: error.code });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to create pool' });
    }
  };

  router.post('/', createPoolEndpoint);

  return router;
}
