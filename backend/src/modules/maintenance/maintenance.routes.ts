import { Router } from 'express';
import { MaintenanceController } from './maintenance.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// GET — semua user
router.get('/statistics', MaintenanceController.getStatistics);
router.get('/asset/:assetId', MaintenanceController.getByAsset);
router.get('/', MaintenanceController.getAll);
router.get('/:id', MaintenanceController.getById);

// POST, PUT, DELETE — hanya ADMIN
router.post('/', authorize('ADMIN'), MaintenanceController.create);
router.put('/:id', authorize('ADMIN'), MaintenanceController.update);
router.delete('/:id', authorize('ADMIN'), MaintenanceController.delete);

export default router;
