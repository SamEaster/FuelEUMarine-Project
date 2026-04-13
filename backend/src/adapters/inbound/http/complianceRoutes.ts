import { Router, RequestHandler } from 'express';
import { ShipComplianceRepository } from '../../../core/ports/ShipComplianceRepository.js';
import { PoolRepository } from '../../../core/ports/PoolRepository.js';

export function createComplianceRouter(
  shipComplianceRepo: ShipComplianceRepository,
  poolRepo: PoolRepository
): Router {
  const router = Router();

  const getCb: RequestHandler = async (req, res) => {
    try {
      const shipId = req.query.shipId as string;
      const year = parseInt(req.query.year as string, 10);

      if (!shipId || isNaN(year)) {
        res.status(400).json({ success: false, error: 'shipId and valid year are required' });
        return;
      }

      const compliances = await shipComplianceRepo.findByShipId(shipId);
      const compliance = compliances.find(c => c.year === year);

      if (!compliance) {
        res.status(404).json({ success: false, error: 'Ship compliance not found for given year' });
        return;
      }

      res.json({ success: true, data: { cb: compliance.cbGco2eq } });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch compliance balance' });
    }
  };

  const getAdjustedCb: RequestHandler = async (req, res) => {
    try {
      const shipId = req.query.shipId as string;
      const year = parseInt(req.query.year as string, 10);

      if (!shipId || isNaN(year)) {
        res.status(400).json({ success: false, error: 'shipId and valid year are required' });
        return;
      }

      const compliances = await shipComplianceRepo.findByShipId(shipId);
      const compliance = compliances.find(c => c.year === year);

      if (!compliance) {
        res.status(404).json({ success: false, error: 'Ship compliance not found for given year' });
        return;
      }

      let adjustedCb = compliance.cbGco2eq;

      const pools = await poolRepo.findByYear(year);
      for (const pool of pools) {
        const members = await poolRepo.findMembersByPoolId(pool.id);
        const member = members.find(m => m.shipId === shipId);
        if (member) {
          adjustedCb = member.cbAfter;
          break;
        }
      }

      res.json({ success: true, data: { adjustedCb } });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch adjusted compliance balance' });
    }
  };

  /**
   * GET /compliance/adjusted-cb-all?year=YYYY
   * Returns all ships for a given year with their CB and adjusted CB.
   * Powers the Pooling page ship selection table — no shipId required.
   */
  const getAllAdjustedCb: RequestHandler = async (req, res) => {
    try {
      const year = parseInt(req.query.year as string, 10);

      if (isNaN(year)) {
        res.status(400).json({ success: false, error: 'Valid year is required' });
        return;
      }

      const compliances = await shipComplianceRepo.findByYear(year);

      if (compliances.length === 0) {
        res.json({ success: true, data: [] });
        return;
      }

      // Build pool membership lookup once for efficiency
      const pools = await poolRepo.findByYear(year);
      const poolMemberMap = new Map<string, number>(); // shipId -> cbAfter

      for (const pool of pools) {
        const members = await poolRepo.findMembersByPoolId(pool.id);
        for (const member of members) {
          poolMemberMap.set(member.shipId, member.cbAfter);
        }
      }

      const result = compliances.map(c => ({
        shipId: c.shipId,
        cbBefore: c.cbGco2eq,
        adjustedCb: poolMemberMap.has(c.shipId) ? poolMemberMap.get(c.shipId)! : c.cbGco2eq,
        inPool: poolMemberMap.has(c.shipId),
      }));

      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch all adjusted compliance balances' });
    }
  };

  router.get('/cb', getCb);
  router.get('/adjusted-cb', getAdjustedCb);
  router.get('/adjusted-cb-all', getAllAdjustedCb);

  return router;
}
