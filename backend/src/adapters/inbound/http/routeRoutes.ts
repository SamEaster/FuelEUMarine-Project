import { Router, RequestHandler } from 'express';
import { RouteRepository } from '../../../core/ports/RouteRepository.js';
import { compareRoutes } from '../../../core/application/CompareRoutes.js';
import { AppError } from '../../../shared/errors.js';

/**
 * Inbound HTTP adapter: Express routes for the Route entity.
 * Controllers handle only request/response — no business logic.
 */
export function createRouteRouter(routeRepository: RouteRepository): Router {
  const router = Router();

  const getRoutes: RequestHandler = async (_req, res) => {
    try {
      const routes = await routeRepository.findAll();
      res.json({ success: true, data: routes });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch routes' });
    }
  };

  const setBaseline: RequestHandler = async (req, res) => {
    try {
      const routeId = req.params.id as string;
      const route = await routeRepository.findById(routeId);
      if (!route) {
        res.status(404).json({ success: false, error: 'Route not found' });
        return;
      }
      
      const updatedRoute = await routeRepository.setBaseline(routeId);
      res.json({ success: true, data: updatedRoute });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to set baseline' });
    }
  };

  const getComparison: RequestHandler = async (req, res) => {
    try {
      const baselineId = req.query.baselineId as string;
      const comparisonId = req.query.comparisonId as string;

      if (!baselineId || !comparisonId) {
        res.status(400).json({ success: false, error: 'baselineId and comparisonId are required query parameters' });
        return;
      }

      const baselineRoute = await routeRepository.findById(baselineId);
      if (!baselineRoute) {
        res.status(404).json({ success: false, error: 'Baseline route not found' });
        return;
      }

      const comparisonRoute = await routeRepository.findById(comparisonId);
      if (!comparisonRoute) {
        res.status(404).json({ success: false, error: 'Comparison route not found' });
        return;
      }

      const result = compareRoutes({
        baselineGhgIntensity: baselineRoute.ghgIntensity,
        comparisonGhgIntensity: comparisonRoute.ghgIntensity,
      });

      res.json({ success: true, data: result });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, error: error.message, code: error.code });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to compare routes' });
    }
  };

  const getRouteById: RequestHandler = async (req, res) => {
    try {
       // Just keep the id fetch correctly matched
       if (req.params.id === 'comparison') {
          // let router pass it appropriately but since we placed comparison before 'id', it won't hit here. 
       }
      const route = await routeRepository.findById(req.params.id as string);
      if (!route) {
        res.status(404).json({ success: false, error: 'Route not found' });
        return;
      }
      res.json({ success: true, data: route });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch route' });
    }
  };


  router.get('/', getRoutes);
  router.get('/comparison', getComparison); // Must be before /:id
  router.get('/:id', getRouteById);
  router.post('/:id/baseline', setBaseline);

  return router;
}
