import { Router, RequestHandler } from 'express';
import { ShipComplianceRepository } from '../../../core/ports/ShipComplianceRepository.js';
import { BankEntryRepository } from '../../../core/ports/BankEntryRepository.js';
import { PoolRepository } from '../../../core/ports/PoolRepository.js';
import { RouteRepository } from '../../../core/ports/RouteRepository.js';
import { computeComplianceBalance } from '../../../core/application/ComputeComplianceBalance.js';

export function createComplianceRouter(
  shipComplianceRepo: ShipComplianceRepository,
  poolRepo: PoolRepository,
  bankRepo: BankEntryRepository,
  routeRepo: RouteRepository,
): Router {
  const router = Router();

  /**
   * GET /compliance/cb?shipId=&year=
   *
   * Part 1 fix: compute CB dynamically from route data, store/update snapshot,
   * then return the computed value. Never just fetches stale DB value.
   */
  const getCb: RequestHandler = async (req, res) => {
    try {
      const shipId = req.query.shipId as string;
      const year = parseInt(req.query.year as string, 10);

      if (!shipId || isNaN(year)) {
        res.status(400).json({ success: false, error: 'shipId and valid year are required' });
        return;
      }

      // Step 1: Try to find a route whose routeId matches the shipId
      const routesByYear = await routeRepo.findByYear(year);
      const matchedRoute = routesByYear.find(r => r.routeId === shipId);

      let cb: number;

      if (matchedRoute) {
        // Step 2a: compute CB from matched route
        const result = computeComplianceBalance({
          ghgIntensity: matchedRoute.ghgIntensity,
          fuelConsumption: matchedRoute.fuelConsumption,
        });
        cb = result.complianceBalance;
        await shipComplianceRepo.upsert(shipId, year, cb);
      } else {
        // Step 2b: check for existing snapshot
        const existing = await shipComplianceRepo.findByShipIdAndYear(shipId, year);

        if (existing) {
          cb = existing.cbGco2eq;
        } else {
          // Step 2c: no route, no snapshot — compute from year average energy
          // Use average fuelConsumption of all routes in that year as proxy
          if (routesByYear.length === 0) {
            res.status(404).json({ success: false, error: 'No route data found for this year to compute CB' });
            return;
          }
          const avgFuelConsumption = routesByYear.reduce((s, r) => s + r.fuelConsumption, 0) / routesByYear.length;
          const avgGhgIntensity = routesByYear.reduce((s, r) => s + r.ghgIntensity, 0) / routesByYear.length;
          const result = computeComplianceBalance({
            ghgIntensity: avgGhgIntensity,
            fuelConsumption: avgFuelConsumption,
          });
          cb = result.complianceBalance;
          // Store snapshot for future lookups
          await shipComplianceRepo.upsert(shipId, year, cb);
        }
      }

      res.json({ success: true, data: { shipId, year, cb } });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to compute compliance balance' });
    }
  };

  /**
   * GET /compliance/adjusted-cb?shipId=&year=
   *
   * Part 4 fix: adjustedCB = baseCB + banked - applied + poolDelta
   * All three factors are now included.
   */
  const getAdjustedCb: RequestHandler = async (req, res) => {
    try {
      const shipId = req.query.shipId as string;
      const year = parseInt(req.query.year as string, 10);

      if (!shipId || isNaN(year)) {
        res.status(400).json({ success: false, error: 'shipId and valid year are required' });
        return;
      }

      // Step 1: base CB from snapshot
      const existing = await shipComplianceRepo.findByShipIdAndYear(shipId, year);
      if (!existing) {
        res.status(404).json({ success: false, error: 'Ship compliance not found for given year' });
        return;
      }
      const baseCB = existing.cbGco2eq;

      // Step 2: compute banking net effect for this ship/year
      // positive entries = banked, negative entries = applied
      const bankEntries = await bankRepo.findByShipIdAndYear(shipId, year);
      const banked = bankEntries.filter(e => e.amountGco2eq > 0).reduce((s, e) => s + e.amountGco2eq, 0);
      const applied = bankEntries.filter(e => e.amountGco2eq < 0).reduce((s, e) => s + e.amountGco2eq, 0); // negative

      // Step 3: compute pool delta (cb_after - cb_before from pool_members)
      let poolDelta = 0;
      const pools = await poolRepo.findByYear(year);
      for (const pool of pools) {
        const members = await poolRepo.findMembersByPoolId(pool.id);
        const member = members.find(m => m.shipId === shipId);
        if (member) {
          poolDelta = member.cbAfter - member.cbBefore;
          break; // ship can only be in one pool per year
        }
      }

      // Step 4: final adjusted CB (applied is already negative, so we add it)
      const adjustedCB = baseCB + banked + applied + poolDelta;

      res.json({
        success: true,
        data: {
          shipId,
          year,
          cb_before: baseCB,
          banked,
          applied: Math.abs(applied), // return as positive magnitude for clarity
          poolDelta,
          cb_after: adjustedCB,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch adjusted compliance balance' });
    }
  };

  /**
   * GET /compliance/adjusted-cb-all?year=
   * Returns all ships for a given year — used by the Pooling page.
   * Updated to use the correct adjustedCB formula.
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

      // Build pool membership lookup once
      const pools = await poolRepo.findByYear(year);
      const poolDeltaMap = new Map<string, number>(); // shipId -> poolDelta
      for (const pool of pools) {
        const members = await poolRepo.findMembersByPoolId(pool.id);
        for (const member of members) {
          poolDeltaMap.set(member.shipId, member.cbAfter - member.cbBefore);
        }
      }

      // Build bank net lookup once
      const allBankEntries = await bankRepo.findByYear(year);
      const bankNetMap = new Map<string, number>(); // shipId -> net banking
      for (const entry of allBankEntries) {
        bankNetMap.set(entry.shipId, (bankNetMap.get(entry.shipId) ?? 0) + entry.amountGco2eq);
      }

      const result = compliances.map(c => {
        const poolDelta = poolDeltaMap.get(c.shipId) ?? 0;
        const bankNet = bankNetMap.get(c.shipId) ?? 0;
        return {
          shipId: c.shipId,
          cbBefore: c.cbGco2eq,
          adjustedCb: c.cbGco2eq + bankNet + poolDelta,
          inPool: poolDeltaMap.has(c.shipId),
        };
      });

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
