import { Router } from 'express';
import { NetworkController } from './network.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// GET - semua user
router.get('/statistics', NetworkController.getStatistics);
router.get('/asset/:assetId', NetworkController.getByAsset);
router.get('/', NetworkController.getAll);
router.get('/:id', NetworkController.getById);

// POST/PUT/DELETE - admin only
router.post('/', authorize('ADMIN'), NetworkController.upsert);
router.put('/:id', authorize('ADMIN'), NetworkController.update);
router.delete('/:id', authorize('ADMIN'), NetworkController.delete);

// Cek status - semua user (technician bisa cek)
router.post('/:id/check', NetworkController.checkStatus);

export default router;
