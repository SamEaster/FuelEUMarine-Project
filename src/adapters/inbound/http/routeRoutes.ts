import { Router, Request, Response } from 'express';
import { RouteRepository } from '../../../core/ports/RouteRepository.js';

/**
 * Inbound HTTP adapter: Express routes for the Route entity.
 * Controllers handle only request/response — no business logic.
 */
export function createRouteRouter(routeRepository: RouteRepository): Router {
  const router = Router();

  router.get('/', async (_req: Request, res: Response) => {
    try {
      const routes = await routeRepository.findAll();
      res.json({ success: true, data: routes });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch routes' });
    }
  });

  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const route = await routeRepository.findById(req.params.id as string);
      if (!route) {
        res.status(404).json({ success: false, error: 'Route not found' });
        return;
      }
      res.json({ success: true, data: route });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch route' });
    }
  });

  return router;
}
