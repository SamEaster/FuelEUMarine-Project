import { Router, RequestHandler } from 'express';
import { BankEntryRepository } from '../../../core/ports/BankEntryRepository.js';
import { ShipComplianceRepository } from '../../../core/ports/ShipComplianceRepository.js';
import { bankSurplus, applyBanked } from '../../../core/application/index.js';
import { AppError } from '../../../shared/errors.js';

export function createBankingRouter(
  bankRepo: BankEntryRepository,
  shipComplianceRepo: ShipComplianceRepository
): Router {
  const router = Router();

  const getRecords: RequestHandler = async (req, res) => {
    try {
      const shipId = req.query.shipId as string;
      if (shipId) {
        const records = await bankRepo.findByShipId(shipId);
        res.json({ success: true, data: records });
      } else {
        const records = await bankRepo.findAll();
        res.json({ success: true, data: records });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch banking records' });
    }
  };

  const bankAmount: RequestHandler = async (req, res) => {
    try {
      const { shipId, year, complianceBalance } = req.body;

      if (!shipId || typeof year !== 'number' || typeof complianceBalance !== 'number') {
        res.status(400).json({ success: false, error: 'Invalid input data' });
        return;
      }

      const result = bankSurplus({ shipId, year, complianceBalance });
      const created = await bankRepo.create(result);

      res.json({ success: true, data: created });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, error: error.message, code: error.code });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to bank surplus' });
    }
  };

  const applyAmount: RequestHandler = async (req, res) => {
    try {
      const { shipId, amountToApply, year } = req.body;

      if (!shipId || typeof amountToApply !== 'number' || typeof year !== 'number') {
        res.status(400).json({ success: false, error: 'Invalid input data' });
        return;
      }

      // Calculate total banked
      const bankEntries = await bankRepo.findByShipId(shipId);
      const totalBanked = bankEntries.reduce((sum, b) => sum + b.amountGco2eq, 0);

      // Get current CB for the year
      const compliances = await shipComplianceRepo.findByShipId(shipId);
      const compliance = compliances.find(c => c.year === year);
      
      const currentCb = compliance ? compliance.cbGco2eq : 0;

      const result = applyBanked({
        shipId,
        availableBanked: totalBanked,
        amountToApply,
        currentComplianceBalance: currentCb
      });

      // Insert a negative bank entry to record the 'apply' usage
      await bankRepo.create({
        shipId,
        year,
        amountGco2eq: -amountToApply
      });

      res.json({ success: true, data: result });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, error: error.message, code: error.code });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to apply banked amount' });
    }
  };

  router.get('/records', getRecords);
  router.post('/bank', bankAmount);
  router.post('/apply', applyAmount);

  return router;
}
